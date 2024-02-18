// 此模块仅用于 deno deploy
import { Hono } from "https://deno.land/x/hono@v4.0.4/hono.ts";
import {
  etag,
  serveStatic,
} from "https://deno.land/x/hono@v4.0.4/middleware.ts";
import cache from "./middlewares/cache.ts";

const app = new Hono();

app.use(
  "*",
  // 强制缓存
  cache(),
  // 协商缓存
  etag(),
  // 静态服务
  serveStatic({
    root: "./",
    // 支持 vitepress 等静态站点
    rewriteRequestPath(path) {
      if (path.includes(".")) {
        return path;
      }
      if (path.endsWith("/")) {
        return path + "index.html";
      }
      return path + ".html";
    },
  }),
);

Deno.serve(app.fetch);
