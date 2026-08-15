"use client";

import { Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useStudentProfile } from "@/modules/placement/hooks/useStudentProfile";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { placementBadgeStyle } from "@/modules/placement/components/table/PlacementTable";
import { pageButtonStyle } from "@/modules/placement/lib/pageButtonStyle";
import type { ApplicationStatus, StudentApplicationRow, StudentOfferRow, StudentProfile } from "@/modules/placement/types";

function statusLabel(status: ApplicationStatus | null): string {
  if (status === "placed") return "Placed";
  if (status === "rejected") return "Not placed";
  if (status === null) return "Not applied";
  return "In process";
}

function applicationStageLabel(status: ApplicationStatus): string {
  if (status === "placed") return "Selected";
  if (status === "rejected") return "Rejected";
  if (status === "r1_cleared") return "Shortlisted";
  if (status === "r2_cleared" || status === "r3_cleared") return "In process";
  return "Applied";
}

function offerResponseLabel(response: StudentOfferRow["offerResponse"]): string {
  if (response === "accepted") return "Accepted";
  if (response === "declined") return "Declined";
  return "Pending";
}

function lpa(value: number | null): string {
  return value == null ? "—" : `₹${value.toFixed(1)} LPA`;
}

function dateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function yearLabel(year: number | null): string {
  if (year == null) return "—";
  const roman = ["I", "II", "III", "IV"][year - 1] ?? String(year);
  return `${roman} Year`;
}

function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "—";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/** Real, from student_profiles — not part of the reference mockup, but genuinely available and directly useful to a placement officer reviewing a candidate. */
function profileLinks(profile: StudentProfile): { label: string; url: string }[] {
  return [
    profile.linkedinUrl && { label: "LinkedIn", url: profile.linkedinUrl },
    profile.githubUrl && { label: "GitHub", url: profile.githubUrl },
    profile.leetcodeUrl && { label: "LeetCode", url: profile.leetcodeUrl },
    profile.hackerrankUrl && { label: "HackerRank", url: profile.hackerrankUrl },
    profile.codeforcesUrl && { label: "Codeforces", url: profile.codeforcesUrl },
  ].filter((l): l is { label: string; url: string } => !!l);
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

function ListRow({ title, meta, right, badge }: { title: string; meta: string; right?: string; badge: string }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "center", padding: "12px 0", borderTop: "1px solid #f1f4f8" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 650 }}>{title}</div>
        <div style={{ fontSize: 12, color: "#8b95a6", marginTop: 2 }}>{meta}</div>
      </div>
      {right && (
        <span style={{ fontFamily: "var(--font-ibm-plex-mono)", fontSize: 13, fontWeight: 500 }}>{right}</span>
      )}
      <span style={placementBadgeStyle(badge)}>{badge}</span>
    </div>
  );
}

interface JourneyStep {
  label: string;
  meta: string;
  done: boolean;
}

function buildJourney(profile: StudentProfile): JourneyStep[] {
  const shortlisted = profile.applications.some(
    (a) => a.status === "r1_cleared" || a.status === "r2_cleared" || a.status === "r3_cleared" || a.status === "placed",
  );
  const interviewed = profile.applications.some(
    (a) => a.status === "r2_cleared" || a.status === "r3_cleared" || a.status === "placed",
  );
  const offerReceived = profile.offersCount > 0;
  const bestOffer = profile.offers[0];
  const placed = profile.status === "placed" && bestOffer?.offerResponse === "accepted";

  return [
    { label: "Applied", meta: `${profile.drivesApplied} drive${profile.drivesApplied === 1 ? "" : "s"}`, done: profile.drivesApplied > 0 },
    { label: "Shortlisted", meta: shortlisted ? "Cleared screening" : "Not yet shortlisted", done: shortlisted },
    { label: "Interviewed", meta: interviewed ? "Rounds cleared" : "Not yet scheduled", done: interviewed },
    {
      label: "Offer received",
      meta: offerReceived ? `${profile.offersCount} offer${profile.offersCount === 1 ? "" : "s"}` : "No offer yet",
      done: offerReceived,
    },
    {
      label: "Placed",
      meta: placed ? "Offer accepted" : bestOffer?.offerResponse === "declined" ? "Offer declined" : "Awaiting response",
      done: placed,
    },
  ];
}

