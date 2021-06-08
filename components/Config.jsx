import conf from "../config";
import React from "react";
import { TextInput, Badge, Button, Pane, majorScale } from "evergreen-ui";

export default class Units extends React.Component {
  constructor() {
    super();
    this.state = {
      units: conf.modbus.unitIds,
      ip: conf.modbus.ip,
      port: conf.modbus.port,
    };
  }

  sync = async () => {
    const response = await fetch(
      `http${conf.useHttps ? "s" : ""}://${conf.host.ip}:${
        conf.host.port
      }/api/conf/get`
    );
    if (response.json) {
      const json = await response.json();
      const data = {
        units: json.modbus.unitIds,
        ip: json.modbus.ip,
        port: json.modbus.port,
      };
      console.log(data);
      this.setState(data);
    }
  };

  update = async () => {
    const url = new URL(
      `http${conf.useHttps ? "s" : ""}://${conf.host.ip}:${
        conf.host.port
      }/api/conf/set`
    );
    const params = {
      units: this.state.units.join("|"),
      port: this.state.port,
      ip: this.state.ip,
    };
    url.search = new URLSearchParams(params).toString();
    fetch(url);
  };

  componentDidMount() {
    this.sync();
  }

  componentWillUnmount() {}

  render() {
    return (
      <>
        <Pane margin={majorScale(2)}>
          <Badge color="neutral" marginRight={8}>
            IP of modbus
          </Badge>
          <br />
          <TextInput
            name="input-ip"
            value={this.state.ip}
            onChange={function (e) {
              this.setState({ ip: e.target.value });
            }.bind(this)}
          />
        </Pane>
        <Pane margin={majorScale(2)}>
          <Badge color="neutral" marginRight={8}>
            Port of modbus
          </Badge>
          <br />
          <TextInput
            name="input-port"
            value={this.state.port}
            onChange={function (e) {
              this.setState({ port: e.target.value });
            }.bind(this)}
          />
        </Pane>
        <Pane margin={majorScale(2)}>
          <Badge color="neutral" marginRight={8}>
            Unit ID of meters
          </Badge>
          <br />
          <TextInput
            name="input-units"
            value={this.state.units.join("|")}
            onChange={function (e) {
              this.setState({ units: e.target.value.split("|") });
            }.bind(this)}
          />
        </Pane>
        <Pane
          display="flex"
          justifyContent="space-between"
          marginX={majorScale(2)}
        >
          <Button margin={16} intent="none" onClick={this.sync}>
            Restore
          </Button>
          <Button margin={16} intent="success" onClick={this.update}>
            Update
          </Button>
        </Pane>
      </>
    );
  }
}
