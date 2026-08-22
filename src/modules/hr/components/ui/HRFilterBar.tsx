import { SearchInput } from "@/shared/components/ui/SearchInput";

interface HRFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  /** Extra filter controls (SelectInput, etc.) rendered inline after search. */
  filters?: React.ReactNode;
  onReset?: () => void;
  /** "8 of 8 records" style counter on the far right. */
  resultCount?: { showing: number; total: number; noun?: string };
}

/** Search + filters + "Reset filters" + "X of Y records" row — composes the
 *  shared SearchInput/SelectInput rather than owning input logic itself. */
export function HRFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search…",
  filters,
  onReset,
  resultCount,
}: HRFilterBarProps) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="min-w-[220px] flex-1">
        <SearchInput
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
        />
      </div>
      {filters}
      {onReset && (
        <button type="button" onClick={onReset} className="shrink-0 text-sm font-semibold text-blue-700 hover:underline">
          Reset filters
        </button>
      )}
      {resultCount && (
        <span className="shrink-0 whitespace-nowrap text-sm text-slate-400">
          {resultCount.showing} of {resultCount.total} {resultCount.noun ?? "records"}
        </span>
      )}
    </div>
  );
}
