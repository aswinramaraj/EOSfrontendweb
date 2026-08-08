"use client";

import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/shared/components/icons";

interface SingleDateCalendarProps {
  value: Date;
  onChange: (day: Date) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function SingleDateCalendar({ value, onChange }: SingleDateCalendarProps) {
  const [viewDate, setViewDate] = useState(value);
  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: { date: Date | null; label: string }[] = [];
  for (let i = 0; i < firstDow; i++) cells.push({ date: null, label: "" });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(viewYear, viewMonth, d), label: String(d) });
  }

  return (
    <div className="rounded-2xl border border-[#E3E8EF] bg-white p-[22px] shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="mb-3.5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setViewDate(new Date(viewYear, viewMonth - 1, 1))}
          className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#E3E8EF] text-slate-700 hover:bg-slate-100"
          aria-label="Previous month"
        >
          <ChevronLeftIcon className="h-[18px] w-[18px]" />
        </button>
        <span className="text-[19px] font-semibold text-slate-900">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={() => setViewDate(new Date(viewYear, viewMonth + 1, 1))}
          className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#E3E8EF] text-slate-700 hover:bg-slate-100"
          aria-label="Next month"
        >
          <ChevronRightIcon className="h-[18px] w-[18px]" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1.5 pb-2 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((cell, i) => {
          if (!cell.date) return <span key={i} />;
          const isSunday = cell.date.getDay() === 0;
          const isSelected = sameDay(cell.date, value);
          return (
            <button
              key={i}
              type="button"
              disabled={isSunday}
              onClick={() => onChange(cell.date as Date)}
              className={`flex h-[52px] items-center justify-center ${
                isSelected ? "" : ""
              }`}
            >
              <span
                className={`flex h-[46px] w-[46px] items-center justify-center rounded-full text-[16.5px] font-medium transition-colors ${
                  isSelected
                    ? "bg-blue-200 text-blue-800"
                    : isSunday
                      ? "cursor-not-allowed text-slate-300"
                      : "text-slate-900 hover:bg-slate-100"
                }`}
              >
                {cell.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
