import type { Metadata } from "next";
import { Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import { QueryProvider } from "@/shared/components/QueryProvider";
import { ToastProvider } from "@/shared/components/ui/ToastProvider";
import { PlacementShell } from "@/modules/placement/components/PlacementShell";

export const metadata: Metadata = {
  title: "Placement Cell — EOS Portal",
};

// Scoped to this module only (reference design's own type system) — the
// rest of the app keeps Geist from the root layout, so this is loaded here
// rather than globally.
const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export default function PlacementLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${instrumentSans.variable} ${ibmPlexMono.variable} font-[family-name:var(--font-instrument-sans)]`}
      // Reference's own root wrapper sets these explicitly (color:#14181f;
      // background:#ffffff) rather than relying on inherited body color —
      // without this, text with no color of its own (headings, stat
      // values) inherits `body`'s `--foreground`, which the app's global
      // CSS flips to a light gray under `prefers-color-scheme: dark`,
      // washing out everything that doesn't set its own color.
      style={{ color: "#14181f", background: "#ffffff" }}
    >
      <QueryProvider>
        <ToastProvider>
          <PlacementShell>{children}</PlacementShell>
        </ToastProvider>
      </QueryProvider>
    </div>
  );
}
