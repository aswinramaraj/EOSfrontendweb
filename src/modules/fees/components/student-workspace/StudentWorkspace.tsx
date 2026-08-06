"use client";

import { useEffect, useState } from "react";
import { CloseIcon } from "@/shared/components/icons";
import { ApiError } from "@/shared/lib/api-client";
import { StudentHeader } from "./StudentHeader";
import { StudentSummary } from "./StudentSummary";
import { WorkspaceTabs } from "./WorkspaceTabs";
import { ReceivePaymentPanel } from "./ReceivePaymentPanel";
import { DemandSummaryCard } from "./DemandSummaryCard";
import { PlaceholderTab } from "./PlaceholderTab";
import { FeeConcessionsPanel } from "../fee-concessions/FeeConcessionsPanel";
import { EducationLoanDDPanel } from "../education-loan-dd/EducationLoanDDPanel";
import { WORKSPACE_TABS } from "./constants";
import { FeePaymentsList } from "../fee-payments-crud/FeePaymentsList";
import { FeePaymentDrawer } from "../fee-payments-crud/FeePaymentDrawer";
import { DeleteFeePaymentDialog } from "../fee-payments-crud/DeleteFeePaymentDialog";
import { feePaymentsService } from "../../services/fee-payments.service";
import { studentWorkspaceService, type StudentWorkspaceData } from "../../services/student-workspace.service";
import type { FeePayment, FeePaymentFormValues } from "../fee-payments-crud/types";

interface StudentWorkspaceProps {
  studentId: string;
  onClose: () => void;
}

type PaymentDialogState =
  | { mode: "create" }
  | { mode: "edit"; payment: FeePayment }
  | { mode: "delete"; payment: FeePayment }
  | null;

