"use client";

import { useState } from "react";

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface DateRangeCalendarProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_LABEL_FORMAT = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function buildGridDays(viewYear: number, viewMonth: number): Date[] {
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const gridStart = addDays(firstOfMonth, -firstOfMonth.getDay());
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

export function DateRangeCalendar({ value, onChange }: DateRangeCalendarProps) {
  const today = startOfDay(new Date());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const days = buildGridDays(viewYear, viewMonth);

  function goToMonth(offset: number) {
    const next = new Date(viewYear, viewMonth + offset, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  function handleDayClick(day: Date) {
    if (day < today || day.getMonth() !== viewMonth) return;

    if (!value.start || value.end) {
      onChange({ start: day, end: null });
    } else if (day < value.start) {
      onChange({ start: day, end: null });
    } else {
      onChange({ start: value.start, end: day });
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => goToMonth(-1)}
          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
        >
          ‹
        </button>
        <p className="text-sm font-semibold text-slate-800">{MONTH_LABEL_FORMAT.format(new Date(viewYear, viewMonth, 1))}</p>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => goToMonth(1)}
          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="pb-2 text-xs font-semibold text-slate-400">
            {label}
          </div>
        ))}

        {days.map((day) => {
          const isCurrentMonth = day.getMonth() === viewMonth;
          const isPast = day < today;
          const isDisabled = isPast || !isCurrentMonth;
          const isStart = isSameDay(day, value.start);
          const isEnd = isSameDay(day, value.end);
          const isEndpoint = isStart || isEnd;
          const isInRange = value.start && value.end && day > value.start && day < value.end;
          const isToday = isSameDay(day, today);

          return (
            <div key={day.toISOString()} className="flex items-center justify-center py-1">
              <button
                type="button"
                disabled={isDisabled}
                onClick={() => handleDayClick(day)}
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition ${
                  isDisabled
                    ? "cursor-not-allowed text-slate-300"
                    : isEndpoint
                      ? "border-2 border-indigo-500 bg-indigo-100 text-indigo-700"
                      : isInRange
                        ? "bg-indigo-50 text-indigo-700"
                        : isToday
                          ? "text-indigo-600 hover:bg-slate-50"
                          : "text-slate-800 hover:bg-slate-50"
                }`}
              >
                {day.getDate()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
