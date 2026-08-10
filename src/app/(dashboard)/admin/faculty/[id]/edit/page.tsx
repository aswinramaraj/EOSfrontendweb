"use client";

import { useParams } from "next/navigation";
import { ApiError } from "@/shared/lib/api-client";
import { useFacultyById } from "@/modules/faculty/hooks/useFacultyById";
import { FacultyEditForm } from "@/modules/faculty/components/FacultyEditForm";

export default function FacultyEditPage() {
  const params = useParams<{ id: string }>();
  const facultyId = Number(params.id);

  const { data: faculty, isLoading, error } = useFacultyById(Number.isFinite(facultyId) ? facultyId : null);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading faculty…</p>;
  }

  if (error || !faculty) {
    return (
      <p className="text-sm text-red-600">
        {error instanceof ApiError ? error.message : "Couldn't load this faculty record."}
      </p>
    );
  }

  return <FacultyEditForm faculty={faculty} />;
}
