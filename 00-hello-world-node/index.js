const { createServer } = require("http");

const server = createServer((req, res) => {
  res.end("Hello World");
});

server.listen(4000);
