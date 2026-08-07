import type { Metadata } from "next";
import { AppShell } from "@/shared/components/layout/AppShell/AppShell";

export const metadata: Metadata = {
  title: "Fees & Finance — EOS Portal",
};

export default function FeesLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
