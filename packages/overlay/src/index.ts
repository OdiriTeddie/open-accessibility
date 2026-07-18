export interface OverlayMessage {
  type: "highlight-node" | "clear-highlight";
  selector?: string;
}

export function createOverlayScript(): string {
  return "window.__OPEN_ACCESSIBILITY_OVERLAY__ = true;";
}
