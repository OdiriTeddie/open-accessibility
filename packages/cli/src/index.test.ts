import { describe, expect, it, vi, afterEach } from "vitest";
import type { AnalysisReport } from "@open-accessibility/tree";
import { createProgram, type CliDependencies } from "./index.js";

describe("open-accessibility inspect CLI", () => {
  afterEach(() => {
    process.exitCode = undefined;
  });

  it("renders CLI format to stdout and forwards parser options", async () => {
    const dependencies = createDependencies(createReport({ critical: 0, serious: 0 }));

    await runCli(dependencies, [
      "inspect",
      "http://localhost:3000/",
      "--format",
      "cli",
      "--timeout",
      "5000",
      "--viewport",
      "1280x720",
      "--wait-until",
      "load",
      "--wait-for-selector",
      "main",
      "--user-agent",
      "OpenAccessibilityTest",
      "--auth-storage-state",
      "state.json",
      "--headed",
      "--debug",
      "--fail-on",
      "none",
    ]);

    expect(dependencies.inspect).toHaveBeenCalledWith("http://localhost:3000/", {
      headless: false,
      timeoutMs: 5000,
      viewport: { width: 1280, height: 720 },
      waitUntil: "load",
      waitForSelector: "main",
      userAgent: "OpenAccessibilityTest",
      storageStatePath: "state.json",
      debug: true,
    });
    expect(dependencies.stdout.log).toHaveBeenCalledWith(
      expect.stringContaining("Open Accessibility report for http://localhost:3000/"),
    );
  });

  it("writes JSON and HTML output files", async () => {
    const dependencies = createDependencies(createReport({ critical: 0, serious: 0 }));

    await runCli(dependencies, [
      "inspect",
      "http://localhost:3000/",
      "--format",
      "json",
      "--output",
      "reports/report.json",
      "--fail-on",
      "none",
    ]);
    await runCli(dependencies, [
      "inspect",
      "http://localhost:3000/",
      "--format",
      "html",
      "--output",
      "reports/report.html",
      "--fail-on",
      "none",
    ]);

    expect(dependencies.mkdir).toHaveBeenCalledWith("reports", { recursive: true });
    expect(dependencies.writeFile).toHaveBeenCalledWith(
      "reports/report.json",
      expect.stringContaining("\"schemaVersion\": \"0.1.0\""),
      "utf8",
    );
    expect(dependencies.writeFile).toHaveBeenCalledWith(
      "reports/report.html",
      expect.stringContaining("<!doctype html>"),
      "utf8",
    );
  });

  it("opens generated HTML reports when --open is passed", async () => {
    const dependencies = createDependencies(createReport({ critical: 0, serious: 0 }));

    await runCli(dependencies, [
      "inspect",
      "http://localhost:3000/",
      "--format",
      "html",
      "--output",
      "reports/report.html",
      "--open",
      "--fail-on",
      "none",
    ]);

    expect(dependencies.writeFile).toHaveBeenCalledWith(
      "reports/report.html",
      expect.stringContaining("<!doctype html>"),
      "utf8",
    );
    expect(dependencies.openFile).toHaveBeenCalledWith("reports/report.html");
    expect(dependencies.stdout.log).toHaveBeenCalledWith("Opened HTML report in your default browser.");
  });

  it("rejects invalid URLs and unsupported parser values", async () => {
    const dependencies = createDependencies(createReport({ critical: 0, serious: 0 }));

    await expect(runCli(dependencies, ["inspect", "not-a-url"])).rejects.toThrow(
      'Invalid URL "not-a-url"',
    );
    await expect(
      runCli(dependencies, ["inspect", "http://localhost:3000/", "--viewport", "large"]),
    ).rejects.toThrow('Invalid viewport "large"');
    await expect(
      runCli(dependencies, ["inspect", "http://localhost:3000/", "--wait-until", "ready"]),
    ).rejects.toThrow('Unsupported wait state "ready"');
    await expect(
      runCli(dependencies, ["inspect", "http://localhost:3000/", "--fail-on", "bad"]),
    ).rejects.toThrow('Unsupported fail threshold "bad"');
  });

  it("rejects --open without HTML file output", async () => {
    const dependencies = createDependencies(createReport({ critical: 0, serious: 0 }));

    await expect(
      runCli(dependencies, ["inspect", "http://localhost:3000/", "--format", "json", "--open"]),
    ).rejects.toThrow("--open can only be used with --format html.");
    await expect(
      runCli(dependencies, ["inspect", "http://localhost:3000/", "--format", "html", "--open"]),
    ).rejects.toThrow("--open requires --output");
    expect(dependencies.inspect).not.toHaveBeenCalled();
  });

  it("sets a failing exit code when impact meets the fail threshold", async () => {
    const dependencies = createDependencies(createReport({ critical: 0, serious: 1 }));

    await runCli(dependencies, [
      "inspect",
      "http://localhost:3000/",
      "--format",
      "cli",
      "--fail-on",
      "serious",
    ]);

    expect(process.exitCode).toBe(2);
  });
});

async function runCli(dependencies: CliDependencies, args: string[]): Promise<void> {
  await createProgram(dependencies).exitOverride().parseAsync(["node", "open-accessibility", ...args]);
}

function createDependencies(report: AnalysisReport): CliDependencies {
  return {
    inspect: vi.fn().mockResolvedValue(report),
    stdout: { log: vi.fn() },
    stderr: { error: vi.fn() },
    writeFile: vi.fn().mockResolvedValue(undefined),
    mkdir: vi.fn().mockResolvedValue(undefined),
    openFile: vi.fn().mockResolvedValue(undefined),
  };
}

function createReport(overrides: { critical: number; serious: number }): AnalysisReport {
  const issues =
    overrides.critical + overrides.serious > 0
      ? [
          {
            id: "button-name",
            impact: overrides.critical > 0 ? ("critical" as const) : ("serious" as const),
            description: "Ensures buttons have discernible text",
            help: "Buttons must have discernible text",
            helpUrl: "https://dequeuniversity.com/rules/axe/button-name",
            location: {
              selector: "#empty-button",
              target: ["#empty-button"],
              html: '<button id="empty-button"></button>',
              correlation: "selector" as const,
            },
            computedRole: "button",
            suggestedRemediation:
              "Buttons must have discernible text. See https://dequeuniversity.com/rules/axe/button-name",
          },
        ]
      : [];

  return {
    metadata: { schemaVersion: "0.1.0", toolVersion: "0.1.0" },
    url: "http://localhost:3000/",
    finalUrl: "http://localhost:3000/",
    title: "Fixture",
    inspectedAt: "2026-01-01T00:00:00.000Z",
    totals: {
      accessibilityNodes: 2,
      domElements: 1,
      issues: issues.length,
      critical: overrides.critical,
      serious: overrides.serious,
      moderate: 0,
      minor: 0,
      unknown: 0,
    },
    issues,
    snapshot: {
      accessibilityTree: [{ nodeId: "1", role: { value: "RootWebArea" }, name: { value: "Fixture" } }],
      dom: [
        {
          selector: "#empty-button",
          tagName: "button",
          outerHtml: '<button id="empty-button"></button>',
        },
      ],
    },
  };
}
