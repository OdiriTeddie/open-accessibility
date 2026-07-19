import { describe, expect, it } from "vitest";
import { createFixtureReport } from "./__fixtures__/report.js";
import { renderCliReport } from "./index.js";

describe("renderCliReport", () => {
  it("renders summary counts and issue details", () => {
    const output = renderCliReport(createFixtureReport());

    expect(output).toContain("Total accessibility nodes: 4");
    expect(output).toContain("DOM elements inspected: 4");
    expect(output).toContain("Critical issues: 1");
    expect(output).toContain("[CRITICAL] Buttons must have discernible text");
    expect(output).toContain("DOM element: #empty-button");
    expect(output).toContain("Correlation: selector");
    expect(output).toContain("Source: apps/playground/src/main.tsx:9:10 (PlaygroundApp)");
    expect(output).toContain("Source confidence: high");
    expect(output).toContain("Source strategy: source-attribute");
    expect(output).toContain("Computed role: button");
  });
});