function StudentDetailContent({ id }: { id: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { show } = useToast();
  const driveId = searchParams.get("driveId");
  const { data: profile, isLoading, error } = useStudentProfile(id);

  if (isLoading) return <p style={{ fontSize: 13, color: "#77808f" }}>Loading…</p>;
  if (error || !profile) return <p style={{ fontSize: 13, color: "#77808f" }}>Failed to load this student.</p>;

  const backLabel = driveId ? "← Back to Placement Drives" : "← Back to Students";
  const backHref = driveId ? `/placement/drives/${driveId}` : "/placement/students";
  const journey = buildJourney(profile);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <button
        type="button"
        onClick={() => router.push(backHref)}
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
        {backLabel}
      </button>

      <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 14, padding: "24px 26px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          {profile.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- external Supabase storage URL, not a local asset
            <img
              src={profile.photoUrl}
              alt={profile.name}
              style={{ width: 62, height: 62, borderRadius: "50%", objectFit: "cover", flex: "0 0 auto" }}
            />
          ) : (
            <div
              style={{
                width: 62,
                height: 62,
                borderRadius: "50%",
                background: "#e8f0fe",
                color: "#1f4fd8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 21,
                fontWeight: 680,
                flex: "0 0 auto",
              }}
            >
              {initials(profile.name)}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11, flexWrap: "wrap" }}>
              <span style={{ fontSize: 26, fontWeight: 680, letterSpacing: "-.7px" }}>{profile.name}</span>
              <span style={placementBadgeStyle(statusLabel(profile.status))}>{statusLabel(profile.status)}</span>
              <span style={placementBadgeStyle("Not tracked")}>Not tracked</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 5, fontSize: 13, color: "#77808f" }}>
              <span style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>{profile.registerNo ?? profile.studentIdNo}</span>
              <span style={{ color: "#cbd3e0" }}>·</span>
              <span>{profile.departmentCode ?? "—"}</span>
              <span style={{ color: "#cbd3e0" }}>·</span>
              <span>{yearLabel(profile.year)}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 9 }}>
            <a href={`mailto:${profile.email}`} style={{ ...pageButtonStyle(false), display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
              Email student
            </a>
            {/* Some seeded resume_url rows are placeholder relative paths (e.g. "/files/resumes/22CS002.pdf") that don't resolve to a real file — only treat it as a real download once it's an actual URL. */}
            {profile.resumeUrl?.startsWith("http") ? (
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...pageButtonStyle(true), display: "inline-flex", alignItems: "center", textDecoration: "none" }}
              >
                Download resume
              </a>
            ) : (
              <button
                type="button"
                onClick={() => show("No resume uploaded yet.", "error")}
                style={pageButtonStyle(true)}
              >
                Download resume
              </button>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 12, marginTop: 20 }}>
          {[
            ["CGPA", "—", "Not tracked in this system yet"],
            ["Standing arrears", "—", "Not tracked in this system yet"],
            ["Applications", String(profile.drivesApplied), "This placement cycle"],
            ["Offers", String(profile.offersCount), lpa(Math.max(0, ...profile.offers.map((o) => o.offeredPackageLpa ?? 0)) || null)],
          ].map(([label, value, sub]) => (
            <div key={label} style={{ background: "#f6f8fb", borderRadius: 10, padding: "13px 15px" }}>
              <div style={{ fontSize: 11.5, color: "#8b95a6" }}>{label}</div>
              <div style={{ fontSize: 20, fontWeight: 670, letterSpacing: "-.5px", marginTop: 4 }}>{value}</div>
              <div style={{ fontSize: 11, color: "#96a0b0", marginTop: 2 }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 14, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ fontSize: 14, fontWeight: 650 }}>Profile</div>
            <div style={{ display: "flex", flexDirection: "column", marginTop: 8 }}>
              <DetailRow label="Register number" value={profile.registerNo ?? profile.studentIdNo} />
              <DetailRow label="Department" value={profile.departmentCode ?? "—"} />
              <DetailRow label="Year" value={yearLabel(profile.year)} />
              <DetailRow label="CGPA" value="—" />
              <DetailRow label="Standing arrears" value="—" />
              <DetailRow label="Eligibility" value="" badge="Not tracked" />
              <DetailRow label="Placement status" value="" badge={statusLabel(profile.status)} />
              {profileLinks(profile).length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 0", borderTop: "1px solid #f1f4f8" }}>
                  <span style={{ fontSize: 12.5, color: "#8b95a6", minWidth: 132 }}>Profiles</span>
                  <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {profileLinks(profile).map((link) => (
                      <a
                        key={link.label}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#1f4fd8",
                          background: "#e8f0fe",
                          padding: "3.5px 9px",
                          borderRadius: 5,
                          textDecoration: "none",
                        }}
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ fontSize: 14, fontWeight: 650 }}>Placement journey</div>
            <div style={{ display: "flex", flexDirection: "column", marginTop: 14 }}>
              {journey.map((j, i) => (
                <div key={j.label} style={{ display: "flex", gap: 13 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 11 }}>
                    <span
                      style={{
                        width: 11,
                        height: 11,
                        borderRadius: "50%",
                        flex: "0 0 auto",
                        border: `2px solid ${j.done ? "#1f4fd8" : "#cbd3e0"}`,
                        background: j.done ? "#1f4fd8" : "#fff",
                      }}
                    />
                    {i < journey.length - 1 && (
                      <span
                        style={{
                          width: 2,
                          flex: 1,
                          minHeight: 16,
                          margin: "3px 0",
                          background: journey[i + 1].done ? "#1f4fd8" : "#e6eaf1",
                        }}
                      />
                    )}
                  </div>
                  <div style={{ paddingBottom: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: j.done ? 650 : 500, color: j.done ? "#16224a" : "#8b95a6" }}>
                      {j.label}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#96a0b0", marginTop: 2 }}>{j.meta}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ fontSize: 14, fontWeight: 650 }}>Applications</div>
            {profile.applications.length === 0 && (
              <div style={{ fontSize: 12.5, color: "#96a0b0", padding: "18px 0 6px 0" }}>No applications recorded this cycle.</div>
            )}
            <div style={{ display: "flex", flexDirection: "column", marginTop: 8 }}>
              {profile.applications.map((a: StudentApplicationRow) => (
                <ListRow
                  key={a.driveId}
                  title={a.companyName}
                  meta={[a.jobRole, `Applied ${dateLabel(a.updatedAt)}`].filter(Boolean).join(" · ")}
                  badge={applicationStageLabel(a.status)}
                />
              ))}
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ fontSize: 14, fontWeight: 650 }}>Offers</div>
            {profile.offers.length === 0 && (
              <div style={{ fontSize: 12.5, color: "#96a0b0", padding: "18px 0 6px 0" }}>No offers released yet.</div>
            )}
            <div style={{ display: "flex", flexDirection: "column", marginTop: 8 }}>
              {profile.offers.map((o: StudentOfferRow) => (
                <ListRow
                  key={o.driveId}
                  title={o.companyName}
                  meta={[o.jobRole, `Released ${dateLabel(o.updatedAt)}`].filter(Boolean).join(" · ")}
                  right={lpa(o.offeredPackageLpa)}
                  badge={offerResponseLabel(o.offerResponse)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentDetailInner() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  return <StudentDetailContent id={id} />;
}

export default function StudentDetailPage() {
  return (
    <Suspense fallback={<p style={{ fontSize: 13, color: "#77808f" }}>Loading…</p>}>
      <StudentDetailInner />
    </Suspense>
  );
}
