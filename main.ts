import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const POST_FILENAME = "POST.json";
const DEFAULT_OUTPUT_DIR = "/output";
const MAX_POST_FILE_BYTES = 16_384;

function resolveRepoDir(): string {
  const envBotDir = process.env.MAKEFUN_BOT_DIR?.trim();
  if (envBotDir) {
    return resolve(envBotDir);
  }
  return dirname(fileURLToPath(import.meta.url));
}

function resolveOutputDir(): string {
  const envOutputDir = process.env.MAKEFUN_OUTPUT_DIR?.trim();
  if (envOutputDir) {
    return resolve(envOutputDir);
  }
  return DEFAULT_OUTPUT_DIR;
}

function validatePostPayload(rawBytes: Buffer): void {
  if (rawBytes.byteLength === 0 || rawBytes.byteLength > MAX_POST_FILE_BYTES) {
    throw new Error(
      `${POST_FILENAME} size (${rawBytes.byteLength} bytes) must be between 1 and ${MAX_POST_FILE_BYTES} bytes.`,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBytes.toString("utf8"));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`${POST_FILENAME} is not valid JSON: ${message}`);
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error(`${POST_FILENAME} must contain a JSON object.`);
  }

  const record = parsed as Record<string, unknown>;
  if (typeof record.url !== "string" || record.url.trim().length === 0) {
    throw new Error(`${POST_FILENAME} must contain a non-empty string "url" field.`);
  }
}

function main(): void {
  const repoDir = resolveRepoDir();
  const outputDir = resolveOutputDir();

  const sourcePath = join(repoDir, POST_FILENAME);
  const destinationPath = join(outputDir, POST_FILENAME);

  const rawBytes = readFileSync(sourcePath);
  validatePostPayload(rawBytes);

  mkdirSync(outputDir, { recursive: true });
  writeFileSync(destinationPath, rawBytes);
}

main();
