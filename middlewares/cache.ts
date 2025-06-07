import { basename } from "https://deno.land/std@0.196.0/path/mod.ts";
import { Context } from "https://deno.land/x/hono@v4.0.7/context.ts";
import { STATUS_CODE } from "https://deno.land/std@0.217.0/http/status.ts";
import type { MiddlewareHandler } from "https://deno.land/x/hono@v4.0.7/types.ts";

interface Options {
  cacheControl: string;
  ignore?: (ctx: Context) => boolean | Promise<boolean>;
}

// 仅匹配具有哈希值的路径
// 例如：/assets/index.825553e7.css
// 例如：/assets/index.825553e7.js
const hashReg = /.+\..+\..+/;

const defaultOptions: Options = {
  // 默认 1 年的缓存时间
  cacheControl: "public, max-age=31536000, immutable",
  ignore(ctx) {
    const base = basename(ctx.req.path);

    // 如果是 HTML 页面，则不缓存
    const isHtml = base.endsWith(".html");
    // 如果不是带 hash 的静态资源，则不缓存
    const hasHash = hashReg.test(base);

    return isHtml || !hasHash;
  },
};

export default function cache(
  options = defaultOptions,
): MiddlewareHandler {
  const {
    ignore = defaultOptions.ignore,
    cacheControl = defaultOptions.cacheControl,
  } = options;

  return async function (c, next) {
    await next();
    if (await ignore?.(c)) {
      return;
    }
    if (c.res.status === STATUS_CODE.OK) {
      c.res.headers.set("Cache-Control", cacheControl);
    }
  };
}
