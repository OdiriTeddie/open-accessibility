import { describe, expect, it } from "vitest";
import { createComponentSourceProps, formatReactSourceLocation, sourceProps } from "./index.js";

describe("React source props", () => {
  it("creates Open Accessibility source attributes", () => {
    expect(
      sourceProps({
        file: "src/App.tsx",
        line: 12,
        column: 4,
        componentName: "App",
      }),
    ).toEqual({
      "data-open-accessibility-source": "src/App.tsx:12:4",
      "data-open-accessibility-framework": "react",
      "data-open-accessibility-component": "App",
    });
  });

  it("formats source locations with optional line and column", () => {
    expect(formatReactSourceLocation({ file: " src/App.tsx " })).toBe("src/App.tsx");
    expect(formatReactSourceLocation({ file: "src/App.tsx", line: 12 })).toBe("src/App.tsx:12");
    expect(formatReactSourceLocation({ file: "src/App.tsx", line: 12, column: 4 })).toBe(
      "src/App.tsx:12:4",
    );
  });

  it("creates component-scoped source helpers", () => {
    const source = createComponentSourceProps({
      file: "apps/playground/src/main.tsx",
      componentName: "PlaygroundApp",
    });

    expect(source(29, 9)).toMatchObject({
      "data-open-accessibility-source": "apps/playground/src/main.tsx:29:9",
      "data-open-accessibility-component": "PlaygroundApp",
    });
  });

  it("trims file and component defaults", () => {
    const source = createComponentSourceProps({
      file: " src/App.tsx ",
      componentName: " App ",
    });

    expect(source(1, 2)).toEqual({
      "data-open-accessibility-source": "src/App.tsx:1:2",
      "data-open-accessibility-framework": "react",
      "data-open-accessibility-component": "App",
    });
  });

  it("rejects invalid source marker inputs", () => {
    expect(() => sourceProps({ file: "" })).toThrow("file must be a non-empty string");
    expect(() => sourceProps({ file: "src/App.tsx", componentName: " " })).toThrow(
      "componentName must be a non-empty string",
    );
    expect(() => sourceProps({ file: "src/App.tsx", line: 0 })).toThrow(
      "line must be a positive integer",
    );
    expect(() => sourceProps({ file: "src/App.tsx", column: 1.5 })).toThrow(
      "column must be a positive integer",
    );
  });
});
