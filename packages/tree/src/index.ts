export type Impact = "minor" | "moderate" | "serious" | "critical";
export type NormalizedImpact = Impact | "unknown";

export const REPORT_SCHEMA_NAME = "open-accessibility-analysis-report";
export const REPORT_SCHEMA_VERSION = "0.1.0";
export const REPORT_TOOL_NAME = "open-accessibility";

export interface ReportMetadata {
  schemaName: typeof REPORT_SCHEMA_NAME;
  schemaVersion: typeof REPORT_SCHEMA_VERSION;
  toolName: typeof REPORT_TOOL_NAME;
  toolVersion: string;
}

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
  attributes?: Record<string, string>;
  backendNodeId?: number;
  id?: string;
  role?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  title?: string;
  text?: string;
  accessibleNameHint?: string;
  source?: SourceLocation;
}

export interface SourceLocation {
  file: string;
  line?: number;
  column?: number;
  componentName?: string;
  framework?: string;
  confidence: "high" | "medium" | "low";
  strategy: string;
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
  accessibilityNode?: AccessibilityTreeNode;
  correlation: "backend-node-id" | "selector" | "html" | "none";
  source?: SourceLocation;
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
  metadata: ReportMetadata;
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
  snapshot: {
    accessibilityTree: AccessibilityTreeNode[];
    dom: DomElementSnapshot[];
  };
}

export function createReportMetadata(toolVersion: string): ReportMetadata {
  return {
    schemaName: REPORT_SCHEMA_NAME,
    schemaVersion: REPORT_SCHEMA_VERSION,
    toolName: REPORT_TOOL_NAME,
    toolVersion,
  };
}

export function countAccessibilityNodes(nodes: readonly AccessibilityTreeNode[]): number {
  return nodes.length;
}
