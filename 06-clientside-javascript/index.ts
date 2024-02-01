import { stat } from "fs/promises";
import { createServer } from "http";
import { extname, join } from "path";
import { provide } from "./store";

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
  const path = join(import.meta.dir, "routes", url.pathname.slice(1));
  const fileType = extname(path).slice(1);

  if ((await isFile(path)) && fileType === "ts") {
    try {
      const { default: fn } = await import(path);
      await provide(req, res, () => fn());
    } catch (err) {
      res.statusCode = 500;
      res.write(
        err instanceof Error ? err.message : "An Unknown Error Occurred"
      );
    } finally {
      res.end();
    }
  } else {
    res.statusCode = 404;
    res.end("Not Found");
  }
});

server.listen(4000);
