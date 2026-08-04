import type { Metadata } from "next";
import { AcademicsPage } from "@/modules/faculty/academics/components/AcademicsPage";

export const metadata: Metadata = {
  title: "Academics — EOS ERP Portal",
  description: "Assignments, CIA marks, lesson plans, and LMS notes for subject handling faculty.",
};

export default function FacultyAcademicsPage() {
  return <AcademicsPage />;
}
