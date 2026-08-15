import { formatAmountInWords } from "./receipt-utils";
import type { FeePayment } from "./types";

export interface ReceiptStudentInfo {
  name: string;
  registerNumber: string;
  rollNo: string;
  programme: string;
  academicYear: string;
  semester: number | string;
}

interface ReceiptDocumentProps {
  student: ReceiptStudentInfo;
  payments: FeePayment[];
  // Optional, billing-staff-entered at print time via the "From Education
  // Loan" flow in Payment History — never derived from payment_mode, never
  // invented. Omitted entirely for a normal (non-DD) receipt.
  ddReferenceNumber?: string;
}

// Header identity fields (college name/address/phone/logo) mirror the real,
// existing institutional letterhead already used elsewhere in this app
// (Sidebar, page metadata) — not fabricated data, just this receipt's
// required header content, per the uploaded reference layout.
//
// Fields populated: Student Name, Register Number, Roll No, Programme,
// Academic Year, Semester, Demand Category (per row), Amount Paid (per
// row), Grand Total, Amount in Words. Sl. No. and Grand Total/Amount-in-
// Words are generated at render time from the real selected rows — nothing
// else is derived. No value from the uploaded reference receipt (names,
// amounts, numbers) is used anywhere here — it was consulted for
// layout/proportions only.
function formatDateDDMMYYYY(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

export function ReceiptDocument({ student, payments, ddReferenceNumber }: ReceiptDocumentProps) {
  const grandTotal = payments.reduce((sum, p) => sum + p.amountPaid, 0);

  // Real values straight from the selected payment rows — shown once if every
  // selected row shares the same receipt number/date (the normal case), or
  // comma-separated if they genuinely differ. Never generated, never guessed.
  const receiptNumbers = Array.from(new Set(payments.map((p) => p.receiptNo).filter(Boolean))).join(", ");
  const dates = Array.from(new Set(payments.map((p) => formatDateDDMMYYYY(p.paymentDate)))).join(", ");

  return (
    <div
      className="receipt-page bg-white text-black"
      style={{
        width: "210mm",
        padding: "8mm 12mm 0 12mm",
        // var(--font-geist-sans) is the already-loaded Inter instance from
        // the root layout (next/font) — referencing it directly guarantees
        // the real Inter font renders here instead of a same-named but
        // unavailable system font.
        fontFamily: 'var(--font-geist-sans), "Segoe UI", "Helvetica Neue", Arial, sans-serif',
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @page { size: A4; margin: 0; }
        .receipt-page * { box-sizing: border-box; }
        .receipt-frame table { table-layout: fixed; width: 100%; border-collapse: collapse; }
        .receipt-frame tr { page-break-inside: avoid; }
      `}</style>

      {/* Whole visual receipt (letterhead + boxed frame) is capped together
          at 148mm — exactly half of A4's 297mm. This wrapper, not the box
          alone, is what must never exceed half the sheet: the letterhead
          sits above the box, so both have to fit inside the same budget.
          overflow: hidden is the hard backstop; the paddings below are sized
          so a typical 1–6 line-item receipt fits well within the cap on its
          own, without ever needing to clip real data. */}
      <div style={{ maxHeight: "148mm", overflow: "hidden" }}>
        {/* Letterhead — sits above the boxed receipt, matching the sample's
            unboxed header with a single rule underneath it. */}
        <div className="flex items-center justify-between gap-2 pb-1.5">
          <img src="/assest/secelogo.png" alt="" className="h-[56px] w-[56px] shrink-0 object-contain" />
          <div className="min-w-0 flex-1 text-center leading-tight">
            <h1 className="text-[21px] font-bold tracking-tight whitespace-nowrap">
              Sri Eshwar College of Engineering
            </h1>
            <p className="mt-0.5 text-[10px]">(Approved by AICTE, New Delhi &amp; Affiliated to Anna University)</p>
            <p className="mt-0.5 text-[12px] font-semibold">
              Kondampatti(P.O), Vadasithur(Via), Kinathukadavu, Coimbatore-641 202.
            </p>
            <p className="mt-0.5 text-[10px]">Ph : 04259 200300</p>
          </div>
          <p className="shrink-0 self-start whitespace-nowrap pt-1 text-right text-[12px] font-semibold">
            ORIGINAL
          </p>
        </div>
        <div className="border-t-2 border-black" />

        {/* Boxed frame — Receipt No/Date, student details, particulars,
            totals, signature. Height is auto (grows/shrinks with the number
            of selected line items) rather than a fixed value, so a short
            receipt hugs its own content instead of leaving a large blank
            gap before the signature — the outer wrapper above is what
            enforces the half-page ceiling. */}
        <div className="receipt-frame mt-1.5 border-2 border-black">
          {/* Receipt No / Date */}
          <table className="text-[12.5px]">
            <tbody>
              <tr>
                <td className="w-1/2 border-b border-black px-4 py-1.5 align-top">
                  <span className="font-semibold">Receipt No: </span>
                  {receiptNumbers || "—"}
                </td>
                <td className="w-1/2 border-b border-black px-4 py-1.5 align-top">
                  <span className="font-semibold">Date : </span>
                  {dates || "—"}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Student details */}
          <table className="text-[12.5px]">
            <tbody>
              <tr>
                <td className="w-[62%] border-b border-black px-4 py-2 align-top">
                  <span className="font-semibold">Name : </span>
                  {student.name}
                </td>
                <td className="w-[38%] border-b border-black px-4 py-2 align-top">
                  <span className="font-semibold">Class: </span>
                  {student.programme}
                </td>
              </tr>
              <tr>
                <td className="border-b-2 border-black px-4 py-2 align-top">
                  <span className="font-semibold">Roll no: </span>
                  {student.rollNo}
                </td>
                <td className="border-b-2 border-black px-4 py-2 align-top">
                  <span className="font-semibold">Sem period: </span>
                  {student.academicYear} · Sem {student.semester}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Particulars */}
          <table className="text-[12.5px]">
            <thead>
              <tr>
                <th className="w-12 border-b-2 border-black py-1.5 pl-4 text-left font-semibold">Sl.</th>
                <th className="border-b-2 border-black py-1.5 pl-2 text-left font-semibold">Particulars</th>
                <th className="w-24 border-b-2 border-l-2 border-black py-1.5 pr-4 text-right font-semibold">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <tr key={payment.id} className="border-b border-black">
                  <td className="py-1.5 pl-4 align-top">{index + 1}</td>
                  <td className="py-1.5 pl-2 align-top">{payment.demandCategoryName ?? "—"}</td>
                  <td className="border-l-2 border-black py-1.5 pr-4 text-right align-top tabular-nums">
                    {payment.amountPaid.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <table className="text-[12.5px]">
            <tbody>
              <tr>
                <td className="border-b border-t border-black px-4 py-1.5 align-middle">
                  {ddReferenceNumber ? (
                    <>
                      Cheque/DD subjected to realization.{" "}
                      <span className="font-semibold">DD No: {ddReferenceNumber}</span>
                    </>
                  ) : (
                    <>&nbsp;</>
                  )}
                </td>
                <td className="w-24 border-b border-t border-l-2 border-black px-2 py-1.5 text-right align-middle font-semibold">
                  Total
                </td>
                <td className="w-24 border-b border-t border-black px-2 py-1.5 text-right align-middle font-bold tabular-nums">
                  {grandTotal.toLocaleString("en-IN")}
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="px-4 py-1.5 italic">
                  {formatAmountInWords(grandTotal)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Signature — area only, no signature image */}
          <div className="flex justify-end px-4 pb-2 pt-3">
            <div className="text-center text-[12px]">
              <p className="italic">For Sri Eshwar College of Engineering</p>
              <p className="mt-4 border-t border-black px-6 pt-1">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
