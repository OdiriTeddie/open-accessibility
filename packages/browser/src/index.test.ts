import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { inspectPage, normalizePlaywrightBrowserInstallError } from "./index.js";

describe("inspectPage", () => {
  let server: Server;
  let url: string;
  let baseUrl: string;

  beforeAll(async () => {
    server = createServer((request, response) => {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      response.end(renderFixture(request.url ?? "/"));
    });

    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", resolve);
    });
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
    url = `${baseUrl}/`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  function renderFixture(path: string): string {
    if (path.startsWith("/semantics")) {
      return `<!doctype html>
<html lang="en">
  <head><title>Semantic Fixture</title></head>
  <body>
    <main>
      <h1>Semantic Fixture</h1>
      <span id="save-label">Save profile</span>
      <button
        id="labelled-button"
        aria-labelledby="save-label"
        data-open-accessibility-source="fixtures/semantic.tsx:11:7"
        data-open-accessibility-component="SemanticFixture"
      ></button>
      <button id="hidden-button" aria-label="Hidden action" hidden></button>
      <section id="custom-region" role="region" aria-label="Account tools">
        <a id="settings-link" href="/settings">Settings</a>
      </section>
    </main>
  </body>
</html>`;
    }

    if (path.startsWith("/nested")) {
      return `<!doctype html>
<html lang="en">
  <head><title>Nested Fixture</title></head>
  <body>
    <main>
      <nav aria-label="Primary">
        <ul id="nav-list">
          <li><a id="home-link" href="/">Home</a></li>
          <li><a id="docs-link" href="/docs">Docs</a></li>
        </ul>
      </nav>
    </main>
  </body>
</html>`;
    }

    return `<!doctype html>
<html lang="en">
  <head><title>Browser Fixture</title></head>
  <body>
    <main>
      <h1>Browser Fixture</h1>
      <button
        id="empty-button"
        data-open-accessibility-source="fixtures/browser.tsx:10:7"
        data-open-accessibility-component="BrowserFixture"
        data-open-accessibility-token="secret-token"
        data-test-token="secret-token"
        data-noisy="ignored"
      ></button>
      <img id="missing-alt" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" />
      <label for="email">Email</label>
      <input id="email" type="email" />
    </main>
  </body>
</html>`;
  }

  it("collects DOM, accessibility tree, axe violations, backend ids, and attributes", async () => {
    const inspection = await inspectPage(url, {
      waitUntil: "load",
      waitForSelector: "main",
      timeoutMs: 15_000,
    });

    const button = inspection.dom.find((element) => element.selector === "#empty-button");
    const buttonAxNode = inspection.accessibilityTree.find(
      (node) => node.backendDOMNodeId === button?.backendNodeId,
    );

    expect(inspection.title).toBe("Browser Fixture");
    expect(inspection.finalUrl).toBe(url);
    expect(inspection.dom.length).toBeGreaterThan(0);
    expect(inspection.accessibilityTree.length).toBeGreaterThan(0);
    expect(inspection.axe.violations.map((violation) => violation.id)).toEqual(
      expect.arrayContaining(["button-name", "image-alt"]),
    );
    expect(button?.backendNodeId).toEqual(expect.any(Number));
    expect(button?.attributes).toMatchObject({
      id: "empty-button",
      "data-open-accessibility-source": "fixtures/browser.tsx:10:7",
      "data-open-accessibility-component": "BrowserFixture",
      "data-open-accessibility-token": "[redacted]",
    });
    expect(button?.attributes?.["data-test-token"]).toBeUndefined();
    expect(button?.attributes?.["data-noisy"]).toBeUndefined();
    expect(buttonAxNode?.role?.value).toBe("button");
  });

  it("captures accessible name hints from ARIA labels and omits hidden DOM from the AX tree", async () => {
    const inspection = await inspectPage(`${baseUrl}/semantics`, {
      waitUntil: "load",
      waitForSelector: "#labelled-button",
      timeoutMs: 15_000,
    });

    const labelledButton = inspection.dom.find((element) => element.selector === "#labelled-button");
    const hiddenButton = inspection.dom.find((element) => element.selector === "#hidden-button");
    const region = inspection.dom.find((element) => element.selector === "#custom-region");
    const labelledButtonAxNode = inspection.accessibilityTree.find(
      (node) => node.backendDOMNodeId === labelledButton?.backendNodeId,
    );
    const hiddenButtonAxNode = inspection.accessibilityTree.find(
      (node) => node.backendDOMNodeId === hiddenButton?.backendNodeId,
    );
    const regionAxNode = inspection.accessibilityTree.find(
      (node) => node.backendDOMNodeId === region?.backendNodeId,
    );

    expect(inspection.title).toBe("Semantic Fixture");
    expect(labelledButton?.accessibleNameHint).toBe("Save profile");
    expect(labelledButton?.attributes).toMatchObject({
      "aria-labelledby": "save-label",
      "data-open-accessibility-source": "fixtures/semantic.tsx:11:7",
      "data-open-accessibility-component": "SemanticFixture",
    });
    expect(labelledButtonAxNode?.role?.value).toBe("button");
    expect(labelledButtonAxNode?.name?.value).toBe("Save profile");
    expect(hiddenButton?.backendNodeId).toEqual(expect.any(Number));
    expect(hiddenButtonAxNode).toBeUndefined();
    expect(region?.role).toBe("region");
    expect(region?.accessibleNameHint).toBe("Account tools");
    expect(regionAxNode?.role?.value).toBe("region");
    expect(regionAxNode?.name?.value).toBe("Account tools");
  });

  it("preserves nested accessibility hierarchy relationships from CDP", async () => {
    const inspection = await inspectPage(`${baseUrl}/nested`, {
      waitUntil: "load",
      waitForSelector: "#nav-list",
      timeoutMs: 15_000,
    });

    const navigation = inspection.accessibilityTree.find(
      (node) => node.role?.value === "navigation" && node.name?.value === "Primary",
    );
    const list = inspection.accessibilityTree.find((node) => node.role?.value === "list");
    const listItems = inspection.accessibilityTree.filter((node) => node.role?.value === "listitem");
    const links = inspection.accessibilityTree.filter((node) => node.role?.value === "link");
    const homeLink = inspection.dom.find((element) => element.selector === "#home-link");
    const homeLinkAxNode = inspection.accessibilityTree.find(
      (node) => node.backendDOMNodeId === homeLink?.backendNodeId,
    );

    expect(inspection.title).toBe("Nested Fixture");
    expect(navigation?.childIds?.length).toBeGreaterThan(0);
    expect(list?.childIds).toEqual(expect.arrayContaining(listItems.map((node) => node.nodeId)));
    expect(listItems.length).toBe(2);
    expect(links.map((node) => node.name?.value)).toEqual(expect.arrayContaining(["Home", "Docs"]));
    expect(homeLink?.backendNodeId).toEqual(expect.any(Number));
    expect(homeLinkAxNode?.role?.value).toBe("link");
    expect(homeLinkAxNode?.name?.value).toBe("Home");
  });
});

describe("normalizePlaywrightBrowserInstallError", () => {
  it("adds a clear install hint for missing Chromium binaries", () => {
    const error = normalizePlaywrightBrowserInstallError(
      new Error("browserType.launch: Executable doesn't exist at C:\\Users\\example\\chromium.exe"),
    );

    expect(error.message).toContain("Playwright Chromium is not installed.");
    expect(error.message).toContain("pnpm exec playwright install chromium");
    expect(error.message).toContain("Original error:");
  });

  it("preserves unrelated browser launch errors", () => {
    const original = new Error("Browser closed unexpectedly");

    expect(normalizePlaywrightBrowserInstallError(original)).toBe(original);
  });
});
