export function StudentRosterUnavailableNotice() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 px-4 py-10 text-center">
      <p className="text-sm font-medium text-slate-600">Student roster is unavailable right now.</p>
      <p className="max-w-xs text-xs text-slate-400">
        This class&apos;s student list couldn&apos;t be loaded from the backend. This panel will populate
        automatically once it can be reached.
      </p>
    </div>
  );
}
