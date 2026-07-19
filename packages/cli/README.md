# open-accessibility

CLI for inspecting a page and writing Open Accessibility reports.

## Usage

```bash
open-accessibility inspect http://localhost:3000
open-accessibility inspect http://localhost:3000 --format json --output reports/report.json
open-accessibility inspect http://localhost:3000 --format html --open
```

HTML reports default to `open-accessibility-report.html` when `--output` is omitted.

## Common Options

```bash
open-accessibility inspect http://localhost:3000 \
  --format html \
  --wait-for-selector main \
  --viewport 1280x720 \
  --fail-on serious
```

Run `pnpm exec playwright install chromium` if Playwright reports that Chromium is missing.
