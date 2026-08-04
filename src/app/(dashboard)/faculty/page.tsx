import type { Metadata } from "next";
import { FacultyDashboard } from "@/modules/faculty/dashboard/components/FacultyDashboard";

export const metadata: Metadata = {
  title: "Faculty Dashboard — EOS ERP Portal",
  description: "Subject handling faculty dashboard.",
};

export default function FacultyDashboardPage() {
  return <FacultyDashboard />;
}
