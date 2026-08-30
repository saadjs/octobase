import { execFile } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { resolveChannel } from "./channels.mjs";

const run = promisify(execFile);
const channel = resolveChannel();
const teamId = process.env.APPLE_TEAM_ID;

if (!teamId || !/^[A-Z0-9]{10}$/.test(teamId)) {
  throw new Error(
    "Set APPLE_TEAM_ID to the 10-character team ID from your Apple Developer account.",
  );
}

await rm(channel.exportPath, { recursive: true, force: true });
await mkdir(channel.exportPath, { recursive: true });

const optionsPath = join(channel.exportPath, "ExportOptions.plist");
await writeFile(
  optionsPath,
  `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key>
  <string>developer-id</string>
  <key>teamID</key>
  <string>${teamId}</string>
  <key>signingStyle</key>
  <string>automatic</string>
  <key>destination</key>
  <string>export</string>
</dict>
</plist>
`,
);

await run(
  "xcodebuild",
  [
    "-exportArchive",
    "-archivePath",
    channel.archivePath,
    "-exportPath",
    channel.exportPath,
    "-exportOptionsPlist",
    optionsPath,
    "-allowProvisioningUpdates",
  ],
  { maxBuffer: 10 * 1024 * 1024 },
);

await run("codesign", ["--verify", "--strict", "--verbose=2", channel.appBundle]);
const signature = await run("codesign", ["--display", "--verbose=2", channel.appBundle]);
const authority = /Authority=(Developer ID Application[^\n]*)/.exec(signature.stderr);
if (!authority) {
  throw new Error(
    `${channel.appBundle} is not signed with a Developer ID Application certificate; Safari will not load it outside Xcode.`,
  );
}

process.stdout.write(`Exported: ${channel.appBundle}\n`);
process.stdout.write(`${authority[1]}\n`);
process.stdout.write("Run pnpm notarize:safari to notarize, staple, and zip it.\n");
