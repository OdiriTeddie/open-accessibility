import { createComponentSourceProps } from "@open-accessibility/react";

const source = createComponentSourceProps({
  file: "examples/next/app/page.tsx",
  componentName: "Page",
});

export default function Page() {
  return (
    <main {...source(10, 5)}>
      <h1 {...source(11, 7)}>Next.js Accessibility Example</h1>
      <button {...source(12, 7)} aria-label="Open menu">
        Menu
      </button>
    </main>
  );
}
