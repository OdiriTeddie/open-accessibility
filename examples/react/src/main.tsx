import { createRoot } from "react-dom/client";

function App() {
  return (
    <main>
      <h1>React Accessibility Example</h1>
      <button aria-label="Save changes">Save</button>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
