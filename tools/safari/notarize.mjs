import { execFile, spawn } from "node:child_process";
import { access, mkdir, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { resolveChannel, root } from "./channels.mjs";

const run = promisify(execFile);
const channel = resolveChannel();
const profile = process.env.APPLE_NOTARY_PROFILE ?? "octobase";
const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
const version = packageJson.version;

try {
  await access(channel.appBundle);
} catch {
  throw new Error(`No exported app at ${channel.appBundle}. Run pnpm export:safari first.`);
}

const releaseDirectory = join(root, ".output", "safari-release");
const uploadZip = join(releaseDirectory, `${channel.appName}-upload.zip`);
const releaseZip = join(releaseDirectory, `octobase-${version}-safari.zip`);
await mkdir(releaseDirectory, { recursive: true });
await rm(uploadZip, { force: true });
await rm(releaseZip, { force: true });

await run("ditto", ["-c", "-k", "--keepParent", channel.appBundle, uploadZip]);
await inherit("xcrun", [
  "notarytool",
  "submit",
  uploadZip,
  "--keychain-profile",
  profile,
  "--wait",
]);
await rm(uploadZip, { force: true });

// Stapling attaches the ticket to the app, so Gatekeeper clears it without a network round trip.
await run("xcrun", ["stapler", "staple", channel.appBundle]);
await run("xcrun", ["stapler", "validate", channel.appBundle]);
const assessment = await run("spctl", [
  "--assess",
  "--type",
  "execute",
  "--verbose=4",
  channel.appBundle,
]);
if (!assessment.stderr.includes("source=Notarized Developer ID")) {
  throw new Error(`Gatekeeper did not accept ${channel.appBundle}:\n${assessment.stderr}`);
}

await run("ditto", ["-c", "-k", "--keepParent", channel.appBundle, releaseZip]);
const digest = await run("shasum", ["-a", "256", releaseZip]);
const sha256 = digest.stdout.split(" ")[0];

process.stdout.write(`Notarized and stapled: ${channel.appBundle}\n`);
process.stdout.write(`Release asset: ${releaseZip}\n`);
process.stdout.write(`\nCask fields:\n  version "${version}"\n  sha256 "${sha256}"\n`);

function inherit(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args[0]} exited with code ${code}.`));
    });
  });
}
