const ALL_BATCHES_VALUE = "all";

interface BatchSelectorProps {
  batches: string[];
  selected: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export { ALL_BATCHES_VALUE };

export function BatchSelector({ batches, selected, onSelect, disabled }: BatchSelectorProps) {
  return (
    <div role="group" aria-label="Filter by batch" className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect(ALL_BATCHES_VALUE)}
        aria-pressed={selected === ALL_BATCHES_VALUE}
        className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          selected === ALL_BATCHES_VALUE
            ? "border-[var(--c-primary-600)] bg-[var(--c-primary-600)] text-white"
            : "border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--c-gray-50)]"
        }`}
      >
        All
      </button>

      {batches.map((batch) => (
        <button
          key={batch}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(batch)}
          aria-pressed={selected === batch}
          className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            selected === batch
              ? "border-[var(--c-primary-600)] bg-[var(--c-primary-600)] text-white"
              : "border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--c-gray-50)]"
          }`}
        >
          {batch}
        </button>
      ))}
    </div>
  );
}
