import { basename, join } from "@std/path";
import { existsSync } from "@std/fs";
import { outputToString } from "./utils.ts";

export async function solve(fn: (input: string) => unknown) {
  let path = new URL(Deno.mainModule).pathname;
  if (/\/[a-z]:\//gi.test(path)) {
    path = path.slice(1);
  }
  await runWithPath(fn, path);
}

function getPaths(path: string) {
  const name = basename(path, ".ts");
  const inputFiles = [
    join(path, "..", name + ".in"),
    join(path, "..", name + ".txt"),
  ];

  const inputPath = inputFiles.find((file) => existsSync(file));
  if (!inputPath) throw new Error("No input file found");
  return { inputPath, outputPath: join(path, "..", name + ".out") };
}

async function runWithPath(fn: (input: string) => unknown, path: string) {
  const { inputPath, outputPath } = getPaths(path);
  const input = await Deno.readTextFile(inputPath);
  const output = fn(input);
  if (output === undefined || output === null) {
    console.warn("⚠️ The function did not return anything");
    return;
  }
  return Deno.writeTextFile(outputPath, await outputToString(output));
}
