import type { Metadata } from "next";
import { HostelShell } from "@/modules/hostel/components/HostelShell";

export const metadata: Metadata = {
  title: "Warden Console — EOS Portal",
};

export default function HostelLayout({ children }: { children: React.ReactNode }) {
  return <HostelShell>{children}</HostelShell>;
}
