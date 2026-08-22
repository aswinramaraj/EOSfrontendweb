"use client";

import type { ReactNode } from "react";
import { fieldInputStyle } from "@/modules/academic-structure/lib/formStyles";
import type { FeedbackQuestionInput, FeedbackQuestionType } from "../types";

interface FeedbackQuestionListEditorProps {
  questions: FeedbackQuestionInput[];
  onChange: (questions: FeedbackQuestionInput[]) => void;
  /** Rendered next to "+ Add question" — used by the create dialog for its "Load standard questions" shortcut. */
  headerExtra?: ReactNode;
}

/** Shared by the create dialog and the edit-draft dialog so the two never drift apart. */
export function FeedbackQuestionListEditor({ questions, onChange, headerExtra }: FeedbackQuestionListEditorProps) {
  function updateQuestion(index: number, patch: Partial<FeedbackQuestionInput>) {
    onChange(questions.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  }

  function removeQuestion(index: number) {
    onChange(questions.filter((_, i) => i !== index));
  }

  return (
    <div style={{ marginTop: 14, borderTop: "1px solid #eef1f6", paddingTop: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".4px", color: "#9aa5b8", margin: 0 }}>QUESTIONS</p>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {headerExtra}
          <button
            type="button"
            onClick={() => onChange([...questions, { question_text: "", question_type: "rating" }])}
            style={{ fontSize: 12, fontWeight: 600, color: "#1f4fd8", background: "none", border: "none", cursor: "pointer" }}
          >
            + Add question
          </button>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {questions.map((q, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 11.5, color: "#9aa5b8", width: 18, flexShrink: 0 }}>{i + 1}.</span>
            <input
              value={q.question_text}
              onChange={(e) => updateQuestion(i, { question_text: e.target.value })}
              maxLength={1000}
              placeholder="Question text"
              style={{ ...fieldInputStyle(), flex: 1 }}
            />
            <select
              value={q.question_type}
              onChange={(e) => updateQuestion(i, { question_type: e.target.value as FeedbackQuestionType })}
              style={{ ...fieldInputStyle(), width: 100, flexShrink: 0 }}
            >
              <option value="rating">Rating</option>
              <option value="text">Text</option>
            </select>
            <button
              type="button"
              onClick={() => removeQuestion(i)}
              disabled={questions.length === 1}
              title={questions.length === 1 ? "At least one question is required" : "Remove question"}
              style={{
                width: 28,
                height: 28,
                flexShrink: 0,
                border: "1px solid #fecaca",
                borderRadius: 6,
                background: "#fff",
                color: questions.length === 1 ? "#f3b4b4" : "#b91c1c",
                cursor: questions.length === 1 ? "not-allowed" : "pointer",
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
