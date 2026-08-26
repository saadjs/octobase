import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../..", import.meta.url));
const manifest = fileURLToPath(new URL("../../.output/chrome-mv3/manifest.json", import.meta.url));

/** e2e drives the real build output, so make sure one exists before the first launch. */
export default function globalSetup(): void {
  if (existsSync(manifest) && !process.env["E2E_REBUILD"]) return;
  execFileSync("pnpm", ["build"], { cwd: root, stdio: "inherit" });
}
