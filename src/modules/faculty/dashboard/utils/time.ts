/** Extracts "HH:MM" from a raw ISO timestamp, mirroring the backend's own
 * formatHHMM helper (which slices the same [11,16] range) for the endpoints
 * that return full ISO datetimes instead of pre-formatted time strings. */
export function formatHHMM(isoString: string): string {
  return isoString.slice(11, 16);
}

export function toMinutesSinceMidnight(hhmm: string): number {
  const [hours, minutes] = hhmm.split(":").map(Number);
  return hours * 60 + minutes;
}

export function isWithinPeriod(startHHMM: string, endHHMM: string, now: Date): boolean {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return nowMinutes >= toMinutesSinceMidnight(startHHMM) && nowMinutes < toMinutesSinceMidnight(endHHMM);
}

const DAY_LABELS: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export function dayLabel(dayOfWeek: number): string {
  return DAY_LABELS[dayOfWeek] ?? "";
}

/** 0=Sun..6=Sat (JS convention), which coincides with the backend's 1=Mon..6=Sat
 * day_of_week values for every day that convention actually stores (Sunday has
 * no timetable rows either way). */
export function todayDayOfWeek(): number {
  return new Date().getDay();
}

/** "Tuesday, 4 August 2026" */
export function formatTodayLabel(): string {
  const now = new Date();
  const weekday = now.toLocaleDateString("en-US", { weekday: "long" });
  const day = now.getDate();
  const month = now.toLocaleDateString("en-US", { month: "long" });
  const year = now.getFullYear();
  return `${weekday}, ${day} ${month} ${year}`;
}
