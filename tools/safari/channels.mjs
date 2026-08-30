import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// "appstore" ships through App Store Connect; "direct" is the Developer ID build for Homebrew.
const channels = {
  appstore: {
    appName: "Octobase",
    bundleId: "sh.saad.octobase",
    directory: "safari-xcode",
    extensionDisplayName: "Octobase Extension",
  },
  direct: {
    appName: "Octobase Direct",
    bundleId: "sh.saad.octobase.direct",
    directory: "safari-xcode-direct",
    extensionDisplayName: "Octobase",
  },
};

export function resolveChannel() {
  const flag = process.argv.indexOf("--channel");
  const name = flag === -1 ? "appstore" : process.argv[flag + 1];
  const channel = channels[name];
  if (!channel) {
    throw new Error(`Unknown channel "${name}". Use --channel appstore or --channel direct.`);
  }
  const xcodeOutput = join(root, ".output", channel.directory);
  const projectRoot = join(xcodeOutput, channel.appName);
  return {
    name,
    appName: channel.appName,
    bundleId: channel.bundleId,
    extensionDisplayName: channel.extensionDisplayName,
    xcodeOutput,
    projectRoot,
    xcodeproj: join(projectRoot, `${channel.appName}.xcodeproj`),
    projectFile: join(projectRoot, `${channel.appName}.xcodeproj`, "project.pbxproj"),
    appInfo: join(projectRoot, channel.appName, "Info.plist"),
    extensionResources: join(projectRoot, `${channel.appName} Extension`, "Resources"),
    archivePath: join(root, ".output", "safari-archive", `${channel.appName}.xcarchive`),
    exportPath: join(root, ".output", `safari-export-${name}`),
    appBundle: join(root, ".output", `safari-export-${name}`, `${channel.appName}.app`),
  };
}
