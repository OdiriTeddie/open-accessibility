# @open-accessibility/react

React helpers for adding Open Accessibility source marker attributes.

## Usage

```tsx
import { createComponentSourceProps, sourceProps } from "@open-accessibility/react";

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
