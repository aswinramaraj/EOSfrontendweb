"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { pageButtonStyle } from "@/modules/placement/lib/pageButtonStyle";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { useCreateSections } from "../hooks/useAcademicStructureMutations";
import { fieldErrorStyle, fieldHintStyle, fieldInputStyle, fieldLabelStyle, fieldRowStyle, dialogFooterStyle } from "../lib/formStyles";
import { SECTION_LETTERS, type Batch, type Course, type SchoolClass } from "../types";

interface SectionsDialogProps {
  open: boolean;
  onClose: () => void;
  course: Course;
  batches: Batch[];
  classes: SchoolClass[];
}

/** Parses a free-text "E, F G" into ["E","F","G"] — trims, uppercases, dedupes, drops empties. */
function parseCustomSections(raw: string): string[] {
  const tokens = raw
    .split(/[,\s]+/)
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean);
  return Array.from(new Set(tokens));
}

export function SectionsDialog({ open, onClose, course, batches, classes }: SectionsDialogProps) {
  const [batchId, setBatchId] = useState<string>(batches[0] ? String(batches[0].id) : "");
  const [semester, setSemester] = useState<string>("1");
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const [customText, setCustomText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createSections = useCreateSections();
  const { show } = useToast();

  const takenSections = useMemo(() => {
    if (!batchId) return new Set<string>();
    return new Set(
      classes.filter((c) => c.course_id === course.id && c.batch_id === Number(batchId)).map((c) => c.section),
    );
  }, [classes, course.id, batchId]);

  const semesterOptions = Array.from({ length: course.duration_years * 2 }, (_, i) => i + 1);

  const customSections = parseCustomSections(customText);
  const invalidCustom = customSections.filter((s) => s.length > 10 || !/^[A-Z0-9]+$/.test(s));
  const validCustom = customSections.filter((s) => s.length <= 10 && /^[A-Z0-9]+$/.test(s) && !takenSections.has(s));
  const allSelected = new Set([...chosen, ...validCustom]);

  function toggleLetter(letter: string) {
    if (takenSections.has(letter)) return;
    setChosen((prev) => {
      const next = new Set(prev);
      if (next.has(letter)) next.delete(letter);
      else next.add(letter);
      return next;
    });
  }

  function handleBatchChange(value: string) {
    setBatchId(value);
    const nextTaken = new Set(
      classes.filter((c) => c.course_id === course.id && c.batch_id === Number(value)).map((c) => c.section),
    );
    setChosen((prev) => new Set([...prev].filter((l) => !nextTaken.has(l))));
  }

  function handleSave() {
    setError(null);
    if (!batchId) return setError("Pick a batch.");
    if (allSelected.size === 0) return setError("Pick or type at least one section to create.");

    createSections
      .mutateAsync({
        batch_id: Number(batchId),
        department_id: course.department_id,
        course_id: course.id,
        sections: Array.from(allSelected),
        current_semester: semester ? Number(semester) : undefined,
      })
      .then(({ created, skipped }) => {
        if (created.length === 0) {
          show("Nothing created", "error");
          return;
        }
        const batchName = batches.find((b) => b.id === Number(batchId))?.name ?? "";
        show(`${created.length} class${created.length === 1 ? "" : "es"} created`, "success");
        if (skipped.length > 0) {
          show(`Section ${skipped.join(", ")} already existed for ${batchName} — skipped.`, "info");
        }
        onClose();
      });
  }

  const allLettersTaken = SECTION_LETTERS.every((l) => takenSections.has(l));

  return (
    <Modal open={open} onClose={onClose} title="Add sections" subtitle={course.name} widthClassName="max-w-sm">
      <div style={fieldRowStyle}>
        <label style={fieldLabelStyle}>Batch *</label>
        <select value={batchId} onChange={(e) => handleBatchChange(e.target.value)} style={fieldInputStyle()}>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>
      <div style={fieldRowStyle}>
        <label style={fieldLabelStyle}>Starting semester</label>
        <select value={semester} onChange={(e) => setSemester(e.target.value)} style={fieldInputStyle()}>
          <option value="">Not set yet</option>
          {semesterOptions.map((s) => (
            <option key={s} value={s}>
              Semester {s}
            </option>
          ))}
        </select>
      </div>
      <div style={fieldRowStyle}>
        <label style={fieldLabelStyle}>Sections *</label>
        <div style={{ display: "flex", gap: 8 }}>
          {SECTION_LETTERS.map((letter) => {
            const taken = takenSections.has(letter);
            const active = chosen.has(letter);
            return (
              <button
                key={letter}
                type="button"
                disabled={taken}
                onClick={() => toggleLetter(letter)}
                title={taken ? "exists" : undefined}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  border: `1px solid ${active ? "#1f4fd8" : "#dfe4ec"}`,
                  background: taken ? "#f1f3f7" : active ? "#1f4fd8" : "#fff",
                  color: taken ? "#c3cad4" : active ? "#fff" : "#3f4b60",
                  fontWeight: 650,
                  fontSize: 14,
                  cursor: taken ? "not-allowed" : "pointer",
                }}
              >
                {letter}
              </button>
            );
          })}
        </div>
        {allLettersTaken && <p style={fieldHintStyle}>A–D already exist for this batch — add more below.</p>}
      </div>
      <div style={fieldRowStyle}>
        <label style={fieldLabelStyle}>More sections (optional)</label>
        <input
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="e.g. E, F"
          style={fieldInputStyle()}
        />
        <p style={fieldHintStyle}>
          Not limited to A–D — type any section labels, separated by commas or spaces.
          {invalidCustom.length > 0 && (
            <span style={{ color: "#b91c1c" }}> "{invalidCustom.join(", ")}" — letters/numbers only, 10 chars max.</span>
          )}
        </p>
      </div>
      <p style={fieldHintStyle}>
        {allSelected.size > 0 ? `Creating section ${Array.from(allSelected).join(", ")}.` : "Pick or type the sections to create."}
      </p>
      {error && <p style={fieldErrorStyle}>{error}</p>}
      <div style={dialogFooterStyle}>
        <button type="button" style={pageButtonStyle(false)} onClick={onClose} disabled={createSections.isPending}>
          Cancel
        </button>
        <button type="button" style={pageButtonStyle(true)} onClick={handleSave} disabled={createSections.isPending}>
          {createSections.isPending ? "Creating…" : "Create classes"}
        </button>
      </div>
    </Modal>
  );
}
