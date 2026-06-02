/**
 * Single source of truth for the color-theme catalog.
 *
 * The CSS variables themselves live in `src/app/globals.css` under
 * the `:root` block — that file is the one we paste theme tokens
 * into. This module only carries the metadata the UI (settings
 * picker, no-flash boot script) needs.
 *
 * Currently a single light green/white theme inspired by Wati.
 */

export const THEME_IDS = [
  "light",
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export const DEFAULT_THEME: ThemeId = "light";

export const STORAGE_KEY = "wacrm.theme";

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  tagline: string;
  /**
   * Static swatch color for the picker chip. Hard-coded so the boot
   * script / picker cards don't need a getComputedStyle round trip
   * before the page settles. Must mirror `--primary` of the same
   * theme in globals.css.
   */
  swatch: string;
}

export const THEMES: ReadonlyArray<ThemeMeta> = [
  {
    id: "light",
    name: "Light Green",
    tagline: "Clean, modern — WhatsApp green on white.",
    swatch: "oklch(0.76 0.18 155)",
  },
];

export function isThemeId(value: unknown): value is ThemeId {
  return (
    typeof value === "string" &&
    (THEME_IDS as ReadonlyArray<string>).includes(value)
  );
}
