import { describe, expect, it } from "vitest";
import { createFixtureReport } from "./__fixtures__/report.js";
import { renderHtmlReport } from "./index.js";

describe("renderHtmlReport", () => {
  it("renders escaped issue content and summary metrics", () => {
    const html = renderHtmlReport(createFixtureReport());

    expect(html).toContain("<!doctype html>");
    expect(html).toContain("Accessibility nodes");
    expect(html).toContain("Buttons must have discernible text");
    expect(html).toContain("&lt;button id=&quot;empty-button&quot;&gt;&lt;/button&gt;");
  });
});
