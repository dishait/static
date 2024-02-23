// 此模块仅用于 deno deploy
import { slash } from "https://deno.land/x/easy_std@v0.8.0/src/path.ts";
import { walk } from "https://deno.land/std@0.216.0/fs/walk.ts";
import { relative } from "https://deno.land/std@0.216.0/path/relative.ts";
import { Hono } from "https://deno.land/x/hono@v4.0.4/hono.ts";
import {
  etag,
  serveStatic,
} from "https://deno.land/x/hono@v4.0.4/middleware.ts";
import cache from "./middlewares/cache.ts";
import { MiddlewareHandler } from "https://deno.land/x/hono@v4.0.4/types.ts";

export interface Options {
  /**
   * @default 'ssg'
   */
  mode?: "ssg" | "spa" | "fallback" | "nuxt-ssg";
  /**
   * @default './'
   */
  root?: string;
  /**
   * @default false
   */
  forceCache?: boolean;
  port?: number;
}

export const defaultOptions: Options = {
  mode: "ssg",
  root: "./",
  forceCache: false,
};

export async function useStaticServer(options: Options = {}) {
  const {
    port,
    mode = defaultOptions.mode,
    root = defaultOptions.root,
    forceCache = defaultOptions.forceCache,
  } = options;

  const app = new Hono();

  if (forceCache) {
    // 强制缓存
    use(cache());
  }
  // 协商缓存
  use(etag());

  if (mode === "fallback") {
    useServeStatic();
  }

  if (mode === "ssg") {
    useServeStatic((path) => {
      if (path.includes(".")) {
        return path;
      }
      if (path.endsWith("/")) {
        return path + "index.html";
      }
      return path + ".html";
    });
  }

  if (mode === "spa") {
    useServeStatic((path) => {
      if (path.includes(".")) {
        return path;
      }
      return "index.html";
    });
  }

  if (mode === "nuxt-ssg") {
    const routes: string[] = [];
    for await (
      const entry of walk(root!, {
        includeFiles: false,
        skip: [/_nuxt/],
      })
    ) {
      routes.push("/" + slash(relative(root!, entry.path)));
    }

    useServeStatic((path) => {
      if (path.includes(".")) {
        return path;
      }
      if (path.endsWith("/")) {
        return path + "index.html";
      }
      if (routes.includes(path)) {
        return path + "/" + "index.html";
      }
      return "404.html";
    });
  }

  Deno.serve({ port }, app.fetch);

  function use(middleware: MiddlewareHandler) {
    app.use("*", middleware);
  }

  function useServeStatic(rewriteRequestPath?: (path: string) => string) {
    use(
      serveStatic({
        root,
        rewriteRequestPath,
      }),
    );
  }
}

if (import.meta.main) {
  // 开启强制缓存
  useStaticServer({
    forceCache: true,
  });
}
