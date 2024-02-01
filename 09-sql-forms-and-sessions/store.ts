import { AsyncLocalStorage } from "async_hooks";
import { IncomingMessage, ServerResponse } from "http";
import { randomBytes } from "crypto";
import { sql } from "./sql";

const asyncLocalStorage = new AsyncLocalStorage<{
  req: IncomingMessage;
  res: ServerResponse;
}>();

export async function provide(
  req: IncomingMessage,
  res: ServerResponse,
  fn: () => any | Promise<any> | AsyncGenerator<any, any, any>
) {
  await asyncLocalStorage.run({ req, res }, fn);
}

export function getReqRes() {
  return asyncLocalStorage.getStore();
}

export function html(strings: TemplateStringsArray, ...values: any[]) {
  return strings.reduce((acc, str, i) => {
    const value = values[i];
    return (
      acc +
      str +
      (value === undefined
        ? ""
        : typeof value === "number"
        ? value.toLocaleString()
        : value.toString() || "")
    );
  }, "");
}

const jsWeakMap = new WeakMap<ServerResponse, Map<Function, string>>();
export function js<T extends unknown[]>(
  fn: (...args: T) => void,
  ...args: T
): string {
  const { res } = getReqRes()!;

  if (!jsWeakMap.has(res)) jsWeakMap.set(res, new Map());
  const map = jsWeakMap.get(res)!;
  let id: string | undefined = undefined;

  if (map.has(fn)) {
    id = map.get(fn);
    return `<script>window["${id}"].apply(document.currentScript.previousElementSibling, ${JSON.stringify(
      args
    )})</script>`;
  } else {
    id = randomBytes(4).toString("hex");
    map.set(fn, id);
    return `<script>(window["${id}"]=${fn.toString()}).apply(document.currentScript.previousElementSibling, ${JSON.stringify(
      args
    )})</script>`;
  }
}

export function css(
  strings: TemplateStringsArray,
  ...values: (string | number)[]
) {
  return {
    css: strings.reduce((acc, str, i) => acc + str + (values[i] || ""), ""),
  };
}

export class StatusChange extends Error {
  statusCode: number;
  headers?: Headers;
  constructor(message: string, statusCode: number, headers?: Headers) {
    super(message);
    this.statusCode = statusCode;
    this.headers = headers;
  }
}

export class Redirect extends StatusChange {
  constructor(url: string) {
    const headers = new Headers();
    headers.set("Location", url);
    super("Redirect", 302, headers);
  }
}

export function redirect(url: string) {
  return new Redirect(url);
}

const cssWeakMap = new WeakMap<ServerResponse, Set<{}>>();

export function component<El extends HTMLElement, Props extends unknown[]>(
  render: (...props: Props) => string,
  script?: (this: El, ...props: Props) => void,
  styles?: ReturnType<typeof css>
) {
  return (...props: Props) => {
    let returned = "";

    if (styles) {
      const { res } = getReqRes()!;
      if (!cssWeakMap.has(res)) cssWeakMap.set(res, new Set());
      const set = cssWeakMap.get(res)!;
      if (!set.has(styles)) {
        set.add(styles);
        returned += html`<style>
          ${styles.css}
        </style>`;
      }
    }

    returned += render(...props);

    if (script) returned += js(script, ...props);

    return returned;
  };
}

let bodyWeakMap = new WeakMap<IncomingMessage, Buffer>();
export async function getReqBinary() {
  const { req } = getReqRes()!;
  if (bodyWeakMap.has(req)) return bodyWeakMap.get(req)!;

  const body = [];
  for await (const chunk of req) {
    body.push(chunk);
  }

  const buffer = Buffer.concat(body);
  bodyWeakMap.set(req, buffer);
  return buffer;
}

export async function getFormData() {
  const body = await getReqBinary();
  return new URLSearchParams(body.toString());
}

export function cookies(): Record<string, string> {
  const { req } = getReqRes()!;
  const cookieStr = req.headers.cookie || "";
  return cookieStr
    .split(";")
    .map((v) => v.split("="))
    .reduce((acc: any, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});
}

function getSessionId() {
  const reqCookies = cookies();
  const id = reqCookies.session || randomBytes(32).toString("hex");
  const { res } = getReqRes()!;
  if (!reqCookies.session)
    res.setHeader("Set-Cookie", `session=${id}; HttpOnly; SameSite=Strict`);
  return id;
}

export function getSession() {
  const id = getSessionId();
  const session = sql<{ data: any }>`
    select data from sessions
    where id = ${id}
  `.first();
  if (session) return JSON.parse(session.data);
  else return {};
}

export function setSession(data: any) {
  const id = getSessionId();
  const session = getSession();
  sql`
    insert into sessions (id, data)
    values (${id}, ${JSON.stringify({
      ...session,
      ...data,
    })})
    on conflict (id) do update set data = excluded.data
  `.exec();
}

export function endSession() {
  const id = getSessionId();

  sql`
    delete from sessions
    where id = ${id}
  `.exec();

  const { res } = getReqRes()!;
  res.setHeader("Set-Cookie", `session=; HttpOnly; SameSite=Strict`);
}
