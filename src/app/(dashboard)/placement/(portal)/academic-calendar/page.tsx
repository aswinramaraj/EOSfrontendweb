"use client";

import { useMemo, useState } from "react";
import { useBatches } from "@/modules/placement/hooks/useBatches";
import { useAcademicCalendarPeriods, useCalendarEvents } from "@/modules/placement/hooks/useAcademicCalendar";
import { placementSelectStyle } from "@/modules/placement/components/table/PlacementTable";
import type { AcademicCalendarPeriod, CalendarEventItem, CalendarEventType } from "@/modules/placement/types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DOW = ["S", "M", "T", "W", "T", "F", "S"];
const DOW_FULL = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const EVENT_TONE: Record<CalendarEventType, { bg: string; fg: string }> = {
  holiday: { bg: "#eef1f6", fg: "#16224a" },
  event: { bg: "#e6f6ec", fg: "#1a7a44" },
  instruction: { bg: "#eff2f7", fg: "#46536a" },
  assessment: { bg: "#fdf1e0", fg: "#93650e" },
  placement: { bg: "#e8f0fe", fg: "#1f4fd8" },
  institution: { bg: "#f1e9fb", fg: "#5b2e9c" },
};

function eventChipStyle(type: CalendarEventType) {
  const tone = EVENT_TONE[type] ?? EVENT_TONE.event;
  return {
    fontFamily: "var(--font-ibm-plex-mono)",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: ".7px",
    padding: "3px 8px",
    borderRadius: 6,
    background: tone.bg,
    color: tone.fg,
    textTransform: "uppercase" as const,
    flexShrink: 0,
  };
}

// event_date arrives as an ISO date string at UTC midnight — parsing its
// Y/M/D via the UTC getters (not the local getters) avoids the date
// shifting a day back for any viewer west of UTC.
function dateParts(iso: string) {
  const d = new Date(iso);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth(), day: d.getUTCDate() };
}

interface CalCell {
  day: number | null;
  inMonth: boolean;
  isToday: boolean;
  events: CalendarEventItem[];
}

function buildMonthCells(year: number, month: number, events: CalendarEventItem[]): CalCell[] {
  const firstDow = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const todayIso = new Date().toISOString().slice(0, 10);

  const byDay = new Map<number, CalendarEventItem[]>();
  for (const e of events) {
    const p = dateParts(e.eventDate);
    if (p.year === year && p.month === month) {
      if (!byDay.has(p.day)) byDay.set(p.day, []);
      byDay.get(p.day)!.push(e);
    }
  }

  const cells: CalCell[] = [];
  for (let i = 0; i < firstDow; i++) cells.push({ day: null, inMonth: false, isToday: false, events: [] });
  for (let day = 1; day <= daysInMonth; day++) {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ day, inMonth: true, isToday: iso === todayIso, events: byDay.get(day) ?? [] });
  }
  while (cells.length % 7 !== 0) cells.push({ day: null, inMonth: false, isToday: false, events: [] });
  return cells;
}

/**
 * Keyed by `period.id` on the caller side — that's what re-initializes
 * `cursor` to the newly-selected period's start month instead of leaving
 * the view stuck on whatever month the previous period was showing.
 */
