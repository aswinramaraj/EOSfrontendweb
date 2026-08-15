const base = ["secretary", "timetable"] as const;

export const timetableKeys = {
  slots: (params: object) => [...base, "slots", params] as const,
  classes: () => [...base, "classes"] as const,
  departments: () => [...base, "departments"] as const,
  batches: () => [...base, "batches"] as const,
};
