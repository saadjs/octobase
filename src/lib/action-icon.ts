import type { Theme } from "@/content/theme";

export type ActionIconPaths = { 16: string; 32: string; 48: string; 128: string };

/** Toolbar icons are flat PNGs, so we ship one ink per browser theme and swap between them. */
export function actionIconPaths(theme: Theme): ActionIconPaths {
  return {
    16: `icon/${theme}/16.png`,
    32: `icon/${theme}/32.png`,
    48: `icon/${theme}/48.png`,
    128: `icon/${theme}/128.png`,
  };
}
