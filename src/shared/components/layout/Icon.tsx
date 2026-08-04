import { ICON_PATHS } from "./icon-paths";

interface IconProps {
  name: keyof typeof ICON_PATHS;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 18, className }: IconProps) {
  const d = ICON_PATHS[name];
  if (!d) return null;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: d }}
    />
  );
}
