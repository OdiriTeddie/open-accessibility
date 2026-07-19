#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import { inspect } from "@open-accessibility/core";
import type { AnalysisReport } from "@open-accessibility/tree";
import { renderCliReport } from "@open-accessibility/reporter-cli";
import { renderHtmlReport } from "@open-accessibility/reporter-html";
import { renderJsonReport } from "@open-accessibility/reporter-json";

export interface CliDependencies {
  inspect: typeof inspect;
  stdout: Pick<typeof console, "log">;
  stderr: Pick<typeof console, "error">;
  writeFile: typeof writeFile;
  mkdir: typeof mkdir;
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

      if (options.output) {
        await dependencies.mkdir(dirname(options.output), { recursive: true });
        await dependencies.writeFile(options.output, rendered, "utf8");
        dependencies.stdout.log(`Wrote ${options.format} report to ${options.output}`);
      } else {
        dependencies.stdout.log(rendered);
      }

      if (shouldFail(report, options.failOn)) {
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
  };
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

function shouldFail(
  report: Awaited<ReturnType<typeof inspect>>,
  failOn: InspectCommandOptions["failOn"],
): boolean {
  switch (failOn) {
    case "none":
      return false;
    case "critical":
      return report.totals.critical > 0;
    case "serious":
      return report.totals.critical + report.totals.serious > 0;
    case "moderate":
      return report.totals.critical + report.totals.serious + report.totals.moderate > 0;
    case "minor":
      return report.totals.issues > 0;
  }
}
