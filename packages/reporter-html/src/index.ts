import type {
  AccessibilityTreeNode,
  AnalysisReport,
  DomElementSnapshot,
} from "@open-accessibility/tree";

export function renderHtmlReport(report: AnalysisReport): string {
  const links = createExplorerLinks(report);
  const issueRows = report.issues.map((issue, index) => renderIssue(issue, index, links)).join("\n");
  const axRows = renderAccessibilityTree(report.snapshot.accessibilityTree, links);
  const domRows = report.snapshot.dom.map((element) => renderDomElement(element, links)).join("\n");
  const sourceRows = report.issues
    .map((issue, index) => (issue.location.source ? renderSourceRow(issue, index) : ""))
    .join("\n");
  const reportData = escapeScriptJson(report);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Open Accessibility Report</title>
  <style>
    :root { color-scheme: light; --bg: #f7f7f4; --panel: #ffffff; --text: #191919; --muted: #666b70; --border: #d7d9dc; --accent: #12645f; --critical: #b42318; --serious: #b54708; --moderate: #776300; --minor: #2457a6; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: var(--text); background: var(--bg); }
    main { max-width: 1240px; margin: 0 auto; padding: 32px 20px 48px; }
    header { display: grid; gap: 6px; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
    h1 { margin: 0; font-size: 30px; line-height: 1.15; letter-spacing: 0; }
    h2 { margin: 0; font-size: 18px; letter-spacing: 0; }
    p { margin: 0; color: var(--muted); }
    code, pre { font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace; }
    code { overflow-wrap: anywhere; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(148px, 1fr)); gap: 10px; margin: 20px 0; }
    .metric { background: var(--panel); border: 1px solid var(--border); border-radius: 8px; padding: 14px; min-height: 82px; }
    .metric strong { display: block; font-size: 28px; line-height: 1; margin-bottom: 8px; }
    .metric span { color: var(--muted); font-size: 13px; }
    .toolbar { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin: 18px 0; }
    .tabs { display: flex; flex-wrap: wrap; gap: 6px; }
    button, input, select { font: inherit; }
    .tab { border: 1px solid var(--border); background: var(--panel); border-radius: 8px; padding: 8px 12px; cursor: pointer; }
    .tab[aria-selected="true"] { border-color: var(--accent); color: #fff; background: var(--accent); }
    .search { flex: 1 1 280px; min-width: 220px; border: 1px solid var(--border); border-radius: 8px; padding: 9px 11px; background: var(--panel); color: var(--text); }
    .impact-filter { flex: 0 1 180px; min-width: 150px; border: 1px solid var(--border); border-radius: 8px; padding: 9px 11px; background: var(--panel); color: var(--text); }
    .panel { display: none; }
    .panel.active { display: block; }
    .grid { display: grid; gap: 10px; }
    .tree { display: grid; gap: 8px; }
    .tree__children { display: grid; gap: 8px; margin-left: 18px; padding-left: 14px; border-left: 2px solid var(--border); }
    .tree__children:empty { display: none; }
    .item { background: var(--panel); border: 1px solid var(--border); border-radius: 8px; padding: 14px; }
    .item.hidden { display: none; }
    .item__top { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
    .meta { color: var(--muted); font-size: 12px; text-transform: uppercase; font-weight: 700; letter-spacing: .04em; }
    .badge { display: inline-flex; align-items: center; border-radius: 999px; padding: 3px 8px; color: #fff; font-size: 12px; font-weight: 700; text-transform: uppercase; }
    .links { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0; }
    .link { color: var(--accent); font-weight: 700; text-decoration: none; }
    .link:hover { text-decoration: underline; }
    .impact-critical { background: var(--critical); }
    .impact-serious { background: var(--serious); }
    .impact-moderate { background: var(--moderate); }
    .impact-minor, .impact-unknown { background: var(--minor); }
    dl { display: grid; grid-template-columns: minmax(120px, 180px) 1fr; gap: 8px 14px; margin: 0; }
    dt { color: var(--muted); font-weight: 700; }
    dd { margin: 0; min-width: 0; overflow-wrap: anywhere; }
    pre { margin: 10px 0 0; overflow: auto; white-space: pre-wrap; background: #f0f1f1; border-radius: 8px; padding: 10px; }
    .empty { background: var(--panel); border: 1px dashed var(--border); border-radius: 8px; padding: 18px; color: var(--muted); }
    @media (max-width: 720px) { main { padding: 22px 12px 36px; } dl { grid-template-columns: 1fr; gap: 4px; } .item__top { align-items: flex-start; } }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Open Accessibility Report</h1>
      <p>${escapeHtml(report.url)}</p>
      ${report.finalUrl !== report.url ? `<p>Final URL: ${escapeHtml(report.finalUrl)}</p>` : ""}
      ${report.title ? `<p>Title: ${escapeHtml(report.title)}</p>` : ""}
      <p>Inspected at ${escapeHtml(report.inspectedAt)}</p>
      <p>Schema ${escapeHtml(report.metadata.schemaVersion)} / Tool ${escapeHtml(report.metadata.toolVersion)}</p>
    </header>

    <section class="summary" aria-label="Summary">
      ${metric("Accessibility nodes", report.totals.accessibilityNodes)}
      ${metric("DOM elements", report.totals.domElements)}
      ${metric("Issues", report.totals.issues)}
      ${metric("Critical", report.totals.critical)}
      ${metric("Serious", report.totals.serious)}
      ${metric("Moderate", report.totals.moderate)}
      ${metric("Minor", report.totals.minor)}
    </section>

    <div class="toolbar">
      <div class="tabs" role="tablist" aria-label="Report views">
        ${tabButton("issues", "Issues", true)}
        ${tabButton("accessibility-tree", "Accessibility Tree", false)}
        ${tabButton("dom", "DOM", false)}
        ${tabButton("sources", "Sources", false)}
      </div>
      <input class="search" type="search" placeholder="Filter current view" aria-label="Filter current view" />
      <select class="impact-filter" aria-label="Filter by impact">
        <option value="all">All impacts</option>
        <option value="critical">Critical</option>
        <option value="serious">Serious</option>
        <option value="moderate">Moderate</option>
        <option value="minor">Minor</option>
      </select>
    </div>

    <section id="panel-issues" class="panel active" role="tabpanel" aria-labelledby="tab-issues">
      <div class="grid" data-filter-scope>${issueRows || `<div class="empty">No axe-core violations found.</div>`}</div>
    </section>
    <section id="panel-accessibility-tree" class="panel" role="tabpanel" aria-labelledby="tab-accessibility-tree">
      <div class="tree" data-filter-scope>${axRows || `<div class="empty">No accessibility nodes were returned.</div>`}</div>
    </section>
    <section id="panel-dom" class="panel" role="tabpanel" aria-labelledby="tab-dom">
      <div class="grid" data-filter-scope>${domRows || `<div class="empty">No DOM elements were captured.</div>`}</div>
    </section>
    <section id="panel-sources" class="panel" role="tabpanel" aria-labelledby="tab-sources">
      <div class="grid" data-filter-scope>${sourceRows || `<div class="empty">No mapped source locations found.</div>`}</div>
    </section>
  </main>
  <script id="open-accessibility-report-data" type="application/json">${reportData}</script>
  <script>
    const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
    const panels = Array.from(document.querySelectorAll('[role="tabpanel"]'));
    const search = document.querySelector('.search');
    const impactFilter = document.querySelector('.impact-filter');

    function activateTab(id) {
      tabs.forEach((tab) => tab.setAttribute('aria-selected', String(tab.id === 'tab-' + id)));
      panels.forEach((panel) => panel.classList.toggle('active', panel.id === 'panel-' + id));
      filterActivePanel();
    }

    function activateLinkTarget(anchor) {
      const target = document.querySelector(anchor.getAttribute('href'));
      const panel = target?.closest('[role="tabpanel"]');
      if (panel?.id?.startsWith('panel-')) {
        activateTab(panel.id.replace('panel-', ''));
      }
    }

    function filterActivePanel() {
      const query = search.value.trim().toLowerCase();
      const selectedImpact = impactFilter.value;
      const panel = document.querySelector('.panel.active [data-filter-scope]');
      if (!panel) return;
      Array.from(panel.querySelectorAll('.item')).forEach((item) => {
        const matchesText = query.length === 0 || item.textContent.toLowerCase().includes(query);
        const itemImpact = item.dataset.impact;
        const matchesImpact = selectedImpact === 'all' || !itemImpact || itemImpact === selectedImpact;
        item.classList.toggle('hidden', !matchesText || !matchesImpact);
      });
    }

    tabs.forEach((tab) => tab.addEventListener('click', () => activateTab(tab.dataset.tab)));
    Array.from(document.querySelectorAll('[data-explorer-link]')).forEach((anchor) => {
      anchor.addEventListener('click', () => activateLinkTarget(anchor));
    });
    if (window.location.hash) {
      const target = document.querySelector(window.location.hash);
      const panel = target?.closest('[role="tabpanel"]');
      if (panel?.id?.startsWith('panel-')) activateTab(panel.id.replace('panel-', ''));
    }
    search.addEventListener('input', filterActivePanel);
    impactFilter.addEventListener('change', filterActivePanel);
  </script>
</body>
</html>`;
}

function renderIssue(
  issue: AnalysisReport["issues"][number],
  index: number,
  links: ExplorerLinks,
): string {
  const issueId = issueElementId(index);
  const domId = findDomElementIdForIssue(issue, links);
  const axId = findAccessibilityNodeIdForIssue(issue, links);

  return `<article id="${issueId}" class="item issue" data-kind="issue" data-impact="${escapeHtml(issue.impact)}">
    <div class="item__top">
      <div>
        <div class="meta">${escapeHtml(issue.id)}</div>
        <h2>${escapeHtml(issue.help)}</h2>
      </div>
      <span class="badge impact-${escapeHtml(issue.impact)}">${escapeHtml(issue.impact)}</span>
    </div>
    <div class="links">
      ${domId ? explorerLink(`#${domId}`, "View DOM") : ""}
      ${axId ? explorerLink(`#${axId}`, "View AX node") : ""}
    </div>
    <dl>
      <dt>DOM element</dt><dd><code>${escapeHtml(issue.location.selector || "unknown")}</code></dd>
      <dt>Correlation</dt><dd>${escapeHtml(issue.location.correlation)}</dd>
      <dt>Source</dt><dd><code>${escapeHtml(formatSource(issue.location.source))}</code></dd>
      <dt>Source confidence</dt><dd>${escapeHtml(formatSourceConfidence(issue.location.source))}</dd>
      <dt>Source strategy</dt><dd>${escapeHtml(formatSourceStrategy(issue.location.source))}</dd>
      <dt>Computed role</dt><dd>${escapeHtml(issue.computedRole || "not exposed in initial snapshot")}</dd>
      <dt>Accessible name</dt><dd>${escapeHtml(issue.accessibleName || "not exposed in initial snapshot")}</dd>
      <dt>Remediation</dt><dd>${escapeHtml(issue.suggestedRemediation)}</dd>
    </dl>
    <pre>${escapeHtml(issue.location.html)}</pre>
  </article>`;
}

function renderAccessibilityTree(nodes: AccessibilityTreeNode[], links: ExplorerLinks): string {
  const { roots, nodesById } = buildAccessibilityTree(nodes);
  const visited = new Set<string>();

  return roots.map((node) => renderAccessibilityTreeNode(node, nodesById, links, visited)).join("\n");
}

function renderAccessibilityTreeNode(
  node: AccessibilityTreeNode,
  nodesById: Map<string, AccessibilityTreeNode>,
  links: ExplorerLinks,
  visited: Set<string>,
): string {
  if (visited.has(node.nodeId)) {
    return "";
  }
  visited.add(node.nodeId);

  const children = (node.childIds ?? [])
    .map((childId) => nodesById.get(childId))
    .filter((child): child is AccessibilityTreeNode => Boolean(child))
    .map((child) => renderAccessibilityTreeNode(child, nodesById, links, visited))
    .join("\n");

  return `${renderAccessibilityNode(node, links)}
    <div class="tree__children">${children}</div>`;
}

function renderAccessibilityNode(node: AccessibilityTreeNode, links: ExplorerLinks): string {
  const role = readValue(node.role) ?? "unknown";
  const name = readValue(node.name) ?? "";
  const axId = accessibilityNodeElementId(node);
  const relatedIssues = node.backendDOMNodeId
    ? links.issueIdsByBackendNodeId.get(node.backendDOMNodeId) ?? []
    : [];

  return `<article id="${axId}" class="item" data-kind="accessibility-node">
    <div class="item__top">
      <div>
        <div class="meta">AX node ${escapeHtml(node.nodeId)}</div>
        <h2>${escapeHtml(role)}</h2>
      </div>
      ${node.ignored ? `<span class="badge impact-unknown">ignored</span>` : ""}
    </div>
    ${renderRelatedIssueLinks(relatedIssues)}
    <dl>
      <dt>Accessible name</dt><dd>${escapeHtml(name || "not named")}</dd>
      <dt>Backend DOM node</dt><dd>${escapeHtml(String(node.backendDOMNodeId ?? "none"))}</dd>
      <dt>Children</dt><dd>${escapeHtml(node.childIds?.join(", ") || "none")}</dd>
    </dl>
  </article>`;
}

function renderDomElement(element: DomElementSnapshot, links: ExplorerLinks): string {
  const domId = domElementId(element);
  const axId = element.backendNodeId
    ? links.accessibilityNodeIdByBackendNodeId.get(element.backendNodeId)
    : undefined;
  const relatedIssues = [
    ...(links.issueIdsBySelector.get(element.selector) ?? []),
    ...(element.backendNodeId ? links.issueIdsByBackendNodeId.get(element.backendNodeId) ?? [] : []),
  ].filter((id, index, ids) => ids.indexOf(id) === index);

  return `<article id="${domId}" class="item" data-kind="dom-element">
    <div class="item__top">
      <div>
        <div class="meta">${escapeHtml(element.tagName)}</div>
        <h2><code>${escapeHtml(element.selector)}</code></h2>
      </div>
    </div>
    <div class="links">
      ${axId ? explorerLink(`#${axId}`, "View AX node") : ""}
      ${renderInlineIssueLinks(relatedIssues)}
    </div>
    <dl>
      <dt>Backend node</dt><dd>${escapeHtml(String(element.backendNodeId ?? "none"))}</dd>
      <dt>Role attribute</dt><dd>${escapeHtml(element.role || "none")}</dd>
      <dt>Name hint</dt><dd>${escapeHtml(element.accessibleNameHint || "none")}</dd>
      <dt>Source</dt><dd><code>${escapeHtml(formatSource(element.source))}</code></dd>
      <dt>Source confidence</dt><dd>${escapeHtml(formatSourceConfidence(element.source))}</dd>
      <dt>Source strategy</dt><dd>${escapeHtml(formatSourceStrategy(element.source))}</dd>
    </dl>
    <pre>${escapeHtml(element.outerHtml)}</pre>
  </article>`;
}

function renderSourceRow(issue: AnalysisReport["issues"][number], index: number): string {
  const source = issue.location.source;
  return `<article class="item" data-kind="source" data-impact="${escapeHtml(issue.impact)}">
    <div class="item__top">
      <div>
        <div class="meta">${escapeHtml(source?.componentName || "source")}</div>
        <h2><code>${escapeHtml(formatSource(source))}</code></h2>
      </div>
      <span class="badge impact-${escapeHtml(issue.impact)}">${escapeHtml(issue.impact)}</span>
    </div>
    <div class="links">${explorerLink(`#${issueElementId(index)}`, "View issue")}</div>
    <dl>
      <dt>Issue</dt><dd>${escapeHtml(issue.help)}</dd>
      <dt>Selector</dt><dd><code>${escapeHtml(issue.location.selector || "unknown")}</code></dd>
      <dt>Strategy</dt><dd>${escapeHtml(source?.strategy || "none")}</dd>
      <dt>Confidence</dt><dd>${escapeHtml(source?.confidence || "none")}</dd>
    </dl>
  </article>`;
}

function readValue(value: AccessibilityTreeNode["role"]): string | undefined {
  return typeof value?.value === "string" && value.value.trim() ? value.value : undefined;
}

function formatSource(source: AnalysisReport["issues"][number]["location"]["source"]): string {
  if (!source) {
    return "not mapped";
  }

  const line = source.line ? `:${source.line}` : "";
  const column = source.column ? `:${source.column}` : "";
  const component = source.componentName ? ` (${source.componentName})` : "";
  return `${source.file}${line}${column}${component}`;
}

interface ExplorerLinks {
  domIdBySelector: Map<string, string>;
  domIdByBackendNodeId: Map<number, string>;
  backendNodeIdBySelector: Map<string, number>;
  accessibilityNodeIdByBackendNodeId: Map<number, string>;
  issueIdsBySelector: Map<string, string[]>;
  issueIdsByBackendNodeId: Map<number, string[]>;
}

interface AccessibilityTreeRenderModel {
  roots: AccessibilityTreeNode[];
  nodesById: Map<string, AccessibilityTreeNode>;
}

function buildAccessibilityTree(nodes: AccessibilityTreeNode[]): AccessibilityTreeRenderModel {
  const nodesById = new Map(nodes.map((node) => [node.nodeId, node]));
  const childNodeIds = new Set<string>();

  nodes.forEach((node) => {
    node.childIds?.forEach((childId) => childNodeIds.add(childId));
  });

  const roots = nodes.filter((node) => !childNodeIds.has(node.nodeId));

  return {
    roots: roots.length > 0 ? roots : nodes,
    nodesById,
  };
}

function createExplorerLinks(report: AnalysisReport): ExplorerLinks {
  const domIdBySelector = new Map<string, string>();
  const domIdByBackendNodeId = new Map<number, string>();
  const backendNodeIdBySelector = new Map<string, number>();
  const accessibilityNodeIdByBackendNodeId = new Map<number, string>();
  const issueIdsBySelector = new Map<string, string[]>();
  const issueIdsByBackendNodeId = new Map<number, string[]>();

  report.snapshot.dom.forEach((element) => {
    const id = domElementId(element);
    domIdBySelector.set(element.selector, id);
    if (element.backendNodeId) {
      domIdByBackendNodeId.set(element.backendNodeId, id);
      backendNodeIdBySelector.set(element.selector, element.backendNodeId);
    }
  });

  report.snapshot.accessibilityTree.forEach((node) => {
    if (node.backendDOMNodeId) {
      accessibilityNodeIdByBackendNodeId.set(node.backendDOMNodeId, accessibilityNodeElementId(node));
    }
  });

  report.issues.forEach((issue, index) => {
    const issueId = issueElementId(index);
    addMapValue(issueIdsBySelector, issue.location.selector, issueId);

    const backendNodeId =
      issue.location.domElement?.backendNodeId ??
      report.snapshot.dom.find((element) => element.selector === issue.location.selector)?.backendNodeId;
    if (backendNodeId) {
      addMapValue(issueIdsByBackendNodeId, backendNodeId, issueId);
    }
  });

  return {
    domIdBySelector,
    domIdByBackendNodeId,
    backendNodeIdBySelector,
    accessibilityNodeIdByBackendNodeId,
    issueIdsBySelector,
    issueIdsByBackendNodeId,
  };
}

function findDomElementIdForIssue(
  issue: AnalysisReport["issues"][number],
  links: ExplorerLinks,
): string | undefined {
  return (
    (issue.location.domElement?.backendNodeId
      ? links.domIdByBackendNodeId.get(issue.location.domElement.backendNodeId)
      : undefined) ?? links.domIdBySelector.get(issue.location.selector)
  );
}

function findAccessibilityNodeIdForIssue(
  issue: AnalysisReport["issues"][number],
  links: ExplorerLinks,
): string | undefined {
  const backendNodeId =
    issue.location.accessibilityNode?.backendDOMNodeId ??
    issue.location.domElement?.backendNodeId ??
    links.backendNodeIdBySelector.get(issue.location.selector);
  if (backendNodeId) {
    return links.accessibilityNodeIdByBackendNodeId.get(backendNodeId);
  }
  return undefined;
}

function addMapValue<Key>(map: Map<Key, string[]>, key: Key, value: string): void {
  if (!key) {
    return;
  }
  map.set(key, [...(map.get(key) ?? []), value]);
}

function issueElementId(index: number): string {
  return `issue-${index + 1}`;
}

function domElementId(element: DomElementSnapshot): string {
  return `dom-${slugify(element.selector || element.tagName)}`;
}

function accessibilityNodeElementId(node: AccessibilityTreeNode): string {
  return `ax-${slugify(node.nodeId)}`;
}

function renderRelatedIssueLinks(issueIds: string[]): string {
  return issueIds.length > 0 ? `<div class="links">${renderInlineIssueLinks(issueIds)}</div>` : "";
}

function renderInlineIssueLinks(issueIds: string[]): string {
  return issueIds.map((id) => explorerLink(`#${id}`, "View issue")).join("");
}

function explorerLink(href: string, label: string): string {
  return `<a class="link" data-explorer-link href="${escapeHtml(href)}">${escapeHtml(label)}</a>`;
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function formatSourceConfidence(
  source: AnalysisReport["issues"][number]["location"]["source"],
): string {
  return source?.confidence ?? "not mapped";
}

function formatSourceStrategy(source: AnalysisReport["issues"][number]["location"]["source"]): string {
  return source?.strategy ?? "not mapped";
}

function metric(label: string, value: number): string {
  return `<div class="metric"><strong>${value}</strong><span>${escapeHtml(label)}</span></div>`;
}

function tabButton(id: string, label: string, selected: boolean): string {
  return `<button id="tab-${id}" class="tab" role="tab" data-tab="${id}" aria-selected="${String(selected)}" aria-controls="panel-${id}" type="button">${escapeHtml(label)}</button>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;");
}

function escapeScriptJson(report: AnalysisReport): string {
  return JSON.stringify(report).replaceAll("<", "\\u003c");
}
