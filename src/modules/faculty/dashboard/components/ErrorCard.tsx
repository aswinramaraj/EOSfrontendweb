import { AlertCircleIcon } from "./icons";

interface ErrorCardProps {
  message?: string | null;
  onRetry?: () => void;
}

export function ErrorCard({ message, onRetry }: ErrorCardProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-red-200 bg-red-50 px-4 py-8 text-center">
      <AlertCircleIcon className="h-6 w-6 text-red-500" />
      <p className="text-sm text-red-700">{message ?? "Something went wrong. Please try again."}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
        >
          Retry
        </button>
      )}
    </div>
  );
}
