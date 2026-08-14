// Shared hover treatment for genuinely interactive HR surfaces (cards, nav
// items, list rows that open something) — flat by default, an outline + lift
// on hover, clean revert on mouse-leave. Deliberately NOT applied to table
// rows (DataTable's own subtle hover:bg-slate-50 already covers those) or
// buttons (they carry their own hover states) or static text/dividers.
// Color is the reference design's exact hover-accent hex (#2655DA), not a
// generic Tailwind blue shade.
export const HOVER_ACCENT = "#2655DA";

export const HOVERABLE =
  "transition-all duration-150 ease-out hover:border-[#2655DA] hover:shadow-[0_0_0_3px_rgba(38,85,218,0.16)] hover:-translate-y-0.5";

// Same idea for elements that aren't already `border`-based cards (e.g. the
// sidebar's nav items, which use bg-color for their default/active states) —
// an inset outline instead of a border-color swap, so it doesn't fight the
// element's own border.
export const HOVERABLE_RING =
  "transition-all duration-150 ease-out hover:shadow-[inset_0_0_0_2px_#2655DA]";
