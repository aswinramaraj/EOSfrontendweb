"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { pageButtonStyle } from "@/modules/placement/lib/pageButtonStyle";
import { ApiError } from "@/shared/lib/api-client";
import { fieldInputStyle } from "@/modules/academic-structure/lib/formStyles";
import { useFeedbackForm, useFeedbackResults } from "@/modules/academic-coordinator/hooks/useFeedbackQueries";
import {
  useAddFeedbackQuestion,
  useDeleteFeedbackForm,
  useDeleteFeedbackQuestion,
} from "@/modules/academic-coordinator/hooks/useFeedbackMutations";
import type { FeedbackMatrixResults, FeedbackQuestionResult, FeedbackQuestionType } from "@/modules/academic-coordinator/types";

function Card({ children }: { children: React.ReactNode }) {
  return <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: 20 }}>{children}</div>;
}

function RatingBar({ result }: { result: FeedbackQuestionResult }) {
  const dist = result.rating_distribution ?? {};
  const max = Math.max(1, ...Object.values(dist));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
      {[5, 4, 3, 2, 1].map((v) => {
        const count = dist[v] ?? 0;
        return (
          <div key={v} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, width: 12, color: "#8b95a6" }}>{v}</span>
            <div style={{ flex: 1, height: 8, borderRadius: 4, background: "#eceff5", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(count / max) * 100}%`, background: "#1f4fd8", borderRadius: 4 }} />
            </div>
            <span style={{ fontSize: 11, width: 20, color: "#8b95a6", textAlign: "right" }}>{count}</span>
          </div>
        );
      })}
    </div>
  );
}

function QuestionResultBlock({ q }: { q: FeedbackQuestionResult }) {
  return (
    <div style={{ padding: "14px 0", borderTop: "1px solid #f1f4f8" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{q.question_text}</div>
        <span style={{ fontSize: 11.5, color: "#8b95a6", flexShrink: 0 }}>{q.response_count} responses</span>
      </div>
      {q.question_type === "rating" ? (
        <>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>
            {q.average_rating != null ? q.average_rating.toFixed(2) : "—"}
            <span style={{ fontSize: 12, fontWeight: 500, color: "#8b95a6" }}> / 5 avg</span>
          </div>
          <RatingBar result={q} />
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8, maxHeight: 160, overflowY: "auto" }}>
          {(q.responses ?? []).filter(Boolean).length === 0 ? (
            <p style={{ fontSize: 12, color: "#8b95a6" }}>No text responses yet.</p>
          ) : (
            (q.responses ?? []).filter(Boolean).map((r, i) => (
              <div key={i} style={{ fontSize: 12.5, background: "#f7f9fc", borderRadius: 8, padding: "8px 10px", color: "#3a4351" }}>
                {r}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function FeedbackFormDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { show } = useToast();
  const formId = Number(params.id);

  const form = useFeedbackForm(formId);
  const results = useFeedbackResults(formId);
  const addQuestion = useAddFeedbackQuestion();
  const deleteQuestion = useDeleteFeedbackQuestion();
  const deleteForm = useDeleteFeedbackForm();

  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionType, setNewQuestionType] = useState<FeedbackQuestionType>("rating");
  const [deletingQuestionId, setDeletingQuestionId] = useState<number | null>(null);
  const [confirmingDeleteForm, setConfirmingDeleteForm] = useState(false);

  function handleAddQuestion() {
    const text = newQuestionText.trim();
    if (!text) return;
    addQuestion
      .mutateAsync({ formId, input: { question_text: text, question_type: newQuestionType } })
      .then(() => {
        setNewQuestionText("");
        show("Question added", "success");
      })
      .catch((err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"));
  }

  function handleDeleteQuestion(questionId: number) {
    setDeletingQuestionId(questionId);
    deleteQuestion
      .mutateAsync({ formId, questionId })
      .then(() => show("Question removed", "success"))
      .catch((err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"))
      .finally(() => setDeletingQuestionId(null));
  }

  function handleDeleteForm() {
    deleteForm
      .mutateAsync(formId)
      .then(() => {
        show("Feedback form deleted", "success");
        router.push("/academic-coordinator/feedback");
      })
      .catch((err: unknown) => {
        show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
        setConfirmingDeleteForm(false);
      });
  }

  if (form.isLoading || !form.data) {
    return <div style={{ fontSize: 13, color: "#8b95a6" }}>Loading…</div>;
  }

  const responseRate =
    results.data && results.data.target_student_count > 0
      ? Math.round((results.data.respondent_count / results.data.target_student_count) * 100)
      : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
        <div>
          <button
            type="button"
            onClick={() => router.push("/academic-coordinator/feedback")}
            style={{ fontSize: 12, color: "#1f4fd8", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 6 }}
          >
            ← All feedback forms
          </button>
          <h1 style={{ margin: 0, fontSize: 24, letterSpacing: "-.6px", fontWeight: 680 }}>{form.data.title}</h1>
          <p style={{ margin: "5px 0 0 0", fontSize: 12.5, color: "#77808f" }}>
            {form.data.form_type === "end_semester" ? "End-of-semester faculty rating" : "General feedback"}
            {form.data.classSection ? ` · Section ${form.data.classSection}` : ""}
            {form.data.batchName ? ` · Batch ${form.data.batchName}` : ""}
          </p>
        </div>
        <button type="button" style={{ ...pageButtonStyle(false), borderColor: "#fecaca", color: "#b91c1c" }} onClick={() => setConfirmingDeleteForm(true)}>
          Delete form
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
        <Card>
          <div style={{ fontSize: 12, color: "#8b95a6" }}>Target students</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{results.data?.target_student_count ?? "—"}</div>
        </Card>
        <Card>
          <div style={{ fontSize: 12, color: "#8b95a6" }}>Responses received</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{results.data?.respondent_count ?? "—"}</div>
        </Card>
        <Card>
          <div style={{ fontSize: 12, color: "#8b95a6" }}>Response rate</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{responseRate != null ? `${responseRate}%` : "—"}</div>
        </Card>
      </div>

      <Card>
        <div style={{ fontSize: 15, fontWeight: 650, marginBottom: 4 }}>Questions</div>
        <p style={{ fontSize: 11.5, color: "#8b95a6", margin: 0 }}>
          Questions can only be edited or removed before the form receives any responses.
        </p>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 10 }}>
          {form.data.questions.map((q) => (
            <div key={q.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: "1px solid #f1f4f8" }}>
              <span style={{ fontSize: 12, color: "#9aa5b8", width: 18 }}>{q.sequence_no}.</span>
              <span style={{ flex: 1, fontSize: 13 }}>{q.question_text}</span>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 5,
                  background: q.question_type === "rating" ? "#eaf0fe" : "#f1f3f7",
                  color: q.question_type === "rating" ? "#1f4fd8" : "#5b6577",
                }}
              >
                {q.question_type === "rating" ? "Rating" : "Text"}
              </span>
              <button
                type="button"
                disabled={deletingQuestionId === q.id}
                onClick={() => handleDeleteQuestion(q.id)}
                style={{
                  width: 26,
                  height: 26,
                  border: "1px solid #fecaca",
                  borderRadius: 6,
                  background: "#fff",
                  color: "#b91c1c",
                  cursor: deletingQuestionId === q.id ? "not-allowed" : "pointer",
                  flexShrink: 0,
                }}
                title="Remove question"
              >
                {deletingQuestionId === q.id ? (
                  <span
                    className="animate-spin rounded-full border-2 border-current border-t-transparent"
                    style={{ display: "inline-block", width: 11, height: 11 }}
                  />
                ) : (
                  "×"
                )}
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14, paddingTop: 14, borderTop: "1px solid #eef1f6" }}>
          <input
            value={newQuestionText}
            onChange={(e) => setNewQuestionText(e.target.value)}
            placeholder="Add another question…"
            maxLength={1000}
            style={{ ...fieldInputStyle(), flex: 1 }}
          />
          <select value={newQuestionType} onChange={(e) => setNewQuestionType(e.target.value as FeedbackQuestionType)} style={{ ...fieldInputStyle(), width: 100 }}>
            <option value="rating">Rating</option>
            <option value="text">Text</option>
          </select>
          <button type="button" style={pageButtonStyle(true)} onClick={handleAddQuestion} disabled={addQuestion.isPending}>
            {addQuestion.isPending ? "Adding…" : "Add"}
          </button>
        </div>
      </Card>

      <Card>
        <div style={{ fontSize: 15, fontWeight: 650, marginBottom: 4 }}>Results</div>
        <p style={{ fontSize: 11.5, color: "#8b95a6", margin: 0 }}>All responses are anonymous — no student identity is ever shown.</p>

        {results.isLoading && <p style={{ fontSize: 12.5, color: "#8b95a6", marginTop: 12 }}>Loading results…</p>}

        {results.data && results.data.form_type === "general" && (
          <div>{results.data.questions.map((q) => <QuestionResultBlock key={q.id} q={q} />)}</div>
        )}

        {results.data && results.data.form_type === "end_semester" && (
          <MatrixResults results={results.data} />
        )}
      </Card>

      <ConfirmDialog
        open={confirmingDeleteForm}
        title="Delete feedback form?"
        message="This permanently removes the form and its questions. Forms that already have student responses cannot be deleted."
        confirmLabel="Delete"
        tone="danger"
        isPending={deleteForm.isPending}
        onConfirm={handleDeleteForm}
        onClose={() => setConfirmingDeleteForm(false)}
      />
    </div>
  );
}

function MatrixResults({ results }: { results: FeedbackMatrixResults }) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  if (results.rows.length === 0) {
    return <p style={{ fontSize: 12.5, color: "#8b95a6", marginTop: 12 }}>No faculty roster found for this class yet.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", marginTop: 10 }}>
      {results.rows.map((row) => {
        const ratingQuestions = row.questions.filter((q) => q.question_type === "rating");
        const overallAvg =
          ratingQuestions.length > 0
            ? ratingQuestions.reduce((sum, q) => sum + (q.average_rating ?? 0), 0) / ratingQuestions.filter((q) => q.average_rating != null).length || 0
            : null;
        const expanded = expandedRow === row.mapping_id;
        return (
          <div key={row.mapping_id} style={{ borderTop: "1px solid #f1f4f8" }}>
            <div
              onClick={() => setExpandedRow(expanded ? null : row.mapping_id)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", cursor: "pointer" }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{row.faculty_name}</div>
                <div style={{ fontSize: 11.5, color: "#8b95a6" }}>{row.subject_name}</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{overallAvg != null && overallAvg > 0 ? overallAvg.toFixed(2) : "—"}</div>
              <span style={{ fontSize: 12, color: "#8b95a6" }}>{expanded ? "▲" : "▼"}</span>
            </div>
            {expanded && <div style={{ paddingBottom: 10 }}>{row.questions.map((q) => <QuestionResultBlock key={q.id} q={q} />)}</div>}
          </div>
        );
      })}
    </div>
  );
}
