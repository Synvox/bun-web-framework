import { countButton } from "../components/countButton";
import { html, write } from "../store";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function () {
  write(html`
    <a href="/index.ts">Back</a>
    <h1>Welcome to streaming but with components</h1>
  `);

  write(countButton("Fast Button", 100));
  await sleep(10000);
  write(html`<br />`);
  write(countButton("Slow Button", 1000));
  await sleep(10000);
  write(html`<p>Done</p>`);
}
