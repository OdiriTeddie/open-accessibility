# @open-accessibility/source-map

Source marker parsing for DOM snapshots.

## Usage

```ts
import { findSourceInAttributes, parseSourceLocation } from "@open-accessibility/source-map";

const parsed = parseSourceLocation("src/App.tsx:12:4#App");
const source = findSourceInAttributes({
  "data-open-accessibility-source": "src/App.tsx:12:4",
  "data-open-accessibility-component": "App",
  "data-open-accessibility-framework": "react",
});

console.log(parsed?.file);
console.log(source?.confidence);
```

Preferred attributes:

```html
<button
  data-open-accessibility-source="src/App.tsx:12:4"
  data-open-accessibility-component="App"
  data-open-accessibility-framework="react"
></button>
```
