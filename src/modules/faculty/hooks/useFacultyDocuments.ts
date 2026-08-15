import { useQuery } from "@tanstack/react-query";
import { facultyFilesService } from "../services/faculty-files.service";
import { facultyKeys } from "../query-keys";

export function useFacultyDocuments(facultyId: number | null) {
  return useQuery({
    queryKey: facultyKeys.documents(facultyId ?? -1),
    queryFn: () => facultyFilesService.listDocuments(facultyId as number),
    enabled: facultyId !== null && Number.isFinite(facultyId),
  });
}
