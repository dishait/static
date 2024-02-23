import { version } from "./version.ts";
import { useStaticServer } from "./mod.ts";
import { Command } from "https://deno.land/x/cliffy@v1.0.0-rc.3/command/command.ts";
import { EnumType } from "https://deno.land/x/cliffy@v1.0.0-rc.3/command/types/enum.ts";

if (import.meta.main) {
  const modes = new EnumType(["ssg", "spa", "fallback", "nuxt-ssg"]);

  new Command()
    .name("static")
    .version(version)
    .type("mode", modes).option("-m --mode <mode:mode>", "static mode", {
      default: "ssg" as const,
    })
    .option("-r --root <string>", "root", {
      default: "./",
    })
    .option("-f --forceCache", "with forceCache", {
      default: false as boolean,
    })
    .action((options) => {
      useStaticServer(options);
    }).parse(Deno.args);
}
