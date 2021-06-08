import conf from "../config";
import React from "react";
import { Table } from "evergreen-ui";

export default class Units extends React.Component {
  constructor() {
    super();
    this.state = {
      data: {},
      keyword: "",
    };
  }

  refresh = async () => {
    const response = await fetch(
      `http${conf.useHttps ? "s" : ""}://${conf.host.ip}:${
        conf.host.port
      }/api/data`
    );
    if (response.json) {
      const json = await response.json();
      this.setState({
        data: { ...this.state.data, ...json },
      });
    }
  };

  componentDidMount() {
    this.handle = setInterval(this.refresh, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.handle);
  }

  render() {
    const data = Object.entries(this.state.data)
      .map((item) => {
        const [name, value] = item;
        return {
          name: "#" + parseInt(name).toString(16).padStart(4, "0"),
          value: (parseInt(value) / 1000).toFixed(3),
        };
      })
      .filter(({ name }) => {
        if (this.state.keyword) {
          return Boolean(name.match(this.state.keyword));
        } else {
          return true;
        }
      });

    return (
      <Table>
        <Table.Head>
          <Table.SearchHeaderCell
            onChange={(keyword) => this.setState({ keyword })}
          />
          <Table.TextHeaderCell>Value (kW·h)</Table.TextHeaderCell>
        </Table.Head>
        <Table.Body>
          {data.map(({ name, value }, key) => {
            return (
              <Table.Row key={key}>
                <Table.TextCell>{name}</Table.TextCell>
                <Table.TextCell>{value}</Table.TextCell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    );
  }
}
