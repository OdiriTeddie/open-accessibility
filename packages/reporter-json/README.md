# @open-accessibility/reporter-json

JSON reporter for Open Accessibility analysis reports.

## Usage

```ts
import { writeFile } from "node:fs/promises";
import { inspect } from "@open-accessibility/core";
import { renderJsonReport } from "@open-accessibility/reporter-json";

const report = await inspect("http://localhost:3000");
await writeFile("open-accessibility-report.json", renderJsonReport(report), "utf8");
```

The emitted JSON preserves the full `AnalysisReport`, including metadata, totals, issues, DOM snapshots, and AX tree snapshots.
