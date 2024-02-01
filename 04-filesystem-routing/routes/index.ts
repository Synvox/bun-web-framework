import { IncomingMessage, ServerResponse } from "http";

export default async function (_req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Content-Type", "text/html");
  res.end("<h1>Hello World</h1><a href='/page2.ts'>Page 2</a>");
}
