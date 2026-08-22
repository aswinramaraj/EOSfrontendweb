import { HOVERABLE } from "./hoverable";

interface HRCardProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  hoverable?: boolean;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

/** Bordered white rounded-xl container — the base building block for
 *  dashboard widgets, announcement/calendar list items, and profile info
 *  panels in the reference design. */
export function HRCard({
  title,
  description,
  actions,
  hoverable = true,
  onClick,
  className = "",
  children,
}: HRCardProps) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      onClick={onClick}
      className={`w-full rounded-xl border border-slate-200 bg-white p-5 text-left ${
        onClick ? "cursor-pointer" : ""
      } ${hoverable ? HOVERABLE : ""} ${className}`}
    >
      {(title || actions) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && <h3 className="text-base font-extrabold text-slate-900">{title}</h3>}
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </Wrapper>
  );
}
