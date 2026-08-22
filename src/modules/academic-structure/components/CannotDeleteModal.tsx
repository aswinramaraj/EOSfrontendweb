import { Modal } from "@/shared/components/ui/Modal";
import { AlertTriangleIcon } from "@/shared/components/icons";
import { pageButtonStyle } from "@/modules/placement/lib/pageButtonStyle";

interface CannotDeleteModalProps {
  open: boolean;
  onClose: () => void;
  label: string;
  /** e.g. ["1 course", "5 classes"] — rendered as a bullet list. */
  blockers: string[];
}

/**
 * Matches the reference's "Cannot delete" flow: no confirm action, since the
 * real onDelete: NoAction foreign keys mean the delete would simply fail —
 * this just explains what's in the way before the user tries.
 */
export function CannotDeleteModal({ open, onClose, label, blockers }: CannotDeleteModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={`Cannot delete ${label}`} subtitle="Something still points at it." widthClassName="max-w-md">
      <div style={{ display: "flex", gap: 12 }}>
        <AlertTriangleIcon style={{ width: 20, height: 20, color: "#b45309", flexShrink: 0, marginTop: 2 }} />
        <div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#3a4351", display: "flex", flexDirection: "column", gap: 3 }}>
            {blockers.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <p style={{ fontSize: 12, color: "#77808f", marginTop: 10 }}>
            Remove or move those first. This is not a caution — the foreign keys are declared NoAction, so the delete would
            simply fail.
          </p>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18, paddingTop: 14, borderTop: "1px solid #eef1f6" }}>
        <button type="button" style={pageButtonStyle(false)} onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  );
}
