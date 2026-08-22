"use client";

import { useParams, useRouter } from "next/navigation";
import { useInterviews } from "@/modules/placement/hooks/useInterviews";
import { placementBadgeStyle } from "@/modules/placement/components/table/PlacementTable";
import type { ApplicationStatus, InterviewRow, InterviewStatus } from "@/modules/placement/types";

function statusLabel(status: InterviewStatus): string {
  if (status === "scheduled") return "Scheduled";
  if (status === "in_progress") return "In progress";
  return "Completed";
}

function resultLabel(status: ApplicationStatus | null): string {
  if (status === "placed") return "Selected";
  if (status === "rejected") return "Rejected";
  if (status === "r1_cleared" || status === "r2_cleared" || status === "r3_cleared") return "In process";
  return "Pending";
}

function DetailRow({ label, value, badge }: { label: string; value: string; badge?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 0", borderTop: "1px solid #f1f4f8" }}>
      <span style={{ fontSize: 12.5, color: "#8b95a6", minWidth: 132 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 550, flex: 1 }}>{value}</span>
      {badge && <span style={placementBadgeStyle(badge)}>{badge}</span>}
    </div>
  );
}

function InterviewDetailContent({ id }: { id: number }) {
  const router = useRouter();
  const { data, isLoading, error } = useInterviews();
  const interview: InterviewRow | undefined = data?.find((i) => i.id === id);

  if (isLoading) return <p style={{ fontSize: 13, color: "#77808f" }}>Loading…</p>;
  if (error || !interview) return <p style={{ fontSize: 13, color: "#77808f" }}>Failed to load this interview.</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <button
        type="button"
        onClick={() => router.push("/placement/interviews")}
        style={{
          alignSelf: "flex-start",
          height: 34,
          border: "1px solid #dfe4ec",
          background: "#fff",
          borderRadius: 8,
          padding: "0 14px",
          fontSize: 12.5,
          fontWeight: 600,
          color: "#1f4fd8",
          cursor: "pointer",
        }}
      >
        ← Back to Interviews
      </button>

      <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: "22px 24px" }}>
        <div style={{ fontFamily: "var(--font-ibm-plex-mono)", fontSize: 11, color: "#8b95a6", letterSpacing: ".8px" }}>
          INTERVIEW
        </div>
        <div style={{ fontSize: 27, fontWeight: 680, letterSpacing: "-.8px", marginTop: 7 }}>{interview.studentName}</div>
        <div style={{ fontSize: 13.5, color: "#77808f", marginTop: 4 }}>
          {interview.companyName} · {interview.roundLabel}
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: "18px 20px" }}>
        <div style={{ fontSize: 14, fontWeight: 650, letterSpacing: "-.2px" }}>Details</div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 8 }}>
          <DetailRow label="Register number" value={interview.registerNo ?? interview.studentIdNo} />
          <DetailRow label="Department" value={interview.departmentCode ?? "—"} />
          <DetailRow label="Role" value={interview.jobRole ?? "—"} />
          <DetailRow label="Slot" value={interview.slotLabel} />
          <DetailRow label="Panel" value={interview.panelMember} />
          <DetailRow label="Status" value="" badge={statusLabel(interview.status)} />
          <DetailRow label="Result" value={resultLabel(interview.applicationStatus)} />
        </div>
      </div>
    </div>
  );
}

export default function InterviewDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  return <InterviewDetailContent id={id} />;
}
