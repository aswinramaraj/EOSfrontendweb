interface PageHeaderProps {
  title: string;
  description?: string;
  /** Small line above the title — e.g. a personal greeting — kept in the
   *  same header block/spacing rhythm as title+description instead of a
   *  disconnected line floating above it. */
  eyebrow?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, eyebrow, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-1 text-sm font-semibold text-blue-700">{eyebrow}</p>}
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
