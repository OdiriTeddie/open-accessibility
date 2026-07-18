export type Impact = "minor" | "moderate" | "serious" | "critical";
export type NormalizedImpact = Impact | "unknown";

export interface AccessibilityProperty {
  name: string;
  value?: AccessibilityValue;
}

export interface AccessibilityValue {
  type?: string;
  value?: string | number | boolean;
}

export interface AccessibilityTreeNode {
  nodeId: string;
  ignored?: boolean;
  role?: AccessibilityValue;
  name?: AccessibilityValue;
  description?: AccessibilityValue;
  value?: AccessibilityValue;
  backendDOMNodeId?: number;
  childIds?: string[];
  properties?: AccessibilityProperty[];
}

export interface DomElementSnapshot {
  selector: string;
  tagName: string;
  outerHtml: string;
  id?: string;
  role?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  title?: string;
  text?: string;
  accessibleNameHint?: string;
}

export interface AxeRunResult {
  violations: AxeViolation[];
  passes?: AxeCheckResult[];
  incomplete?: AxeCheckResult[];
  inapplicable?: AxeCheckResult[];
}

export interface AxeCheckResult {
  id: string;
  impact?: Impact | null;
  description: string;
  help: string;
  helpUrl: string;
  nodes: AxeNodeResult[];
}

export type AxeViolation = AxeCheckResult;

export interface AxeNodeResult {
  target: string[];
  html: string;
  failureSummary?: string;
}

export interface BrowserInspection {
  url: string;
  finalUrl: string;
  title: string;
  inspectedAt: string;
  accessibilityTree: AccessibilityTreeNode[];
  dom: DomElementSnapshot[];
  axe: AxeRunResult;
}

export interface IssueLocation {
  selector: string;
  target: string[];
  html: string;
  domElement?: DomElementSnapshot;
}

export interface AccessibilityIssue {
  id: string;
  impact: NormalizedImpact;
  description: string;
  help: string;
  helpUrl: string;
  location: IssueLocation;
  computedRole?: string;
  accessibleName?: string;
  suggestedRemediation: string;
}

export interface AnalysisReport {
  url: string;
  finalUrl: string;
  title: string;
  inspectedAt: string;
  totals: {
    accessibilityNodes: number;
    domElements: number;
    issues: number;
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
    unknown: number;
  };
  issues: AccessibilityIssue[];
}

export function countAccessibilityNodes(nodes: readonly AccessibilityTreeNode[]): number {
  return nodes.length;
}
