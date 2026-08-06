"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/shared/lib/api-client";
import { financeOverviewService } from "../../services/finance-overview.service";
import { ExecutiveKPIs } from "./ExecutiveKPIs";
import { FinancialAnalytics } from "./FinancialAnalytics";
import { OperationalInsights } from "./OperationalInsights";
import { FinanceOverviewLoading } from "./FinanceOverviewLoading";
import { BatchSelector, ALL_BATCHES_VALUE } from "./BatchSelector";
import type { FinanceOverviewData } from "./types";

export function FinanceOverviewPanel() {
  const [data, setData] = useState<FinanceOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Real batches only — sourced from GET /finance-overview/batches, never
  // hardcoded. Defaults to "All" (no batch param, the unscoped aggregate).
  const [batches, setBatches] = useState<string[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>(ALL_BATCHES_VALUE);

  useEffect(() => {
    financeOverviewService.getBatches().then(setBatches).catch(() => setBatches([]));
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setLoadError(null);

    financeOverviewService
      .get(selectedBatch === ALL_BATCHES_VALUE ? undefined : selectedBatch)
      .then((result) => setData(result))
      .catch((err: unknown) => {
        setLoadError(err instanceof ApiError ? err.message : "Failed to load finance overview.");
      })
      .finally(() => setIsLoading(false));
  }, [selectedBatch]);

  const batchSelector = (
    <BatchSelector batches={batches} selected={selectedBatch} onSelect={setSelectedBatch} disabled={isLoading} />
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {batchSelector}
        <div role="status" aria-live="polite" aria-label="Loading finance overview">
          <FinanceOverviewLoading />
        </div>
      </div>
    );
  }

  if (loadError || !data) {
    return (
      <div className="flex flex-col gap-4">
        {batchSelector}
        <div
          role="alert"
          className="flex flex-col items-center justify-center gap-2 rounded-[var(--r-xl)] border border-[var(--border-subtle)] bg-white py-16 text-center shadow-[var(--shadow-xs)]"
        >
          <p className="text-sm font-medium text-[var(--text-primary)]">Unable to load Finance Overview</p>
          <p className="text-sm text-[var(--text-tertiary)]">{loadError ?? "Failed to load finance overview."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {batchSelector}
      <ExecutiveKPIs kpis={data.executiveKPIs} />
      <OperationalInsights insights={data.operationalInsights} />
      <FinancialAnalytics analytics={data.financialAnalytics} />
    </div>
  );
}
