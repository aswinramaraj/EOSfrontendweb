import { useQuery } from "@tanstack/react-query";
import { timetableService } from "@/modules/secretary/timetable/services/timetable.service";

/** day_of_week: 1 = Monday ... 6 = Saturday (backend has no Sunday value). */
export function useDayTimetable(classId: number | undefined, dayOfWeek: number | undefined) {
  return useQuery({
    queryKey: ["secretary", "attendance", "day-timetable", classId, dayOfWeek],
    queryFn: () => timetableService.listSlots({ class_id: classId, day_of_week: dayOfWeek }),
    enabled: Boolean(classId && dayOfWeek),
  });
}
