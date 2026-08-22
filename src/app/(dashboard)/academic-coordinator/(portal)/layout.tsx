import type { Metadata } from "next";
import { Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import { QueryProvider } from "@/shared/components/QueryProvider";
import { ToastProvider } from "@/shared/components/ui/ToastProvider";
import { AcademicCoordinatorShell } from "@/modules/academic-coordinator/components/AcademicCoordinatorShell";

export const metadata: Metadata = {
  title: "Academic Coordinator — EOS Portal",
};

// Scoped to this module only, matching the Placement module's font-loading
// convention — the rest of the app keeps Geist from the root layout.
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

export default function AcademicCoordinatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${instrumentSans.variable} ${ibmPlexMono.variable} font-[family-name:var(--font-instrument-sans)]`}
      style={{ color: "#14181f", background: "#ffffff" }}
    >
      <QueryProvider>
        <ToastProvider>
          <AcademicCoordinatorShell>{children}</AcademicCoordinatorShell>
        </ToastProvider>
      </QueryProvider>
    </div>
  );
}
