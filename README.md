# Open Accessibility

Open Accessibility is an open-source developer tool for inspecting, understanding, and debugging web accessibility during development.

The project uses the browser as the source of truth. It retrieves Chrome's computed accessibility tree through Chrome DevTools Protocol, relates that data to the rendered DOM, runs axe-core, and emits reports that explain what the browser sees.

## Status

This repository is scaffolded for the `0.1` MVP:

- CLI inspection command
- Playwright Chromium runner
- CDP accessibility tree extraction
- Rendered DOM snapshot extraction
- axe-core integration
- CLI, JSON, and HTML reporter packages

## Quick Start

```bash
pnpm install
pnpm --filter @open-accessibility/cli dev inspect http://localhost:3000
pnpm --filter @open-accessibility/cli dev inspect http://localhost:3000 --format html
pnpm --filter @open-accessibility/cli dev inspect http://localhost:3000 --format html --open
```

HTML reports default to `open-accessibility-report.html` when `--output` is omitted.

## Source Marker Attributes

Open Accessibility can map rendered DOM elements back to source locations when elements include
development-only marker attributes. These attributes are optional, framework-agnostic, and are read
from the browser DOM snapshot during inspection.

Supported attributes:

| Attribute | Required | Description |
| --- | --- | --- |
| `data-open-accessibility-source` | Yes | Source location in `file`, `file:line`, or `file:line:column` format. |
| `data-open-accessibility-component` | No | Component name to show in CLI, JSON, and HTML reports. |
| `data-open-accessibility-framework` | No | Framework label, for example `react`. |

Fallback aliases are also supported for source-map experiments:

| Attribute | Description |
| --- | --- |
| `data-source` | Alias for `data-open-accessibility-source`. |
| `data-source-location` | Alias for `data-open-accessibility-source`. |
| `data-source-file` | Source file when line and column are split into separate attributes. |
| `data-source-line` | Positive source line number. |
| `data-source-column` | Positive source column number. |
| `data-component` | Alias for component name. |
| `data-component-name` | Alias for component name. |

React projects can use the helper from `@open-accessibility/react` instead of spelling attributes
manually:

```tsx
import { createComponentSourceProps } from "@open-accessibility/react";

const source = createComponentSourceProps({
  file: "src/App.tsx",
  componentName: "App",
});

export function App() {
  return <button {...source(12, 4)} />;
}
```

This emits:

```html
<button
  data-open-accessibility-source="src/App.tsx:12:4"
  data-open-accessibility-component="App"
  data-open-accessibility-framework="react"
></button>
```

## Workspace

```text
apps/
  docs/
  playground/
packages/
  analyzer/
  browser/
  cli/
  core/
  overlay/
  react/
  reporter-cli/
  reporter-html/
  reporter-json/
  rules/
  source-map/
  tree/
examples/
  next/
  react/
  vite/
```

## Architecture

```text
Browser Runner
    -> Accessibility Tree
    -> DOM Snapshot
    -> Analysis Engine
    -> Source Mapper
    -> Reporters
```
