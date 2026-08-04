"use client";

import { useState } from "react";
import { useLmsNotes } from "../hooks/academics.hooks";
import type { AcademicsMappingOption } from "../types/academics.types";
import { DashboardSectionState } from "../../dashboard/components/DashboardSectionState";
import { PlusIcon, TrashIcon } from "./icons";
import { Modal } from "./Modal";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

interface CreateNoteModalProps {
  selectedOption: AcademicsMappingOption;
  onSubmit: (title: string, fileUrl: string) => Promise<boolean>;
  onClose: () => void;
}

function CreateNoteModal({ selectedOption, onSubmit, onClose }: CreateNoteModalProps) {
  const [title, setTitle] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    const ok = await onSubmit(title.trim(), fileUrl.trim());
    setIsSubmitting(false);
    if (ok) onClose();
    else setError("Could not create the note. Check the file URL is valid and try again.");
  }

  return (
    <Modal title="Upload LMS Note" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="-mt-1 text-xs text-slate-500">
          {selectedOption.subjectName} ({selectedOption.subjectCode}) — {selectedOption.departmentCode}{" "}
          {selectedOption.classSection}
        </p>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            placeholder="e.g. Unit 3 — Binary Search Trees"
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">File URL (optional)</span>
          <input
            type="url"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            maxLength={500}
            placeholder="https://…"
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          />
        </label>

        {error && <p className="text-xs font-medium text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 w-full rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
        >
          {isSubmitting ? "Uploading…" : "Upload Note"}
        </button>
      </form>
    </Modal>
  );
}

interface LmsNotesTabProps {
  facultyId: number | null;
  selectedOption: AcademicsMappingOption | null;
}

export function LmsNotesTab({ facultyId, selectedOption }: LmsNotesTabProps) {
  const { status, notes, error, actionError, retry, createNote, deleteNote } = useLmsNotes(facultyId);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filtered = selectedOption
    ? notes.filter((note) => note.class.id === selectedOption.classId && note.subject.id === selectedOption.subjectId)
    : notes;

  if (!selectedOption) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
        Select a class &amp; subject above to view LMS notes.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">
          LMS Notes — {selectedOption.departmentCode} {selectedOption.classSection}
        </h2>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <PlusIcon className="h-4 w-4" />
          Upload Note
        </button>
      </div>

      {actionError && <p className="text-sm font-medium text-red-600">{actionError}</p>}

      <DashboardSectionState status={status} error={error} onRetry={retry} emptyMessage="No LMS notes uploaded yet." skeletonRows={3}>
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
            No LMS notes yet for this class &amp; subject.
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {filtered.map((note) => (
              <li key={note.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="min-w-0">
                  <p className="text-base font-bold text-slate-900">{note.title}</p>
                  <p className="mt-1 text-xs text-slate-400">Uploaded {formatDate(note.uploaded_at)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {note.file_url && (
                    <a
                      href={note.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50"
                    >
                      Open File
                    </a>
                  )}
                  <button
                    type="button"
                    aria-label="Delete note"
                    onClick={() => deleteNote(note.id)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </DashboardSectionState>

      {isCreateOpen && (
        <CreateNoteModal
          selectedOption={selectedOption}
          onSubmit={(title, fileUrl) =>
            createNote({
              subjectId: selectedOption.subjectId,
              classId: selectedOption.classId,
              academicYear: selectedOption.academicYear,
              title,
              fileUrl: fileUrl || undefined,
            })
          }
          onClose={() => setIsCreateOpen(false)}
        />
      )}
    </div>
  );
}
