import { describe, expect, it, vi, afterEach } from "vitest";
import type { AnalysisReport } from "@open-accessibility/tree";
import { createProgram, main, type CliDependencies } from "./index.js";

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

  it("renders JSON to stdout when no output file is requested", async () => {
    const dependencies = createDependencies(createReport({ critical: 0, serious: 0 }));

    await runCli(dependencies, [
      "inspect",
      "http://localhost:3000/",
      "--format",
      "json",
      "--fail-on",
      "none",
    ]);

    expect(dependencies.writeFile).not.toHaveBeenCalled();
    expect(dependencies.mkdir).not.toHaveBeenCalled();
    expect(dependencies.stdout.log).toHaveBeenCalledWith(
      expect.stringContaining("\"schemaVersion\": \"0.1.0\""),
    );
  });

  it("writes CLI output to a file when --output is provided", async () => {
    const dependencies = createDependencies(createReport({ critical: 0, serious: 0 }));

    await runCli(dependencies, [
      "inspect",
      "http://localhost:3000/",
      "--format",
      "cli",
      "--output",
      "reports/report.txt",
      "--fail-on",
      "none",
    ]);

    expect(dependencies.writeFile).toHaveBeenCalledWith(
      "reports/report.txt",
      expect.stringContaining("Open Accessibility report for http://localhost:3000/"),
      "utf8",
    );
    expect(dependencies.stdout.log).toHaveBeenCalledWith("Wrote cli report to reports/report.txt");
    expect(dependencies.stdout.log).not.toHaveBeenCalledWith(
      expect.stringContaining("Open Accessibility report for http://localhost:3000/"),
    );
  });

  it("writes HTML to the default output file when --output is omitted", async () => {
    const dependencies = createDependencies(createReport({ critical: 0, serious: 0 }));

    await runCli(dependencies, [
      "inspect",
      "http://localhost:3000/",
      "--format",
      "html",
      "--fail-on",
      "none",
    ]);

    expect(dependencies.mkdir).toHaveBeenCalledWith(".", { recursive: true });
    expect(dependencies.writeFile).toHaveBeenCalledWith(
      "open-accessibility-report.html",
      expect.stringContaining("<!doctype html>"),
      "utf8",
    );
    expect(dependencies.stdout.log).toHaveBeenCalledWith(
      "Wrote html report to open-accessibility-report.html",
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

  it("opens the default HTML report when --open is passed without --output", async () => {
    const dependencies = createDependencies(createReport({ critical: 0, serious: 0 }));

    await runCli(dependencies, [
      "inspect",
      "http://localhost:3000/",
      "--format",
      "html",
      "--open",
      "--fail-on",
      "none",
    ]);

    expect(dependencies.writeFile).toHaveBeenCalledWith(
      "open-accessibility-report.html",
      expect.stringContaining("<!doctype html>"),
      "utf8",
    );
    expect(dependencies.openFile).toHaveBeenCalledWith("open-accessibility-report.html");
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
    await expect(
      runCli(dependencies, ["inspect", "http://localhost:3000/", "--timeout", "0"]),
    ).rejects.toThrow('Expected a positive integer, received "0"');
    await expect(
      runCli(dependencies, ["inspect", "ftp://localhost:3000/"]),
    ).rejects.toThrow('Invalid URL "ftp://localhost:3000/"');
  });

  it("rejects --open for non-HTML reports", async () => {
    const dependencies = createDependencies(createReport({ critical: 0, serious: 0 }));

    await expect(
      runCli(dependencies, ["inspect", "http://localhost:3000/", "--format", "json", "--open"]),
    ).rejects.toThrow("--open can only be used with --format html.");
    expect(dependencies.inspect).not.toHaveBeenCalled();
  });

  it("rejects unsupported report formats after inspection", async () => {
    const dependencies = createDependencies(createReport({ critical: 0, serious: 0 }));

    await expect(
      runCli(dependencies, ["inspect", "http://localhost:3000/", "--format", "xml"]),
    ).rejects.toThrow('Unsupported report format "xml". Use cli, json, or html.');
    expect(dependencies.inspect).toHaveBeenCalledOnce();
    expect(dependencies.writeFile).not.toHaveBeenCalled();
  });

  it("sets a failing exit code when impact meets the fail threshold", async () => {
    const dependencies = createDependencies(
      createReport({ critical: 1, serious: 1, moderate: 1, minor: 0 }),
    );

    await runCli(dependencies, [
      "inspect",
      "http://localhost:3000/",
      "--format",
      "cli",
      "--fail-on",
      "serious",
    ]);

    expect(process.exitCode).toBe(2);
    expect(dependencies.stderr.error).toHaveBeenCalledWith(
      "Failing because --fail-on serious matched 2 issues (1 critical, 1 serious, 1 moderate, 0 minor).",
    );
  });

  it("uses singular fail messaging for one matching issue", async () => {
    const dependencies = createDependencies(createReport({ critical: 1, serious: 0 }));

    await runCli(dependencies, [
      "inspect",
      "http://localhost:3000/",
      "--format",
      "cli",
      "--fail-on",
      "critical",
    ]);

    expect(process.exitCode).toBe(2);
    expect(dependencies.stderr.error).toHaveBeenCalledWith(
      "Failing because --fail-on critical matched 1 issue (1 critical, 0 serious, 0 moderate, 0 minor).",
    );
  });

  it("does not fail when --fail-on none is used", async () => {
    const dependencies = createDependencies(createReport({ critical: 1, serious: 1 }));

    await runCli(dependencies, [
      "inspect",
      "http://localhost:3000/",
      "--format",
      "cli",
      "--fail-on",
      "none",
    ]);

    expect(process.exitCode).toBeUndefined();
    expect(dependencies.stderr.error).not.toHaveBeenCalled();
  });

  it("main reports dependency errors and sets exit code 1", async () => {
    const dependencies = createDependencies(createReport({ critical: 0, serious: 0 }));
    vi.mocked(dependencies.inspect).mockRejectedValueOnce(
      new Error("Playwright Chromium is not installed.\nRun `pnpm exec playwright install chromium`."),
    );

    await main(["node", "open-accessibility", "inspect", "http://localhost:3000/"], dependencies);

    expect(process.exitCode).toBe(1);
    expect(dependencies.stderr.error).toHaveBeenCalledWith(
      "Playwright Chromium is not installed.\nRun `pnpm exec playwright install chromium`.",
    );
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

function createReport(overrides: Partial<Record<"critical" | "serious" | "moderate" | "minor", number>>): AnalysisReport {
  const totals = {
    critical: overrides.critical ?? 0,
    serious: overrides.serious ?? 0,
    moderate: overrides.moderate ?? 0,
    minor: overrides.minor ?? 0,
  };
  const issues = (Object.entries(totals) as Array<[keyof typeof totals, number]>).flatMap(
    ([impact, count]) =>
      Array.from({ length: count }, (_, index) => ({
        id: `button-name-${impact}-${index + 1}`,
        impact,
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
      })),
  );

  return {
    metadata: {
      schemaName: "open-accessibility-analysis-report",
      schemaVersion: "0.1.0",
      toolName: "open-accessibility",
      toolVersion: "0.1.0",
    },
    url: "http://localhost:3000/",
    finalUrl: "http://localhost:3000/",
    title: "Fixture",
    inspectedAt: "2026-01-01T00:00:00.000Z",
    totals: {
      accessibilityNodes: 2,
      domElements: 1,
      issues: issues.length,
      critical: totals.critical,
      serious: totals.serious,
      moderate: totals.moderate,
      minor: totals.minor,
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
