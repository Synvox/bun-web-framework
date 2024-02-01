import { stat } from "fs/promises";
import { createServer } from "http";
import { extname, join } from "path";
import { StatusChange, provide } from "./store";

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

  if (!((await isFile(path)) && fileType === "ts")) {
    res.statusCode = 404;
    res.end("Not Found");
    return;
  }

  const write = (item: any) => {
    if (item === undefined) return;
    if (res.getHeader("Content-Type") !== "text/html") {
      res.setHeader("Content-Type", "text/html");
      res.writeHead(200);
    }

    if (!res.headersSent) res.write("<!DOCTYPE html>");

    res.write(item.toString());
  };

  try {
    const { default: fn } = await import(path);
    await provide(req, res, async () => {
      const routeResponse = fn();

      if (routeResponse instanceof Promise) {
        const item = await routeResponse;
        if (item instanceof StatusChange) throw item;
        write(item);
      } else if (routeResponse[Symbol.asyncIterator]) {
        for await (const item of routeResponse) {
          if (item instanceof StatusChange) throw item;
          write(item);
        }
      } else {
        throw new Error("Invalid Route");
      }
    });
  } catch (err) {
    if (err instanceof StatusChange) {
      res.writeHead(
        err.statusCode,
        err.headers ? Object.fromEntries(err.headers.entries()) : {}
      );
    } else {
      res.statusCode = 500;
      res.write(
        err instanceof Error ? err.message : "An Unknown Error Occurred"
      );
      console.error(err);
    }
  } finally {
    res.end();
  }
});

server.listen(4000);
