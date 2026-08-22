import type { CSSProperties } from "react";

export const fieldLabelStyle: CSSProperties = {
  display: "block",
  fontSize: 12.5,
  fontWeight: 600,
  color: "#3f4b60",
  marginBottom: 5,
};

export const fieldHintStyle: CSSProperties = {
  fontSize: 11,
  color: "#8b95a6",
  marginTop: 4,
};

export const fieldErrorStyle: CSSProperties = {
  fontSize: 11.5,
  color: "#b91c1c",
  marginTop: 4,
};

export function fieldInputStyle(hasError?: boolean): CSSProperties {
  return {
    width: "100%",
    height: 38,
    border: `1px solid ${hasError ? "#fca5a5" : "#dfe4ec"}`,
    borderRadius: 8,
    background: "#fff",
    padding: "0 12px",
    fontSize: 13,
    color: "#14181f",
    outline: "none",
  };
}

export const fieldSelectStyle: CSSProperties = {
  ...fieldInputStyle(),
  padding: "0 10px",
};

export const fieldRowStyle: CSSProperties = {
  marginBottom: 14,
};

export const dialogFooterStyle: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 9,
  marginTop: 18,
  paddingTop: 14,
  borderTop: "1px solid #eef1f6",
};
