// 此模块仅用于 deno deploy
import { Hono} from "https://deno.land/x/hono@v3.3.1/hono.ts";
import {
  cache,
  compress,
  etag,
  serveStatic,
} from "https://deno.land/x/hono@v3.3.1/middleware.ts";

const app = new Hono();

app.use(
  "*",
  // 强制缓存
  cache({
    wait: true,
    cacheName: "docs",
    cacheControl: 'max-age=3600',
  }),
  // 协商缓存
  etag(),
  // 压缩
  compress(),
  // 静态服务
  serveStatic({ root: Deno.cwd() }),
);

Deno.serve(app.fetch);
