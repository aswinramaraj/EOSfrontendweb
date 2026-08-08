const base = ["faculty"] as const;

export const facultyKeys = {
  all: base,
  list: (params: object = {}) => [...base, "list", params] as const,
};
