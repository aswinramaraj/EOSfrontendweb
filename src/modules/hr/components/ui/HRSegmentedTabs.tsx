interface HRTabOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface HRSegmentedTabsProps<T extends string> {
  options: HRTabOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Full-width pill tab bar with per-segment counts (e.g. "All 8") — the
 *  reference's segmented-tabs pattern used above nearly every list page.
 *  Same value/onChange contract as the shared `SegmentedControl`, but a
 *  distinct component since the visual (full-bleed flex-1 pills with counts)
 *  diverges enough from that compact inline control to not be a fit as a
 *  thin restyle of it. */
export function HRSegmentedTabs<T extends string>({ options, value, onChange }: HRSegmentedTabsProps<T>) {
  return (
    <div className="flex w-full gap-1 overflow-x-auto rounded-full border border-slate-200 bg-white p-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex-1 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
              active ? "bg-blue-700 text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {option.label}
            {option.count !== undefined && <span className="ml-1">{option.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
