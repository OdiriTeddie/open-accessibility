# @open-accessibility/react

React helpers for adding Open Accessibility source marker attributes.

## Usage

```tsx
import {
  createComponentSourceProps,
  formatReactSourceLocation,
  sourceProps,
} from "@open-accessibility/react";

const source = createComponentSourceProps({
  file: "src/App.tsx",
  componentName: "App",
});

export function App() {
  return (
    <main {...source(8, 3)}>
      <button {...sourceProps({ file: "src/App.tsx", line: 9, column: 7, componentName: "App" })}>
        Save
      </button>
    </main>
  );
}
```

The helpers emit `data-open-accessibility-*` attributes that the browser snapshot and source mapper can read.

## API

```ts
formatReactSourceLocation({
  file: "src/App.tsx",
  line: 12,
  column: 4,
});
```

Returns `src/App.tsx:12:4`.

`file` is required and must be non-empty. `line` and `column` are optional, but when provided they must be positive integers. `componentName` is optional and emitted as `data-open-accessibility-component` when provided.
