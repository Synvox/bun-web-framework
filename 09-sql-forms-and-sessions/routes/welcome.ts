import { sql } from "../sql";
import { getSession, html, redirect } from "../store";

export default async function* () {
  const userId = getSession().userId;
  if (!userId) throw redirect("/login.ts");

  const user = sql<{ id: number; username: string }>`
    select * from users
    where id = ${userId}
  `.first();

  if (!user) throw redirect("/login.ts");

  yield html`<h1>Admin</h1>
    <p>Hello ${user.username}</p>
    <a href="/logout.ts">Logout</a>`;
}
