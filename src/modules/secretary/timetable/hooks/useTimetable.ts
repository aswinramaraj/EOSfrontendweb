import { useQuery } from "@tanstack/react-query";
import { timetableService } from "../services/timetable.service";
import { timetableKeys } from "../query-keys";

export function useTimetableSlots(params: { class_id?: number; faculty_id?: number }) {
  return useQuery({
    queryKey: timetableKeys.slots(params),
    queryFn: () => timetableService.listSlots(params),
    enabled: Boolean(params.class_id || params.faculty_id),
  });
}

export function useClasses() {
  return useQuery({ queryKey: timetableKeys.classes(), queryFn: timetableService.listClasses });
}

export function useDepartments() {
  return useQuery({
    queryKey: timetableKeys.departments(),
    queryFn: timetableService.listDepartments,
  });
}

export function useBatches() {
  return useQuery({ queryKey: timetableKeys.batches(), queryFn: timetableService.listBatches });
}

/**
 * There is no faculty-list endpoint Secretary can call (GET /me/faculty is
 * Admin/HoD-only), so faculty options for the "Faculty" tab are derived from
 * real timetable data instead of a dedicated lookup — every distinct
 * faculty member appearing across a broad (unfiltered by faculty) slice of
 * timetable_slots. This is real data, just sourced from an already-
 * authorized endpoint rather than a purpose-built one.
 */
export function useFacultyOptionsFromTimetable() {
  return useQuery({
    queryKey: [...timetableKeys.slots({}), "faculty-options"],
    queryFn: () => timetableService.listSlots({}),
    select: (result) => {
      const seen = new Map<number, { id: number; name: string; designation: string }>();
      for (const slot of result.data) {
        if (!seen.has(slot.faculty.id)) {
          seen.set(slot.faculty.id, {
            id: slot.faculty.id,
            name: `${slot.faculty.first_name} ${slot.faculty.last_name}`,
            designation: slot.faculty.designation,
          });
        }
      }
      return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
    },
  });
}
