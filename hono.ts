// 此模块仅用于 deno deploy
import { Hono } from "https://deno.land/x/hono@v4.0.4/hono.ts";
import {
  etag,
  serveStatic,
} from "https://deno.land/x/hono@v4.0.4/middleware.ts";
import cache from "./middlewares/cache.ts";

export interface Options {
  /**
   * @default 'ssg'
   */
  mode?: "ssg" | "spa" | "fallback";
  /**
   * @default './'
   */
  root?: string;
}

export const defaultOptions: Options = {
  mode: "ssg",
  root: "./",
};

export function useStaticServer(options: Options = {}) {
  const { mode = defaultOptions.mode, root = defaultOptions.root } = options;

  const app = new Hono();

  const presetMiddlewares = [
    // 强制缓存
    cache(),
    // 协商缓存
    etag(),
  ];

  if (mode === "ssg") {
    app.use(
      "*",
      ...presetMiddlewares,
      // 静态服务
      serveStatic({
        root,
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
  }

  if (mode === "fallback") {
    app.use(
      "*",
      ...presetMiddlewares,
      // 静态服务
      serveStatic({
        root,
      }),
    );
  }

  if (mode === "spa") {
    app.use(
      "*",
      ...presetMiddlewares,
      // 静态服务
      serveStatic({
        root,
        rewriteRequestPath(path) {
          if (path.includes(".")) {
            return path;
          }
          return "index.html";
        },
      }),
    );
  }

  Deno.serve(app.fetch);
}

if (import.meta.main) {
  useStaticServer();
}
