import { createServer } from "http";

const server = createServer(async (req, res) => {
  const body = [];

  for await (const chunk of req) {
    body.push(chunk);
  }

  const bodyString = Buffer.concat(body).toString();

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html");
  res.end(`<!DOCTYPE html>
<html>
  <head>
    <title>You sent:</title>
  </head>
  <body>
    <h1>You sent:</h1>
    ${bodyString ? `<code><pre>${bodyString}</pre></code>` : `<p>Nothing</p>`}
  </body>
</html>
`);
});

server.listen(4000);
