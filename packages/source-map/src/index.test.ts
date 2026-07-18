import { describe, expect, it } from "vitest";
import { findSourceInAttributes, parseSourceLocation } from "./index.js";

describe("source mapping", () => {
  it("parses compact source locations", () => {
    expect(parseSourceLocation("src/App.tsx:12:4#CheckoutForm")).toEqual({
      file: "src/App.tsx",
      line: 12,
      column: 4,
      componentName: "CheckoutForm",
    });
  });

  it("maps explicit Open Accessibility source attributes", () => {
    expect(
      findSourceInAttributes({
        "data-open-accessibility-source": "apps/playground/src/main.tsx:9:10",
        "data-open-accessibility-component": "PlaygroundApp",
        "data-open-accessibility-framework": "react",
      }),
    ).toEqual({
      file: "apps/playground/src/main.tsx",
      line: 9,
      column: 10,
      componentName: "PlaygroundApp",
      framework: "react",
      confidence: "high",
      strategy: "source-attribute",
    });
  });

  it("maps split source file attributes", () => {
    expect(
      findSourceInAttributes({
        "data-source-file": "src/components/Search.tsx",
        "data-source-line": "22",
        "data-component-name": "SearchBox",
      }),
    ).toMatchObject({
      file: "src/components/Search.tsx",
      line: 22,
      componentName: "SearchBox",
      confidence: "medium",
      strategy: "source-file-attributes",
    });
  });
});
