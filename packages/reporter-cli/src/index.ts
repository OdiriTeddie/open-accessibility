import type { AnalysisReport } from "@open-accessibility/analyzer";

export function renderCliReport(report: AnalysisReport): string {
  const lines = [
    `Open Accessibility report for ${report.url}`,
    report.title ? `Title: ${report.title}` : undefined,
    "",
    `Total accessibility nodes: ${report.totals.accessibilityNodes}`,
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
    lines.push(`  DOM element: ${issue.target || "unknown"}`);
    lines.push(`  Computed role: ${issue.computedRole || "not exposed in initial snapshot"}`);
    lines.push(`  Accessible name: ${issue.accessibleName || "not exposed in initial snapshot"}`);
    lines.push(`  Suggested remediation: ${issue.suggestedRemediation}`);
    lines.push("");
  }

  return lines.join("\n");
}
