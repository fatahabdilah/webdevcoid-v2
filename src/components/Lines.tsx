import { Fragment } from "react";
import { noOrphan } from "@/lib/text";

/** Copy with "\n" as fixed line breaks, so sibling cards break in the same place; no orphans within a line. */
export function Lines({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {noOrphan(line)}
        </Fragment>
      ))}
    </>
  );
}
