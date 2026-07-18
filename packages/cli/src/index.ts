#!/usr/bin/env node
import { writeFile } from "node:fs/promises";
import { Command } from "commander";
import { inspect } from "@open-accessibility/core";
import { renderCliReport } from "@open-accessibility/reporter-cli";
import { renderHtmlReport } from "@open-accessibility/reporter-html";
import { renderJsonReport } from "@open-accessibility/reporter-json";

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
  .action(async (url: string, options: { format: string; output?: string; headed?: boolean }) => {
    const report = await inspect(url, { headless: !options.headed });
    const rendered = renderReport(options.format, report);

    if (options.output) {
      await writeFile(options.output, rendered, "utf8");
      console.log(`Wrote ${options.format} report to ${options.output}`);
      return;
    }

    console.log(rendered);
  });

program.parseAsync().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

function renderReport(format: string, report: Awaited<ReturnType<typeof inspect>>): string {
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
