import { createComponentSourceProps } from "@open-accessibility/react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const source = createComponentSourceProps({
  file: "apps/playground/src/main.tsx",
  componentName: "PlaygroundApp",
});

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
          {...source(17, 9)}
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
          {...source(32, 9)}
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
            {...source(46, 11)}
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
