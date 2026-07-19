import type {
  AccessibilityTreeNode,
  AnalysisReport,
  DomElementSnapshot,
} from "@open-accessibility/tree";

export function renderHtmlReport(report: AnalysisReport): string {
  const issueRows = report.issues.map(renderIssue).join("\n");
  const axRows = report.snapshot.accessibilityTree.map(renderAccessibilityNode).join("\n");
  const domRows = report.snapshot.dom.map(renderDomElement).join("\n");
  const sourceRows = report.issues.filter((issue) => issue.location.source).map(renderSourceRow).join("\n");
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
    .panel { display: none; }
    .panel.active { display: block; }
    .grid { display: grid; gap: 10px; }
    .item { background: var(--panel); border: 1px solid var(--border); border-radius: 8px; padding: 14px; }
    .item.hidden { display: none; }
    .item__top { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
    .meta { color: var(--muted); font-size: 12px; text-transform: uppercase; font-weight: 700; letter-spacing: .04em; }
    .badge { display: inline-flex; align-items: center; border-radius: 999px; padding: 3px 8px; color: #fff; font-size: 12px; font-weight: 700; text-transform: uppercase; }
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
    </div>

    <section id="panel-issues" class="panel active" role="tabpanel" aria-labelledby="tab-issues">
      <div class="grid" data-filter-scope>${issueRows || `<div class="empty">No axe-core violations found.</div>`}</div>
    </section>
    <section id="panel-accessibility-tree" class="panel" role="tabpanel" aria-labelledby="tab-accessibility-tree">
      <div class="grid" data-filter-scope>${axRows || `<div class="empty">No accessibility nodes were returned.</div>`}</div>
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

    function activateTab(id) {
      tabs.forEach((tab) => tab.setAttribute('aria-selected', String(tab.id === 'tab-' + id)));
      panels.forEach((panel) => panel.classList.toggle('active', panel.id === 'panel-' + id));
      filterActivePanel();
    }

    function filterActivePanel() {
      const query = search.value.trim().toLowerCase();
      const panel = document.querySelector('.panel.active [data-filter-scope]');
      if (!panel) return;
      Array.from(panel.querySelectorAll('.item')).forEach((item) => {
        item.classList.toggle('hidden', query.length > 0 && !item.textContent.toLowerCase().includes(query));
      });
    }

    tabs.forEach((tab) => tab.addEventListener('click', () => activateTab(tab.dataset.tab)));
    search.addEventListener('input', filterActivePanel);
  </script>
</body>
</html>`;
}

function renderIssue(issue: AnalysisReport["issues"][number]): string {
  return `<article class="item issue" data-kind="issue">
    <div class="item__top">
      <div>
        <div class="meta">${escapeHtml(issue.id)}</div>
        <h2>${escapeHtml(issue.help)}</h2>
      </div>
      <span class="badge impact-${escapeHtml(issue.impact)}">${escapeHtml(issue.impact)}</span>
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

function renderAccessibilityNode(node: AccessibilityTreeNode): string {
  const role = readValue(node.role) ?? "unknown";
  const name = readValue(node.name) ?? "";
  return `<article class="item" data-kind="accessibility-node">
    <div class="item__top">
      <div>
        <div class="meta">AX node ${escapeHtml(node.nodeId)}</div>
        <h2>${escapeHtml(role)}</h2>
      </div>
      ${node.ignored ? `<span class="badge impact-unknown">ignored</span>` : ""}
    </div>
    <dl>
      <dt>Accessible name</dt><dd>${escapeHtml(name || "not named")}</dd>
      <dt>Backend DOM node</dt><dd>${escapeHtml(String(node.backendDOMNodeId ?? "none"))}</dd>
      <dt>Children</dt><dd>${escapeHtml(node.childIds?.join(", ") || "none")}</dd>
    </dl>
  </article>`;
}

function renderDomElement(element: DomElementSnapshot): string {
  return `<article class="item" data-kind="dom-element">
    <div class="item__top">
      <div>
        <div class="meta">${escapeHtml(element.tagName)}</div>
        <h2><code>${escapeHtml(element.selector)}</code></h2>
      </div>
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

function renderSourceRow(issue: AnalysisReport["issues"][number]): string {
  const source = issue.location.source;
  return `<article class="item" data-kind="source">
    <div class="item__top">
      <div>
        <div class="meta">${escapeHtml(source?.componentName || "source")}</div>
        <h2><code>${escapeHtml(formatSource(source))}</code></h2>
      </div>
      <span class="badge impact-${escapeHtml(issue.impact)}">${escapeHtml(issue.impact)}</span>
    </div>
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
