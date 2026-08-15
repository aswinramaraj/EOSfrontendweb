const base = ["secretary", "attendance"] as const;

export const attendanceKeys = {
  roster: (classId: number) => [...base, "roster", classId] as const,
  existing: (classId: number, date: string) => [...base, "existing", classId, date] as const,
};
