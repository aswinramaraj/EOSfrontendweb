import { useEffect, useRef } from "react";
import { XIcon } from "@/shared/components/icons";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  widthClassName?: string;
  closeButtonVariant?: "plain" | "bordered";
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  widthClassName = "max-w-lg",
  closeButtonVariant = "plain",
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClose={onClose}
      onClick={(e) => {
        // A click that lands directly on the <dialog> element (not its
        // content) is a backdrop click — native <dialog> has no separate
        // backdrop click target to hook into.
        if (e.target === dialogRef.current) onClose();
      }}
      // Centered via fixed + translate rather than the UA `dialog:modal`
      // default (`inset: 0; margin: auto;`) — that default turned out to be
      // unreliable here (dialogs were rendering pinned to the viewport's
      // top-left corner instead of centered), so centering is pinned
      // explicitly instead of leaning on browser-default behavior.
      // max-h/overflow-y-auto keeps tall content (e.g. the import wizard's
      // table) scrolling inside the dialog instead of overflowing the
      // viewport and looking like a positioning bug.
      className={`fixed left-1/2 top-1/2 m-0 max-h-[85vh] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-slate-200 p-0 shadow-xl backdrop:bg-black/30 ${widthClassName}`}
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className={
            closeButtonVariant === "bordered"
              ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
              : "shrink-0 text-slate-400 hover:text-slate-600"
          }
        >
          <XIcon className={closeButtonVariant === "bordered" ? "h-4 w-4" : "h-5 w-5"} />
        </button>
      </div>
      <div className="px-5 py-4">{children}</div>
    </dialog>
  );
}
