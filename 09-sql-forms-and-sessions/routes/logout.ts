import { endSession, html } from "../store";

export default async function* () {
  endSession();

  yield html`<h1>Logged out</h1>
    <p>You have been logged out</p>
    <a href="/login.ts">Login</a>`;
}
