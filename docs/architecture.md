# Architecture

Open Accessibility keeps browser observation separate from analysis and reporting.

## Packages

- `@open-accessibility/browser`: launches Chromium, creates pages, opens CDP sessions, and collects browser data.
- `@open-accessibility/tree`: normalizes accessibility tree and DOM snapshot structures.
- `@open-accessibility/analyzer`: correlates accessibility nodes, DOM nodes, and axe-core violations.
- `@open-accessibility/core`: orchestrates inspection workflows.
- `@open-accessibility/reporter-cli`: human-readable terminal output.
- `@open-accessibility/reporter-json`: machine-readable JSON output.
- `@open-accessibility/reporter-html`: static HTML report output.
- `@open-accessibility/source-map`: future framework/source component mapping.
- `@open-accessibility/rules`: future explanatory rules beyond axe-core.
- `@open-accessibility/overlay`: future browser overlay.
- `@open-accessibility/react`: future React-specific source mapping helpers.

## Data Flow

```text
URL
  -> Browser runner
  -> CDP Accessibility.getFullAXTree
  -> DOM snapshot
  -> axe-core
  -> analysis engine
  -> reporters
```
