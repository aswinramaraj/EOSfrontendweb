"use client";

import { useState } from "react";
import { useFacultyAcademicsIdentity } from "../hooks/academics.hooks";
import { DashboardSectionState } from "../../dashboard/components/DashboardSectionState";
import { AssignmentsTab } from "./AssignmentsTab";
import { CaMarksTab } from "./CaMarksTab";
import { ClassSubjectSelector } from "./ClassSubjectSelector";
import { LessonPlansTab } from "./LessonPlansTab";
import { LmsNotesTab } from "./LmsNotesTab";

type TabKey = "assignments" | "ca-marks" | "lesson-plans" | "lms-notes";

const TABS: { key: TabKey; label: string }[] = [
  { key: "assignments", label: "Assignments" },
  { key: "ca-marks", label: "CIA Marks Entry" },
  { key: "lesson-plans", label: "Lesson Plan" },
  { key: "lms-notes", label: "LMS Notes" },
];

export function AcademicsPage() {
  const { status, facultyId, mappingOptions, error, retry } = useFacultyAcademicsIdentity();
  const [activeTab, setActiveTab] = useState<TabKey>("assignments");
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);

  const selectedOption =
    mappingOptions.find((option) => option.id === selectedOptionId) ?? mappingOptions[0] ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Academics Suite</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage assignments, CIA marks, lesson plans, and LMS notes for the classes you teach.
        </p>
      </div>

      <nav className="flex w-fit flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.key ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <DashboardSectionState
        status={status}
        error={error}
        onRetry={retry}
        emptyMessage="No subjects are currently allocated to you."
        skeletonRows={4}
      >
        <div className="flex flex-col gap-6">
          <ClassSubjectSelector
            mappingOptions={mappingOptions}
            selectedId={selectedOption?.id ?? null}
            onSelect={(option) => setSelectedOptionId(option.id)}
          />

          {activeTab === "assignments" && <AssignmentsTab selectedOption={selectedOption} />}
          {activeTab === "ca-marks" && (
            <CaMarksTab mappingOptions={mappingOptions} identityStatus={status} selectedOption={selectedOption} />
          )}
          {activeTab === "lesson-plans" && <LessonPlansTab facultyId={facultyId} selectedOption={selectedOption} />}
          {activeTab === "lms-notes" && <LmsNotesTab facultyId={facultyId} selectedOption={selectedOption} />}
        </div>
      </DashboardSectionState>
    </div>
  );
}
