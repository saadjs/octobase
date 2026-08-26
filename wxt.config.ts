import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

process.env["WXT_GITHUB_CLIENT_ID"] ||= "Iv23liJomC4g0gSjqhu4";
process.env["WXT_GITHUB_APP_SLUG"] ||= "octobase-github-homepage";

export default defineConfig({
  srcDir: "src",
  modules: ["@wxt-dev/module-react"],
  manifestVersion: 3,
  vite: () => ({ plugins: [tailwindcss()] }),
  manifest: ({ browser }) => ({
    name: "Octobase",
    description: "Replacement for the GitHub homepage.",
    // Light-toolbar ink by default; the background swaps to icon/dark once a tab reports the theme.
    icons: {
      16: "icon/light/16.png",
      32: "icon/light/32.png",
      48: "icon/light/48.png",
      128: "icon/light/128.png",
    },
    action: {
      default_title: "Octobase",
      default_icon: {
        16: "icon/light/16.png",
        32: "icon/light/32.png",
        48: "icon/light/48.png",
        128: "icon/light/128.png",
      },
    },
    permissions: ["storage"],
    host_permissions: ["https://api.github.com/*", "https://github.com/*"],
    ...(browser === "firefox" && {
      browser_specific_settings: {
        gecko: {
          id: "octobase@saad.sh",
          strict_min_version: "128.0",
          // Read-only tool: nothing leaves the browser.
          data_collection_permissions: { required: ["none"] },
        },
      },
    }),
  }),
});
