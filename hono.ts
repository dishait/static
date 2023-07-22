// 此模块仅用于 deno deploy
import { Hono} from "https://deno.land/x/hono@v3.3.2/hono.ts";
import {
  etag,
  compress,
  serveStatic,
} from "https://deno.land/x/hono@v3.3.2/middleware.ts";
import cache from "./middlewares/cache.ts"

const app = new Hono();

app.use(
  "*",
  // 强制缓存
  cache(),
  // 协商缓存
  etag(),
  // 压缩
  compress(),
  // 静态服务
  serveStatic({ root: './' }),
);

Deno.serve(app.fetch);
