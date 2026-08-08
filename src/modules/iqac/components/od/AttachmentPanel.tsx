import { DownloadIcon, FileTextIcon } from "@/shared/components/icons";

interface AttachmentPanelProps {
  photoUrl: string | null;
  certificateUrl: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export function AttachmentPanel({ photoUrl, certificateUrl, latitude, longitude }: AttachmentPanelProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-lg border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 px-3.5 py-2.5">
          <span className="text-xs font-semibold text-slate-700">Geo-tagged photo</span>
          {latitude != null && longitude != null && (
            <span className="text-xs tabular-nums text-slate-500">
              {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E
            </span>
          )}
        </div>
        {photoUrl ? (
          <a
            href={photoUrl}
            target="_blank"
            rel="noreferrer"
            className="flex h-32 items-center justify-center gap-2 bg-blue-50 text-sm font-medium text-blue-700 hover:bg-blue-100"
          >
            <DownloadIcon className="h-4 w-4" /> View photo
          </a>
        ) : (
          <div className="flex h-32 items-center justify-center text-sm text-slate-400">Not uploaded</div>
        )}
      </div>

      <div className="rounded-lg border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 px-3.5 py-2.5">
          <span className="text-xs font-semibold text-slate-700">Certificate / attachment</span>
        </div>
        {certificateUrl ? (
          <a
            href={certificateUrl}
            target="_blank"
            rel="noreferrer"
            className="flex h-32 items-center justify-center gap-2 bg-slate-50 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <FileTextIcon className="h-4 w-4" /> View certificate
          </a>
        ) : (
          <div className="flex h-32 items-center justify-center text-sm text-slate-400">Not uploaded</div>
        )}
      </div>
    </div>
  );
}
