import { Context } from "https://deno.land/x/hono@v4.0.7/context.ts";
import { STATUS_CODE } from "https://deno.land/std@0.217.0/http/status.ts";
import type { MiddlewareHandler } from "https://deno.land/x/hono@v4.0.7/types.ts";

interface Options {
  cacheControl: string;
  ignore?: (ctx: Context) => boolean | Promise<boolean>;
}

const defaultOptions: Options = {
  cacheControl: "max-age=3600",
  ignore(ctx) {
    const url = ctx.req.url;
    const mayBeFile = url.includes(".");
    const isHtml = url.includes(".html");
    return !mayBeFile || isHtml;
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
