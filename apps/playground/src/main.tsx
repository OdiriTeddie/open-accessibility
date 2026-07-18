import { createRoot } from "react-dom/client";
import "./styles.css";

function PlaygroundApp() {
  return (
    <main>
      <h1>Accessibility Playground</h1>
      <form aria-label="Example checkout">
        <label>
          Email
          <input type="email" placeholder="developer@example.com" />
        </label>
        <button type="submit">Inspect Example</button>
      </form>
      <button className="problem-button"></button>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<PlaygroundApp />);
