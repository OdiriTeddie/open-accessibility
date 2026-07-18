import { describe, expect, it } from "vitest";
import { createFixtureReport } from "./__fixtures__/report.js";
import { renderJsonReport } from "./index.js";

describe("renderJsonReport", () => {
  it("serializes the report schema", () => {
    const json = renderJsonReport(createFixtureReport());
    const parsed = JSON.parse(json) as { totals: { issues: number }; issues: Array<{ id: string }> };

    expect(parsed.totals.issues).toBe(1);
    expect(parsed.issues.map((issue) => issue.id)).toContain("button-name");
  });
});
