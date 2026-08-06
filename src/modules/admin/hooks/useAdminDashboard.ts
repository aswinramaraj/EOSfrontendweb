import { useQuery } from "@tanstack/react-query";
import { adminDashboardService } from "../services/dashboard.service";
import { adminKeys } from "../query-keys";
import { departmentsService } from "@/modules/departments/services/departments.service";
import { studentsService } from "@/modules/students/services/students.service";

export function useFinanceOverview() {
  return useQuery({
    queryKey: adminKeys.financeOverview(),
    queryFn: adminDashboardService.financeOverview,
  });
}

export function useFacultyCount() {
  return useQuery({
    queryKey: adminKeys.facultyCount(),
    queryFn: adminDashboardService.facultyCount,
  });
}

export function useActiveStudentCount() {
  return useQuery({
    queryKey: ["students", "count", { status: "active" }],
    queryFn: () => studentsService.findAll({ status: "active", limit: 1 }),
    select: (res) => res.meta.total,
  });
}

/**
 * Two `limit: 1` reads, one per real status — but sequenced, not fired in
 * parallel. The dev DB's default pg pool (10 connections) briefly 500'd on
 * every endpoint, not just this one, when this was 14+ concurrent requests
 * (see useStudentsByDepartment) — the fix is the same here: never fan out
 * a per-dimension count query in parallel until there's a real aggregate
 * endpoint to replace both with a single round trip.
 */
export function useStudentStatusDistribution() {
  return useQuery({
    queryKey: ["students", "status-distribution"],
    queryFn: async () => {
      const active = await studentsService.findAll({ status: "active", limit: 1 });
      const inactive = await studentsService.findAll({ status: "inactive", limit: 1 });
      return [
        { label: "Active", value: active.meta.total, color: "#2563eb" },
        { label: "Inactive", value: inactive.meta.total, color: "#d4dce6" },
      ].filter((s) => s.value > 0);
    },
  });
}

/**
 * Departments list + one `limit: 1` active-count read per department —
 * bounded by department count (small, fixed), never by roll size. Fetched
 * SEQUENTIALLY, one department at a time: firing all of these in parallel
 * (the original implementation, via useQueries) exhausted the dev DB's
 * connection pool and produced 500s across EVERY endpoint on the page, not
 * just this one. A dedicated `groupBy` aggregate endpoint would replace this
 * entirely with a single round trip — proposed separately, pending backend
 * confirmation; this sequential version is the safe stopgap until then.
 */
export function useStudentsByDepartment() {
  return useQuery({
    queryKey: ["students", "by-department"],
    queryFn: async () => {
      const departments = await departmentsService.list();
      const counted: { label: string; value: number }[] = [];
      for (const dept of departments) {
        const res = await studentsService.findAll({ department_id: dept.id, status: "active", limit: 1 });
        counted.push({ label: dept.code, value: res.meta.total });
      }
      return counted.filter((d) => d.value > 0).sort((a, b) => b.value - a.value);
    },
  });
}
