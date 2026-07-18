import type { AnalysisReport } from "@open-accessibility/analyzer";

export function renderJsonReport(report: AnalysisReport): string {
  return JSON.stringify(report, null, 2);
}
