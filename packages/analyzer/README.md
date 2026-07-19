# @open-accessibility/analyzer

Converts raw browser inspection output into an Open Accessibility analysis report.

## Usage

```ts
import { inspectPage } from "@open-accessibility/browser";
import { analyzeInspection } from "@open-accessibility/analyzer";

const inspection = await inspectPage("http://localhost:3000");
const report = analyzeInspection(inspection);

console.log(report.totals.critical);
console.log(report.issues[0]?.suggestedRemediation);
```

The analyzer correlates axe nodes with DOM snapshots, AX nodes, computed roles, accessible names, and source markers when available.
