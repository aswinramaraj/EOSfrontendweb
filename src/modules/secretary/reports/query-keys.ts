const base = ["secretary", "reports"] as const;

export const secretaryReportsKeys = {
  summary: () => [...base, "summary"] as const,
  preview: (key: string, filters: object = {}) => [...base, "preview", key, filters] as const,
};
