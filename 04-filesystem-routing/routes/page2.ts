import { IncomingMessage, ServerResponse } from "http";

export default async function (_req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Content-Type", "text/html");
  res.end("<a href='/index.ts'>Back</a><h1>Page 2</h1>");
}
