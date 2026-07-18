import { describe, expect, it } from "vitest";
import type { AccessibilityIssue } from "@open-accessibility/tree";
import { analyzeInspection } from "./index.js";
import { createFixtureInspection, createHtmlFallbackInspection } from "./__fixtures__/inspection.js";

describe("analyzeInspection", () => {
  it("counts accessibility nodes, DOM elements, and issue impacts", () => {
    const report = analyzeInspection(createFixtureInspection());

    expect(report.totals).toMatchObject({
      accessibilityNodes: 4,
      domElements: 4,
      issues: 3,
      critical: 2,
      serious: 1,
      moderate: 0,
      minor: 0,
      unknown: 0,
    });
  });

  it("correlates axe targets to DOM snapshots and infers useful report fields", () => {
    const report = analyzeInspection(createFixtureInspection());
    const buttonIssue = report.issues.find(
      (issue: AccessibilityIssue) => issue.id === "button-name",
    );
    const labelIssue = report.issues.find((issue: AccessibilityIssue) => issue.id === "label");

    expect(buttonIssue?.location.domElement?.id).toBe("empty-button");
    expect(buttonIssue?.location.accessibilityNode?.backendDOMNodeId).toBe(101);
    expect(buttonIssue?.location.correlation).toBe("backend-node-id");
    expect(buttonIssue?.computedRole).toBe("button");
    expect(buttonIssue?.accessibleName).toBeUndefined();
    expect(buttonIssue?.suggestedRemediation).toContain("Buttons must have discernible text");

    expect(labelIssue?.location.domElement?.id).toBe("email");
    expect(labelIssue?.computedRole).toBe("textbox");
    expect(labelIssue?.accessibleName).toBe("Email");
  });

  it("falls back to HTML matching when selector correlation misses", () => {
    const report = analyzeInspection(createHtmlFallbackInspection());

    expect(report.issues[0]?.location.selector).toBe(".generated-selector");
    expect(report.issues[0]?.location.domElement?.id).toBe("empty-button");
    expect(report.issues[0]?.location.correlation).toBe("backend-node-id");
    expect(report.issues[0]?.computedRole).toBe("button");
  });
});
