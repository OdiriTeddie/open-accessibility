# @open-accessibility/reporter-cli

Text reporter for Open Accessibility analysis reports.

## Usage

```ts
import { inspect } from "@open-accessibility/core";
import { renderCliReport } from "@open-accessibility/reporter-cli";

const report = await inspect("http://localhost:3000");
const output = renderCliReport(report);

console.log(output);
```

The output includes totals, issue impact, DOM selector, source mapping confidence, computed role, accessible name, and remediation.
