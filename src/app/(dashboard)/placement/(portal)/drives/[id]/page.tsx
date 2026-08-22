"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDrive } from "@/modules/placement/hooks/useDrives";
import { useApplications } from "@/modules/placement/hooks/useApplications";
import { useUpdateDriveStatus } from "@/modules/placement/hooks/useDriveMutations";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { placementBadgeStyle } from "@/modules/placement/components/table/PlacementTable";
import { pageButtonStyle } from "@/modules/placement/lib/pageButtonStyle";
import type { ApplicationStatus, DriveApplication, DriveDetail, DriveDisplayStatus } from "@/modules/placement/types";

function statusLabel(status: DriveDisplayStatus): string {
  if (status === "upcoming") return "Upcoming";
  if (status === "ongoing") return "Ongoing";
  if (status === "completed") return "Completed";
  return "Cancelled";
}

function modeLabel(mode: DriveDetail["mode"]): string {
  if (mode === "on_campus") return "On campus";
  if (mode === "virtual") return "Virtual";
  return "—";
}

function lpa(value: number | undefined): string {
  return value == null ? "—" : `₹${value.toFixed(1)} LPA`;
}

function dateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  applied: "Applied",
  r1_cleared: "Shortlisted",
  r2_cleared: "In process",
  r3_cleared: "In process",
  placed: "Selected",
  rejected: "Rejected",
};

function roundLabel(app: DriveApplication, drive: DriveDetail): string | null {
  if (app.status === "placed" || app.status === "rejected") return null;
  if (app.lastClearedRound == null) return null;
  const next = Math.min(app.lastClearedRound + 1, 3);
  const label = [drive.round1Label, drive.round2Label, drive.round3Label][next - 1];
  return label ?? `Round ${next}`;
}

function rowLabel(label: string, value: string, badge?: string): { label: string; value: string; badge?: string } {
  return { label, value, badge };
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

function StudentRow({
  name,
  meta,
  badge,
  onClick,
}: {
  name: string;
  meta: string;
  badge: string;
  onClick?: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        gap: 14,
        alignItems: "center",
        padding: "12px 0",
        borderTop: "1px solid #f1f4f8",
        cursor: onClick ? "pointer" : undefined,
        background: hover ? "#f8fafc" : undefined,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 650 }}>{name}</div>
        <div style={{ fontSize: 12, color: "#8b95a6", marginTop: 2 }}>{meta}</div>
      </div>
      <span style={placementBadgeStyle(badge)}>{badge}</span>
    </div>
  );
}

