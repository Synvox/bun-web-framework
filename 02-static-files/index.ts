import { stat } from "fs/promises";
import { createReadStream } from "fs";
import { join, extname } from "path";
import { createServer } from "http";

const isFile = async (path: string) => {
  try {
    const stats = await stat(path);
    return stats.isFile();
  } catch (err) {
    return false;
  }
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const path = join(import.meta.dir, "public", url.pathname.slice(1));
  if (await isFile(path)) {
    const fileType = extname(path).slice(1);

    res.setHeader(
      "Content-Type",
      {
        html: "text/html",
        gif: "image/gif",
      }[fileType] || "text/plain"
    );

    res.statusCode = 200;
    const stream = createReadStream(path);

    // idk why typescript doesn't like this
    stream.pipe(res as any);

    stream.on("end", () => {
      res.end();
    });
  } else {
    res.statusCode = 404;
    res.end("Not Found");
  }
});

server.listen(4000);
