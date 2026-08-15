"use client";

import { useParams, useRouter } from "next/navigation";
import { useOffers } from "@/modules/placement/hooks/useOffers";
import { placementBadgeStyle } from "@/modules/placement/components/table/PlacementTable";

function lpa(value: number | undefined): string {
  return value == null ? "—" : `₹${value.toFixed(1)} LPA`;
}

function joiningLabel(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
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

function PlacementDetailContent({ id }: { id: number }) {
  const router = useRouter();
  const { data, isLoading, error } = useOffers();
  const placement = data?.find((o) => o.id === id && o.offerResponse === "accepted");

  if (isLoading) return <p style={{ fontSize: 13, color: "#77808f" }}>Loading…</p>;
  if (error || !placement) return <p style={{ fontSize: 13, color: "#77808f" }}>Failed to load this placement.</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <button
        type="button"
        onClick={() => router.push("/placement/placements")}
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
        ← Back to Placements
      </button>

      <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: "22px 24px" }}>
        <div style={{ fontFamily: "var(--font-ibm-plex-mono)", fontSize: 11, color: "#8b95a6", letterSpacing: ".8px" }}>
          PLACEMENT
        </div>
        <div style={{ fontSize: 27, fontWeight: 680, letterSpacing: "-.8px", marginTop: 7 }}>
          {placement.studentName ?? placement.studentIdNo}
        </div>
        <div style={{ fontSize: 13.5, color: "#77808f", marginTop: 4 }}>
          {placement.companyName} · {placement.jobRole ?? "—"}
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: "18px 20px" }}>
        <div style={{ fontSize: 14, fontWeight: 650 }}>Details</div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 8 }}>
          <DetailRow label="Register number" value={placement.registerNo ?? placement.rollNo ?? placement.studentIdNo} />
          <DetailRow label="Department" value={placement.departmentCode ?? "—"} />
          <DetailRow label="CTC" value={lpa(placement.offeredPackageLpa ?? placement.packageLpa)} />
          <DetailRow label="Joining" value={joiningLabel(placement.joiningDate)} />
          <DetailRow label="Location" value={placement.workLocation ?? "—"} />
          <DetailRow label="Status" value="" badge="Accepted" />
        </div>
      </div>
    </div>
  );
}

export default function PlacementDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  return <PlacementDetailContent id={id} />;
}
