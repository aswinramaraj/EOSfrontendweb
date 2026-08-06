"use client";

import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { PencilIcon } from "@/shared/components/icons";
import { useSubjects } from "@/modules/subjects/hooks/useSubjects";
import { useClasses } from "@/modules/classes/hooks/useClasses";
import type { ExamMark } from "../../types/marks";

interface MarksTableProps {
  rows: ExamMark[];
  onEdit?: (mark: ExamMark) => void;
}

export function MarksTable({ rows, onEdit }: MarksTableProps) {
  const { data: subjects } = useSubjects();
  const { data: classes } = useClasses();

  const columns: DataTableColumn<ExamMark>[] = [
    {
      key: "student",
      header: "Student",
      render: (m) => m.students.register_no ?? m.students.student_id_no,
    },
    {
      key: "subject",
      header: "Paper",
      render: (m) => {
        const subject = subjects?.find((s) => s.id === m.exam_subject_mapping.subject_id);
        return subject ? `${subject.subject_code} · ${subject.name}` : `#${m.exam_subject_mapping.subject_id}`;
      },
    },
    {
      key: "class",
      header: "Section",
      render: (m) => classes?.find((c) => c.id === m.exam_subject_mapping.class_id)?.section ?? "—",
    },
    {
      key: "marks",
      header: "Marks",
      render: (m) => (m.is_absent ? "Absent" : `${m.marks_obtained ?? "—"} / ${m.max_marks}`),
    },
    {
      key: "moderated",
      header: "",
      render: (m) => (m.is_moderated ? <StatusPill tone="amber">Moderated</StatusPill> : null),
    },
    ...(onEdit
      ? [
          {
            key: "actions",
            header: "",
            align: "right" as const,
            render: (m: ExamMark) => (
              <button onClick={() => onEdit(m)} className="text-slate-400 hover:text-blue-700" aria-label="Correct mark">
                <PencilIcon className="h-4 w-4" />
              </button>
            ),
          },
        ]
      : []),
  ];

  return <DataTable columns={columns} rows={rows} rowKey={(row) => row.id} emptyMessage="No mark entries found." />;
}
