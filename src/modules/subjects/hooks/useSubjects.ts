import { useQuery } from "@tanstack/react-query";
import { subjectsService } from "../services/subjects.service";

export function useSubjects() {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: subjectsService.list,
    staleTime: 5 * 60_000,
  });
}
