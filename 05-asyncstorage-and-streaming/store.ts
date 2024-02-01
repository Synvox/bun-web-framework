import { AsyncLocalStorage } from "async_hooks";
import { IncomingMessage, ServerResponse } from "http";

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
  if (res.getHeader("Content-Type") !== "text/html") {
    res.setHeader("Content-Type", "text/html");
    res.write("<!DOCTYPE html>");
  }
  res.write(strings.reduce((acc, str, i) => acc + str + (values[i] || ""), ""));
}
