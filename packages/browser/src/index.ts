import axeSource from "axe-core";
import { chromium, type Browser, type Page } from "playwright";

export interface BrowserInspectOptions {
  headless?: boolean;
  timeoutMs?: number;
}

export interface DomElementSnapshot {
  selector: string;
  tagName: string;
  id?: string;
  role?: string;
  ariaLabel?: string;
  text?: string;
}

export interface BrowserInspection {
  url: string;
  title: string;
  accessibilityTree: unknown[];
  dom: DomElementSnapshot[];
  axe: AxeRunResult;
}

export interface AxeRunResult {
  violations: AxeViolation[];
}

export interface AxeViolation {
  id: string;
  impact?: "minor" | "moderate" | "serious" | "critical" | null;
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    target: string[];
    html: string;
    failureSummary?: string;
  }>;
}

export async function inspectPage(
  url: string,
  options: BrowserInspectOptions = {},
): Promise<BrowserInspection> {
  const browser = await chromium.launch({ headless: options.headless ?? true });

  try {
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "networkidle",
      timeout: options.timeoutMs ?? 30_000,
    });

    const accessibilityTree = await getAccessibilityTree(page);
    const dom = await getDomSnapshot(page);
    const axe = await runAxe(page);

    return {
      url,
      title: await page.title(),
      accessibilityTree,
      dom,
      axe,
    };
  } finally {
    await closeBrowser(browser);
  }
}

async function getAccessibilityTree(page: Page): Promise<unknown[]> {
  const session = await page.context().newCDPSession(page);
  const result = await session.send("Accessibility.getFullAXTree");
  await session.detach();
  return Array.isArray(result.nodes) ? result.nodes : [];
}

async function getDomSnapshot(page: Page): Promise<DomElementSnapshot[]> {
  return page.locator("body *").evaluateAll((elements) =>
    elements.slice(0, 1000).map((element) => {
      const htmlElement = element as HTMLElement;
      return {
        selector: buildSelector(htmlElement),
        tagName: htmlElement.tagName.toLowerCase(),
        id: htmlElement.id || undefined,
        role: htmlElement.getAttribute("role") || undefined,
        ariaLabel: htmlElement.getAttribute("aria-label") || undefined,
        text: htmlElement.innerText?.trim().slice(0, 160) || undefined,
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

declare global {
  interface Window {
    axe: {
      run: (context: Document) => Promise<AxeRunResult>;
    };
  }
}
