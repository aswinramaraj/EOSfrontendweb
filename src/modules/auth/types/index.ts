export type Role =
  | "admin"
  | "hod"
  | "faculty"
  | "student"
  | "parent"
  | "coe"
  | "placement"
  | "library"
  | "billing"
  | "hr_payroll"
  | "finance"
  | "iqac"
  | "secretary"
  | "gate_warden"
  | "media_room"
  | "academic_coordinator";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  email: string;
  role: Role;
  roleId: number;
  /** Only present for `coe` accounts — grants publish/withdraw-tier actions in the examination module. */
  isSeniorCoe?: boolean;
}

export interface LoginResult {
  accessToken: string;
  user: AuthUser;
}

export type QuickRole = "student" | "faculty" | "parent" | "admin";

/** Shape of GET /auth/me — loosely typed since faculty/students are only
 * populated for accounts linked to those tables (null/absent for admin). */
export interface MeProfile {
  id: number;
  email: string;
  phone: string | null;
  status: string;
  created_at: string;
  roles: { id: number; name: string; description: string | null } | null;
  faculty: unknown;
  students: unknown;
}
