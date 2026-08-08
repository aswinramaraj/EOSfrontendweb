import type { Metadata } from "next";
import { IqacShell } from "@/modules/iqac/components/IqacShell";

export const metadata: Metadata = {
  title: "IQAC Platform — EOS Portal",
};

export default function IqacLayout({ children }: { children: React.ReactNode }) {
  return <IqacShell>{children}</IqacShell>;
}
