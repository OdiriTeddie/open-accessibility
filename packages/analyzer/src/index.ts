import type {
  AccessibilityIssue,
  AnalysisReport,
  AxeViolation,
  BrowserInspection,
  DomElementSnapshot,
  NormalizedImpact,
} from "@open-accessibility/tree";

export function analyzeInspection(inspection: BrowserInspection): AnalysisReport {
  const issues = inspection.axe.violations.flatMap((violation) =>
    violation.nodes.map((node) => {
      const target = node.target[0] ?? "";
      const domElement = findDomElement(inspection.dom, target, node.html);
      return {
        id: violation.id,
        impact: normalizeImpact(violation.impact),
        description: violation.description,
        help: violation.help,
        helpUrl: violation.helpUrl,
        location: {
          selector: target,
          target: node.target,
          html: node.html,
          domElement,
        },
        computedRole: getComputedRole(domElement),
        accessibleName: domElement?.accessibleNameHint,
        suggestedRemediation: buildRemediation(violation),
      };
    }),
  );

  return {
    url: inspection.url,
    finalUrl: inspection.finalUrl,
    title: inspection.title,
    inspectedAt: inspection.inspectedAt,
    totals: {
      accessibilityNodes: inspection.accessibilityTree.length,
      domElements: inspection.dom.length,
      issues: issues.length,
      critical: countByImpact(issues, "critical"),
      serious: countByImpact(issues, "serious"),
      moderate: countByImpact(issues, "moderate"),
      minor: countByImpact(issues, "minor"),
      unknown: countByImpact(issues, "unknown"),
    },
    issues,
  };
}

function normalizeImpact(impact: AxeViolation["impact"]): NormalizedImpact {
  return impact ?? "unknown";
}

function countByImpact(issues: AccessibilityIssue[], impact: NormalizedImpact): number {
  return issues.filter((issue) => issue.impact === impact).length;
}

function buildRemediation(violation: AxeViolation): string {
  return `${violation.help}. See ${violation.helpUrl}`;
}

function findDomElement(
  elements: DomElementSnapshot[],
  selector: string,
  html: string,
): DomElementSnapshot | undefined {
  return (
    elements.find((element) => element.selector === selector) ??
    elements.find((element) => element.outerHtml === html) ??
    elements.find((element) => normalizeHtml(element.outerHtml).startsWith(normalizeHtml(html)))
  );
}

function getComputedRole(element: DomElementSnapshot | undefined): string | undefined {
  if (!element) {
    return undefined;
  }

  return element.role ?? implicitRoleByTagName[element.tagName];
}

function normalizeHtml(html: string): string {
  return html.replace(/\s+/g, " ").trim();
}

const implicitRoleByTagName: Record<string, string | undefined> = {
  a: "link",
  article: "article",
  aside: "complementary",
  button: "button",
  form: "form",
  footer: "contentinfo",
  h1: "heading",
  h2: "heading",
  h3: "heading",
  h4: "heading",
  h5: "heading",
  h6: "heading",
  header: "banner",
  img: "img",
  input: "textbox",
  main: "main",
  nav: "navigation",
  section: "region",
  select: "combobox",
  table: "table",
  textarea: "textbox",
  ul: "list",
  ol: "list",
  li: "listitem",
};
