import { countButton } from "../components/countButton";
import { html } from "../store";

export default async function* () {
  yield html`<h1>Counters</h1>`;
  yield countButton("Fast Button", 100);
  yield html`<br />`;
  yield countButton("Slow Button", 2000);
  yield html`<br />`;
  yield html`<a href="/stream.ts">Streaming Example</a>`;
}
