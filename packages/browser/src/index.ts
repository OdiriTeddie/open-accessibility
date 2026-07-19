import axeSource from "axe-core";
import { chromium, type Browser, type BrowserContext, type CDPSession, type Page } from "playwright";
import type {
  AccessibilityTreeNode,
  AxeRunResult,
  BrowserInspection,
  DomElementSnapshot,
} from "@open-accessibility/tree";

export interface BrowserInspectOptions {
  headless?: boolean;
  timeoutMs?: number;
  viewport?: {
    width: number;
    height: number;
  };
  waitUntil?: "load" | "domcontentloaded" | "networkidle" | "commit";
  waitForSelector?: string;
  userAgent?: string;
  storageStatePath?: string;
  debug?: boolean;
}

export async function inspectPage(
  url: string,
  options: BrowserInspectOptions = {},
): Promise<BrowserInspection> {
  const browser = await chromium.launch({ headless: options.headless ?? true });
  let context: BrowserContext | undefined;

  try {
    context = await browser.newContext({
      viewport: options.viewport,
      userAgent: options.userAgent,
      storageState: options.storageStatePath,
    });
    const page = await context.newPage();
    logDebug(options, `Navigating to ${url}`);
    await page.goto(url, {
      waitUntil: options.waitUntil ?? "networkidle",
      timeout: options.timeoutMs ?? 30_000,
    });

    if (options.waitForSelector) {
      logDebug(options, `Waiting for selector ${options.waitForSelector}`);
      await page.waitForSelector(options.waitForSelector, {
        timeout: options.timeoutMs ?? 30_000,
      });
    }

    logDebug(options, "Collecting accessibility tree, DOM snapshot, and axe results");
    const [accessibilityTree, dom, axe, title] = await Promise.all([
      getAccessibilityTree(page),
      getDomSnapshot(page),
      runAxe(page),
      page.title(),
    ]);

    return {
      url,
      finalUrl: page.url(),
      title,
      inspectedAt: new Date().toISOString(),
      accessibilityTree,
      dom,
      axe,
    };
  } finally {
    await context?.close();
    await closeBrowser(browser);
  }
}

async function getAccessibilityTree(page: Page): Promise<AccessibilityTreeNode[]> {
  const session = await page.context().newCDPSession(page);
  try {
    const result = await session.send("Accessibility.getFullAXTree");
    return Array.isArray(result.nodes) ? (result.nodes as AccessibilityTreeNode[]) : [];
  } finally {
    await session.detach();
  }
}

async function getDomSnapshot(page: Page): Promise<DomElementSnapshot[]> {
  const dom = await page.locator("body *").evaluateAll((elements) => {
    function buildSnapshotSelector(element: HTMLElement): string {
      if (element.id) {
        return `#${CSS.escape(element.id)}`;
      }

      const parts: string[] = [];
      let current: HTMLElement | null = element;

      while (current && current.nodeType === Node.ELEMENT_NODE && parts.length < 4) {
        const tag = current.tagName.toLowerCase();
        const parent: HTMLElement | null = current.parentElement;
        if (!parent) {
          parts.unshift(tag);
          break;
        }

        const currentTagName = current.tagName;
        const siblings = Array.from(parent.children).filter(
          (child): child is HTMLElement =>
            child instanceof HTMLElement && child.tagName === currentTagName,
        );
        const index = siblings.indexOf(current) + 1;
        parts.unshift(siblings.length > 1 ? `${tag}:nth-of-type(${index})` : tag);
        current = parent;
      }

      return parts.join(" > ");
    }

    function getSnapshotAccessibleNameHint(element: HTMLElement): string | undefined {
      const ariaLabel = element.getAttribute("aria-label")?.trim();
      if (ariaLabel) {
        return ariaLabel;
      }

      const labelledBy = element.getAttribute("aria-labelledby");
      if (labelledBy) {
        const label = labelledBy
          .split(/\s+/)
          .map((id) => document.getElementById(id)?.innerText.trim())
          .filter(Boolean)
          .join(" ");
        if (label) {
          return label;
        }
      }

      const title = element.getAttribute("title")?.trim();
      if (title) {
        return title;
      }

      return element.innerText?.trim().slice(0, 160) || undefined;
    }

    return elements.slice(0, 1000).map((element) => {
      const htmlElement = element as HTMLElement;
      const attributes = Object.fromEntries(
        htmlElement.getAttributeNames().map((name) => [name, htmlElement.getAttribute(name) ?? ""]),
      );
      return {
        selector: buildSnapshotSelector(htmlElement),
        tagName: htmlElement.tagName.toLowerCase(),
        outerHtml: htmlElement.outerHTML.slice(0, 500),
        attributes,
        id: htmlElement.id || undefined,
        role: htmlElement.getAttribute("role") || undefined,
        ariaLabel: htmlElement.getAttribute("aria-label") || undefined,
        ariaLabelledBy: htmlElement.getAttribute("aria-labelledby") || undefined,
        title: htmlElement.getAttribute("title") || undefined,
        text: htmlElement.innerText?.trim().slice(0, 160) || undefined,
        accessibleNameHint: getSnapshotAccessibleNameHint(htmlElement),
      };
    });
  });

  return enrichDomSnapshotWithBackendNodeIds(page, dom);
}