function SectionCard({ title, rows }: { title: string; rows: { label: string; value: string; badge?: string }[] }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: "18px 20px" }}>
      <div style={{ fontSize: 14, fontWeight: 650, letterSpacing: "-.2px" }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", marginTop: 8 }}>
        {rows.map((r) => (
          <DetailRow key={r.label} {...r} />
        ))}
      </div>
    </div>
  );
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function DriveDetailContent({ id }: { id: number }) {
  const router = useRouter();
  const { show } = useToast();
  const [tab, setTab] = useState<"overview" | "students">("overview");
  const { data: drive, isLoading, error } = useDrive(id);
  const { data: applications } = useApplications(id);
  const updateStatus = useUpdateDriveStatus();

  const rows = useMemo(() => applications ?? [], [applications]);

  function handleExport() {
    if (!drive) return;
    const header = ["Register number", "Student", "Department", "Status"];
    const body = rows.map((a) => [
      a.rollNo ?? a.studentIdNo,
      a.studentName ?? a.studentIdNo,
      a.departmentName ?? "—",
      APPLICATION_STATUS_LABEL[a.status],
    ]);
    downloadCsv(`${drive.companyName.replace(/\s+/g, "-").toLowerCase()}-candidates.csv`, [header, ...body]);
  }

  function handleCloseDrive() {
    if (!drive) return;
    updateStatus.mutate(
      { id: drive.id, status: drive.displayStatus === "completed" ? "scheduled" : "completed" },
      {
        onSuccess: () => show(drive.displayStatus === "completed" ? "Drive reopened." : "Drive closed.", "success"),
        onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"),
      },
    );
  }

  if (isLoading) return <p style={{ fontSize: 13, color: "#77808f" }}>Loading…</p>;
  if (error || !drive) return <p style={{ fontSize: 13, color: "#77808f" }}>Failed to load this drive.</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <button
        type="button"
        onClick={() => router.push("/placement/drives")}
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
        ← Back to Placement Drives
      </button>

      <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: "22px 24px" }}>
        <div style={{ fontFamily: "var(--font-ibm-plex-mono)", fontSize: 11, color: "#8b95a6", letterSpacing: ".8px" }}>
          DRIVE · {dateLabel(drive.scheduledDate)}
        </div>
        <div style={{ fontSize: 27, fontWeight: 680, letterSpacing: "-.8px", marginTop: 7 }}>{drive.companyName}</div>
        <div style={{ fontSize: 13.5, color: "#77808f", marginTop: 4 }}>
          {(drive.role ?? "—") + " · " + lpa(drive.packageLpa) + " · " + modeLabel(drive.mode)}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginTop: 18 }}>
          {[
            ["Applied", drive.appliedCount],
            ["Shortlisted", drive.shortlistedCount],
            ["Selected", drive.selectedCount],
          ].map(([label, value]) => (
            <div key={label} style={{ background: "#f6f8fb", borderRadius: 10, padding: "13px 15px" }}>
              <div style={{ fontSize: 11.5, color: "#8b95a6" }}>{label}</div>
              <div style={{ fontSize: 20, fontWeight: 670, letterSpacing: "-.5px", marginTop: 4 }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 9, marginTop: 18 }}>
          <button type="button" onClick={handleExport} style={pageButtonStyle(false)}>
            Export list
          </button>
          <button type="button" onClick={handleCloseDrive} disabled={updateStatus.isPending} style={pageButtonStyle(true)}>
            {drive.displayStatus === "completed" ? "Reopen drive" : "Close drive"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
        {(["overview", "students"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              height: 36,
              borderRadius: 9,
              padding: "0 15px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              border: `1px solid ${tab === t ? "#1f4fd8" : "#dfe4ec"}`,
              background: tab === t ? "#e8f0fe" : "#fff",
              color: tab === t ? "#1f4fd8" : "#46536a",
            }}
          >
            {t === "overview" ? "Overview" : "Student list"}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: 14, alignItems: "start" }}>
          <SectionCard
            title="Company and role"
            rows={[
              rowLabel("Company", drive.companyName),
              rowLabel("Role", drive.role ?? "—"),
              rowLabel("CTC", lpa(drive.packageLpa)),
              rowLabel("Mode", modeLabel(drive.mode)),
              rowLabel("Drive date", dateLabel(drive.scheduledDate)),
            ]}
          />
          <SectionCard
            title="Criteria"
            rows={[
              rowLabel("Minimum CGPA", drive.eligibilityCgpa != null ? drive.eligibilityCgpa.toFixed(1) : "—"),
              rowLabel("Backlogs allowed", drive.backlogsAllowed ?? "—"),
              rowLabel(
                "Departments",
                drive.eligibleDepartmentCodes ? drive.eligibleDepartmentCodes.split(",").join(", ") : "—",
              ),
              rowLabel("Status", "", statusLabel(drive.displayStatus)),
            ]}
          />
          <SectionCard
            title="Selection process"
            rows={[
              rowLabel("Round 1", drive.round1Label ?? "—"),
              rowLabel("Round 2", drive.round2Label ?? "—"),
              rowLabel("Round 3", drive.round3Label ?? "—"),
              rowLabel("Result declaration", drive.resultDeclarationNote ?? "—"),
            ]}
          />
          <SectionCard
            title="Round progress"
            rows={[
              rowLabel("Registrations", String(drive.appliedCount)),
              rowLabel("Shortlisted", String(drive.shortlistedCount)),
              rowLabel("Interviewed", String(drive.interviewedCount)),
              rowLabel("Selected", String(drive.selectedCount)),
            ]}
          />
        </div>
      )}

      {tab === "students" && (
        <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ fontSize: 14, fontWeight: 650, letterSpacing: "-.2px" }}>
            {rows.length && drive.appliedCount > rows.length
              ? `Students on record · showing ${rows.length} of ${drive.appliedCount} registrations`
              : "Students on record"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 8 }}>
            {rows.length === 0 && (
              <div style={{ padding: "18px 0 6px 0", fontSize: 12.5, color: "#96a0b0" }}>
                No students registered for this drive yet.
              </div>
            )}
            {rows.map((a) => {
              const round = roundLabel(a, drive);
              const deptCode = a.classLabel ? a.classLabel.split(" - ")[0] : a.departmentName ?? "—";
              const meta = [a.rollNo ?? a.studentIdNo, deptCode, round].filter(Boolean).join(" · ");
              return (
                <StudentRow
                  key={a.id}
                  name={a.studentName ?? a.studentIdNo}
                  meta={meta}
                  badge={APPLICATION_STATUS_LABEL[a.status]}
                  onClick={() => router.push(`/placement/students/${a.studentId}?driveId=${id}`)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DriveDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  return <DriveDetailContent id={id} />;
}
