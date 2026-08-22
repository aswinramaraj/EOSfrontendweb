const base = ["secretary", "media-request"] as const;

export const mediaRequestKeys = {
  all: () => base,
  list: (status?: string) => [...base, "list", status ?? "all"] as const,
};
