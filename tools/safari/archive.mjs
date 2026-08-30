import { execFile } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import { dirname } from "node:path";
import { promisify } from "node:util";
import { resolveChannel } from "./channels.mjs";

const run = promisify(execFile);
const channel = resolveChannel();
const teamId = process.env.APPLE_TEAM_ID;
const buildNumber = process.env.APPLE_BUILD_NUMBER;

if (!teamId || !/^[A-Z0-9]{10}$/.test(teamId)) {
  throw new Error(
    "Set APPLE_TEAM_ID to the 10-character team ID from your Apple Developer account.",
  );
}
if (!buildNumber || !/^[1-9][0-9]*$/.test(buildNumber)) {
  throw new Error("Set APPLE_BUILD_NUMBER to a positive, monotonically increasing integer.");
}

await rm(channel.archivePath, { recursive: true, force: true });
await mkdir(dirname(channel.archivePath), { recursive: true });

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
    "-archivePath",
    channel.archivePath,
    `DEVELOPMENT_TEAM=${teamId}`,
    `CURRENT_PROJECT_VERSION=${buildNumber}`,
    "-allowProvisioningUpdates",
    "archive",
  ],
  { maxBuffer: 10 * 1024 * 1024 },
);

process.stdout.write(`Safari archive (${channel.name}): ${channel.archivePath}\n`);
if (channel.name === "appstore") {
  process.stdout.write(
    "Open it in Xcode Organizer to validate and upload it to App Store Connect.\n",
  );
} else {
  process.stdout.write("Run pnpm export:safari to export a Developer ID signed app.\n");
}
