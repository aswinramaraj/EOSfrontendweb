"use client";

import { useState, type FormEvent } from "react";
import { CloseIcon } from "@/shared/components/icons";
import type { DemandCategory } from "./types";

interface DemandCategoryFormDialogProps {
  category: DemandCategory | null;
  error?: string | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export function DemandCategoryFormDialog({
  category,
  error,
  isSubmitting,
  onClose,
  onSubmit,
}: DemandCategoryFormDialogProps) {
  const [name, setName] = useState(category?.name ?? "");
  const isEdit = category !== null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(name.trim());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-7 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900">
            {isEdit ? "Edit Demand Category" : "Add Demand Category"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-zinc-400 hover:text-zinc-600"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-5">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700">Name</span>
            <input
              type="text"
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tuition Fee"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-[#2F6FE0] focus:ring-2 focus:ring-[#BFD3F5]"
            />
          </label>

          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Add Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
