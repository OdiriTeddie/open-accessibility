# Roadmap and Phase Changelog

This document tracks the 0.1 implementation phases completed so far and the next roadmap targets.

## Completed 0.1 Phases

### Phase 1: Stabilize MVP Core

- Scaffolded the monorepo package boundaries for browser collection, analysis, source mapping, and reporters.
- Added the CLI inspection path through `open-accessibility inspect`.
- Collected browser truth data through Playwright, CDP accessibility tree extraction, DOM snapshots, and axe-core.
- Produced CLI, JSON, and HTML report formats from the shared `AnalysisReport` schema.

### Phase 2: Make the CLI Solid

- Added format and output handling for CLI, JSON, and HTML reports.
- Added parser validation for URL, viewport, wait state, and fail threshold options.
- Added `--fail-on` support with non-zero exit behavior.
- Added `--open` for generated HTML reports.
- Added default HTML output naming with `open-accessibility-report.html`.
- Improved `--fail-on` exit messaging with threshold and impact totals.
- Improved missing Playwright Chromium errors with a direct install command.

### Phase 3: Build Confidence With Fixtures

- Added browser integration coverage using a tiny local fixture page.
- Verified end-to-end collection of DOM nodes, AX tree nodes, axe violations, backend node IDs, and captured attributes.
- Added CLI tests for formats, output files, parser options, invalid URLs, and fail thresholds.
- Smoke-tested generated HTML reports from fixture data.
- Added CI artifact generation for HTML and JSON reports.

### Phase 4: Improve Browser Truth Mapping

- Correlated axe issue nodes with DOM snapshots and AX nodes using selectors and backend node IDs.
- Added source marker parsing through `@open-accessibility/source-map`.
- Added React source marker helpers in `@open-accessibility/react`.
- Moved playground source markers behind the React helper API.
- Documented supported source marker attributes and fallback aliases.
- Made source mapping confidence and strategy visible in CLI and HTML output.
- Added bounded DOM attribute capture with useful source attributes retained and sensitive values redacted.

### Phase 5: Source Mapping Examples and Package Quality

- Added source marker examples for React, Vite, and Next fixtures.
- Added package-level README usage examples for every workspace package.
- Added this phase changelog and roadmap.

### Phase 6: HTML Report and Explorer

- Added HTML report schema/tool metadata.
- Added issue-to-DOM and issue-to-AX cross-links.
- Added text search plus impact filtering.
- Rendered the AX tree hierarchy instead of a flat list.
- Added copy selector/source affordances.
- Added source confidence and strategy details to issue and DOM views.

## Upcoming Roadmap

### 0.2: Watch Mode and Live Overlay

- Watch mode for repeated inspection during development.
- Live browser overlay for highlighting related DOM nodes.
- Initial click-to-source navigation experiments.

### 0.3: Component-Aware Analysis

- Component-aware guidance for dialogs, tabs, accordions, menus, comboboxes, tree views, and data grids.
- Framework-agnostic rules with React-first examples.

### 0.4: Accessibility Tree Explorer

- Interactive DOM to accessibility tree synchronization.
- Expand/collapse and focused inspection of AX subtrees.

### 0.5: Accessibility Timeline

- Capture accessibility tree changes before and after interactions.
- Compare snapshots across UI states.

### 0.6: Keyboard and Focus Debugging

- Keyboard journey simulation.
- Focus order and focus trap debugging.
- Interaction testing primitives.

### 0.7: Regression and CI Workflows

- Accessibility snapshots for regression detection.
- CI-focused baselines and comparison output.
- GitHub Action packaging.

### 1.0: Developer Platform

- VS Code extension.
- Browser extension.
- GitHub Action.
- Full developer platform experience.
