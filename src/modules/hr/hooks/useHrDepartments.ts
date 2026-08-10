import { useQuery } from "@tanstack/react-query";
import { hrDepartmentsService } from "../services/hr-departments.service";
import { hrKeys } from "../query-keys";

export function useHrDepartments() {
  return useQuery({
    queryKey: hrKeys.departments.all(),
    queryFn: hrDepartmentsService.list,
  });
}

export function useHrDepartment(id: number | null) {
  return useQuery({
    queryKey: hrKeys.departments.detail(id ?? -1),
    queryFn: () => hrDepartmentsService.get(id as number),
    enabled: id !== null && Number.isFinite(id),
  });
}
