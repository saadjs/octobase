import { execFile } from "node:child_process";
import { dirname, join } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

await run(
  "xcodebuild",
  [
    "-project",
    join(root, ".output", "safari-xcode", "Octobase", "Octobase.xcodeproj"),
    "-scheme",
    "Octobase",
    "-configuration",
    "Release",
    "-destination",
    "generic/platform=macOS",
    "CODE_SIGNING_ALLOWED=NO",
    "build",
  ],
  { maxBuffer: 10 * 1024 * 1024 },
);

process.stdout.write("Safari wrapper builds successfully without signing.\n");
