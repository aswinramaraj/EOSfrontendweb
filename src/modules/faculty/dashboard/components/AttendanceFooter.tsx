interface AttendanceFooterProps {
  presentCount: number;
  absentCount: number;
  lateCount: number;
  total: number;
  onSubmit?: () => void;
  submitDisabled?: boolean;
  submitLabel?: string;
  /** Shown as the button's title tooltip while disabled, e.g. "mark every
   * student first" — omitted entirely once the button is enabled. */
  disabledReason?: string;
  errorMessage?: string | null;
}

export function AttendanceFooter({
  presentCount,
  absentCount,
  lateCount,
  total,
  onSubmit,
  submitDisabled = true,
  submitLabel = "Submit & Lock",
  disabledReason,
  errorMessage,
}: AttendanceFooterProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
      <dl className="flex items-center justify-between gap-2 text-sm">
        <div>
          <dt className="text-xs text-slate-400">Present</dt>
          <dd className="font-semibold text-indigo-600">{presentCount}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400">Absent</dt>
          <dd className="font-semibold text-red-600">{absentCount}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400">Late</dt>
          <dd className="font-semibold text-amber-600">{lateCount}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400">Total</dt>
          <dd className="font-semibold text-slate-700">{total}</dd>
        </div>
      </dl>

      {errorMessage && <p className="text-xs font-medium text-red-600">{errorMessage}</p>}

      <button
        type="button"
        onClick={onSubmit}
        disabled={submitDisabled}
        title={submitDisabled ? disabledReason : undefined}
        className="w-full rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-200"
      >
        {submitLabel}
      </button>
    </div>
  );
}
