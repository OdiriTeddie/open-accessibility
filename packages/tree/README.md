# @open-accessibility/tree

Shared TypeScript types and schema constants for Open Accessibility packages.

## Usage

```ts
import type { AnalysisReport, BrowserInspection } from "@open-accessibility/tree";
import { REPORT_SCHEMA_VERSION, countAccessibilityNodes } from "@open-accessibility/tree";

function summarize(report: AnalysisReport): string {
  return `${report.totals.issues} issues using schema ${REPORT_SCHEMA_VERSION}`;
}

function count(inspection: BrowserInspection): number {
  return countAccessibilityNodes(inspection.accessibilityTree);
}
```

Use this package for stable report, DOM snapshot, accessibility tree, axe, and source mapping types.
