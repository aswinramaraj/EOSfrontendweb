const AVATAR_TINTS = [
  { bg: "#dbeafe", fg: "#1d4ed8" },
  { bg: "#ecfdf3", fg: "#067647" },
  { bg: "#f4f3ff", fg: "#6938ef" },
  { bg: "#fffaeb", fg: "#b54708" },
  { bg: "#ecfeff", fg: "#0e7490" },
  { bg: "#fef3f2", fg: "#b42318" },
];

function avatarTint(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 9973;
  return AVATAR_TINTS[hash % AVATAR_TINTS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return `${first}${second}`.toUpperCase();
}

export function StudentAvatar({ name }: { name: string }) {
  const tint = avatarTint(name);
  return (
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
      style={{ background: tint.bg, color: tint.fg }}
    >
      {getInitials(name)}
    </span>
  );
}
