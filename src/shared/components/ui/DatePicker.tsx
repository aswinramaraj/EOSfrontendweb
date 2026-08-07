"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, XIcon } from "@/shared/components/icons";
import { SelectInput } from "./SelectInput";

interface DatePickerProps {
  id?: string;
  value?: string;
  onChange: (value: string | undefined) => void;
  hasError?: boolean;
  /** ISO "YYYY-MM-DD". Defaults to today — dates after this are disabled. */
  max?: string;
  /** ISO "YYYY-MM-DD". Defaults to 100 years before `max`. */
  min?: string;
  placeholder?: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function toIso(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}
function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}
function firstWeekday(y: number, m: number) {
  return new Date(y, m, 1).getDay();
}
function todayIso() {
  const d = new Date();
  return toIso(d.getFullYear(), d.getMonth(), d.getDate());
}
function formatDisplay(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTH_NAMES[m - 1].slice(0, 3)} ${y}`;
}

// Replaces the native <input type="date"> for cases where its browser-
// controlled year list (always ascending, opens wherever the browser
// decides) is the wrong UX — e.g. picking a birth date decades in the
// past. This owns the year order and the valid range outright.
export function DatePicker({ id, value, onChange, hasError, max, min, placeholder = "Select date" }: DatePickerProps) {
  const today = todayIso();
  const effectiveMax = max ?? today;
  const maxYM = effectiveMax.slice(0, 7);
  const effectiveMin = min ?? `${Number(effectiveMax.slice(0, 4)) - 100}${effectiveMax.slice(4)}`;
  const minYM = effectiveMin.slice(0, 7);

  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<"below" | "above">("below");

  const seed = value ?? effectiveMax;
  const [viewYear, setViewYear] = useState(() => Number(seed.slice(0, 4)));
  const [viewMonth, setViewMonth] = useState(() => Number(seed.slice(5, 7)) - 1);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Estimated panel height (header + weekday row + up to 6 day rows + the
  // clear button) — good enough to decide which side has room without
  // waiting a render cycle to measure the real thing.
  const ESTIMATED_PANEL_HEIGHT = 320;

  function handleToggle() {
    if (!open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setPlacement(spaceBelow < ESTIMATED_PANEL_HEIGHT && spaceAbove > spaceBelow ? "above" : "below");
    }
    setOpen((v) => !v);
  }

  const maxYear = Number(maxYM.slice(0, 4));
  const minYear = Number(minYM.slice(0, 4));
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

  const viewYM = `${viewYear}-${pad(viewMonth + 1)}`;
  const prevDisabled = viewYM <= minYM;
  const nextDisabled = viewYM >= maxYM;

  function goMonth(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) {
      m = 11;
      y -= 1;
    }
    if (m > 11) {
      m = 0;
      y += 1;
    }
    const ym = `${y}-${pad(m + 1)}`;
    if (ym < minYM || ym > maxYM) return;
    setViewYear(y);
    setViewMonth(m);
  }

  function handleYearChange(newYear: number) {
    let m = viewMonth;
    if (`${newYear}-${pad(m + 1)}` > maxYM) m = Number(maxYM.slice(5, 7)) - 1;
    if (`${newYear}-${pad(m + 1)}` < minYM) m = Number(minYM.slice(5, 7)) - 1;
    setViewYear(newYear);
    setViewMonth(m);
  }

  function handleMonthChange(newMonth: number) {
    const ym = `${viewYear}-${pad(newMonth + 1)}`;
    if (ym < minYM || ym > maxYM) return;
    setViewMonth(newMonth);
  }

  const totalDays = daysInMonth(viewYear, viewMonth);
  const offset = firstWeekday(viewYear, viewMonth);
  const cells: (number | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function isDisabled(day: number) {
    const iso = toIso(viewYear, viewMonth, day);
    return iso > effectiveMax || iso < effectiveMin;
  }

  function selectDay(day: number) {
    if (isDisabled(day)) return;
    onChange(toIso(viewYear, viewMonth, day));
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        id={id}
        onClick={handleToggle}
        className={`flex w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 ${
          hasError ? "border-red-300" : "border-slate-200"
        } ${value ? "text-slate-900" : "text-slate-400"}`}
      >
        <span>{value ? formatDisplay(value) : placeholder}</span>
        <CalendarIcon className="h-4 w-4 shrink-0 text-slate-400" />
      </button>

      {open && (
        <div
          className={`absolute z-20 w-72 rounded-lg border border-slate-200 bg-white p-2.5 shadow-lg ${
            placement === "above" ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => goMonth(-1)}
              disabled={prevDisabled}
              className="text-slate-400 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Previous month"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            {/* Constrained wrappers, not same-element width overrides —
                SelectInput's internal w-full needs a sized parent to
                actually shrink; see FacultyFiltersBar's comment for why. */}
            <div className="flex items-center gap-2">
              <div className="w-28">
                <SelectInput
                  aria-label="Month"
                  className="py-1 text-sm font-semibold"
                  value={viewMonth}
                  onChange={(e) => handleMonthChange(Number(e.target.value))}
                >
                  {MONTH_NAMES.map((name, m) => {
                    const ym = `${viewYear}-${pad(m + 1)}`;
                    return (
                      <option key={name} value={m} disabled={ym < minYM || ym > maxYM}>
                        {name}
                      </option>
                    );
                  })}
                </SelectInput>
              </div>
              <div className="w-20">
                <SelectInput
                  aria-label="Year"
                  className="py-1 text-sm"
                  value={viewYear}
                  onChange={(e) => handleYearChange(Number(e.target.value))}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </SelectInput>
              </div>
            </div>
            <button
              type="button"
              onClick={() => goMonth(1)}
              disabled={nextDisabled}
              className="text-slate-400 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Next month"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400">
            {WEEKDAY_LABELS.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-0.5">
            {cells.map((day, i) => {
              if (day === null) return <span key={i} />;
              const iso = toIso(viewYear, viewMonth, day);
              const disabled = isDisabled(day);
              const isSelected = iso === value;
              const isToday = iso === today;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => selectDay(day)}
                  className={`rounded-md py-1 text-sm ${
                    isSelected
                      ? "bg-blue-700 text-white"
                      : disabled
                        ? "cursor-not-allowed text-slate-300"
                        : isToday
                          ? "border border-blue-300 text-blue-700 hover:bg-blue-50"
                          : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {value && (
            <button
              type="button"
              onClick={() => {
                onChange(undefined);
                setOpen(false);
              }}
              className="mt-2 flex w-full items-center justify-center gap-1 rounded-md border border-slate-200 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <XIcon className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}
