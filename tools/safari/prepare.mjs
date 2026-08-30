import { execFile } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { promisify } from "node:util";
import { resolveChannel, root } from "./channels.mjs";

const run = promisify(execFile);
const channel = resolveChannel();
const safariOutput = join(root, ".output", "safari-mv3");
const browserIcon = join(safariOutput, "icon", "light", "128.png");
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
const version = packageJson.version;

const originalBrowserIcon = await readFile(browserIcon);
await renderHighResolutionBrowserIcon();
await rm(channel.xcodeOutput, { recursive: true, force: true });
try {
  await run("xcrun", [
    "safari-web-extension-packager",
    safariOutput,
    "--project-location",
    channel.xcodeOutput,
    "--app-name",
    channel.appName,
    "--bundle-identifier",
    channel.bundleId,
    "--macos-only",
    "--copy-resources",
    "--no-open",
    "--no-prompt",
    "--force",
  ]);
} finally {
  await writeFile(browserIcon, originalBrowserIcon);
}
await writeFile(join(channel.extensionResources, "icon", "light", "128.png"), originalBrowserIcon);
await configureProject();
await configureAppInfo();

process.stdout.write(`Safari Xcode project (${channel.name}): ${channel.projectRoot}\n`);
process.stdout.write(`Bundle identifier: ${channel.bundleId}\n`);
process.stdout.write(
  `Version: ${version} (build 1; override with APPLE_BUILD_NUMBER when archiving)\n`,
);

async function renderHighResolutionBrowserIcon() {
  const iconSource = (
    await readFile(join(root, "public", "icon", "octobase-light.svg"), "utf8")
  ).replace('width="32" height="32"', 'width="1024" height="1024"');
  const iconPage = join(root, ".output", "safari-app-icon.html");
  await mkdir(dirname(browserIcon), { recursive: true });
  await writeFile(
    iconPage,
    `<style>html,body{margin:0;background:transparent}svg{display:block}</style>${iconSource}`,
  );
  await run(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--default-background-color=00000000",
    "--window-size=1024,1024",
    `--screenshot=${browserIcon}`,
    `file://${iconPage}`,
  ]);
  await rm(iconPage, { force: true });
}

async function configureProject() {
  let project = await readFile(channel.projectFile, "utf8");
  project = project
    .replace(
      /PRODUCT_BUNDLE_IDENTIFIER = ([^;]+);/g,
      (_match, identifier) =>
        `PRODUCT_BUNDLE_IDENTIFIER = ${
          identifier.endsWith(".Extension") ? `${channel.bundleId}.Extension` : channel.bundleId
        };`,
    )
    .replaceAll(
      `INFOPLIST_KEY_CFBundleDisplayName = "${channel.appName} Extension";`,
      `INFOPLIST_KEY_CFBundleDisplayName = "${channel.extensionDisplayName}";`,
    )
    .replace(/CURRENT_PROJECT_VERSION = [^;]+;/g, "CURRENT_PROJECT_VERSION = 1;")
    .replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${version};`)
    .replace(/MACOSX_DEPLOYMENT_TARGET = [^;]+;/g, "MACOSX_DEPLOYMENT_TARGET = 12.0;")
    .replaceAll(
      'INFOPLIST_KEY_NSHumanReadableCopyright = "";',
      'INFOPLIST_KEY_NSHumanReadableCopyright = "Copyright © 2026 Saad Bash. All rights reserved.";',
    );
  await writeFile(channel.projectFile, project);
}

async function configureAppInfo() {
  await run("plutil", ["-insert", "ITSAppUsesNonExemptEncryption", "-bool", "NO", channel.appInfo]);
  await run("plutil", [
    "-insert",
    "LSApplicationCategoryType",
    "-string",
    "public.app-category.developer-tools",
    channel.appInfo,
  ]);
}
