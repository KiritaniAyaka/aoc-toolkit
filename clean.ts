#!/usr/bin/env -S deno run --allow-read --allow-write

import { parseArgs } from "@std/cli/parse-args";
import { stringArg } from "./utils.ts";
import { join } from "@std/path/join";

const outputPattern = new RegExp(/\.out$/);

const { _: args } = parseArgs(Deno.args);

const dir = stringArg(args[0]);
if (!dir) {
  await removeOutputFiles(Deno.cwd());
  Deno.exit(0);
}

const stat = await Deno.stat(dir);
if (!stat.isDirectory) {
  throw new Error(`"${dir}" is not a directory`);
}

await removeOutputFiles(dir);

async function removeOutputFiles(dir: string) {
  for await (const file of Deno.readDir(dir)) {
    if (file.isFile && outputPattern.test(file.name)) {
      await Deno.remove(join(dir, file.name));
    } else if (file.isDirectory) {
      await removeOutputFiles(join(dir, file.name));
    }
  }
}
