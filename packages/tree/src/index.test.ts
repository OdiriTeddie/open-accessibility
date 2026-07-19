import { describe, expect, it } from "vitest";
import {
  createReportMetadata,
  REPORT_SCHEMA_NAME,
  REPORT_SCHEMA_VERSION,
  REPORT_TOOL_NAME,
} from "./index.js";

describe("report metadata", () => {
  it("creates stable schema and tool metadata", () => {
    expect(createReportMetadata("0.1.0")).toEqual({
      schemaName: REPORT_SCHEMA_NAME,
      schemaVersion: REPORT_SCHEMA_VERSION,
      toolName: REPORT_TOOL_NAME,
      toolVersion: "0.1.0",
    });
  });
});
