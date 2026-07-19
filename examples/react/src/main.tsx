import { createRoot } from "react-dom/client";
import { createComponentSourceProps } from "@open-accessibility/react";

const source = createComponentSourceProps({
  file: "examples/react/src/main.tsx",
  componentName: "App",
});

function App() {
  return (
    <main {...source(11, 5)}>
      <h1 {...source(12, 7)}>React Accessibility Example</h1>
      <button {...source(13, 7)} aria-label="Save changes">
        Save
      </button>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
