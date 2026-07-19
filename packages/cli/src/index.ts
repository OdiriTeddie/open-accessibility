#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import { inspect } from "@open-accessibility/core";
import type { AnalysisReport } from "@open-accessibility/tree";
import { renderCliReport } from "@open-accessibility/reporter-cli";
import { renderHtmlReport } from "@open-accessibility/reporter-html";
import { renderJsonReport } from "@open-accessibility/reporter-json";

const DEFAULT_HTML_OUTPUT = "open-accessibility-report.html";

export interface CliDependencies {
  inspect: typeof inspect;
  stdout: Pick<typeof console, "log">;
  stderr: Pick<typeof console, "error">;
  writeFile: typeof writeFile;
  mkdir: typeof mkdir;
  openFile: (path: string) => Promise<void>;
}

export function createProgram(dependencies: CliDependencies = defaultDependencies()): Command {
  const program = new Command();

  program
    .name("open-accessibility")
    .description("Inspect browser-computed accessibility for a web page.")
    .version("0.1.0");

  program
    .command("inspect")
    .argument("<url>", "URL to inspect, for example http://localhost:3000")
    .option("-f, --format <format>", "report format: cli, json, or html", "cli")
    .option("-o, --output <path>", "write report to a file")
    .option("--open", "open the generated HTML report in the default browser")
    .option("--headed", "show the Chromium browser window")
    .option("--timeout <ms>", "navigation and selector timeout in milliseconds", parsePositiveInteger)
    .option("--viewport <size>", "viewport size as WIDTHxHEIGHT, for example 1280x720", parseViewport)
    .option(
      "--wait-until <state>",
      "navigation readiness: load, domcontentloaded, networkidle, or commit",
      parseWaitUntil,
    )
    .option("--wait-for-selector <selector>", "wait for a selector before collecting accessibility data")
    .option("--user-agent <value>", "override the browser user agent")
    .option("--auth-storage-state <path>", "Playwright storage state JSON for authenticated pages")
    .option(
      "--fail-on <impact>",
      "set non-zero exit when issues meet impact: critical, serious, moderate, minor, or none",
      parseFailOn,
      "critical",
    )
    .option("--debug", "print browser collection progress to stderr")
    .action(async (url: string, options: InspectCommandOptions) => {
      const normalizedUrl = parseUrl(url);
      validateOpenOptions(options);
      const outputPath = resolveOutputPath(options);
      const report = await dependencies.inspect(normalizedUrl, {
        headless: !options.headed,
        timeoutMs: options.timeout,
        viewport: options.viewport,
        waitUntil: options.waitUntil,
        waitForSelector: options.waitForSelector,
        userAgent: options.userAgent,
        storageStatePath: options.authStorageState,
        debug: options.debug,
      });
      const rendered = renderReport(options.format, report);

      if (outputPath) {
        await dependencies.mkdir(dirname(outputPath), { recursive: true });
        await dependencies.writeFile(outputPath, rendered, "utf8");
        dependencies.stdout.log(`Wrote ${options.format} report to ${outputPath}`);
        if (options.open) {
          await dependencies.openFile(outputPath);
          dependencies.stdout.log(`Opened HTML report in your default browser.`);
        }
      } else {
        dependencies.stdout.log(rendered);
      }

      const failureSummary = getFailOnSummary(report, options.failOn);
      if (failureSummary.shouldFail) {
        dependencies.stderr.error(
          `Failing because --fail-on ${options.failOn} matched ${failureSummary.matchingIssues} ${pluralize(
            "issue",
            failureSummary.matchingIssues,
          )} (${failureSummary.impactSummary}).`,
        );
        process.exitCode = 2;
      }
    });

  return program;
}

export async function main(argv = process.argv, dependencies = defaultDependencies()): Promise<void> {
  try {
    await createProgram(dependencies).parseAsync(argv);
  } catch (error: unknown) {
    dependencies.stderr.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  void main();
}

function defaultDependencies(): CliDependencies {
  return {
    inspect,
    stdout: console,
    stderr: console,
    writeFile,
    mkdir,
    openFile,
  };
}

async function openFile(path: string): Promise<void> {
  const command =
    process.platform === "win32" ? "cmd" : process.platform === "darwin" ? "open" : "xdg-open";
  const args =
    process.platform === "win32" ? ["/c", "start", '""', path] : [path];

  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    });
    child.once("error", reject);
    child.unref();
    resolve();
  });
}

