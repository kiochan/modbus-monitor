const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const config = require("./config");

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const nextRequestHandler = nextApp.getRequestHandler();
const api = require("./api");

async function main() {
  await nextApp.prepare();

  createServer((req, res) => {
    // need fix if you are using node 15+
    const parsedUrl = parse(req.url, true);
    const { pathname, query } = parsedUrl;
    if (pathname === "/api/data") {
      api.httpListener(req, res);
    } else if (pathname === "/api/conf/get") {
      api.getConf(req, res);
    } else if (pathname === "/api/conf/set") {
      api.setConf(req, res);
    } else {
      nextRequestHandler(req, res, parsedUrl);
    }
  }).listen(config.host.port, (err) => {
    if (err) throw err;
    api.start();
  });
}

main().catch((err) => {
  throw err;
});
