import { useQuery } from "@tanstack/react-query";
import { coursesService } from "../services/courses.service";

export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: coursesService.list,
    staleTime: 5 * 60_000,
  });
}
