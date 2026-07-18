import type { DomElementSnapshot, SourceLocation } from "@open-accessibility/tree";

export type { SourceLocation } from "@open-accessibility/tree";

export interface SourceMapper {
  findSourceForElement(element: DomElementSnapshot): SourceLocation | undefined;
}

export const OPEN_ACCESSIBILITY_SOURCE_ATTRIBUTE = "data-open-accessibility-source";
export const OPEN_ACCESSIBILITY_COMPONENT_ATTRIBUTE = "data-open-accessibility-component";
export const OPEN_ACCESSIBILITY_FRAMEWORK_ATTRIBUTE = "data-open-accessibility-framework";

export function findSourceForElement(element: DomElementSnapshot): SourceLocation | undefined {
  return element.source ?? findSourceInAttributes(element.attributes);
}

export function findSourceInAttributes(
  attributes: Record<string, string> | undefined,
): SourceLocation | undefined {
  if (!attributes) {
    return undefined;
  }

  const explicitSource =
    attributes[OPEN_ACCESSIBILITY_SOURCE_ATTRIBUTE] ??
    attributes["data-source"] ??
    attributes["data-source-location"];
  const parsed = explicitSource ? parseSourceLocation(explicitSource) : undefined;
  const file = parsed?.file ?? attributes["data-source-file"] ?? attributes["data-file"];

  if (!file) {
    return undefined;
  }

  return {
    file,
    line: parsed?.line ?? parsePositiveInteger(attributes["data-source-line"]),
    column: parsed?.column ?? parsePositiveInteger(attributes["data-source-column"]),
    componentName:
      attributes[OPEN_ACCESSIBILITY_COMPONENT_ATTRIBUTE] ??
      attributes["data-component"] ??
      attributes["data-component-name"] ??
      parsed?.componentName,
    framework: attributes[OPEN_ACCESSIBILITY_FRAMEWORK_ATTRIBUTE],
    confidence: explicitSource ? "high" : "medium",
    strategy: explicitSource ? "source-attribute" : "source-file-attributes",
  };
}

export function parseSourceLocation(value: string): Omit<SourceLocation, "confidence" | "strategy"> | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const componentSeparator = trimmed.lastIndexOf("#");
  const locationPart = componentSeparator > -1 ? trimmed.slice(0, componentSeparator) : trimmed;
  const componentName =
    componentSeparator > -1 ? trimmed.slice(componentSeparator + 1).trim() || undefined : undefined;

  const match = /^(?<file>.*?)(?::(?<line>\d+))?(?::(?<column>\d+))?$/.exec(locationPart);
  const file = match?.groups?.file?.trim();
  if (!file) {
    return undefined;
  }

  return {
    file,
    line: parsePositiveInteger(match?.groups?.line),
    column: parsePositiveInteger(match?.groups?.column),
    componentName,
  };
}

function parsePositiveInteger(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}
