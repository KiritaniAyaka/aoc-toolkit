import { basename, join } from "@std/path";
import { existsSync } from "@std/fs";

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

async function outputToString(output: unknown): Promise<string> {
  try {
    const result = output instanceof Promise ? await output : output;
    if (typeof result === "string") {
      return result;
    }
    if (typeof result === "object" && "toString" in result) {
      return outputToString(result.toString());
    }
    return String(result);
  } catch (e: unknown) {
    throw new Error(
      `Could not convert output to string: ${output}\n\tError: ${e}`,
    );
  }
}

async function runWithPath(fn: (input: string) => unknown, path: string) {
  const { inputPath, outputPath } = getPaths(path);
  const input = await Deno.readTextFile(inputPath);
  const output = fn(input);
  if (!output) {
    console.warn("⚠️ The function did not return anything");
    return;
  }
  return Deno.writeTextFile(outputPath, await outputToString(output));
}
