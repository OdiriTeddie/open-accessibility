import type { AnalysisReport } from "@open-accessibility/tree";

export function renderCliReport(report: AnalysisReport): string {
  const lines = [
    `Open Accessibility report for ${report.url}`,
    report.finalUrl !== report.url ? `Final URL: ${report.finalUrl}` : undefined,
    report.title ? `Title: ${report.title}` : undefined,
    `Inspected at: ${report.inspectedAt}`,
    "",
    `Total accessibility nodes: ${report.totals.accessibilityNodes}`,
    `DOM elements inspected: ${report.totals.domElements}`,
    `Critical issues: ${report.totals.critical}`,
    `Serious issues: ${report.totals.serious}`,
    `Moderate issues: ${report.totals.moderate}`,
    `Minor issues: ${report.totals.minor}`,
    "",
  ].filter((line): line is string => line !== undefined);

  if (report.issues.length === 0) {
    lines.push("No axe-core violations found.");
    return lines.join("\n");
  }

  for (const issue of report.issues) {
    lines.push(`[${issue.impact.toUpperCase()}] ${issue.help}`);
    lines.push(`  Rule: ${issue.id}`);
    lines.push(`  DOM element: ${issue.location.selector || "unknown"}`);
    lines.push(`  Computed role: ${issue.computedRole || "not exposed in initial snapshot"}`);
    lines.push(`  Accessible name: ${issue.accessibleName || "not exposed in initial snapshot"}`);
    lines.push(`  Suggested remediation: ${issue.suggestedRemediation}`);
    lines.push("");
  }

  return lines.join("\n");
}
