import { component, css, html, js } from "../store";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function* () {
  const panel1Id = "panel-1";
  const panel2Id = "panel-2";
  const randomNumberDivId = "random-number";

  yield Page(
    Main(
      AppNav(),
      Section(
        { id: panel1Id, width: "320px" },
        Nav(html` <h1>Notes</h1> `),
        Article(html`<div id="${randomNumberDivId}"></div>`)
      ),
      Section(
        { id: panel2Id },
        Nav(html`
          <h1>This panel suspends</h1>
          <small>And we'll wait for it to complete</small>
        `),
        Article(html`
          <div
            style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;gap:10px;flex-direction:column;"
          >
            <label for="progress"> Loading... </label>
            <progress id="progress" max="100" value="0"></progress>
          </div>
        `)
      )
    )
  );

  async function* updateProgress() {
    for (let i = 0; i < 100; i += 10) {
      await sleep(Math.round(Math.random() * 1000));
      yield js((i) => {
        const progressElement = document.getElementById(
          "progress"
        ) as HTMLProgressElement;
        progressElement.value = i;
        progressElement.labels[0].textContent = `Loading... ${i}%`;
      }, i);
    }

    yield Swap(
      { id: panel2Id },
      Section(
        {},
        Nav(html`
          <h1>This is now loaded</h1>
          <small>It's Done!</small>
        `),
        Article(html` no longer loading `)
      )
    );
  }

  async function* randomNumber() {
    for (let i = 0; i < 100; i++) {
      await sleep(500);
      yield Swap(
        { id: randomNumberDivId },
        html`<div id="${randomNumberDivId}">
          ${Math.round(Math.random() * 100)}
        </div>`
      );
    }
  }

  for await (const yielded of combineAsyncFunctions(
    updateProgress,
    randomNumber
  )) {
    yield yielded;
  }
}

async function* combineAsyncFunctions(
  ...functions: (() => AsyncGenerator<any>)[]
) {
  let generators = functions.map((fn) => {
    const gen = fn();
    return [gen, gen.next()] as const;
  });

  while (generators.length > 0) {
    const promises = generators.map(
      async ([gen, promise]) => [gen, await promise] as const
    );

    const [gen, completed] = await Promise.race(promises);

    // replace the completed promise with the next one
    generators = generators.map(([g, p]) => [g, g === gen ? g.next() : p]);

    if (completed.done) {
      generators = generators.filter(([g]) => g !== gen);
    } else {
      yield completed.value;
    }
  }
}

const Page = component(
  (...children: string[]) => html`
    <html>
      <head></head>
      <body>
        ${children}
      </body>
    </html>
  `,
  function (this: HTMLElement) {},
  css`
    * {
      margin: 0;
      padding: 0;
    }
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }
    main {
      display: flex;
      flex-direction: row;
      height: 100vh;
      height: 100dvh;
      color: #444;
      font-family:
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        Roboto,
        Oxygen,
        Ubuntu,
        Cantarell,
        "Open Sans",
        "Helvetica Neue",
        sans-serif;
    }
    progress::-webkit-progress-value {
      transition-duration: 1s;
    }
  `
);

const Main = component(
  (...children: string[]) => html` <main>${children}</main> `,
  function (this: HTMLElement) {},
  css`
    * {
      margin: 0;
      padding: 0;
    }
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }
    main {
      display: flex;
      flex-direction: row;
      height: 100vh;
      height: 100dvh;
      color: #444;
      font-family:
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        Roboto,
        Oxygen,
        Ubuntu,
        Cantarell,
        "Open Sans",
        "Helvetica Neue",
        sans-serif;
    }
  `
);

const AppNav = component(
  () => html` <nav id="appnav"></nav> `,
  function (this: HTMLElement) {},
  css`
    nav#appnav {
      background: #0f2740;
      width: 200px;
      flex-shrink: 0;
    }
  `
);

const Nav = component(
  (...children: string[]) => html` <nav>${children}</nav> `,
  function (this: HTMLElement) {},
  css`
    nav {
      padding: 10px 20px;
      border-bottom: 1px solid #eee;
      min-height: 64px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
  `
);

const Section = component(
  (
    { width, id }: { width?: string; id?: string },
    ...children: string[]
  ) => html`
    <section
      style=${width ? `width:${width}` : "flex-grow:1"}
      ${id ? `id="${id}"` : ""}
    >
      ${children}
    </section>
  `,
  function (this: HTMLElement) {},
  css`
    section {
      border-right: 1px solid #eee;
      flex-shrink: 0;
      &:last-of-type {
        border-right: none;
      }
    }
  `
);

const Article = component(
  (...children: string[]) => html` <article>${children}</article> `,
  function (this: HTMLElement) {},
  css`
    article {
      height: 100%;
    }
  `
);

const Swap = component(
  ({ id }: { id: string }, ...children: string[]) =>
    html`<div data-swap-for="${id}" hidden>${children}</div>`,
  function (this: HTMLElement) {
    if (!this.firstElementChild) throw new Error("No children to swap for");
    const id = this.dataset.swapFor!;
    const el = document.getElementById(id)!;
    el.replaceWith(this.firstElementChild!);
    this.remove();
  }
);
