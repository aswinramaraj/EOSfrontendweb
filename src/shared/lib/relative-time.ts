// WhatsApp/Gmail-style humanized timestamp — "Just now" -> "12m ago" ->
// "Today, 14:30" -> "Yesterday, 14:30" -> weekday -> full date, instead of a
// raw ISO string. No existing helper for this in the codebase.
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatRelativeTime(input: Date | string | number): string {
  const date = input instanceof Date ? input : new Date(input);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < MINUTE) return "Just now";
  if (diffMs < HOUR) return `${Math.floor(diffMs / MINUTE)}m ago`;

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDiff = Math.round((startOfToday.getTime() - startOfDate.getTime()) / DAY);
  const time = date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  if (dayDiff === 0) return diffMs < DAY ? `${Math.floor(diffMs / HOUR)}h ago` : `Today, ${time}`;
  if (dayDiff === 1) return `Yesterday, ${time}`;
  if (dayDiff < 7) return `${date.toLocaleDateString("en-IN", { weekday: "long" })}, ${time}`;
  return `${date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}, ${time}`;
}
