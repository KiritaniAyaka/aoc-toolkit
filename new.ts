#!/usr/bin/env -S deno run --allow-read -allow-write

import { parseArgs } from "@std/cli/parse-args";
import { stringArg } from "./utils.ts";
import { join } from "@std/path/join";

const CONTENT = `
export function solve(input: string) {
  
}
`.trim();

const { _: args } = parseArgs(Deno.args);

const dir = stringArg(args[0]);
if (!dir) {
  await create(await nextDirName(Deno.cwd()));
  Deno.exit(0);
}

await create(dir);

async function create(dir: string) {
  await Deno.mkdir(dir, { recursive: true });
  await Promise.all([
    Deno.writeTextFile(join(dir, "part1.ts"), CONTENT),
    Deno.writeTextFile(join(dir, "part2.ts"), CONTENT),
  ]);
}

async function nextDirName(workingDir: string) {
  const pattern = /^day(\d+)$/;
  let max = "";
  for await (const file of Deno.readDir(workingDir)) {
    if (!file.isDirectory) continue;
    const result = pattern.exec(file.name);
    if (!result) continue;
    const num = parseInt(result[1]);
    if (Number.isNaN(num)) continue;
    if (num > +max) {
      max = result[1];
    }
  }
  if (max === "") return "day1";
  if (max.startsWith("0")) {
    return `day` + (+max + 1).toString().padStart(max.length, "0");
  }
  return `day` + (+max + 1);
}
