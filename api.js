const modbus = require("modbus-stream");
const http = require("http");
const fs = require("fs");
const url = require("url");

const store = new Map(); // unit id -> value (32-bit integer)
let conf = null;

function syncConf() {
  return new Promise((resolve, reject) => {
    fs.readFile("config.json", (err, data) => {
      if (err) reject(err);
      try {
        conf = JSON.parse(data.toString("utf-8"));
        prepareStore();
        resolve(conf);
      } catch (err) {
        reject(err);
      }
    });
  });
}

function wait(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time * 1000);
  });
}

function modbusTcpConnect(target) {
  return new Promise((resolve, reject) => {
    modbus.tcp.connect(
      target.port,
      target.ip,
      { debug: null },
      (err, connection) => {
        if (err) reject(err);
        resolve(connection);
      }
    );
  });
}

// start connection
async function connect(target) {
  console.log(
    "modbus connection starting, wait response from modbus server..."
  );
  while (true) {
    await syncConf();
    try {
      const connection = await modbusTcpConnect(target);
      if (connection === void 0) throw Error("empty connection");
      console.log("modbus connection succeeded, pull data from registers..");
      while (true) {
        await syncConf();
        await update({ connection, target });
      }
    } catch (err) {
      console.warn("modbus connection failed, try again after 5 seconds...");
      wait(5);
    }
  }
}

function readHoldingRegisters({ connection, target, unitId }) {
  return new Promise((resolve, reject) => {
    connection.readHoldingRegisters(
      {
        address: parseInt(target.address),
        quantity: parseInt(target.quantity),
        extra: { unitId },
      },
      (err, res) => {
        if (err) {
          reject(
            new TypeError(
              `modbus cannot read register from unit 0x${dec2hex(unitId)}`
            )
          );
        } else {
          try {
            // read two 16-bit register of integer
            const buf = Buffer.concat(res.response.data);
            // combine those into single 32-bit register of integer
            const integer = buf.readInt32BE(0);
            resolve(integer);
          } catch (err) {
            reject(new TypeError(`bad value: 0x${dec2hex(unitId)}`));
          }
        }
      }
    );
  });
}

async function update({ connection, target }) {
  for (const [unitId, value] of store) {
    try {
      const newValue = await readHoldingRegisters({
        connection,
        target,
        unitId,
      });
      if (value !== newValue) {
        store.set(unitId, newValue);
        console.log(
          `value update: 0x${dec2hex(unitId)} (${value} => ${newValue})`
        );
      }
    } catch (err) {
      console.warn(err.toString());
    }
  }
}

function dec2hex(dec, length = 4) {
  dec = String(dec);
  return dec.toString(16).padStart(length, "0");
}

function httpListener(request, response) {
  response.writeHead(200, { "Content-Type": "application/json" });
  const obj = Object.fromEntries(store);
  response.end(JSON.stringify(obj));
}

function startHttpServer() {
  http.createServer(httpListener).listen(conf.host.apiPort, (err) => {
    console.log(
      `http server created for modbus at port "${conf.host.apiPort}"`
    );
  });
}

function prepareStore() {
  for (const unitId of conf.modbus.unitIds) {
    if (!store.has(parseInt(unitId))) {
      store.set(parseInt(unitId), void 0);
    }
  }
}

async function start() {
  await syncConf();
  connect(conf.modbus);
}

async function getConf(request, response) {
  response.writeHead(200, { "Content-Type": "application/json" });
  await syncConf();
  response.end(JSON.stringify(conf));
}

async function setConf(request, response) {
  response.writeHead(200, { "Content-Type": "application/json" });
  await syncConf();

  // url.parse(request)

  const searchParams = new URL(
    request.url,
    `http${conf.useHttps ? "s" : ""}://${conf.host.ip}:${conf.host.port}`
  ).searchParams;

  const ip = searchParams.get("ip");
  const port = searchParams.get("port");
  const unitIds = searchParams.get("units");

  if (ip) {
    conf.modbus.ip = ip;
  }
  if (port) {
    conf.modbus.port = port;
  }
  if (unitIds) {
    conf.modbus.unitIds = unitIds.split("|");
  }
  await new Promise((resolve, reject) => {
    fs.writeFile("config.json", JSON.stringify(conf), (err) => {
      if (err) reject(err);
      resolve();
    });
  });
  response.end(JSON.stringify(conf));
}

module.exports = { start, startHttpServer, httpListener, getConf, setConf };
