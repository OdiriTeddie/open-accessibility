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
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<DocsApp />);
