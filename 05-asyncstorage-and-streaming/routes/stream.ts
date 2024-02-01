import { html } from "../store";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function () {
  html`
    <a href="/index.ts">Back</a>
    <h1>Welcome to streaming</h1>
  `;

  await sleep(1000);

  html`<h2>Streaming is cool</h2>`;

  await sleep(1000);

  html`<p>Lets count to 50</p>`;

  for (let i = 0; i <= 50; i++) {
    await sleep(500);
    html`<p>${String(i)}</p>`;
  }
}
