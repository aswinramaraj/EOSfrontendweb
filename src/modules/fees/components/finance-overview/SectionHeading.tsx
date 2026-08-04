interface SectionHeadingProps {
  id?: string;
  title: string;
  description?: string;
}

export function SectionHeading({ id, title, description }: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <h3 id={id} className="text-[15px] font-semibold text-[var(--text-primary)]">
        {title}
      </h3>
      {description && <p className="text-[13px] text-[var(--text-tertiary)]">{description}</p>}
    </div>
  );
}
