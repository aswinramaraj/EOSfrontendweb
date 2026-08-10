const base = ["faculty"] as const;

export const facultyKeys = {
  all: base,
  list: (params: object = {}) => [...base, "list", params] as const,
  detail: (id: number) => [...base, "detail", id] as const,
  mappings: (params: object = {}) => [...base, "mappings", params] as const,
  documents: (facultyId: number) => [...base, "documents", facultyId] as const,
  activity: (facultyId: number) => [...base, "activity", facultyId] as const,
  attendance: (facultyId: number) => [...base, "attendance", facultyId] as const,
  attendanceOverview: (params: object = {}) => [...base, "attendance-overview", params] as const,
};
