"use client";

import { useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { useDepartments } from "@/modules/departments/hooks/useDepartments";
import { ApiError } from "@/shared/lib/api-client";
import { CheckIcon, DownloadIcon, TrashIcon, UploadIcon, XIcon } from "@/shared/components/icons";
import { facultyService } from "../services/faculty.service";
import { facultyKeys } from "../query-keys";
import {
  IMPORT_FIELDS,
  IMPORT_MAX_ROWS,
  autoMapColumns,
  downloadSample,
  downloadTemplate,
  parseSheet,
  validateRow,
  type ImportRow,
} from "../lib/faculty-import";

interface FacultyImportModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = "source" | "map" | "review";
type RowStatus = "valid" | "invalid" | "pending" | "success" | "failed";

interface ReviewRow {
  key: number;
  values: ImportRow;
  errors: Record<string, string>;
  status: RowStatus;
  submitError?: string;
}

const STEPS: { id: Step; label: string }[] = [
  { id: "source", label: "Source" },
  { id: "map", label: "Map columns" },
  { id: "review", label: "Review & fix" },
];

function StepHeader({ current }: { current: Step }) {
  const currentIndex = STEPS.findIndex((s) => s.id === current);
  return (
    <div className="mb-6 flex items-center">
      {STEPS.map((step, index) => (
        <div key={step.id} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                index < currentIndex
                  ? "border-blue-600 bg-blue-600 text-white"
                  : index === currentIndex
                    ? "border-blue-600 text-blue-600"
                    : "border-slate-300 text-slate-400"
              }`}
            >
              {index < currentIndex ? <CheckIcon className="h-3.5 w-3.5" /> : index + 1}
            </span>
            <span className={`text-sm font-medium ${index <= currentIndex ? "text-blue-700" : "text-slate-400"}`}>
              {step.label}
            </span>
            <span className="text-[11px] text-slate-400">Step {index + 1}</span>
          </div>
          {index < STEPS.length - 1 && (
            <div className={`mx-2 mb-5 h-px flex-1 ${index < currentIndex ? "bg-blue-600" : "bg-slate-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export function FacultyImportModal({ open, onClose }: FacultyImportModalProps) {
  const { show } = useToast();
  const queryClient = useQueryClient();
  const { data: departments } = useDepartments();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("source");
  const [sourceMode, setSourceMode] = useState<"upload" | "paste">("upload");
  const [fileName, setFileName] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [dataRows, setDataRows] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<number, string>>({});
  const [reviewRows, setReviewRows] = useState<ReviewRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function resetAll() {
    setStep("source");
    setSourceMode("upload");
    setFileName(null);
    setPastedText("");
    setHeaders([]);
    setDataRows([]);
    setColumnMapping({});
    setReviewRows([]);
    setIsSubmitting(false);
    setSubmitted(false);
  }

  function handleClose() {
    resetAll();
    onClose();
  }

  function loadText(text: string, name: string | null) {
    const { headers: parsedHeaders, rows } = parseSheet(text);
    if (parsedHeaders.length === 0 || rows.length === 0) {
      show("Couldn't find any rows in that file.", "error");
      return;
    }
    if (rows.length > IMPORT_MAX_ROWS) {
      show(`This file has ${rows.length} rows — the limit is ${IMPORT_MAX_ROWS}.`, "error");
      return;
    }
    setFileName(name);
    setHeaders(parsedHeaders);
    setDataRows(rows);
    setColumnMapping(autoMapColumns(parsedHeaders));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => loadText(String(reader.result ?? ""), file.name);
    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => loadText(String(reader.result ?? ""), file.name);
    reader.readAsText(file);
  }

  function goToMapColumns() {
    if (sourceMode === "paste") {
      if (!pastedText.trim()) {
        show("Paste some rows first.", "error");
        return;
      }
      loadText(pastedText, null);
    }
    if (headers.length === 0) {
      show("Choose a file or paste rows first.", "error");
      return;
    }
    setStep("map");
  }

  const mappedFieldKeys = useMemo(
    () => Array.from(new Set(Object.values(columnMapping))).filter(Boolean),
    [columnMapping],
  );

  function buildReviewRows(): ReviewRow[] {
    return dataRows.map((cells, rowIndex) => {
      const values: ImportRow = {};
      headers.forEach((_, colIndex) => {
        const fieldKey = columnMapping[colIndex];
        if (fieldKey) values[fieldKey] = cells[colIndex] ?? "";
      });
      const { errors } = validateRow(values, departments ?? []);
      return {
        key: rowIndex,
        values,
        errors,
        status: Object.keys(errors).length > 0 ? "invalid" : "valid",
      };
    });
  }

  function goToReview() {
    if (mappedFieldKeys.length === 0) {
      show("Map at least one column first.", "error");
      return;
    }
    const required = IMPORT_FIELDS.filter((f) => f.required).map((f) => f.key);
    const missingRequired = required.filter((key) => !mappedFieldKeys.includes(key));
    if (missingRequired.length > 0) {
      show(`Map these required fields: ${missingRequired.join(", ")}`, "error");
      return;
    }
    setReviewRows(buildReviewRows());
    setSubmitted(false);
    setStep("review");
  }

  function updateCell(rowKey: number, fieldKey: string, value: string) {
    setReviewRows((prev) =>
      prev.map((row) => {
        if (row.key !== rowKey) return row;
        const values = { ...row.values, [fieldKey]: value };
        const { errors } = validateRow(values, departments ?? []);
        return { ...row, values, errors, status: Object.keys(errors).length > 0 ? "invalid" : "valid" };
      }),
    );
  }

  function removeRow(rowKey: number) {
    setReviewRows((prev) => prev.filter((row) => row.key !== rowKey));
  }

  const validCount = reviewRows.filter((r) => r.status === "valid" || r.status === "success").length;
  const invalidCount = reviewRows.filter((r) => r.status === "invalid").length;
  const failedCount = reviewRows.filter((r) => r.status === "failed").length;
  const successCount = reviewRows.filter((r) => r.status === "success").length;

  async function handleImport() {
    const toImport = reviewRows.filter((r) => r.status === "valid");
    if (toImport.length === 0) {
      show("No valid rows to import.", "error");
      return;
    }

    setIsSubmitting(true);
    setReviewRows((prev) =>
      prev.map((row) => (row.status === "valid" ? { ...row, status: "pending" } : row)),
    );

    const CONCURRENCY = 3;
    const queue = [...toImport];

    async function worker() {
      while (queue.length > 0) {
        const row = queue.shift();
        if (!row) return;
        const { payload } = validateRow(row.values, departments ?? []);
        if (!payload) continue;
        try {
          await facultyService.create(payload);
          setReviewRows((prev) =>
            prev.map((r) => (r.key === row.key ? { ...r, status: "success" } : r)),
          );
        } catch (err: unknown) {
          setReviewRows((prev) =>
            prev.map((r) =>
              r.key === row.key
                ? {
                    ...r,
                    status: "failed",
                    submitError: err instanceof ApiError ? err.message : "Failed to create",
                  }
                : r,
            ),
          );
        }
      }
    }

    await Promise.all(Array.from({ length: CONCURRENCY }, worker));

    setIsSubmitting(false);
    setSubmitted(true);
    queryClient.invalidateQueries({ queryKey: facultyKeys.all });
  }

  if (submitted) {
    const finalFailed = reviewRows.filter((r) => r.status === "failed").length;
    return (
      <Modal open={open} onClose={handleClose} title="Import Faculty" closeButtonVariant="bordered">
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-full ${
              finalFailed === 0 ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
            }`}
          >
            <CheckIcon className="h-6 w-6" />
          </span>
          <div>
            <p className="text-base font-bold text-slate-900">
              {reviewRows.length - finalFailed} of {reviewRows.length} faculty imported
            </p>
            {finalFailed > 0 && (
              <p className="mt-1 text-sm text-slate-500">{finalFailed} row(s) failed — see details below.</p>
            )}
          </div>
        </div>

        {finalFailed > 0 && (
          <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-200">
            {reviewRows
              .filter((r) => r.status === "failed")
              .map((r) => (
                <div key={r.key} className="border-b border-slate-100 px-3 py-2 text-sm last:border-b-0">
                  <p className="font-medium text-slate-800">
                    {r.values.first_name} {r.values.last_name} — {r.values.email}
                  </p>
                  <p className="text-xs text-red-600">{r.submitError}</p>
                </div>
              ))}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={resetAll}>
            Import more
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Done
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title="Import Faculty" closeButtonVariant="bordered" widthClassName="max-w-2xl">
      <p className="mb-5 text-sm text-slate-500">
        Map your spreadsheet&apos;s columns onto database fields, then fix anything that would not load.
      </p>

      <StepHeader current={step} />

      {step === "source" && (
        <div>
          <div className="mb-4 inline-flex rounded-md border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setSourceMode("upload")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                sourceMode === "upload" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              Upload a file
            </button>
            <button
              type="button"
              onClick={() => setSourceMode("paste")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                sourceMode === "paste" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              Paste rows
            </button>
          </div>

          {sourceMode === "upload" ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center"
            >
              <UploadIcon className="h-6 w-6 text-blue-600" />
              <p className="text-sm font-semibold text-slate-800">
                {fileName ?? "Drop a CSV or TSV file here"}
              </p>
              <p className="text-xs text-slate-500">Up to {IMPORT_MAX_ROWS.toLocaleString()} rows · headers are detected automatically</p>
              <Button type="button" variant="secondary" className="mt-2" onClick={() => fileInputRef.current?.click()}>
                Browse files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.tsv,text/csv,text/tab-separated-values"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste tab- or comma-separated rows, including a header row."
              rows={8}
              className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-4 text-sm">
              <button type="button" onClick={downloadTemplate} className="flex items-center gap-1.5 text-blue-700 hover:underline">
                <DownloadIcon className="h-3.5 w-3.5" /> Download template
              </button>
              <button type="button" onClick={downloadSample} className="text-blue-700 hover:underline">
                Load a sample
              </button>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="primary" onClick={goToMapColumns}>
                Map columns
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === "map" && (
        <div>
          <p className="mb-3 text-sm text-slate-500">
            We matched columns we recognized — check them, and map anything left as &quot;Don&apos;t import&quot;.
          </p>
          <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-200">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Your column
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Sample value
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Maps to
                  </th>
                </tr>
              </thead>
              <tbody>
                {headers.map((header, index) => (
                  <tr key={index} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-3 py-2 font-medium text-slate-800">{header || `Column ${index + 1}`}</td>
                    <td className="px-3 py-2 text-slate-500">{dataRows[0]?.[index] ?? ""}</td>
                    <td className="px-3 py-2">
                      <SelectInput
                        value={columnMapping[index] ?? ""}
                        onChange={(e) =>
                          setColumnMapping((prev) => ({ ...prev, [index]: e.target.value }))
                        }
                      >
                        <option value="">Don&apos;t import</option>
                        {IMPORT_FIELDS.map((f) => (
                          <option key={f.key} value={f.key}>
                            {f.label}
                            {f.required ? " *" : ""}
                          </option>
                        ))}
                      </SelectInput>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setStep("source")}>
              Back
            </Button>
            <Button variant="primary" onClick={goToReview}>
              Review rows
            </Button>
          </div>
        </div>
      )}

      {step === "review" && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-green-700">{validCount + successCount} ready</span>
              {invalidCount > 0 && (
                <span className="ml-2 font-semibold text-red-600">{invalidCount} need fixing</span>
              )}
              {failedCount > 0 && <span className="ml-2 font-semibold text-red-600">{failedCount} failed</span>}
            </p>
          </div>

          <div className="max-h-80 overflow-auto rounded-lg border border-slate-200">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Status
                  </th>
                  {mappedFieldKeys.map((key) => (
                    <th
                      key={key}
                      className="whitespace-nowrap px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                    >
                      {IMPORT_FIELDS.find((f) => f.key === key)?.label ?? key}
                    </th>
                  ))}
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {reviewRows.map((row) => (
                  <tr key={row.key} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-3 py-2">
                      {row.status === "invalid" && (
                        <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-red-600">
                          Fix
                        </span>
                      )}
                      {row.status === "valid" && (
                        <span className="rounded-md bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-green-700">
                          Ready
                        </span>
                      )}
                      {row.status === "pending" && (
                        <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-blue-700">
                          …
                        </span>
                      )}
                      {row.status === "success" && (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckIcon className="h-3.5 w-3.5" />
                        </span>
                      )}
                      {row.status === "failed" && (
                        <span
                          className="rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-red-600"
                          title={row.submitError}
                        >
                          Failed
                        </span>
                      )}
                    </td>
                    {mappedFieldKeys.map((key) => (
                      <td key={key} className="px-2 py-1.5">
                        <input
                          value={row.values[key] ?? ""}
                          disabled={isSubmitting || row.status === "success" || row.status === "pending"}
                          onChange={(e) => updateCell(row.key, key, e.target.value)}
                          title={row.errors[key]}
                          className={`w-32 rounded-md border px-2 py-1 text-xs focus:outline-none focus:ring-1 disabled:bg-slate-50 ${
                            row.errors[key]
                              ? "border-red-300 focus:ring-red-400"
                              : "border-slate-200 focus:ring-blue-300"
                          }`}
                        />
                      </td>
                    ))}
                    <td className="px-2 py-1.5 text-right">
                      <button
                        type="button"
                        onClick={() => removeRow(row.key)}
                        disabled={isSubmitting}
                        aria-label="Remove row"
                        className="text-slate-400 hover:text-red-600 disabled:opacity-40"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {invalidCount > 0 && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
              <XIcon className="h-3 w-3" /> Rows marked &quot;Fix&quot; will be skipped until corrected.
            </p>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setStep("map")} disabled={isSubmitting}>
              Back
            </Button>
            <Button variant="primary" onClick={handleImport} isPending={isSubmitting} disabled={validCount === 0}>
              Import {validCount} faculty
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
