import { analyzeInspection } from "@open-accessibility/analyzer";
import { inspectPage, type BrowserInspectOptions } from "@open-accessibility/browser";

export type InspectOptions = BrowserInspectOptions;

export async function inspect(url: string, options: InspectOptions = {}) {
  const browserResult = await inspectPage(url, options);
  return analyzeInspection(browserResult);
}

export type InspectionReport = Awaited<ReturnType<typeof inspect>>;
