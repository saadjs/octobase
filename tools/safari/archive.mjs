import { execFile } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
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

const archiveDirectory = join(root, ".output", "safari-archive");
const archivePath = join(archiveDirectory, "Octobase.xcarchive");
await rm(archivePath, { recursive: true, force: true });
await mkdir(archiveDirectory, { recursive: true });

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
    "-archivePath",
    archivePath,
    `DEVELOPMENT_TEAM=${teamId}`,
    `CURRENT_PROJECT_VERSION=${buildNumber}`,
    "-allowProvisioningUpdates",
    "archive",
  ],
  { maxBuffer: 10 * 1024 * 1024 },
);

process.stdout.write(`Safari archive: ${archivePath}\n`);
process.stdout.write(
  "Open it in Xcode Organizer to validate and upload it to App Store Connect.\n",
);
