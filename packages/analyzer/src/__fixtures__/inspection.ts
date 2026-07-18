import type { BrowserInspection } from "@open-accessibility/tree";

export function createFixtureInspection(): BrowserInspection {
  return {
    url: "http://localhost:3000/fixtures",
    finalUrl: "http://localhost:3000/fixtures",
    title: "Accessibility Fixtures",
    inspectedAt: "2026-01-01T00:00:00.000Z",
    accessibilityTree: [
      { nodeId: "1", role: { value: "RootWebArea" }, name: { value: "Accessibility Fixtures" } },
      { nodeId: "2", backendDOMNodeId: 101, role: { value: "button" }, name: { value: "" } },
      { nodeId: "3", backendDOMNodeId: 102, role: { value: "image" }, name: { value: "" } },
      { nodeId: "4", backendDOMNodeId: 103, role: { value: "textbox" }, name: { value: "Email" } },
    ],
    dom: [
      {
        selector: "#empty-button",
        tagName: "button",
        backendNodeId: 101,
        outerHtml: '<button id="empty-button"></button>',
        id: "empty-button",
      },
      {
        selector: "#hero-image",
        tagName: "img",
        backendNodeId: 102,
        outerHtml: '<img id="hero-image" src="/hero.png">',
        id: "hero-image",
      },
      {
        selector: "#email",
        tagName: "input",
        backendNodeId: 103,
        outerHtml: '<input id="email" type="email">',
        id: "email",
      },
      {
        selector: "#save",
        tagName: "button",
        outerHtml: '<button id="save" aria-label="Save changes"></button>',
        id: "save",
        ariaLabel: "Save changes",
        accessibleNameHint: "Save changes",
      },
    ],
    axe: {
      violations: [
        {
          id: "button-name",
          impact: "critical",
          description: "Ensures buttons have discernible text",
          help: "Buttons must have discernible text",
          helpUrl: "https://dequeuniversity.com/rules/axe/4.10/button-name",
          nodes: [
            {
              target: ["#empty-button"],
              html: '<button id="empty-button"></button>',
              failureSummary: "Fix any of the following: Element does not have inner text.",
            },
          ],
        },
        {
          id: "image-alt",
          impact: "critical",
          description: "Ensures image elements have alternate text",
          help: "Images must have alternate text",
          helpUrl: "https://dequeuniversity.com/rules/axe/4.10/image-alt",
          nodes: [
            {
              target: ["#hero-image"],
              html: '<img id="hero-image" src="/hero.png">',
            },
          ],
        },
        {
          id: "label",
          impact: "serious",
          description: "Ensures every form element has a label",
          help: "Form elements must have labels",
          helpUrl: "https://dequeuniversity.com/rules/axe/4.10/label",
          nodes: [
            {
              target: ["#email"],
              html: '<input id="email" type="email">',
            },
          ],
        },
      ],
    },
  };
}

export function createHtmlFallbackInspection(): BrowserInspection {
  const inspection = createFixtureInspection();
  return {
    ...inspection,
    axe: {
      violations: [
        {
          id: "button-name",
          impact: "critical",
          description: "Ensures buttons have discernible text",
          help: "Buttons must have discernible text",
          helpUrl: "https://dequeuniversity.com/rules/axe/4.10/button-name",
          nodes: [
            {
              target: [".generated-selector"],
              html: '<button id="empty-button"></button>',
            },
          ],
        },
      ],
    },
  };
}
