import axeSource from "axe-core";
import { chromium, type Browser, type Page } from "playwright";
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
}

export async function inspectPage(
  url: string,
  options: BrowserInspectOptions = {},
): Promise<BrowserInspection> {
  const browser = await chromium.launch({ headless: options.headless ?? true });

  try {
    const page = await browser.newPage({
      viewport: options.viewport,
    });
    await page.goto(url, {
      waitUntil: options.waitUntil ?? "networkidle",
      timeout: options.timeoutMs ?? 30_000,
    });

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
  return page.locator("body *").evaluateAll((elements) =>
    elements.slice(0, 1000).map((element) => {
      const htmlElement = element as HTMLElement;
      return {
        selector: buildSelector(htmlElement),
        tagName: htmlElement.tagName.toLowerCase(),
        outerHtml: htmlElement.outerHTML.slice(0, 500),
        id: htmlElement.id || undefined,
        role: htmlElement.getAttribute("role") || undefined,
        ariaLabel: htmlElement.getAttribute("aria-label") || undefined,
        ariaLabelledBy: htmlElement.getAttribute("aria-labelledby") || undefined,
        title: htmlElement.getAttribute("title") || undefined,
        text: htmlElement.innerText?.trim().slice(0, 160) || undefined,
        accessibleNameHint: getAccessibleNameHint(htmlElement),
      };
    }),
  );
}

async function runAxe(page: Page): Promise<AxeRunResult> {
  await page.addScriptTag({ content: axeSource.source });
  return page.evaluate(() => window.axe.run(document));
}

async function closeBrowser(browser: Browser): Promise<void> {
  await browser.close();
}

function buildSelector(element: HTMLElement): string {
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

function getAccessibleNameHint(element: HTMLElement): string | undefined {
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

declare global {
  interface Window {
    axe: {
      run: (context: Document) => Promise<AxeRunResult>;
    };
  }
}
