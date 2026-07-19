# @open-accessibility/browser

Browser-sourced collection layer for Open Accessibility.

This package launches Chromium with Playwright, retrieves the Chrome accessibility tree through CDP, captures a DOM snapshot, and runs axe-core.

## Usage

```ts
import { inspectPage } from "@open-accessibility/browser";

const inspection = await inspectPage("http://localhost:3000", {
  waitUntil: "load",
  waitForSelector: "main",
  timeoutMs: 30_000,
});

console.log(inspection.accessibilityTree.length);
console.log(inspection.dom.length);
console.log(inspection.axe.violations.length);
```

If Chromium is not installed, run:

```bash
pnpm exec playwright install chromium
```
