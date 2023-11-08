// 此模块仅用于 deno deploy
import { Hono } from "https://deno.land/x/hono@v3.10.0-rc.1/hono.ts";
import {
  etag,
  serveStatic,
} from "https://deno.land/x/hono@v3.10.0-rc.1/middleware.ts";
import cache from "./middlewares/cache.ts";

const app = new Hono();

app.use(
  "*",
  // 强制缓存
  cache(),
  // 协商缓存
  etag(),
  // 静态服务
  serveStatic({ root: "./" }),
);

Deno.serve(app.fetch);