export function StudentWorkspace({ studentId, onClose }: StudentWorkspaceProps) {
  const [activeTab, setActiveTab] = useState(WORKSPACE_TABS[0]?.key ?? "receive-payment");

  const [workspace, setWorkspace] = useState<StudentWorkspaceData | null>(null);
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(true);
  const [loadWorkspaceError, setLoadWorkspaceError] = useState<string | null>(null);

  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [loadPaymentsError, setLoadPaymentsError] = useState<string | null>(null);
  const [paymentDialog, setPaymentDialog] = useState<PaymentDialogState>(null);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isDeletingPayment, setIsDeletingPayment] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Scoped to this student's active demand mapping — GET
  // /student-fee-demand-mappings/:id/payments — never the global
  // GET /fee-payments admin list (that endpoint is untouched and still
  // powers the global Fee Payments CRUD screen elsewhere).
  function fetchPayments(demandMappingId: number) {
    setIsLoadingPayments(true);
    setLoadPaymentsError(null);

    return feePaymentsService
      .listByDemandMapping(demandMappingId)
      .then((data) => setPayments(data))
      .catch((err: unknown) => {
        setLoadPaymentsError(err instanceof ApiError ? err.message : "Failed to load payments.");
      })
      .finally(() => setIsLoadingPayments(false));
  }

  // Single source of truth for re-fetching this student's workspace snapshot
  // (fee_summary, demand_summary, payment_summary, student_profile) AND this
  // student's own scoped Payment History. Called after every successful
  // finance write so every section reflects the latest database values
  // instead of a stale snapshot from mount.
  function refreshWorkspace() {
    return studentWorkspaceService
      .get(Number(studentId))
      .then((data) => {
        setWorkspace(data);

        const activeMappingId = data.demandSummary[0]?.studentFeeDemandMappingId;
        if (activeMappingId !== undefined) {
          return fetchPayments(activeMappingId);
        }

        setPayments([]);
        setIsLoadingPayments(false);
      })
      .catch((err: unknown) => {
        setLoadWorkspaceError(err instanceof ApiError ? err.message : "Failed to load student workspace.");
      });
  }

  useEffect(() => {
    setIsLoadingWorkspace(true);
    setLoadWorkspaceError(null);

    refreshWorkspace().finally(() => setIsLoadingWorkspace(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  function handleSavePayment(values: FeePaymentFormValues, demandMappingId: number | null) {
    if (paymentDialog?.mode === "edit") {
      setIsSubmittingPayment(true);
      setFormError(null);

      feePaymentsService
        .update(paymentDialog.payment.id, values)
        .then(() => {
          setPaymentDialog(null);
          return refreshWorkspace();
        })
        .catch((err: unknown) => {
          setFormError(err instanceof ApiError ? err.message : "Failed to update payment.");
        })
        .finally(() => setIsSubmittingPayment(false));
      return;
    }

    if (demandMappingId === null) {
      setFormError("Select a demand mapping to continue.");
      return;
    }

    setIsSubmittingPayment(true);
    setFormError(null);

    feePaymentsService
      .create(demandMappingId, values)
      .then(() => {
        setPaymentDialog(null);
        return refreshWorkspace();
      })
      .catch((err: unknown) => {
        setFormError(err instanceof ApiError ? err.message : "Failed to create payment.");
      })
      .finally(() => setIsSubmittingPayment(false));
  }

  function handleDeletePayment() {
    if (paymentDialog?.mode !== "delete") return;

    setIsDeletingPayment(true);
    setDeleteError(null);

    feePaymentsService
      .remove(paymentDialog.payment.id)
      .then(() => {
        setPaymentDialog(null);
        return refreshWorkspace();
      })
      .catch((err: unknown) => {
        setDeleteError(err instanceof ApiError ? err.message : "Failed to delete payment.");
      })
      .finally(() => setIsDeletingPayment(false));
  }

  function closePaymentDialog() {
    setFormError(null);
    setDeleteError(null);
    setPaymentDialog(null);
  }

  if (isLoadingWorkspace) {
    return <p className="py-8 text-center text-sm text-zinc-500">Loading student workspace...</p>;
  }

  if (loadWorkspaceError || !workspace) {
    return (
      <p className="py-8 text-center text-sm text-red-600">
        {loadWorkspaceError ?? "Failed to load student workspace."}
      </p>
    );
  }

  const { profile, feeSummary, demandSummary, paymentSummary } = workspace;
  const firstMapping = demandSummary[0];

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex items-center gap-2 text-sm text-zinc-500">
        <span>Home</span>
        <span className="text-zinc-300">{">"}</span>
        <button type="button" onClick={onClose} className="hover:text-zinc-700">
          Fees & Finance
        </button>
        <span className="text-zinc-300">{">"}</span>
        <button type="button" onClick={onClose} className="hover:text-zinc-700">
          Fee Payments
        </button>
        <span className="text-zinc-300">{">"}</span>
        <span className="flex items-center gap-1.5 font-medium text-zinc-900">
          {profile.name} ({profile.registerNumber})
          <button
            type="button"
            onClick={onClose}
            aria-label="Close student workspace"
            className="text-zinc-400 hover:text-zinc-600"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-6">
        <StudentHeader student={profile} />
        <StudentSummary
          summary={feeSummary}
          feeStructureName={firstMapping?.feeStructureName ?? "—"}
          academicYear={firstMapping?.academicYear ?? "—"}
          batch={profile.batch}
        />
      </div>

      <WorkspaceTabs tabs={WORKSPACE_TABS} activeKey={activeTab} onTabChange={setActiveTab} />

      {activeTab === "receive-payment" ? (
        <ReceivePaymentPanel
          paymentSummary={paymentSummary}
          outstandingAmount={feeSummary.totalOutstanding}
          onReceivePayment={() => setPaymentDialog({ mode: "create" })}
          onPrintReceipt={() => setActiveTab("payment-history")}
        />
      ) : activeTab === "demand-details" ? (
        <div className="max-w-2xl">
          <DemandSummaryCard items={demandSummary} feeSummary={feeSummary} />
        </div>
      ) : activeTab === "payment-history" ? (
        isLoadingPayments ? (
          <p className="py-8 text-center text-sm text-zinc-500">Loading payments...</p>
        ) : loadPaymentsError ? (
          <p className="py-8 text-center text-sm text-red-600">{loadPaymentsError}</p>
        ) : (
          <FeePaymentsList
            payments={payments}
            student={{
              name: profile.name,
              registerNumber: profile.registerNumber,
              rollNo: profile.rollNo,
              programme: profile.programme,
              academicYear: firstMapping?.academicYear ?? "—",
              semester: firstMapping?.semester ?? "—",
            }}
            onAdd={() => setPaymentDialog({ mode: "create" })}
            onEdit={(payment) => setPaymentDialog({ mode: "edit", payment })}
            onDelete={(payment) => setPaymentDialog({ mode: "delete", payment })}
          />
        )
      ) : activeTab === "fee-concessions" ? (
        <FeeConcessionsPanel feeStructureId={firstMapping?.feeStructureId ?? null} onDataChanged={refreshWorkspace} />
      ) : activeTab === "education-loan-dd" ? (
        <EducationLoanDDPanel
          demandMappingId={firstMapping?.studentFeeDemandMappingId ?? null}
          onDataChanged={refreshWorkspace}
        />
      ) : (
        <PlaceholderTab label={WORKSPACE_TABS.find((tab) => tab.key === activeTab)?.label ?? ""} />
      )}

      {(paymentDialog?.mode === "create" || paymentDialog?.mode === "edit") && (
        <FeePaymentDrawer
          payment={paymentDialog.mode === "edit" ? paymentDialog.payment : null}
          demandMappings={demandSummary}
          error={formError}
          isSubmitting={isSubmittingPayment}
          onClose={closePaymentDialog}
          onSubmit={handleSavePayment}
        />
      )}

      {paymentDialog?.mode === "delete" && (
        <DeleteFeePaymentDialog
          payment={paymentDialog.payment}
          error={deleteError}
          isDeleting={isDeletingPayment}
          onCancel={closePaymentDialog}
          onConfirm={handleDeletePayment}
        />
      )}
    </div>
  );
}
