"use client";

import { createContext, useContext, useState } from "react";

interface HRPeriodValue {
  month: number; // 1-12
  year: number;
  monthKey: string; // "YYYY-MM", matches useHrPayroll's existing month param shape
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
}

const HRPeriodContext = createContext<HRPeriodValue | null>(null);

/** The one small piece of new shared state this redesign needs — lets the
 *  topbar's month/year pills and any page that already has its own
 *  month/year concept (Payroll, Academic Calendar) read from a single
 *  source instead of each inventing its own "current month" state. */
export function HRPeriodProvider({ children }: { children: React.ReactNode }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const value: HRPeriodValue = {
    month,
    year,
    monthKey: `${year}-${String(month).padStart(2, "0")}`,
    setMonth,
    setYear,
  };

  return <HRPeriodContext.Provider value={value}>{children}</HRPeriodContext.Provider>;
}

export function useHRPeriod(): HRPeriodValue {
  const ctx = useContext(HRPeriodContext);
  if (!ctx) throw new Error("useHRPeriod must be used within HRPeriodProvider");
  return ctx;
}

export const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