function CalendarPeriodView({ period, batchName }: { period: AcademicCalendarPeriod; batchName: string }) {
  const events = useCalendarEvents(period.id);
  const allEvents = useMemo(() => events.data ?? [], [events.data]);

  const initial = dateParts(period.startDate);
  const [cursor, setCursor] = useState({ year: initial.year, month: initial.month });

  const cells = useMemo(() => buildMonthCells(cursor.year, cursor.month, allEvents), [cursor, allEvents]);
  const monthEvents = useMemo(
    () =>
      allEvents
        .filter((e) => {
          const p = dateParts(e.eventDate);
          return p.year === cursor.year && p.month === cursor.month;
        })
        .sort((a, b) => a.eventDate.localeCompare(b.eventDate)),
    [allEvents, cursor],
  );

  function goPrev() {
    setCursor((c) => (c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }));
  }
  function goNext() {
    setCursor((c) => (c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 }));
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 14, alignItems: "start" }}>
      <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            onClick={goPrev}
            style={{ width: 38, height: 38, border: "1px solid #e6eaf1", background: "#f7f9fc", borderRadius: 9, fontSize: 15, color: "#46536a", cursor: "pointer" }}
          >
            ‹
          </button>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 19, fontWeight: 680, letterSpacing: "-.4px" }}>
              {MONTHS[cursor.month]} {cursor.year}
            </div>
            <div style={{ fontSize: 12.5, color: "#8b95a6", marginTop: 2 }}>
              {batchName} · Semester {period.semester} · {monthEvents.length} event{monthEvents.length === 1 ? "" : "s"}
            </div>
          </div>
          <button
            type="button"
            onClick={goNext}
            style={{ width: 38, height: 38, border: "1px solid #e6eaf1", background: "#f7f9fc", borderRadius: 9, fontSize: 15, color: "#46536a", cursor: "pointer" }}
          >
            ›
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8, marginTop: 18 }}>
          {DOW.map((d, i) => (
            <div key={i} style={{ textAlign: "center", fontSize: 12, fontWeight: 650, color: "#9aa5b8" }}>
              {d}
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8, marginTop: 8 }}>
          {cells.map((c, i) => (
            <div
              key={i}
              title={c.events.map((e) => e.title).join(", ")}
              style={{
                minHeight: 46,
                borderRadius: 8,
                padding: "6px 4px",
                fontSize: 12.5,
                color: c.inMonth ? "#2c3542" : "#c7cedb",
                background: c.isToday ? "#e8f0fe" : c.events.length > 0 ? "#f7f9fc" : undefined,
                border: c.isToday ? "1px solid #1f4fd8" : "1px solid transparent",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
              }}
            >
              <span style={{ fontWeight: c.isToday ? 700 : 500 }}>{c.day ?? ""}</span>
              {c.events.length > 0 && (
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: EVENT_TONE[c.events[0].eventType]?.fg ?? "#1f4fd8" }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 17, fontWeight: 680, letterSpacing: "-.3px" }}>Events in {MONTHS[cursor.month]}</div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 8 }}>
          {events.isLoading && <div style={{ fontSize: 13, color: "#8b95a6", padding: "13px 2px" }}>Loading…</div>}
          {!events.isLoading && monthEvents.length === 0 && (
            <div style={{ fontSize: 13, color: "#8b95a6", padding: "13px 2px" }}>No events published this month.</div>
          )}
          {monthEvents.map((e) => {
            const p = dateParts(e.eventDate);
            const dow = DOW_FULL[new Date(Date.UTC(p.year, p.month, p.day)).getUTCDay()];
            return (
              <div key={e.id} style={{ display: "flex", gap: 14, alignItems: "center", padding: "13px 2px", borderTop: "1px solid #f1f4f8" }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    background: "#f4f7fc",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1.1,
                    flex: "0 0 auto",
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 670 }}>{p.day}</span>
                  <span style={{ fontSize: 9.5, color: "#8b95a6", letterSpacing: ".6px" }}>{dow}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 650, letterSpacing: "-.2px" }}>{e.title}</div>
                  <div style={{ fontSize: 12.5, color: "#8b95a6", marginTop: 3 }}>
                    {e.startTime ? `${e.startTime}–${e.endTime ?? ""}` : "All day"}
                    {e.description ? ` · ${e.description}` : ""}
                  </div>
                </div>
                <span style={eventChipStyle(e.eventType)}>{e.eventType}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function PlacementAcademicCalendarPage() {
  const batches = useBatches();
  const periods = useAcademicCalendarPeriods();

  const [batchId, setBatchId] = useState<number | "all">("all");
  const [semester, setSemester] = useState<number | "all">("all");

  const batchNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const b of batches.data ?? []) map.set(b.id, b.name);
    return map;
  }, [batches.data]);

  const filteredPeriods = useMemo(
    () =>
      (periods.data ?? []).filter(
        (p) => (batchId === "all" || p.batchId === batchId) && (semester === "all" || p.semester === semester),
      ),
    [periods.data, batchId, semester],
  );

  const semesterOptions = useMemo(() => {
    const set = new Set((periods.data ?? []).filter((p) => batchId === "all" || p.batchId === batchId).map((p) => p.semester));
    return Array.from(set).sort((a, b) => a - b);
  }, [periods.data, batchId]);

  // Defaults to the most recently-ended period in the filtered set — the
  // current/latest real term — rather than whichever row the backend
  // happens to return first.
  const selectedPeriod = useMemo(
    () =>
      filteredPeriods.length === 0
        ? null
        : filteredPeriods.reduce((latest, p) => (p.endDate > latest.endDate ? p : latest), filteredPeriods[0]),
    [filteredPeriods],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <h1 style={{ margin: 0, fontSize: 26, letterSpacing: "-.7px", fontWeight: 680 }}>Academic Calendar</h1>
          <p style={{ margin: "5px 0 0 0", fontSize: 13, color: "#77808f" }}>
            Published institution events — read-only here; Academic Coordinator and Principal add or edit events.
          </p>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <select
            value={batchId === "all" ? "all" : String(batchId)}
            onChange={(e) => {
              setBatchId(e.target.value === "all" ? "all" : Number(e.target.value));
              setSemester("all");
            }}
            style={placementSelectStyle}
          >
            <option value="all">All batches</option>
            {(batches.data ?? []).map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <select
            value={semester === "all" ? "all" : String(semester)}
            onChange={(e) => setSemester(e.target.value === "all" ? "all" : Number(e.target.value))}
            style={placementSelectStyle}
          >
            <option value="all">All semesters</option>
            {semesterOptions.map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {periods.isLoading ? (
        <div style={{ fontSize: 13, color: "#8b95a6" }}>Loading calendar…</div>
      ) : !selectedPeriod ? (
        <div style={{ fontSize: 13, color: "#8b95a6" }}>No academic calendar published for this batch/semester yet.</div>
      ) : (
        <CalendarPeriodView
          key={selectedPeriod.id}
          period={selectedPeriod}
          batchName={batchNameById.get(selectedPeriod.batchId) ?? `Batch #${selectedPeriod.batchId}`}
        />
      )}
    </div>
  );
}
