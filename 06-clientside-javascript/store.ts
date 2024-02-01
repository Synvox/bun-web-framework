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
  res.write(data);
}

export function html(strings: TemplateStringsArray, ...values: string[]) {
  const { res } = getReqRes()!;
  if (res.getHeader("Content-Type") !== "text/html")
    res.setHeader("Content-Type", "text/html");
  res.write(strings.reduce((acc, str, i) => acc + str + (values[i] || ""), ""));
}

const jsWeakMap = new WeakMap<ServerResponse, Map<Function, string>>();
export function js<T extends unknown[]>(
  fn: (...args: T) => void,
  ...args: T
): void {
  const { res } = getReqRes()!;

  if (res.getHeader("Content-Type") !== "text/html")
    res.setHeader("Content-Type", "text/html");

  if (!jsWeakMap.has(res)) jsWeakMap.set(res, new Map());
  const map = jsWeakMap.get(res)!;
  let id: string | undefined = undefined;

  if (map.has(fn)) {
    id = map.get(fn);
    res.write(
      `<script>window["${id}"].apply(this, ${JSON.stringify(args)})</script>`
    );
  } else {
    id = randomBytes(4).toString("hex");
    map.set(fn, id);
    res.write(
      `<script>(window["${id}"]=${fn.toString()}).apply(this, ${JSON.stringify(
        args
      )})</script>`
    );
  }
}
