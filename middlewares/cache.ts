import { Status } from "https://deno.land/std@0.195.0/http/http_status.ts";
import { MiddlewareHandler } from "https://deno.land/x/hono@v3.3.2/types.ts";

interface Options {
  cacheControl: string;
}

const defaultOptions: Options = { cacheControl: "max-age=3600" };

export default function cache(
  options = defaultOptions,
): MiddlewareHandler {
  return async function (c, next) {
    await next();
    if (c.res.status === Status.OK) {
      c.res.headers.set("Cache-Control", options.cacheControl);
    }
  };
}
