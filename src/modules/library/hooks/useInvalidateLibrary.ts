import { useQueryClient } from "@tanstack/react-query";
import { libraryKeys } from "../query-keys";

// Circulation actions (issue/return/renew/declare lost or damaged/collect
// fine/settle charge/...) can shift books' copy counts, the dashboard
// summary, and members' status all at once — invalidating the whole module
// is deliberate, not lazy; enumerating that dependency graph per mutation is
// how a stale table ships. Catalogue CRUD (books/eBooks/categories/racks)
// invalidates just its own resource + the dashboard instead — see those
// hooks (useBookMutations, useEResourceMutations, useCategories, useRacks).
export function useInvalidateLibrary() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: libraryKeys.all });
}
