import { createRoot } from "react-dom/client";
import "./styles.css";

function PlaygroundApp() {
  return (
    <main>
      <h1>Accessibility Playground</h1>
      <section aria-labelledby="buttons-heading">
        <h2 id="buttons-heading">Buttons</h2>
        <button id="named-button" type="button" aria-label="Save changes"></button>
        <button
          id="empty-button"
          className="problem-button"
          type="button"
          data-open-accessibility-source="apps/playground/src/main.tsx:12:9"
          data-open-accessibility-component="PlaygroundApp"
          data-open-accessibility-framework="react"
        ></button>
      </section>

      <section aria-labelledby="images-heading">
        <h2 id="images-heading">Images</h2>
        <img
          id="decorative-image"
          alt=""
          src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
        />
        <img
          id="missing-alt-image"
          data-open-accessibility-source="apps/playground/src/main.tsx:29:9"
          data-open-accessibility-component="PlaygroundApp"
          data-open-accessibility-framework="react"
          src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
        />
      </section>

      <section aria-labelledby="forms-heading">
        <h2 id="forms-heading">Forms</h2>
        <form aria-label="Example checkout">
          <label>
            Email
            <input id="email" type="email" placeholder="developer@example.com" />
          </label>
          <input
            id="unlabelled-search"
            type="search"
            placeholder="Search catalog"
            data-open-accessibility-source="apps/playground/src/main.tsx:42:11"
            data-open-accessibility-component="PlaygroundApp"
            data-open-accessibility-framework="react"
          />
          <button type="submit">Inspect Example</button>
        </form>
      </section>

      <section aria-labelledby="landmarks-heading">
        <h2 id="landmarks-heading">Landmarks</h2>
        <nav aria-label="Primary">
          <a href="#buttons-heading">Buttons</a>
          <a href="#forms-heading">Forms</a>
        </nav>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<PlaygroundApp />);
