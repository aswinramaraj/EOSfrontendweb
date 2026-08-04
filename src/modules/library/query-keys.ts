// Params objects are passed straight into the key array — TanStack Query
// hashes them structurally, so the same params object doubles as the cache
// discriminator without any extra serialization step. Typed as `object`
// rather than Record<string, unknown> so a declared params interface
// (BookListParams, RackListParams, ...) can be passed without a cast — see
// buildQuery's comment for why a concrete Record type would force one.
function resourceKeys(all: readonly unknown[]) {
  return {
    all: () => all,
    list: (params: object = {}) => [...all, "list", params] as const,
    detail: (id: number | string) => [...all, "detail", id] as const,
    search: (q: string) => [...all, "search", q] as const,
  };
}

const base = ["library"] as const;

export const libraryKeys = {
  all: base,
  dashboard: () => [...base, "dashboard"] as const,
  books: resourceKeys([...base, "books"]),
  eResources: resourceKeys([...base, "e-resources"]),
  categories: resourceKeys([...base, "categories"]),
  racks: resourceKeys([...base, "racks"]),
  borrowRecords: resourceKeys([...base, "borrow-records"]),
  members: resourceKeys([...base, "members"]),
  students: {
    search: (q: string) => [...base, "students", "search", q] as const,
    noDues: (id: number) => [...base, "students", "no-dues", id] as const,
  },
  settings: () => [...base, "settings"] as const,
  reports: {
    preview: (key: string, filters: object = {}) =>
      [...base, "reports", key, filters] as const,
  },
};
