import { describe, expect, it } from "vitest";
import { createComponentSourceProps, sourceProps } from "./index.js";

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
});
