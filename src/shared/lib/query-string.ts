export type QueryValue = string | number | boolean | undefined | null;

// Typed as `object` rather than Record<string, QueryValue> — a declared
// params interface (BookListParams, RackListParams, ...) doesn't satisfy an
// explicit index signature even when every property's type does, so a
// concrete Record type here would force a cast at every call site.
export function buildQuery(params: object): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params as Record<string, QueryValue>)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }

  const qs = search.toString();
  return qs ? `?${qs}` : "";
}
