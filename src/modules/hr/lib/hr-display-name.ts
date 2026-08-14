// HR accounts (`AuthUser`) carry only { id, email, role, roleId } — no person
// name field, since they aren't linked to a faculty record. The reference
// design's sidebar identity block and dashboard greeting are personalized
// ("K. Meenakshi"), so we derive a display name and initials from the email
// local-part client-side. Purely cosmetic — not a stand-in for real profile
// data, and never sent anywhere.
export function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  const words = local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1));
  return words.join(" ") || email;
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
