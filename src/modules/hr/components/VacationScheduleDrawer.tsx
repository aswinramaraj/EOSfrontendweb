"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/Button";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { XIcon } from "@/shared/components/icons";
import { useFaculties } from "@/modules/faculty/hooks/useFaculties";
import { FacultyAvatar } from "@/modules/faculty/components/FacultyAvatar";
import { fullName } from "@/modules/faculty/lib/faculty-format";
import { useCreateHrVacationEntry, useDeleteHrVacationEntry } from "../hooks/useHrRequests";
import { useLeaveTypes } from "../hooks/useLeaveTypes";
import type { HrUnifiedRequest, LeaveTypeRef } from "../types/api";

const KIND_LABEL: Record<HrUnifiedRequest["kind"], string> = { leave: "Leave", od: "On Duty" };

export interface VacationScheduleEntry {
  requestId: string;
  kind: HrUnifiedRequest["kind"];
  sourceId: number;
  facultyId: number;
  firstName: string;
  lastName: string;
  name: string;
  department: string;
  leaveType: LeaveTypeRef | null;
  profileUrl?: string | null;
}

interface VacationScheduleDrawerProps {
  date: string | null;
  entries: VacationScheduleEntry[];
  isPastDate: boolean;
  onClose: () => void;
}

export function VacationScheduleDrawer({ date, entries, isPastDate, onClose }: VacationScheduleDrawerProps) {
  if (!date) return null;
  // Keyed by date so the "add" form (faculty/kind selection) resets fresh
  // whenever a different day is opened, instead of syncing via effect.
  return <VacationScheduleDrawerContent key={date} date={date} entries={entries} isPastDate={isPastDate} onClose={onClose} />;
}

interface VacationScheduleDrawerContentProps {
  date: string;
  entries: VacationScheduleEntry[];
  isPastDate: boolean;
  onClose: () => void;
}

function VacationScheduleDrawerContent({ date, entries, isPastDate, onClose }: VacationScheduleDrawerContentProps) {
  const { show } = useToast();
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [kind, setKind] = useState<HrUnifiedRequest["kind"]>("leave");
  const [leaveTypeId, setLeaveTypeId] = useState("");

  const { data: facultyData } = useFaculties({ limit: 100 });
  const { data: leaveTypes } = useLeaveTypes();
  const createEntry = useCreateHrVacationEntry();
  const deleteEntry = useDeleteHrVacationEntry();

  const formattedDate = new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  function handleAdd() {
    if (!selectedFacultyId) return;
    createEntry.mutate(
      {
        faculty_id: Number(selectedFacultyId),
        kind,
        date,
        leave_type_id: kind === "leave" && leaveTypeId ? Number(leaveTypeId) : undefined,
      },
      {
        onSuccess: () => {
          show("Added to this day.", "success");
          setSelectedFacultyId("");
        },
        onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Couldn't add this entry.", "error"),
      },
    );
  }

  function handleRemove(entry: VacationScheduleEntry) {
    deleteEntry.mutate(
      { kind: entry.kind, sourceId: entry.sourceId },
      {
        onSuccess: () => show("Removed.", "success"),
        onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Couldn't remove this entry.", "error"),
      },
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} aria-hidden="true" />

      <aside className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-slate-200 bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Vacation Schedule</p>
            <h3 className="text-base font-bold text-slate-900">{formattedDate}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 px-5 py-5">
          <div className="flex flex-col divide-y divide-slate-100">
            {entries.map((entry) => (
              <div key={entry.requestId} className="flex items-center gap-3 py-3">
                <FacultyAvatar
                  faculty={{ id: entry.facultyId, first_name: entry.firstName, last_name: entry.lastName, profile_url: entry.profileUrl }}
                  className="h-9 w-9 rounded-full text-xs"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{entry.name}</p>
                  <p className="text-xs text-slate-500">
                    {entry.department} · {entry.kind === "leave" && entry.leaveType ? entry.leaveType.name : KIND_LABEL[entry.kind]}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(entry)}
                  disabled={deleteEntry.isPending}
                  className="shrink-0 text-slate-400 hover:text-red-600 disabled:opacity-50"
                  aria-label={`Remove ${entry.name}`}
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
            {entries.length === 0 && (
              <p className="py-4 text-sm text-slate-500">Nobody on leave or OD this day.</p>
            )}
          </div>

          {isPastDate ? (
            <p className="mt-5 border-t border-slate-100 pt-5 text-xs text-slate-400">
              This date is in the past — leave/OD can only be added for today or a future date.
            </p>
          ) : (
            <div className="mt-5 border-t border-slate-100 pt-5">
              <p className="mb-2 text-sm font-bold text-slate-900">Add faculty to this day</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <SelectInput
                  className="flex-1"
                  value={selectedFacultyId}
                  onChange={(e) => setSelectedFacultyId(e.target.value)}
                >
                  <option value="">Choose faculty...</option>
                  {facultyData?.data.map((f) => (
                    <option key={f.id} value={f.id}>
                      {fullName(f)}
                    </option>
                  ))}
                </SelectInput>
                <SelectInput
                  className="sm:w-36"
                  value={kind}
                  onChange={(e) => setKind(e.target.value as HrUnifiedRequest["kind"])}
                >
                  <option value="leave">Leave</option>
                  <option value="od">On Duty</option>
                </SelectInput>
              </div>
              {kind === "leave" && (
                <SelectInput className="mt-2 w-full" value={leaveTypeId} onChange={(e) => setLeaveTypeId(e.target.value)}>
                  <option value="">Leave type (optional)...</option>
                  {leaveTypes?.map((lt) => (
                    <option key={lt.id} value={lt.id}>
                      {lt.name}
                    </option>
                  ))}
                </SelectInput>
              )}
              <Button
                variant="primary"
                className="mt-3 w-full"
                disabled={!selectedFacultyId}
                isPending={createEntry.isPending}
                onClick={handleAdd}
              >
                Add to this day
              </Button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
