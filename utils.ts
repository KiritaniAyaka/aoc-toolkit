export async function outputToString(output: unknown): Promise<string> {
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

export async function scanDir(dir: string, part?: string) {
  const inputFiles: string[] = [];
  const partsFiles: string[] = [];
  const inputPattern = new RegExp("^(.*)\.in$");
  const partsPattern = part
    ? new RegExp(`^(${part})\\.ts$`)
    : new RegExp("^(.+)\\.ts$");
  for await (const file of Deno.readDir(dir)) {
    const inputResult = inputPattern.exec(file.name);
    if (inputResult) {
      inputFiles.push(inputResult[1]);
    }
    const partsResult = partsPattern.exec(file.name);
    if (partsResult) {
      partsFiles.push(partsResult[1]);
    }
  }
  return { inputFiles, partsFiles };
}

export function stringArg(arg?: string | number) {
  if (arg === undefined) return undefined;
  if (typeof arg === "number") return arg.toString();
  return arg;
}
