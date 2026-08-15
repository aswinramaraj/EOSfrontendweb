import type { CSSProperties } from "react";

/** Exact button style transcribed from Placement Module v2.dc.html's `btn()` helper. */
export function pageButtonStyle(primary: boolean): CSSProperties {
  return {
    height: 34,
    borderRadius: 8,
    padding: "0 14px",
    fontSize: 12.5,
    fontWeight: 600,
    border: `1px solid ${primary ? "#1f4fd8" : "#dfe4ec"}`,
    background: primary ? "#1f4fd8" : "#fff",
    color: primary ? "#fff" : "#2c3542",
  };
}
