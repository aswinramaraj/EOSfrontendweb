const base = ["classes"] as const;

export const classesKeys = {
  all: base,
  list: () => [...base, "list"] as const,
};
