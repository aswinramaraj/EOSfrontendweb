const base = ["secretary", "dashboard"] as const;

export const secretaryDashboardKeys = {
  summary: () => [...base, "summary"] as const,
};
