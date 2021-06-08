import React from "react";
import Config from "../components/Config";
import { Pane, majorScale, Button } from "evergreen-ui";
import Link from "next/link";

export default function Home() {
  return (
    <Pane
      display="flex"
      flexDirection="column"
      alignItems="center"
      maxWidth={majorScale(16 * 16)}
      marginX={majorScale(2)}
    >
      <Config />
      <Pane
        display="flex"
        justifyContent="space-between"
        marginX={majorScale(2)}
      >
        <Link href="/">
          <Button margin={16} intent="danger">
            HOME
          </Button>
        </Link>
      </Pane>
    </Pane>
  );
}
