import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { inspectPage } from "./index.js";

describe("inspectPage", () => {
  let server: Server;
  let url: string;

  beforeAll(async () => {
    server = createServer((_, response) => {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      response.end(`<!doctype html>
<html lang="en">
  <head><title>Browser Fixture</title></head>
  <body>
    <main>
      <h1>Browser Fixture</h1>
      <button
        id="empty-button"
        data-open-accessibility-source="fixtures/browser.tsx:10:7"
        data-open-accessibility-component="BrowserFixture"
      ></button>
      <img id="missing-alt" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" />
      <label for="email">Email</label>
      <input id="email" type="email" />
    </main>
  </body>
</html>`);
    });

    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", resolve);
    });
    const address = server.address() as AddressInfo;
    url = `http://127.0.0.1:${address.port}/`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

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
    });
    expect(buttonAxNode?.role?.value).toBe("button");
  });
});
