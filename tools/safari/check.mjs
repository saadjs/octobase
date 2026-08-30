import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { resolveChannel } from "./channels.mjs";

const run = promisify(execFile);
const channel = resolveChannel();

await run(
  "xcodebuild",
  [
    "-project",
    channel.xcodeproj,
    "-scheme",
    channel.appName,
    "-configuration",
    "Release",
    "-destination",
    "generic/platform=macOS",
    "CODE_SIGNING_ALLOWED=NO",
    "build",
  ],
  { maxBuffer: 10 * 1024 * 1024 },
);

process.stdout.write(`Safari wrapper (${channel.name}) builds successfully without signing.\n`);
