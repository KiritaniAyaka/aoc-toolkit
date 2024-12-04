#!/usr/bin/env -S deno run --allow-read
import { parseArgs } from "@std/cli/parse-args";
import { basename, join, resolve } from "@std/path";
import { outputToString, scanDir, stringArg } from "./utils.ts";

const { _: args, silent } = parseArgs(Deno.args, {
  boolean: ["silent"],
  default: {
    silent: false,
  },
});

const dir = stringArg(args[0]);
if (!dir) {
  console.error("No target directory to run");
  Deno.exit(1);
}

const part = stringArg(args[1]);
const stat = await Deno.stat(join(Deno.cwd(), dir));
if (!stat.isDirectory) {
  throw new Error(`"${dir}" is not a directory`);
}

const { inputFiles, partsFiles } = await scanDir(join(Deno.cwd(), dir), part);

interface ResolverModule {
  solve?: (input: string) => unknown;
}

for (let i = 0; i < inputFiles.length; i++) {
  for (let j = 0; j < partsFiles.length; j++) {
    const time = new Date().getTime();
    !silent &&
      console.log(`Running...\t${inputFiles[i]}.in => ${partsFiles[j]}.ts`);
    const input = await Deno.readTextFile(
      join(Deno.cwd(), dir, inputFiles[i] + ".in"),
    );
    const mod: ResolverModule = await import(
      join("file://", Deno.cwd(), dir, partsFiles[j] + ".ts")
    );
    const outputFile = resolve(
      Deno.cwd(),
      dir,
      partsFiles.length < 2
        ? inputFiles[i] + ".out"
        : inputFiles[i] + "_" + partsFiles[j] + ".out",
    );
    if (!mod.solve) {
      console.error(
        new Error(`"${partsFiles[j]}.ts" does not export a "solve" function`),
      );
      break; // skip this part
    }
    const output = mod.solve(input);
    await Deno.writeTextFile(outputFile, await outputToString(output));
    !silent && console.log(
      `Done...\t\t${partsFiles[j]}.ts => ${basename(outputFile)} (Total ${
        new Date().getTime() - time
      }ms include I/O)`,
    );
  }
}
