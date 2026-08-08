"use client";

import { Button } from "@/shared/components/ui/Button";
import { PencilIcon, UploadIcon, XIcon } from "@/shared/components/icons";

interface FacultyPhotoPickerProps {
  photoDataUrl: string | null;
  photoLabel: string | null;
  initials: string;
  tone: string;
  avatarClassName?: string;
  isUploading?: boolean;
  onPick: () => void;
  onRemove: () => void;
}

export function FacultyPhotoPicker({
  photoDataUrl,
  photoLabel,
  initials,
  tone,
  avatarClassName = "h-16 w-16 rounded-xl text-xl",
  isUploading = false,
  onPick,
  onRemove,
}: FacultyPhotoPickerProps) {
  const caption = isUploading
    ? "Uploading…"
    : photoLabel
      ? `Selected: ${photoLabel}`
      : photoDataUrl
        ? "Photo uploaded."
        : "No photo uploaded.";
  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={onPick}
          disabled={isUploading}
          aria-label="Change profile photo"
          className={`flex items-center justify-center overflow-hidden font-bold disabled:opacity-60 ${photoDataUrl ? "" : tone} ${avatarClassName}`}
        >
          {photoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoDataUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </button>

        <button
          type="button"
          onClick={onPick}
          disabled={isUploading}
          aria-label="Change profile photo"
          className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:text-blue-600 disabled:opacity-60"
        >
          <PencilIcon className="h-3 w-3" />
        </button>

        {photoDataUrl && (
          <button
            type="button"
            onClick={onRemove}
            disabled={isUploading}
            aria-label="Remove photo"
            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:text-red-600 disabled:opacity-60"
          >
            <XIcon className="h-3 w-3" />
          </button>
        )}
      </div>

      <div>
        <p className="text-xs text-slate-500">{caption}</p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-2"
          onClick={onPick}
          disabled={isUploading}
          isPending={isUploading}
        >
          <UploadIcon className="h-3.5 w-3.5" />
          Change photo
        </Button>
      </div>
    </div>
  );
}
