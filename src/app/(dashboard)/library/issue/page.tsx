"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { Button } from "@/shared/components/ui/Button";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { CheckIcon, XIcon } from "@/shared/components/icons";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useStudentSearch, useStudentNoDues } from "@/modules/library/hooks/useStudentLookup";
import { useBookSearch } from "@/modules/library/hooks/useBookSearch";
import { useLibrarySettings } from "@/modules/library/hooks/useLibrarySettings";
import { useCreateBorrowRecord } from "@/modules/library/hooks/useBorrowRecordMutations";
import type { StudentSearchResult } from "@/modules/library/types/student-lookup";
import type { BookSearchResult } from "@/modules/library/types/books";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function IssueBooksPage() {
  const { show } = useToast();
  const [studentQuery, setStudentQuery] = useState("");
  const [bookQuery, setBookQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentSearchResult | null>(null);
  const [selectedBook, setSelectedBook] = useState<BookSearchResult | null>(null);
  const [dueDate, setDueDate] = useState("");

  const debouncedStudentQuery = useDebouncedValue(studentQuery);
  const debouncedBookQuery = useDebouncedValue(bookQuery);

  const { data: studentResults, isFetching: studentsLoading } = useStudentSearch(debouncedStudentQuery);
  const { data: bookResults, isFetching: booksLoading } = useBookSearch(debouncedBookQuery);
  const { data: noDues, isLoading: noDuesLoading } = useStudentNoDues(selectedStudent?.id);
  const { data: settings } = useLibrarySettings();
  const createBorrowRecord = useCreateBorrowRecord();

  const defaultDueDate = useMemo(
    () => (settings ? addDaysIso(settings.default_borrowing_days) : addDaysIso(14)),
    [settings],
  );

  const effectiveDueDate = dueDate || defaultDueDate;

  function selectStudent(student: StudentSearchResult) {
    setSelectedStudent(student);
    setStudentQuery("");
  }

  function selectBook(book: BookSearchResult) {
    setSelectedBook(book);
    setBookQuery("");
  }

  function resetForm() {
    setSelectedStudent(null);
    setSelectedBook(null);
    setDueDate("");
    setStudentQuery("");
    setBookQuery("");
  }

  function handleIssue() {
    if (!selectedStudent || !selectedBook) return;
    createBorrowRecord.mutate(
      {
        book_id: selectedBook.id,
        borrower_type: "student",
        student_id: selectedStudent.id,
        due_date: effectiveDueDate,
      },
      {
        onSuccess: () => {
          show(`"${selectedBook.title}" issued to ${selectedStudent.name}.`, "success");
          resetForm();
        },
        onError: (err: unknown) => {
          show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
        },
      },
    );
  }

  return (
    <div>
      <PageHeader
        title="Issue books"
        description="Look up a student, pick an available copy and set the due date."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Student */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">1. Student</h3>

          {!selectedStudent ? (
            <>
              <SearchInput
                placeholder="Search by name, roll no, register no or email"
                value={studentQuery}
                onChange={(e) => setStudentQuery(e.target.value)}
              />
              {studentQuery.trim().length > 0 && studentQuery.trim().length < 2 && (
                <p className="mt-2 text-xs text-slate-400">Type at least 2 characters.</p>
              )}
              {studentsLoading && <p className="mt-2 text-xs text-slate-400">Searching…</p>}
              <div className="mt-2 flex flex-col gap-2">
                {studentResults?.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => selectStudent(student)}
                    className="flex flex-col items-start rounded-md border border-slate-200 px-3 py-2 text-left hover:border-blue-300 hover:bg-blue-50"
                  >
                    <span className="text-sm font-medium text-slate-900">{student.name}</span>
                    <span className="text-xs text-slate-500">
                      {student.student_id_no} · {student.department.code} · {student.course.name}
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div>
              <div className="flex items-start justify-between rounded-md border border-blue-200 bg-blue-50 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-slate-900">{selectedStudent.name}</p>
                  <p className="text-xs text-slate-500">
                    {selectedStudent.student_id_no} · {selectedStudent.department.name}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-slate-400 hover:text-slate-600"
                  aria-label="Change student"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>

              {noDuesLoading && <p className="mt-3 text-xs text-slate-400">Checking library standing…</p>}
              {noDues && (
                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <StatusPill tone={noDues.has_outstanding_library_dues ? "amber" : "green"}>
                      {noDues.has_outstanding_library_dues ? "Has outstanding dues" : "Clear"}
                    </StatusPill>
                  </div>
                  {noDues.overdue_books.length > 0 && (
                    <p className="text-xs text-red-600">
                      {noDues.overdue_books.length} overdue book(s) — issuing more books may be blocked.
                    </p>
                  )}
                  {noDues.unpaid_fine_records.length > 0 && (
                    <p className="text-xs text-amber-700">
                      {noDues.unpaid_fine_records.length} unpaid fine(s) on record.
                    </p>
                  )}
                  {noDues.unsettled_lost_damaged_charges.length > 0 && (
                    <p className="text-xs text-amber-700">
                      {noDues.unsettled_lost_damaged_charges.length} unsettled lost/damaged charge(s).
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Book */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">2. Book</h3>

          {!selectedBook ? (
            <>
              <SearchInput
                placeholder="Search by title, author or accession"
                value={bookQuery}
                onChange={(e) => setBookQuery(e.target.value)}
              />
              {bookQuery.trim().length > 0 && bookQuery.trim().length < 2 && (
                <p className="mt-2 text-xs text-slate-400">Type at least 2 characters.</p>
              )}
              {booksLoading && <p className="mt-2 text-xs text-slate-400">Searching…</p>}
              <div className="mt-2 flex flex-col gap-2">
                {bookResults?.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => selectBook(book)}
                    disabled={book.available_copies <= 0}
                    className="flex flex-col items-start rounded-md border border-slate-200 px-3 py-2 text-left hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="text-sm font-medium text-slate-900">{book.title}</span>
                    <span className="text-xs text-slate-500">
                      {book.author ?? "Unknown author"} · {book.available_copies} of {book.total_copies} available
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-start justify-between rounded-md border border-blue-200 bg-blue-50 px-3 py-2.5">
              <div>
                <p className="text-sm font-medium text-slate-900">{selectedBook.title}</p>
                <p className="text-xs text-slate-500">
                  {selectedBook.qr_code} · {selectedBook.available_copies} of {selectedBook.total_copies} available
                </p>
              </div>
              <button
                onClick={() => setSelectedBook(null)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Change book"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="issue-due-date" className="text-sm font-medium text-slate-700">
            Due date
          </label>
          <input
            id="issue-due-date"
            type="date"
            min={todayIso()}
            value={effectiveDueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <Button
          variant="primary"
          disabled={!selectedStudent || !selectedBook}
          isPending={createBorrowRecord.isPending}
          onClick={handleIssue}
        >
          <CheckIcon className="h-4 w-4" /> Issue book
        </Button>
      </div>
    </div>
  );
}
