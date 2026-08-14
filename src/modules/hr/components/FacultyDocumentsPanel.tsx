"use client";

import { useRef, useState } from "react";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { Button } from "@/shared/components/ui/Button";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { DownloadIcon, FileTextIcon, TrashIcon, UploadIcon } from "@/shared/components/icons";
import { useFacultyDocuments } from "@/modules/faculty/hooks/useFacultyDocuments";
import { useUploadFacultyDocument, useDeleteFacultyDocument } from "@/modules/faculty/hooks/useFacultyFileMutations";
import { DOCUMENT_TYPE_OPTIONS } from "@/modules/faculty/lib/faculty-wizard-config";
import { formatDate } from "@/modules/faculty/lib/faculty-format";

const DOCUMENT_FORMAT_HINT = "PDF, JPG, or PNG · up to 10 MB";

interface FacultyDocumentsPanelProps {
  facultyId: number;
}

export function FacultyDocumentsPanel({ facultyId }: FacultyDocumentsPanelProps) {
  const { show } = useToast();
  const { data: documents, isLoading } = useFacultyDocuments(facultyId);
  const uploadDocument = useUploadFacultyDocument(facultyId);
  const deleteDocument = useDeleteFacultyDocument(facultyId);

  const [documentType, setDocumentType] = useState(DOCUMENT_TYPE_OPTIONS[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    uploadDocument.mutate(
      { file, documentType },
      {
        onSuccess: () => show("Document uploaded.", "success"),
        onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Failed to upload document.", "error"),
      },
    );
  }

  function handleDelete(documentId: number) {
    deleteDocument.mutate(documentId, {
      onSuccess: () => show("Document removed.", "success"),
      onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Failed to remove document.", "error"),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SelectInput className="flex-1" value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
            {DOCUMENT_TYPE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </SelectInput>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            className="hidden"
            onChange={handleFileSelected}
          />
          <Button variant="primary" onClick={handleUploadClick} isPending={uploadDocument.isPending}>
            <UploadIcon className="h-4 w-4" />
            Upload Document
          </Button>
        </div>
        <p className="mt-2 text-xs text-slate-500">Accepted formats: {DOCUMENT_FORMAT_HINT}.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        {isLoading && <p className="px-5 py-8 text-center text-sm text-slate-500">Loading…</p>}
        {!isLoading && (documents?.length ?? 0) === 0 && (
          <p className="px-5 py-8 text-center text-sm text-slate-500">No documents uploaded for this faculty yet.</p>
        )}
        {!isLoading &&
          documents?.map((doc) => (
            <div key={doc.id} className="flex items-center gap-3 border-b border-slate-100 px-5 py-3.5 last:border-b-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                <FileTextIcon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{doc.file_name}</p>
                <p className="text-xs text-slate-500">
                  {doc.document_type} · Uploaded {formatDate(doc.uploaded_at)}
                  {!doc.url && " · File unavailable"}
                </p>
              </div>
              {doc.url ? (
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex shrink-0 items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <DownloadIcon className="h-4 w-4" />
                  View
                </a>
              ) : (
                <span className="shrink-0 rounded-md border border-slate-100 px-3 py-1.5 text-sm text-slate-400">
                  Unavailable
                </span>
              )}
              <button
                onClick={() => handleDelete(doc.id)}
                disabled={deleteDocument.isPending}
                className="shrink-0 text-slate-400 hover:text-red-600 disabled:opacity-50"
                aria-label={`Delete ${doc.file_name}`}
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
