import type { Metadata } from "next";
import { SecretaryShell } from "@/modules/secretary/components/SecretaryShell";

export const metadata: Metadata = {
  title: "Secretary Portal — EOS Portal",
};

export default function SecretaryLayout({ children }: { children: React.ReactNode }) {
  return <SecretaryShell>{children}</SecretaryShell>;
}
