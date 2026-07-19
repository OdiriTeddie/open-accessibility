import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { createFixtureReport } from "./__fixtures__/report.js";
import { renderHtmlReport } from "./index.js";

describe("renderHtmlReport", () => {
  it("renders escaped issue content and summary metrics", () => {
    const html = renderHtmlReport(createFixtureReport());

    expect(html).toContain("<!doctype html>");
    expect(html).toContain("Accessibility nodes");
    expect(html).toContain("Schema 0.1.0 / Tool 0.1.0");
    expect(html).toContain("Accessibility Tree");
    expect(html).toContain("Filter current view");
    expect(html).toContain("Buttons must have discernible text");
    expect(html).toContain("apps/playground/src/main.tsx:12:9 (PlaygroundApp)");
    expect(html).toContain("Source confidence</dt><dd>high</dd>");
    expect(html).toContain("Source strategy</dt><dd>source-attribute</dd>");
    expect(html).toContain("open-accessibility-report-data");
    expect(html).toContain("&lt;button id=&quot;empty-button&quot;&gt;&lt;/button&gt;");
  });

  it("writes and smoke-tests a self-contained HTML report file", async () => {
    const report = createFixtureReport();
    const directory = await mkdtemp(join(tmpdir(), "open-accessibility-html-"));
    const file = join(directory, "report.html");

    await writeFile(file, renderHtmlReport(report), "utf8");
    const html = await readFile(file, "utf8");
    const json = /<script id="open-accessibility-report-data" type="application\/json">(?<json>.*?)<\/script>/s.exec(
      html,
    )?.groups?.json;

    expect(html).toContain('role="tablist"');
    expect(json).toBeDefined();
    expect(JSON.parse(json ?? "{}")).toMatchObject({
      metadata: { schemaVersion: "0.1.0" },
      totals: { issues: 1 },
      snapshot: { dom: expect.any(Array), accessibilityTree: expect.any(Array) },
    });
  });
});
