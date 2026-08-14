"use client";

import { useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { FormField } from "@/shared/components/ui/FormField";
import { TextInput } from "@/shared/components/ui/TextInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { Button } from "@/shared/components/ui/Button";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { useCreateAnnouncement } from "@/modules/hr/local/announcements-store";

const DEFAULT_OFFICE = "HR & Payroll office";

const AUDIENCE_OPTIONS = [
  "All faculty · all departments",
  "Heads of department",
  "Professors",
  "Associate professors",
  "Assistant professors",
  "Non-teaching staff",
];

const CATEGORY_OPTIONS = ["ACADEMIC", "HR", "EMERGENCY", "PLACEMENT", "EXAMINATIONS"];

interface NewAnnouncementModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewAnnouncementModal({ open, onClose }: NewAnnouncementModalProps) {
  const { show } = useToast();
  const createAnnouncement = useCreateAnnouncement();
  const [headline, setHeadline] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [office, setOffice] = useState(DEFAULT_OFFICE);
  const [audience, setAudience] = useState<string[]>([AUDIENCE_OPTIONS[0]]);

  function toggleAudience(option: string) {
    setAudience((prev) => (prev.includes(option) ? prev.filter((a) => a !== option) : [...prev, option]));
  }

  function reset() {
    setHeadline("");
    setMessage("");
    setCategory(CATEGORY_OPTIONS[0]);
    setOffice(DEFAULT_OFFICE);
    setAudience([AUDIENCE_OPTIONS[0]]);
  }

  function handleSave() {
    if (!headline.trim() || !message.trim() || audience.length === 0) {
      show("Headline, message and at least one audience are required.", "error");
      return;
    }
    createAnnouncement({
      headline: headline.trim(),
      message: message.trim(),
      category,
      audience,
      postedBy: office.trim() || DEFAULT_OFFICE,
    });
    show("Announcement posted.", "success");
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="New announcement" widthClassName="max-w-xl">
      <div className="flex flex-col gap-4">
        <FormField label="Headline" htmlFor="ann-headline" required>
          <TextInput
            id="ann-headline"
            placeholder="e.g. CIA-II retest schedule for CSE published"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Audience" htmlFor="ann-audience-0">
            <div className="flex max-h-40 flex-col gap-1 overflow-y-auto rounded-md border border-slate-200 p-2">
              {AUDIENCE_OPTIONS.map((option, index) => (
                <label key={option} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-slate-50">
                  <input
                    id={index === 0 ? "ann-audience-0" : undefined}
                    type="checkbox"
                    checked={audience.includes(option)}
                    onChange={() => toggleAudience(option)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-700"
                  />
                  {option}
                </label>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setAudience([...AUDIENCE_OPTIONS])} className="text-xs font-semibold text-blue-700 hover:underline">
                Select all
              </button>
              <button type="button" onClick={() => setAudience([])} className="text-xs font-semibold text-blue-700 hover:underline">
                Clear
              </button>
            </div>
          </FormField>

          <div className="flex flex-col gap-4">
            <FormField label="Category" htmlFor="ann-category">
              <SelectInput id="ann-category" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </SelectInput>
            </FormField>

            <FormField label="Posted as" htmlFor="ann-office">
              <TextInput id="ann-office" placeholder={DEFAULT_OFFICE} value={office} onChange={(e) => setOffice(e.target.value)} />
            </FormField>
          </div>
        </div>

        {audience.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {audience.map((a) => (
              <span key={a} className="rounded-full bg-[#EEF2FF] px-2.5 py-1 text-xs font-medium text-[#2655DA]">
                {a}
              </span>
            ))}
          </div>
        )}

        <FormField label="Message" htmlFor="ann-message" required>
          <textarea
            id="ann-message"
            rows={4}
            placeholder="Write the announcement in full"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-tint"
          />
        </FormField>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Post announcement
          </Button>
        </div>
      </div>
    </Modal>
  );
}
