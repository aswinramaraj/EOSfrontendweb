import { useEffect, useRef } from "react";
import { XIcon } from "@/shared/components/icons";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  widthClassName?: string;
}

export function Modal({ open, onClose, title, children, widthClassName = "max-w-lg" }: ModalProps) {
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
      className={`m-auto w-full rounded-lg border border-slate-200 p-0 shadow-xl backdrop:bg-black/30 ${widthClassName}`}
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close">
          <XIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="px-5 py-4">{children}</div>
    </dialog>
  );
}
