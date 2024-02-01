// putting this in a route for a quick and dirty way to initialize the database

import { sql } from "../sql";
import { html } from "../store";

export default async function* () {
  yield html` <div>Initializing database</div>`;

  sql`drop table if exists users`.exec();
  sql`drop table if exists sessions`.exec();

  sql`
    create table if not exists users (
      id integer primary key,
      username text not null,
      password text not null
    )
  `.exec();

  sql`
    create table if not exists sessions (
      id text primary key,
      data text not null
    )
  `.exec();

  sql`
    insert into users (username, password)
    values ('admin', 'password')
  `.exec();

  yield html` <div>Database Initialized</div>`;
}
