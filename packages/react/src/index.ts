export interface ReactComponentHint {
  displayName: string;
  sourceFile?: string;
}

export interface ReactSourceLocation {
  file: string;
  line?: number;
  column?: number;
  componentName?: string;
}

export interface ReactSourceDefaults {
  file: string;
  componentName?: string;
}

export type OpenAccessibilitySourceProps = {
  "data-open-accessibility-source": string;
  "data-open-accessibility-framework": "react";
  "data-open-accessibility-component"?: string;
};

export function getReactComponentHint(): ReactComponentHint | undefined {
  return undefined;
}

export function sourceProps(location: ReactSourceLocation): OpenAccessibilitySourceProps {
  const componentName = normalizeOptionalText(location.componentName, "componentName");
  const props: OpenAccessibilitySourceProps = {
    "data-open-accessibility-source": formatReactSourceLocation(location),
    "data-open-accessibility-framework": "react",
  };

  if (componentName) {
    props["data-open-accessibility-component"] = componentName;
  }

  return props;
}

export function createComponentSourceProps(
  defaults: ReactSourceDefaults,
): (line?: number, column?: number) => OpenAccessibilitySourceProps {
  const file = normalizeRequiredText(defaults.file, "file");
  const componentName = normalizeOptionalText(defaults.componentName, "componentName");

  return (line?: number, column?: number) =>
    sourceProps({
      file,
      line,
      column,
      componentName,
    });
}

export function formatReactSourceLocation(location: ReactSourceLocation): string {
  const file = normalizeRequiredText(location.file, "file");
  const line = formatOptionalPositiveInteger(location.line, "line");
  const column = formatOptionalPositiveInteger(location.column, "column");
  return `${file}${line}${column}`;
}

function normalizeRequiredText(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`Open Accessibility React source ${field} must be a non-empty string.`);
  }
  return normalized;
}

function normalizeOptionalText(value: string | undefined, field: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`Open Accessibility React source ${field} must be a non-empty string when provided.`);
  }
  return normalized;
}

function formatOptionalPositiveInteger(value: number | undefined, field: string): string {
  if (value === undefined) {
    return "";
  }
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Open Accessibility React source ${field} must be a positive integer when provided.`);
  }
  return `:${value}`;
}
