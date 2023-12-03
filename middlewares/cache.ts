import { STATUS_CODE } from "https://deno.land/std@0.208.0/http/status.ts";
import { MiddlewareHandler } from "https://deno.land/x/hono@v3.10.4/types.ts";

interface Options {
  cacheControl: string;
}

const defaultOptions: Options = { cacheControl: "max-age=3600" };

export default function cache(
  options = defaultOptions,
): MiddlewareHandler {
  return async function (c, next) {
    await next();
    if (c.res.status === STATUS_CODE.OK) {
      c.res.headers.set("Cache-Control", options.cacheControl);
    }
  };
}
