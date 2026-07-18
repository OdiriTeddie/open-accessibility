import type { AnalysisReport } from "@open-accessibility/tree";

export function createFixtureReport(): AnalysisReport {
  return {
    url: "http://localhost:3000/fixtures",
    finalUrl: "http://localhost:3000/fixtures",
    title: "Accessibility Fixtures",
    inspectedAt: "2026-01-01T00:00:00.000Z",
    totals: {
      accessibilityNodes: 4,
      domElements: 4,
      issues: 1,
      critical: 1,
      serious: 0,
      moderate: 0,
      minor: 0,
      unknown: 0,
    },
    issues: [
      {
        id: "button-name",
        impact: "critical",
        description: "Ensures buttons have discernible text",
        help: "Buttons must have discernible text",
        helpUrl: "https://dequeuniversity.com/rules/axe/4.10/button-name",
        location: {
          selector: "#empty-button",
          target: ["#empty-button"],
          html: '<button id="empty-button"></button>',
        },
        computedRole: "button",
        suggestedRemediation:
          "Buttons must have discernible text. See https://dequeuniversity.com/rules/axe/4.10/button-name",
      },
    ],
  };
}
