"use client";

import { useMemo, useState } from "react";
import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { ApiError } from "@/shared/lib/api-client";
import { useAnnouncements } from "@/modules/placement/hooks/useAnnouncements";
import { useDeleteAnnouncement } from "@/modules/placement/hooks/useAnnouncementMutations";
import { AnnouncementComposerModal } from "@/modules/placement/components/announcements/AnnouncementComposerModal";
import {
  placementResetButtonStyle,
  placementSearchInputStyle,
  placementSelectStyle,
} from "@/modules/placement/components/table/PlacementTable";
import { pageButtonStyle } from "@/modules/placement/lib/pageButtonStyle";
import { ANNOUNCEMENT_CATEGORIES, type AnnouncementListItem } from "@/modules/placement/types";

const AUDIENCE_LABEL: Record<string, string> = {
  students: "Students",
  teachers: "Faculty / HODs",
  parents: "Parents",
  roles: "Placement cell staff",
};

const CAT_TONE: Record<string, { bg: string; fg: string }> = {
  emergency: { bg: "#eef1f6", fg: "#16224a" },
  academic: { bg: "#e8f0fe", fg: "#1f4fd8" },
  placement: { bg: "#e8f0fe", fg: "#1f4fd8" },
};

function catStyle(category: string | null) {
  const tone = (category && CAT_TONE[category]) || { bg: "#eff2f7", fg: "#46536a" };
  return {
    fontFamily: "var(--font-ibm-plex-mono)",
    fontSize: 10.5,
    fontWeight: 600,
    letterSpacing: ".9px",
    padding: "4px 9px",
    borderRadius: 6,
    background: tone.bg,
    color: tone.fg,
    textTransform: "uppercase" as const,
  };
}

function statusStyle(status: string) {
  return {
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: ".9px",
    padding: "4px 10px",
    borderRadius: 6,
    background: status === "published" ? "#dbe6ff" : "#f1f4f8",
    color: status === "published" ? "#1f4fd8" : "#77808f",
    textTransform: "uppercase" as const,
  };
}

function dateLabel(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AnnouncementCard({
  a,
  isMine,
  onEdit,
  onDelete,
}: {
  a: AnnouncementListItem;
  isMine: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const audienceBits: string[] = [];
  if (a.classLabels.length > 0) audienceBits.push(`${a.classLabels.length} class${a.classLabels.length === 1 ? "" : "es"}`);
  if (a.roleLabels.length > 0) audienceBits.push(a.roleLabels.join(", "));
  audienceBits.push(AUDIENCE_LABEL[a.targetAudience] ?? a.targetAudience);

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: "16px 20px 15px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 13, flexWrap: "wrap" }}>
        {a.category && <span style={catStyle(a.category)}>{a.category}</span>}
        <span style={{ fontSize: 12.5, color: "#8b95a6" }}>{dateLabel(a.createdAt)}</span>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 12.5, color: "#8b95a6" }}>{a.postedBy.name}</span>
        <span style={statusStyle(a.status)}>{a.status}</span>
      </div>
      <div style={{ fontSize: 16, fontWeight: 670, letterSpacing: "-.3px", marginTop: 11 }}>{a.title}</div>
      <div style={{ fontSize: 13, color: "#46536a", lineHeight: 1.55, marginTop: 5 }}>{a.content}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10 }}>
        <span style={{ fontSize: 12.5, color: "#96a0b0" }}>Audience · {audienceBits.join(" · ")}</span>
        {isMine && (
          <>
            <span style={{ flex: 1 }} />
            <button type="button" onClick={onEdit} style={{ fontSize: 12.5, color: "#1f4fd8", fontWeight: 600 }}>
              Edit
            </button>
            <button type="button" onClick={onDelete} style={{ fontSize: 12.5, color: "#c0392b", fontWeight: 600 }}>
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function PlacementAnnouncementsPage() {
  const user = useAuthUser();
  const { show } = useToast();
  const { data, isLoading, error } = useAnnouncements();
  const deleteAnnouncement = useDeleteAnnouncement();

  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [category, setCategory] = useState("All categories");
  const [audience, setAudience] = useState("All audiences");
  const [resetHover, setResetHover] = useState(false);
  const [composerTarget, setComposerTarget] = useState<AnnouncementListItem | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AnnouncementListItem | null>(null);

  const rows = useMemo(() => data ?? [], [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((a) => {
      const matchesQuery = !q || a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q);
      const matchesCategory = category === "All categories" || a.category === category;
      const matchesAudience = audience === "All audiences" || a.targetAudience === audience;
      return matchesQuery && matchesCategory && matchesAudience;
    });
  }, [rows, query, category, audience]);

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteAnnouncement.mutate(deleteTarget.id, {
      onSuccess: () => {
        show("Announcement deleted.", "success");
        setDeleteTarget(null);
      },
      onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"),
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <h1 style={{ margin: 0, fontSize: 26, letterSpacing: "-.7px", fontWeight: 680 }}>Announcements</h1>
          <p style={{ margin: "5px 0 0 0", fontSize: 13, color: "#77808f" }}>
            Circulars from the institution and posts you publish to your department
          </p>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <button type="button" onClick={() => setComposerTarget("new")} style={pageButtonStyle(true)}>
            New announcement
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder="Search announcements"
          style={placementSearchInputStyle(searchFocused)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={placementSelectStyle}>
          {["All categories", ...ANNOUNCEMENT_CATEGORIES].map((c) => (
            <option key={c} value={c}>
              {c === "All categories" ? c : c[0].toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
        <select value={audience} onChange={(e) => setAudience(e.target.value)} style={placementSelectStyle}>
          {["All audiences", "students", "teachers", "parents"].map((a) => (
            <option key={a} value={a}>
              {a === "All audiences" ? a : AUDIENCE_LABEL[a]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setCategory("All categories");
            setAudience("All audiences");
          }}
          onMouseEnter={() => setResetHover(true)}
          onMouseLeave={() => setResetHover(false)}
          style={placementResetButtonStyle(resetHover)}
        >
          Reset
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {isLoading && <div style={{ fontSize: 13, color: "#8b95a6" }}>Loading…</div>}
        {error && <div style={{ fontSize: 13, color: "#c0392b" }}>Failed to load announcements.</div>}
        {!isLoading && !error && filtered.length === 0 && (
          <div style={{ fontSize: 13, color: "#8b95a6" }}>No announcements match these filters.</div>
        )}
        {filtered.map((a) => (
          <AnnouncementCard
            key={a.id}
            a={a}
            isMine={user != null && user.id === a.postedByUserId}
            onEdit={() => setComposerTarget(a)}
            onDelete={() => setDeleteTarget(a)}
          />
        ))}
      </div>

      <AnnouncementComposerModal
        open={composerTarget !== null}
        announcement={composerTarget === "new" || composerTarget === null ? null : composerTarget}
        onClose={() => setComposerTarget(null)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete announcement"
        message={`Delete "${deleteTarget?.title}"? This can't be undone.`}
        confirmLabel="Delete"
        tone="danger"
        isPending={deleteAnnouncement.isPending}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
