"use client";

import { useState, type SubmitEvent } from "react";
import { useLogin } from "../hooks/useLogin";
import type { QuickRole } from "../types";
import {
  LockIcon,
  MailIcon,
  EyeIcon,
  EyeOffIcon,
  GraduationCapIcon,
  PersonIcon,
  PeopleIcon,
  ShieldPersonIcon,
} from "@/shared/components/icons";

const QUICK_ROLES: {
  key: QuickRole;
  label: string;
  icon: typeof GraduationCapIcon;
  activeClasses: string;
}[] = [
  { key: "student", label: "Student", icon: GraduationCapIcon, activeClasses: "border-blue-500 bg-blue-50 text-blue-700" },
  { key: "faculty", label: "Faculty", icon: PersonIcon, activeClasses: "border-purple-500 bg-purple-50 text-purple-700" },
  { key: "parent", label: "Parent", icon: PeopleIcon, activeClasses: "border-green-500 bg-green-50 text-green-700" },
  { key: "admin", label: "Admin", icon: ShieldPersonIcon, activeClasses: "border-orange-500 bg-orange-50 text-orange-700" },
];

export function LoginForm() {
  const { login, isSubmitting, error } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [quickRole, setQuickRole] = useState<QuickRole | null>(null);

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    void login(email, password, quickRole);
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 sm:p-10 shadow-xl">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <LockIcon className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-xl font-bold text-slate-900">Sign in to your account</h1>
        <p className="mt-1 text-sm text-slate-500">Enter your credentials to access the ERP portal</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <label className="relative block">
          <span className="sr-only">College Email / Username</span>
          <MailIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="College Email / Username"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <label className="relative block">
          <span className="sr-only">Password</span>
          <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        </label>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-600">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400"
            />
            Remember me
          </label>
          <a href="#" className="font-medium text-blue-600 hover:text-blue-700">
            Forgot Password?
          </a>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 w-full rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-95 disabled:opacity-60"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs font-medium text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        OR
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {QUICK_ROLES.map(({ key, label, icon: Icon, activeClasses }) => {
          const isActive = quickRole === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setQuickRole(isActive ? null : key)}
              className={`flex flex-col items-center gap-2 rounded-xl border py-4 text-xs font-medium transition ${
                isActive ? activeClasses : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              <Icon className="h-6 w-6" />
              Login as
              <span className="-mt-1 font-semibold">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
