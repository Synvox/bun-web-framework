import { AsyncLocalStorage } from "async_hooks";
import { IncomingMessage, ServerResponse } from "http";
import { randomBytes } from "crypto";

const asyncLocalStorage = new AsyncLocalStorage<{
  req: IncomingMessage;
  res: ServerResponse;
}>();

export function provide<T>(
  req: IncomingMessage,
  res: ServerResponse,
  fn: () => Promise<T>
) {
  return asyncLocalStorage.run({ req, res }, fn);
}

export function getReqRes() {
  return asyncLocalStorage.getStore();
}

export function write(data: string) {
  const { res } = getReqRes()!;
  if (res.getHeader("Content-Type") !== "text/html")
    res.setHeader("Content-Type", "text/html");
  res.write(data);
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
