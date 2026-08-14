"use client";

import { useMemo, useState } from "react";
import { TextInput } from "@/shared/components/ui/TextInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { Button } from "@/shared/components/ui/Button";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { PlusIcon } from "@/shared/components/icons";
import { useHRPeriod, MONTH_LABELS } from "@/modules/hr/components/HRPeriodContext";
import { useCalendarEvents, useCreateCalendarEvent } from "@/modules/hr/local/academic-calendar-store";
import { HRMonthCalendar } from "@/modules/hr/components/HRMonthCalendar";
import { HRPageHeader } from "@/modules/hr/components/ui/HRPageHeader";
import { HRCard } from "@/modules/hr/components/ui/HRCard";
import { HRPill, type HRPillTone } from "@/modules/hr/components/ui/HRPill";
import type { CalendarEventType } from "@/modules/hr/local/types";

const EVENT_TYPES: CalendarEventType[] = ["Instruction", "Assessment", "Holiday", "Placement", "HR", "Academic"];

const TYPE_TONE: Record<CalendarEventType, HRPillTone> = {
  Instruction: "blue",
  Assessment: "purple",
  Holiday: "red",
  Placement: "green",
  HR: "amber",
  Academic: "cyan",
};

export default function HRAcademicCalendarPage() {
  const { show } = useToast();
  const { year, month, setYear, setMonth } = useHRPeriod();
  const { data: events } = useCalendarEvents(year, month);
  const createEvent = useCreateCalendarEvent();

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [day, setDay] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<CalendarEventType>("Instruction");

  const daysWithEvents = useMemo(() => new Set(events.map((e) => e.day)), [events]);

  const sortedEvents = useMemo(() => {
    const rows = selectedDay ? events.filter((e) => e.day === selectedDay) : events;
    return [...rows].sort((a, b) => a.day - b.day);
  }, [events, selectedDay]);

  function goMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    if (m > 12) {
      m = 1;
      y += 1;
    }
    setYear(y);
    setMonth(m);
    setSelectedDay(null);
  }

  function handleSave() {
    const dayNum = Number(day);
    if (!dayNum || dayNum < 1 || dayNum > 31 || !title.trim()) {
      show("Enter a valid day and event title.", "error");
      return;
    }
    createEvent({ year, month, day: dayNum, title: title.trim(), type });
    show("Event added.", "success");
    setDay("");
    setTitle("");
    setType("Instruction");
    setFormOpen(false);
  }

  return (
    <div>
      <HRPageHeader
        title="Academic Calendar"
        description={`Academic year ${year}–${String((year + 1) % 100).padStart(2, "0")} · you can add new events for ${MONTH_LABELS[month - 1]} ${year}`}
        actions={
          <Button variant="primary" onClick={() => setFormOpen((o) => !o)}>
            <PlusIcon className="h-4 w-4" />
            Add event
          </Button>
        }
      />

      {formOpen && (
        <HRCard className="mb-5">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-24">
              <label className="mb-1 block text-sm font-medium text-blue-700">Day of month</label>
              <TextInput type="number" min={1} max={31} placeholder="e.g. 21" value={day} onChange={(e) => setDay(e.target.value)} />
            </div>
            <div className="min-w-[240px] flex-1">
              <label className="mb-1 block text-sm font-medium text-blue-700">Event title</label>
              <TextInput placeholder="e.g. Faculty development programme" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="w-40">
              <label className="mb-1 block text-sm font-medium text-blue-700">Type</label>
              <SelectInput value={type} onChange={(e) => setType(e.target.value as CalendarEventType)}>
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </SelectInput>
            </div>
            <Button variant="primary" onClick={handleSave}>
              Save event
            </Button>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
          </div>
        </HRCard>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <HRMonthCalendar
          year={year}
          month={month}
          daysWithEvents={daysWithEvents}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          onPrevMonth={() => goMonth(-1)}
          onNextMonth={() => goMonth(1)}
        />

        <HRCard title={`Events in ${MONTH_LABELS[month - 1]}`}>
          <div className="flex flex-col gap-3">
            {sortedEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-slate-50 text-slate-700">
                  <span className="text-sm font-bold leading-none">{event.day}</span>
                  <span className="text-[9px] font-semibold uppercase leading-none text-slate-400">
                    {new Date(event.year, event.month - 1, event.day).toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{event.title}</p>
                  <p className="text-xs text-slate-500">
                    {MONTH_LABELS[event.month - 1]} {event.day}, {event.year}
                  </p>
                </div>
                <HRPill tone={TYPE_TONE[event.type]}>{event.type}</HRPill>
              </div>
            ))}

            {sortedEvents.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-500">No events for this month yet.</p>
            )}
          </div>
        </HRCard>
      </div>
    </div>
  );
}
