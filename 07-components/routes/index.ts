import { html, write } from "../store";
import { countButton } from "../components/countButton";

export default async function () {
  write(html`<h1>Counters</h1>`);
  write(countButton("Fast Button", 100));
  write(html`<br />`);
  write(countButton("Slow Button", 2000));
  write(html`<br />`);
  write(html`<a href="/stream.ts">Streaming Example</a>`);
}
