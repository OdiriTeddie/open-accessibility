# @open-accessibility/tree

Shared TypeScript types and schema constants for Open Accessibility packages.

## Usage

```ts
import type { AnalysisReport, BrowserInspection } from "@open-accessibility/tree";
import {
  REPORT_SCHEMA_NAME,
  REPORT_SCHEMA_VERSION,
  countAccessibilityNodes,
} from "@open-accessibility/tree";

function summarize(report: AnalysisReport): string {
  return `${report.totals.issues} issues using ${REPORT_SCHEMA_NAME}@${REPORT_SCHEMA_VERSION}`;
}

function count(inspection: BrowserInspection): number {
  return countAccessibilityNodes(inspection.accessibilityTree);
}
```

Use this package for stable report, DOM snapshot, accessibility tree, axe, and source mapping types.

## Report Metadata

Every `AnalysisReport` includes:

| Field | Description |
| --- | --- |
| `metadata.schemaName` | Stable schema identifier: `open-accessibility-analysis-report`. |
| `metadata.schemaVersion` | Version of the report contract. |
| `metadata.toolName` | Tool that generated the report: `open-accessibility`. |
| `metadata.toolVersion` | Version of the generating tool. |
