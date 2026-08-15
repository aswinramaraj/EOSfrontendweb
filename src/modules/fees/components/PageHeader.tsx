import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  subtitle?: string;
}

export function PageHeader({ breadcrumbs, title, subtitle }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-2">
      <nav className="flex items-center gap-2 text-[13px] text-[var(--text-tertiary)]">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <span key={item.label} className="flex items-center gap-2">
              {index > 0 && <span className="text-[var(--border-default)]">{"›"}</span>}
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-[var(--text-secondary)]">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "font-medium text-[var(--text-primary)]" : ""}>{item.label}</span>
              )}
            </span>
          );
        })}
      </nav>

      <div>
        <h1 className="text-[22px] font-semibold leading-[1.25] tracking-[-0.011em] text-[var(--text-primary)]">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-[13px] leading-[1.55] text-[var(--text-tertiary)]">{subtitle}</p>}
      </div>
    </div>
  );
}
