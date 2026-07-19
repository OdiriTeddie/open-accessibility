import { describe, expect, it } from "vitest";
import { createFixtureReport } from "./__fixtures__/report.js";
import { renderJsonReport } from "./index.js";

describe("renderJsonReport", () => {
  it("serializes the report schema", () => {
    const json = renderJsonReport(createFixtureReport());
    const parsed = JSON.parse(json) as {
      metadata: {
        schemaName: string;
        schemaVersion: string;
        toolName: string;
        toolVersion: string;
      };
      totals: { issues: number };
      issues: Array<{ id: string }>;
    };

    expect(parsed.metadata.schemaName).toBe("open-accessibility-analysis-report");
    expect(parsed.metadata.schemaVersion).toBe("0.1.0");
    expect(parsed.metadata.toolName).toBe("open-accessibility");
    expect(parsed.metadata.toolVersion).toBe("0.1.0");
    expect(parsed.totals.issues).toBe(1);
    expect(parsed.issues.map((issue) => issue.id)).toContain("button-name");
  });
});
