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
  const props: OpenAccessibilitySourceProps = {
    "data-open-accessibility-source": formatSourceLocation(location),
    "data-open-accessibility-framework": "react",
  };

  if (location.componentName) {
    props["data-open-accessibility-component"] = location.componentName;
  }

  return props;
}

export function createComponentSourceProps(
  defaults: ReactSourceDefaults,
): (line?: number, column?: number) => OpenAccessibilitySourceProps {
  return (line?: number, column?: number) =>
    sourceProps({
      file: defaults.file,
      line,
      column,
      componentName: defaults.componentName,
    });
}

function formatSourceLocation(location: ReactSourceLocation): string {
  const line = location.line ? `:${location.line}` : "";
  const column = location.column ? `:${location.column}` : "";
  return `${location.file}${line}${column}`;
}
