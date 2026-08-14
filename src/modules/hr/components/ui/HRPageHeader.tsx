interface HRPageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

/** Reference design's heavier page-header treatment — bigger/bolder title
 *  than the shared `PageHeader`. HR-owned so the shared component (used by
 *  every other module) stays untouched. */
export function HRPageHeader({ title, description, actions }: HRPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[28px] font-black leading-tight tracking-tight text-slate-900 sm:text-[34px]">
          {title}
        </h1>
        {description && <p className="mt-1.5 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
