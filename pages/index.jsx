import React from "react";
import Units from "../components/Units";
import { Pane, Button, majorScale } from "evergreen-ui";
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
      <Units />
      <Pane
        display="flex"
        justifyContent="space-between"
        marginX={majorScale(2)}
      >
        <Link href="/config">
          <Button margin={16} intent="danger">
            CONFIG
          </Button>
        </Link>
      </Pane>
    </Pane>
  );
}
