# @open-accessibility/core

High-level inspection API. This package combines browser collection and analysis into one call.

## Usage

```ts
import { inspect } from "@open-accessibility/core";

const report = await inspect("http://localhost:3000", {
  waitUntil: "load",
  waitForSelector: "main",
  viewport: { width: 1280, height: 720 },
});

console.log(report.totals);
```

Use this package when you want an `AnalysisReport` without manually coordinating browser collection and analysis.
