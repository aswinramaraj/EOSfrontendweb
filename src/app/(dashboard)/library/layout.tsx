import type { Metadata } from "next";
import { LibraryShell } from "@/modules/library/components/LibraryShell";

export const metadata: Metadata = {
  title: "Library — EOS Portal",
};

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return <LibraryShell>{children}</LibraryShell>;
}
