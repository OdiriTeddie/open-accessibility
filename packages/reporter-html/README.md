# @open-accessibility/reporter-html

Self-contained HTML report and explorer for Open Accessibility analysis reports.

## Usage

```ts
import { writeFile } from "node:fs/promises";
import { inspect } from "@open-accessibility/core";
import { renderHtmlReport } from "@open-accessibility/reporter-html";

const report = await inspect("http://localhost:3000");
await writeFile("open-accessibility-report.html", renderHtmlReport(report), "utf8");
```

The report includes issue summaries, impact filtering, text search, AX tree hierarchy, DOM/AX cross-links, source confidence, and copy selector/source buttons.
