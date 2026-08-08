import type { Metadata } from "next";
import { AdminShell } from "@/modules/admin/components/AdminShell";

export const metadata: Metadata = {
  title: "Admin Console — EOS Portal",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
