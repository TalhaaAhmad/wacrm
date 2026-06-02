"use client";

import { Check, Palette } from "lucide-react";

/**
 * Appearance panel — shows the active theme.
 *
 * Since the app now uses a single light-green theme (no user-switchable
 * variants), this panel is informational only. It confirms the active
 * look and explains the design language.
 */
export function AppearancePanel() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your workspace uses the Light Green theme — a clean, modern
          design inspired by WhatsApp's signature green on white.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ background: "oklch(0.76 0.18 155)" }}
            aria-hidden
          >
            <Palette className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                Light Green
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary">
                <Check className="h-3 w-3" />
                Active
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              WhatsApp green accents on a clean white background.
            </p>
          </div>
        </div>

        {/* Color swatches */}
        <div className="mt-4 flex items-center gap-2">
          <Swatch label="Primary" color="oklch(0.76 0.18 155)" />
          <Swatch label="Background" color="oklch(0.993 0.002 155)" border />
          <Swatch label="Card" color="oklch(1 0 0)" border />
          <Swatch label="Muted" color="oklch(0.97 0.003 155)" border />
          <Swatch label="Sidebar" color="oklch(0.2 0.05 162)" />
        </div>
      </div>
    </section>
  );
}

function Swatch({
  label,
  color,
  border = false,
}: {
  label: string;
  color: string;
  border?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className="h-6 w-6 rounded-full"
        style={{
          background: color,
          boxShadow: border
            ? "inset 0 0 0 1px oklch(0.85 0.01 260)"
            : "inset 0 0 0 1px oklch(1 0 0 / 0.15)",
        }}
        aria-hidden
      />
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}
