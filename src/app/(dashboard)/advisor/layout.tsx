import type { Metadata } from "next";
import { AdvisorShell } from "@/modules/advisor/components/AdvisorShell";

export const metadata: Metadata = {
  title: "Advisor Portal — EOS Portal",
};

export default function AdvisorLayout({ children }: { children: React.ReactNode }) {
  return <AdvisorShell>{children}</AdvisorShell>;
}
