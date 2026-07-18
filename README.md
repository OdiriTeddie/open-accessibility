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
