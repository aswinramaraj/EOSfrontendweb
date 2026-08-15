"use client";

import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/shared/components/icons";

interface DateRangeCalendarProps {
  from: Date | null;
  to: Date | null;
  onPick: (day: Date) => void;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function sameDay(a: Date | null, b: Date): boolean {
  return !!a && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function DateRangeCalendar({ from, to, onPick }: DateRangeCalendarProps) {
  const [viewDate, setViewDate] = useState(() => from ?? new Date());
  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: { date: Date | null; label: string }[] = [];
  for (let i = 0; i < firstDow; i++) cells.push({ date: null, label: "" });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(viewYear, viewMonth, d), label: String(d) });
  }

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const fromTime = from ? startOfDay(from) : null;
  const toTime = to ? startOfDay(to) : null;

  return (
    <div className="rounded-[14px] bg-slate-50 p-3.5">
      <div className="mb-2.5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setViewDate(new Date(viewYear, viewMonth - 1, 1))}
          className="rounded-lg p-1.5 text-slate-700 hover:bg-slate-200"
          aria-label="Previous month"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <span className="text-[17px] font-semibold text-slate-900">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={() => setViewDate(new Date(viewYear, viewMonth + 1, 1))}
          className="rounded-lg p-1.5 text-slate-700 hover:bg-slate-200"
          aria-label="Next month"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 pb-2 text-center text-[13px] text-slate-500">
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((cell, i) => {
          if (!cell.date) return <span key={i} />;
          const t = startOfDay(cell.date);
          const isFrom = sameDay(from, cell.date);
          const isTo = sameDay(to, cell.date);
          const inRange = fromTime != null && toTime != null && t > fromTime && t < toTime;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onPick(cell.date as Date)}
              className={`h-12 text-base font-semibold transition-colors ${
                isFrom || isTo
                  ? "rounded-full bg-blue-200 text-blue-800"
                  : inRange
                    ? "rounded-[10px] bg-blue-50 text-slate-900"
                    : "rounded-[10px] text-slate-900 hover:bg-blue-200"
              }`}
            >
              {cell.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
