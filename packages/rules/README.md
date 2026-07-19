# @open-accessibility/rules

Placeholder package for explanation rules that will augment axe findings with Open Accessibility guidance.

## Usage

```ts
import { rules, type ExplanationRule } from "@open-accessibility/rules";

const customRule: ExplanationRule = {
  id: "example",
  title: "Example rule",
  explain: () => "Explain the accessibility behavior in developer-facing terms.",
};

console.log(rules.length);
console.log(customRule.explain({}));
```

The exported `rules` array is currently empty while the rules engine API is being shaped.
