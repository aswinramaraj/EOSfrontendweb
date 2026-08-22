"use client";

import { useParams } from "next/navigation";
import { ApiError } from "@/shared/lib/api-client";
import { useFacultyById } from "@/modules/faculty/hooks/useFacultyById";
import { FacultyEditForm } from "@/modules/faculty/components/FacultyEditForm";
import { HRPageSkeleton } from "@/modules/hr/components/ui/HRSkeleton";

export default function HRFacultyEditPage() {
  const params = useParams<{ facultyId: string }>();
  const facultyId = Number(params.facultyId);

  const { data: faculty, isLoading, error } = useFacultyById(Number.isFinite(facultyId) ? facultyId : null);

  if (isLoading) {
    return <HRPageSkeleton statCount={0} cardCount={2} cardContentClassName="h-64" blockCount={0} />;
  }

  if (error || !faculty) {
    return (
      <p className="text-sm text-red-600">
        {error instanceof ApiError ? error.message : "Couldn't load this faculty record."}
      </p>
    );
  }

  return (
    <FacultyEditForm
      faculty={faculty}
      basePath="/hr/faculty-directory"
      homeHref="/hr"
      homeLabel="Dashboard"
      listLabel="Faculty Directory"
    />
  );
}
