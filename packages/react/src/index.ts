export interface ReactComponentHint {
  displayName: string;
  sourceFile?: string;
}

export function getReactComponentHint(): ReactComponentHint | undefined {
  return undefined;
}
