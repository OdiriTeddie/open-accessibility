import { createRoot } from "react-dom/client";
import "./styles.css";

function DocsApp() {
  return (
    <main>
      <h1>Open Accessibility</h1>
      <p>
        Browser-sourced accessibility inspection for developers. The 0.1 docs will cover CLI
        inspection, report formats, and the package architecture.
      </p>
      <section>
        <h2>0.1 MVP</h2>
        <ul>
          <li>Launch Chromium with Playwright.</li>
          <li>Read the computed accessibility tree through CDP.</li>
          <li>Run axe-core and produce CLI, JSON, and HTML reports.</li>
        </ul>
      </section>
      <section>
        <h2>Source Markers</h2>
        <p>
          Source mapping is driven by optional development-only DOM attributes. The primary marker is
          <code>data-open-accessibility-source</code>, with values like
          <code>src/App.tsx:12:4</code>.
        </p>
        <ul>
          <li>
            <code>data-open-accessibility-source</code> maps an element to
            <code>file:line:column</code>.
          </li>
          <li>
            <code>data-open-accessibility-component</code> labels the owning component.
          </li>
          <li>
            <code>data-open-accessibility-framework</code> identifies the framework, such as
            <code>react</code>.
          </li>
        </ul>
        <pre>{`import { createComponentSourceProps } from "@open-accessibility/react";

const source = createComponentSourceProps({
  file: "src/App.tsx",
  componentName: "App",
});

export function App() {
  return <button {...source(12, 4)} />;
}`}</pre>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<DocsApp />);