function renderReport(format: string, report: AnalysisReport): string {
  switch (format) {
    case "cli":
      return renderCliReport(report);
    case "json":
      return renderJsonReport(report);
    case "html":
      return renderHtmlReport(report);
    default:
      throw new Error(`Unsupported report format "${format}". Use cli, json, or html.`);
  }
}

interface InspectCommandOptions {
  format: string;
  output?: string;
  open?: boolean;
  headed?: boolean;
  timeout?: number;
  viewport?: { width: number; height: number };
  waitUntil?: "load" | "domcontentloaded" | "networkidle" | "commit";
  waitForSelector?: string;
  userAgent?: string;
  authStorageState?: string;
  failOn: "critical" | "serious" | "moderate" | "minor" | "none";
  debug?: boolean;
}

function validateOpenOptions(options: InspectCommandOptions): void {
  if (!options.open) {
    return;
  }
  if (options.format !== "html") {
    throw new Error("--open can only be used with --format html.");
  }
}

function resolveOutputPath(options: InspectCommandOptions): string | undefined {
  if (options.output) {
    return options.output;
  }
  if (options.format === "html") {
    return DEFAULT_HTML_OUTPUT;
  }
  return undefined;
}

function parseUrl(value: string): string {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("URL must use http or https.");
    }
    return url.toString();
  } catch {
    throw new Error(`Invalid URL "${value}". Use an absolute http or https URL.`);
  }
}

function parsePositiveInteger(value: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Expected a positive integer, received "${value}".`);
  }
  return parsed;
}

function parseViewport(value: string): { width: number; height: number } {
  const match = /^(\d+)x(\d+)$/i.exec(value);
  if (!match) {
    throw new Error(`Invalid viewport "${value}". Use WIDTHxHEIGHT, for example 1280x720.`);
  }

  return {
    width: parsePositiveInteger(match[1] ?? ""),
    height: parsePositiveInteger(match[2] ?? ""),
  };
}

function parseWaitUntil(value: string): InspectCommandOptions["waitUntil"] {
  if (
    value === "load" ||
    value === "domcontentloaded" ||
    value === "networkidle" ||
    value === "commit"
  ) {
    return value;
  }
  throw new Error(`Unsupported wait state "${value}". Use load, domcontentloaded, networkidle, or commit.`);
}

function parseFailOn(value: string): InspectCommandOptions["failOn"] {
  if (
    value === "critical" ||
    value === "serious" ||
    value === "moderate" ||
    value === "minor" ||
    value === "none"
  ) {
    return value;
  }
  throw new Error(`Unsupported fail threshold "${value}". Use critical, serious, moderate, minor, or none.`);
}

interface FailOnSummary {
  shouldFail: boolean;
  matchingIssues: number;
  impactSummary: string;
}

function getFailOnSummary(
  report: Awaited<ReturnType<typeof inspect>>,
  failOn: InspectCommandOptions["failOn"],
): FailOnSummary {
  const matchingIssues = countFailingIssues(report, failOn);
  return {
    shouldFail: matchingIssues > 0,
    matchingIssues,
    impactSummary: formatImpactSummary(report),
  };
}

function countFailingIssues(
  report: Awaited<ReturnType<typeof inspect>>,
  failOn: InspectCommandOptions["failOn"],
): number {
  switch (failOn) {
    case "none":
      return 0;
    case "critical":
      return report.totals.critical;
    case "serious":
      return report.totals.critical + report.totals.serious;
    case "moderate":
      return report.totals.critical + report.totals.serious + report.totals.moderate;
    case "minor":
      return report.totals.issues;
  }
}

function formatImpactSummary(report: Awaited<ReturnType<typeof inspect>>): string {
  return [
    `${report.totals.critical} critical`,
    `${report.totals.serious} serious`,
    `${report.totals.moderate} moderate`,
    `${report.totals.minor} minor`,
  ].join(", ");
}

function pluralize(word: string, count: number): string {
  return count === 1 ? word : `${word}s`;
}
