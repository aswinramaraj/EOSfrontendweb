"use client";

import { avatarToneFor, initialsOf } from "../lib/faculty-format";
import type { Faculty } from "../types";

interface FacultyAvatarProps {
  faculty: Pick<Faculty, "id" | "first_name" | "last_name"> & { profile_url?: string | null };
  className?: string;
}

export function FacultyAvatar({ faculty, className = "h-16 w-16 rounded-xl text-xl" }: FacultyAvatarProps) {
  if (faculty.profile_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={faculty.profile_url}
        alt=""
        className={`shrink-0 overflow-hidden object-cover ${className}`}
      />
    );
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center font-bold ${avatarToneFor(faculty.id)} ${className}`}
    >
      {initialsOf(faculty)}
    </span>
  );
}
