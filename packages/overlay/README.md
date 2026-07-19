# @open-accessibility/overlay

Early overlay package for future in-page highlighting and browser overlay work.

## Usage

```ts
import { createOverlayScript } from "@open-accessibility/overlay";

const script = createOverlayScript();
console.log(script);
```

Current behavior is intentionally minimal: it returns a script that marks the page with `window.__OPEN_ACCESSIBILITY_OVERLAY__ = true`.
