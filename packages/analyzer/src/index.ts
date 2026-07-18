import type { AxeViolation, BrowserInspection } from "@open-accessibility/browser";

export interface AccessibilityIssue {
  id: string;
  impact: "minor" | "moderate" | "serious" | "critical" | "unknown";
  description: string;
  help: string;
  helpUrl: string;
  target: string;
  html: string;
  domElement?: {
    selector: string;
    tagName: string;
    role?: string;
    ariaLabel?: string;
    text?: string;
  };
  computedRole?: string;
  accessibleName?: string;
  suggestedRemediation: string;
}

export interface AnalysisReport {
  url: string;
  title: string;
  totals: {
    accessibilityNodes: number;
    issues: number;
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  };
  issues: AccessibilityIssue[];
}

export function analyzeInspection(inspection: BrowserInspection): AnalysisReport {
  const issues = inspection.axe.violations.flatMap((violation) =>
    violation.nodes.map((node) => {
      const target = node.target[0] ?? "";
      const domElement = inspection.dom.find((element) => element.selector === target);
      return {
        id: violation.id,
        impact: normalizeImpact(violation.impact),
        description: violation.description,
        help: violation.help,
        helpUrl: violation.helpUrl,
        target,
        html: node.html,
        domElement,
        computedRole: domElement?.role,
        accessibleName: domElement?.ariaLabel ?? domElement?.text,
        suggestedRemediation: buildRemediation(violation),
      };
    }),
  );

  return {
    url: inspection.url,
    title: inspection.title,
    totals: {
      accessibilityNodes: inspection.accessibilityTree.length,
      issues: issues.length,
      critical: countByImpact(issues, "critical"),
      serious: countByImpact(issues, "serious"),
      moderate: countByImpact(issues, "moderate"),
      minor: countByImpact(issues, "minor"),
    },
    issues,
  };
}

function normalizeImpact(impact: AxeViolation["impact"]): AccessibilityIssue["impact"] {
  return impact ?? "unknown";
}

function countByImpact(issues: AccessibilityIssue[], impact: AccessibilityIssue["impact"]): number {
  return issues.filter((issue) => issue.impact === impact).length;
}

function buildRemediation(violation: AxeViolation): string {
  return `${violation.help}. See ${violation.helpUrl}`;
}
