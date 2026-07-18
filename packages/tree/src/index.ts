export interface AccessibilityTreeNode {
  nodeId: string;
  role?: string;
  name?: string;
  ignored?: boolean;
  childIds?: string[];
}

export function countAccessibilityNodes(nodes: readonly unknown[]): number {
  return nodes.length;
}
