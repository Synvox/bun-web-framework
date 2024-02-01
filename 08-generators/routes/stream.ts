import { countButton } from "../components/countButton";
import { html } from "../store";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function* () {
  yield html`
    <a href="/index.ts">Back</a>
    <h1>Welcome to streaming but with components</h1>
  `;

  yield countButton("Fast Button", 100);
  await sleep(10000);
  yield html`<br />`;
  yield countButton("Slow Button", 1000);
  await sleep(10000);
  yield html`<p>Done</p>`;
}
