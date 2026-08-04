"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/shared/lib/api-client";
import { financeOverviewService } from "../../services/finance-overview.service";
import { ExecutiveKPIs } from "./ExecutiveKPIs";
import { FinancialAnalytics } from "./FinancialAnalytics";
import { OperationalInsights } from "./OperationalInsights";
import { FinanceOverviewLoading } from "./FinanceOverviewLoading";
import type { FinanceOverviewData } from "./types";

export function FinanceOverviewPanel() {
  const [data, setData] = useState<FinanceOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setLoadError(null);

    financeOverviewService
      .get()
      .then((result) => setData(result))
      .catch((err: unknown) => {
        setLoadError(err instanceof ApiError ? err.message : "Failed to load finance overview.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div role="status" aria-live="polite" aria-label="Loading finance overview">
        <FinanceOverviewLoading />
      </div>
    );
  }

  if (loadError || !data) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center gap-2 rounded-[var(--r-xl)] border border-[var(--border-subtle)] bg-white py-16 text-center shadow-[var(--shadow-xs)]"
      >
        <p className="text-sm font-medium text-[var(--text-primary)]">Unable to load Finance Overview</p>
        <p className="text-sm text-[var(--text-tertiary)]">{loadError ?? "Failed to load finance overview."}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ExecutiveKPIs kpis={data.executiveKPIs} />
      <FinancialAnalytics analytics={data.financialAnalytics} />
      <OperationalInsights insights={data.operationalInsights} />
    </div>
  );
}
