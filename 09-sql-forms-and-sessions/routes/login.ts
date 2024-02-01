import { sql } from "../sql";
import { getFormData, html, redirect, setSession } from "../store";

export default async function* () {
  const body = await getFormData();

  if (body.has("username") && body.has("password")) {
    const username = body.get("username");
    const password = body.get("password");

    const user = sql<{ id: number; username: string }>`
      select * from users
      where username = ${username}
      and password = ${password}
    `.first();

    if (user) {
      setSession({ userId: user.id });
      throw redirect("/welcome.ts");
    }

    yield html`<p style="color:red">Invalid username or password</p>`;
  }

  yield html`
    <form method="POST">
      <input type="text" name="username" placeholder="username" /><br />
      <input type="password" name="password" placeholder="password" /><br />
      <button type="submit">Submit</button>
    </form>
  `;
}
