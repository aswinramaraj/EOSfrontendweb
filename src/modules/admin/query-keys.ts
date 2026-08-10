const base = ["admin"] as const;

export const adminKeys = {
  all: base,
  financeOverview: () => [...base, "finance-overview"] as const,
  facultyCount: () => [...base, "faculty", "count"] as const,
};
