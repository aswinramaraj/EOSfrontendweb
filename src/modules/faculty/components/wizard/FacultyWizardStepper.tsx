"use client";

import { CheckIcon } from "@/shared/components/icons";
import { WIZARD_STEPS } from "../../lib/faculty-wizard-config";

interface FacultyWizardStepperProps {
  currentIndex: number;
  getSubtext: (stepId: string, index: number) => string;
  onStepClick: (index: number) => void;
}

export function FacultyWizardStepper({ currentIndex, getSubtext, onStepClick }: FacultyWizardStepperProps) {
  return (
    <aside className="sticky top-6 w-64 shrink-0 self-start rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-3 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Sections</p>
      </div>

      <nav className="flex flex-col p-1.5">
        {WIZARD_STEPS.map((step, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
          return (
            <button
              key={step.id}
              onClick={() => onStepClick(index)}
              className={`flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                isCurrent ? "bg-blue-50" : "hover:bg-slate-50"
              }`}
            >
              <span className="relative flex flex-col items-center">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${
                    isDone
                      ? "border-blue-700 bg-blue-700 text-white"
                      : isCurrent
                        ? "border-blue-700 text-blue-700"
                        : "border-slate-300 text-slate-400"
                  }`}
                >
                  {isDone ? <CheckIcon className="h-3 w-3" /> : index + 1}
                </span>
                {index < WIZARD_STEPS.length - 1 && <span className="mt-1 h-full w-px flex-1 bg-slate-200" />}
              </span>
              <span className="pb-1.5">
                <span className={`block text-[13px] font-semibold ${isCurrent ? "text-blue-700" : "text-slate-800"}`}>
                  {step.label}
                </span>
                <span className="block text-[11px] text-slate-500">{getSubtext(step.id, index)}</span>
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