async function runAxe(page: Page): Promise<AxeRunResult> {
  await page.addScriptTag({ content: axeSource.source });
  return page.evaluate(() => window.axe.run(document));
}

async function closeBrowser(browser: Browser): Promise<void> {
  await browser.close();
}

async function enrichDomSnapshotWithBackendNodeIds(
  page: Page,
  dom: DomElementSnapshot[],
): Promise<DomElementSnapshot[]> {
  const session = await page.context().newCDPSession(page);
  try {
    await session.send("DOM.enable");
    const documentResult = await session.send("DOM.getDocument", {
      depth: 0,
      pierce: true,
    });
    const rootNodeId = readNodeId(documentResult.root);
    if (!rootNodeId) {
      return dom;
    }

    const snapshotBackendNodeIds = await getBackendNodeIdsFromSnapshot(session);

    return Promise.all(
      dom.map(async (element) => {
        try {
          const queryResult = await session.send("DOM.querySelector", {
            nodeId: rootNodeId,
            selector: element.selector,
          });
          const nodeId = readNodeId(queryResult);
          if (!nodeId) {
            return element;
          }

          const describeResult = await session.send("DOM.describeNode", {
            nodeId,
          });
          const backendNodeId = readBackendNodeId(describeResult.node);
          return backendNodeId
            ? { ...element, backendNodeId }
            : { ...element, backendNodeId: snapshotBackendNodeIds.get(element.selector) };
        } catch {
          return { ...element, backendNodeId: snapshotBackendNodeIds.get(element.selector) };
        }
      }),
    );
  } finally {
    await session.detach();
  }
}

async function getBackendNodeIdsFromSnapshot(session: CDPSession): Promise<Map<string, number>> {
  const selectors = new Map<string, number>();
  const result = await session.send("DOMSnapshot.captureSnapshot", {
    computedStyles: [],
  });

  if (!isObject(result) || !Array.isArray(result.documents) || !Array.isArray(result.strings)) {
    return selectors;
  }

  const strings = result.strings;
  const document = result.documents[0];
  if (!isObject(document) || !isObject(document.nodes)) {
    return selectors;
  }

  const backendNodeIds = Array.isArray(document.nodes.backendNodeId)
    ? document.nodes.backendNodeId
    : [];
  const nodeNames = Array.isArray(document.nodes.nodeName) ? document.nodes.nodeName : [];
  const attributes = Array.isArray(document.nodes.attributes) ? document.nodes.attributes : [];

  attributes.forEach((attributeIndexes, index) => {
    if (!Array.isArray(attributeIndexes)) {
      return;
    }

    const id = readSnapshotAttribute(attributeIndexes, strings, "id");
    const backendNodeId = backendNodeIds[index];
    if (id && typeof backendNodeId === "number") {
      selectors.set(`#${escapeCssIdentifier(id)}`, backendNodeId);
    }

    const nodeNameIndex = nodeNames[index];
    const nodeName = typeof nodeNameIndex === "number" ? strings[nodeNameIndex]?.toLowerCase() : undefined;
    if (nodeName && typeof backendNodeId === "number" && !selectors.has(nodeName)) {
      selectors.set(nodeName, backendNodeId);
    }
  });

  return selectors;
}

function readSnapshotAttribute(
  attributeIndexes: unknown[],
  strings: unknown[],
  attributeName: string,
): string | undefined {
  for (let index = 0; index < attributeIndexes.length; index += 2) {
    const nameIndex = attributeIndexes[index];
    const valueIndex = attributeIndexes[index + 1];
    const name = typeof nameIndex === "number" ? strings[nameIndex] : undefined;
    const value = typeof valueIndex === "number" ? strings[valueIndex] : undefined;
    if (name === attributeName && typeof value === "string") {
      return value;
    }
  }
  return undefined;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function escapeCssIdentifier(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll("\"", "\\\"").replaceAll("#", "\\#");
}

function readNodeId(value: unknown): number | undefined {
  if (!value || typeof value !== "object" || !("nodeId" in value)) {
    return undefined;
  }
  const nodeId = (value as { nodeId?: unknown }).nodeId;
  return typeof nodeId === "number" && nodeId > 0 ? nodeId : undefined;
}

function readBackendNodeId(value: unknown): number | undefined {
  if (!value || typeof value !== "object" || !("backendNodeId" in value)) {
    return undefined;
  }
  const backendNodeId = (value as { backendNodeId?: unknown }).backendNodeId;
  return typeof backendNodeId === "number" && backendNodeId > 0 ? backendNodeId : undefined;
}

function logDebug(options: BrowserInspectOptions, message: string): void {
  if (options.debug) {
    console.error(`[open-accessibility:debug] ${message}`);
  }
}

declare global {
  interface Window {
    axe: {
      run: (context: Document) => Promise<AxeRunResult>;
    };
  }
}
