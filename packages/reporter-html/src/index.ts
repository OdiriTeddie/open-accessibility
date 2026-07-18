import type { AnalysisReport } from "@open-accessibility/tree";

export function renderHtmlReport(report: AnalysisReport): string {
  const issues = report.issues
    .map(
      (issue) => `
        <article class="issue impact-${escapeHtml(issue.impact)}">
          <div class="issue__meta">${escapeHtml(issue.impact.toUpperCase())} / ${escapeHtml(issue.id)}</div>
          <h2>${escapeHtml(issue.help)}</h2>
          <dl>
            <dt>DOM element</dt><dd><code>${escapeHtml(issue.location.selector || "unknown")}</code></dd>
            <dt>HTML</dt><dd><code>${escapeHtml(issue.location.html)}</code></dd>
            <dt>Computed role</dt><dd>${escapeHtml(issue.computedRole || "not exposed in initial snapshot")}</dd>
            <dt>Accessible name</dt><dd>${escapeHtml(issue.accessibleName || "not exposed in initial snapshot")}</dd>
            <dt>Suggested remediation</dt><dd>${escapeHtml(issue.suggestedRemediation)}</dd>
          </dl>
        </article>`,
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Open Accessibility Report</title>
  <style>
    body { font-family: Inter, system-ui, sans-serif; margin: 0; color: #161616; background: #fafafa; }
    main { max-width: 980px; margin: 0 auto; padding: 40px 20px; }
    header { border-bottom: 1px solid #d8d8d8; margin-bottom: 24px; padding-bottom: 20px; }
    h1 { font-size: 32px; margin: 0 0 8px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin: 24px 0; }
    .metric, .issue { background: #fff; border: 1px solid #d8d8d8; border-radius: 8px; padding: 16px; }
    .metric strong { display: block; font-size: 28px; }
    .issue { margin: 16px 0; }
    .issue__meta { color: #555; font-size: 13px; font-weight: 700; text-transform: uppercase; }
    dt { font-weight: 700; margin-top: 12px; }
    dd { margin: 4px 0 0; }
    code { background: #f1f1f1; padding: 2px 4px; border-radius: 4px; }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Open Accessibility Report</h1>
      <p>${escapeHtml(report.url)}</p>
      <p>Inspected at ${escapeHtml(report.inspectedAt)}</p>
    </header>
    <section class="summary" aria-label="Summary">
      ${metric("Accessibility nodes", report.totals.accessibilityNodes)}
      ${metric("DOM elements", report.totals.domElements)}
      ${metric("Critical", report.totals.critical)}
      ${metric("Serious", report.totals.serious)}
      ${metric("Moderate", report.totals.moderate)}
      ${metric("Minor", report.totals.minor)}
    </section>
    <section aria-label="Issues">${issues || "<p>No axe-core violations found.</p>"}</section>
  </main>
</body>
</html>`;
}

function metric(label: string, value: number): string {
  return `<div class="metric"><strong>${value}</strong>${escapeHtml(label)}</div>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;");
}
