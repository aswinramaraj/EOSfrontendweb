"use client";

import { useState } from "react";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useStudentCount } from "@/modules/students/hooks/useStudentCount";
import { pageButtonStyle } from "@/modules/placement/lib/pageButtonStyle";
import { PencilIcon, TrashIcon, BookIcon, LayersIcon } from "@/shared/components/icons";
import { useCreateClass, useDeleteCourse, useDeleteDepartment } from "../hooks/useAcademicStructureMutations";
import { CannotDeleteModal } from "./CannotDeleteModal";
import { HodPickerDialog } from "./HodPickerDialog";
import { SectionsDialog } from "./SectionsDialog";
import { ClassDialog } from "./ClassDialog";
import { formatBlockers } from "../lib/formatBlockers";
import type { Batch, Course, Department, SchoolClass } from "../types";

interface StructurePanelProps {
  department: Department;
  courses: Course[];
  batches: Batch[];
  classes: SchoolClass[];
  onEditDepartment?: () => void;
  onAddCourse?: () => void;
  onEditCourse?: (course: Course) => void;
  /** Hides every write affordance (edit/delete/add buttons, HOD assignment, section creation) — for viewers without write access to this data, e.g. the Academic Coordinator. */
  readOnly?: boolean;
}

function iconButtonStyle(danger: boolean, disabled: boolean) {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    height: 30,
    borderRadius: 7,
    border: "1px solid #dfe4ec",
    background: "#fff",
    color: disabled ? "#c3cad4" : danger ? "#b91c1c" : "#5b6577",
    cursor: disabled ? "not-allowed" : "pointer",
  } as const;
}

/** Same spinner convention as the shared Button component's isPending state — so a delete-in-flight is visible, not silent. */
function Spinner({ size = 14 }: { size?: number }) {
  return (
    <span
      className="animate-spin rounded-full border-2 border-current border-t-transparent"
      style={{ width: size, height: size, display: "inline-block" }}
      aria-hidden="true"
    />
  );
}

function Figure({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 18, fontWeight: 680, color: "#14181f" }}>{value}</span>
      <span style={{ fontSize: 10.5, color: "#8b95a6" }}>{label}</span>
    </div>
  );
}

export function StructurePanel({ department, courses, batches, classes, onEditDepartment, onAddCourse, onEditCourse, readOnly = false }: StructurePanelProps) {
  const [deptBlockers, setDeptBlockers] = useState<string[] | null>(null);
  const [hodPickerOpen, setHodPickerOpen] = useState(false);
  const [sectionsCourse, setSectionsCourse] = useState<Course | null>(null);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const deleteDepartment = useDeleteDepartment();
  const { show } = useToast();

  const departmentCourses = courses.filter((c) => c.department_id === department.id);
  const departmentClasses = classes.filter((c) => c.department_id === department.id);
  const { data: rollCount } = useStudentCount({ department_id: department.id });
  const hod = department.faculty_departments_head_of_department_faculty_idTofaculty;

  function handleDeleteDepartment() {
    deleteDepartment
      .mutateAsync(department.id)
      .then(() => show("Deleted", "success"))
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.details) {
          setDeptBlockers(formatBlockers(err.details));
        } else {
          show(err instanceof ApiError ? err.message : "Something went wrong. Please try again.", "error");
        }
      });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 680 }}>{department.name}</h2>
              <span
                style={{
                  fontFamily: "var(--font-ibm-plex-mono)",
                  fontSize: 10.5,
                  fontWeight: 650,
                  padding: "3px 7px",
                  borderRadius: 4,
                  background: "#eff2f7",
                  color: "#77808f",
                }}
              >
                {department.code}
              </span>
            </div>
            <div style={{ marginTop: 8, fontSize: 12.5, color: "#77808f" }}>
              Head of Department: {hod ? `${hod.first_name} ${hod.last_name}${hod.designation ? ` — ${hod.designation}` : ""}` : "Not assigned"}
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => setHodPickerOpen(true)}
                  style={{ marginLeft: 8, fontSize: 12, fontWeight: 600, color: "#1f4fd8", background: "none", border: "none", cursor: "pointer" }}
                >
                  {hod ? "Change" : "Assign"}
                </button>
              )}
            </div>
          </div>
          {!readOnly && (
            <div style={{ display: "flex", gap: 7 }}>
              <button type="button" onClick={onEditDepartment} title="Edit" style={iconButtonStyle(false, false)}>
                <PencilIcon style={{ width: 15, height: 15 }} />
              </button>
              <button
                type="button"
                onClick={handleDeleteDepartment}
                title={
                  departmentCourses.length > 0 || departmentClasses.length > 0
                    ? `Cannot be deleted while it has ${departmentCourses.length} courses and ${departmentClasses.length} classes`
                    : "Delete department"
                }
                disabled={departmentCourses.length > 0 || departmentClasses.length > 0 || deleteDepartment.isPending}
                style={iconButtonStyle(true, departmentCourses.length > 0 || departmentClasses.length > 0 || deleteDepartment.isPending)}
              >
                {deleteDepartment.isPending ? <Spinner size={15} /> : <TrashIcon style={{ width: 15, height: 15 }} />}
              </button>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 28, marginTop: 16 }}>
          <Figure label={departmentCourses.length === 1 ? "course" : "courses"} value={departmentCourses.length} />
          <Figure label={departmentClasses.length === 1 ? "class" : "classes"} value={departmentClasses.length} />
          <Figure label="on the roll" value={rollCount ?? "…"} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 650, color: "#3f4b60" }}>Courses</h3>
        {!readOnly && (
          <button type="button" style={pageButtonStyle(true)} onClick={onAddCourse}>
            + Add course
          </button>
        )}
      </div>

      {departmentCourses.length === 0 ? (
        <div style={{ background: "#fff", border: "1px dashed #dfe4ec", borderRadius: 12, padding: 40, textAlign: "center" }}>
          <BookIcon style={{ width: 28, height: 28, color: "#c3cad4", margin: "0 auto 10px" }} />
          <p style={{ fontSize: 13, fontWeight: 600, color: "#3f4b60", margin: 0 }}>No courses in {department.code} yet.</p>
          <p style={{ fontSize: 12, color: "#8b95a6", margin: "6px 0 14px 0", maxWidth: 360, marginLeft: "auto", marginRight: "auto" }}>
            A course is the degree — B.E. Computer Science and Engineering, M.E. Structural Engineering. Classes hang off it.
          </p>
          {!readOnly && (
            <button type="button" style={pageButtonStyle(true)} onClick={onAddCourse}>
              Add the first course
            </button>
          )}
        </div>
      ) : (
        departmentCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            batches={batches}
            classes={classes.filter((c) => c.course_id === course.id)}
            allClasses={classes}
            onEdit={() => onEditCourse?.(course)}
            onAddSections={() => setSectionsCourse(course)}
            onEditClass={setEditingClass}
            readOnly={readOnly}
          />
        ))
      )}

      {!readOnly && hodPickerOpen && (
        <HodPickerDialog open={hodPickerOpen} onClose={() => setHodPickerOpen(false)} department={department} />
      )}

      {!readOnly && sectionsCourse && (
        <SectionsDialog
          open={!!sectionsCourse}
          onClose={() => setSectionsCourse(null)}
          course={sectionsCourse}
          batches={batches}
          classes={classes}
        />
      )}

      {!readOnly && editingClass && (
        <ClassDialog
          open={!!editingClass}
          onClose={() => setEditingClass(null)}
          classItem={editingClass}
          course={departmentCourses.find((c) => c.id === editingClass.course_id) ?? departmentCourses[0]}
          batches={batches}
          classes={classes}
        />
      )}

      {!readOnly && deptBlockers && (
        <CannotDeleteModal open={!!deptBlockers} onClose={() => setDeptBlockers(null)} label={`department "${department.name}"`} blockers={deptBlockers} />
      )}
    </div>
  );
}

interface CourseCardProps {
  course: Course;
  batches: Batch[];
  classes: SchoolClass[];
  allClasses: SchoolClass[];
  onEdit: () => void;
  onAddSections: () => void;
  onEditClass: (c: SchoolClass) => void;
  readOnly?: boolean;
}

function CourseCard({ course, batches, classes, allClasses, onEdit, onAddSections, onEditClass, readOnly = false }: CourseCardProps) {
  const [blockers, setBlockers] = useState<string[] | null>(null);
  const { data: studentCount } = useStudentCount({ course_id: course.id });
  const deleteCourse = useDeleteCourse();
  const { show } = useToast();

  const batchIdsInUse = Array.from(new Set(classes.map((c) => c.batch_id)));
  const batchesInUse = batches.filter((b) => batchIdsInUse.includes(b.id));

  function handleDelete() {
    deleteCourse
      .mutateAsync(course.id)
      .then(() => show("Deleted", "success"))
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.details) {
          setBlockers(formatBlockers(err.details));
        } else {
          show(err instanceof ApiError ? err.message : "Something went wrong. Please try again.", "error");
        }
      });
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "14px 16px", borderBottom: "1px solid #eef1f6" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 650, color: "#14181f" }}>{course.name}</span>
            <span
              style={{
                fontFamily: "var(--font-ibm-plex-mono)",
                fontSize: 10,
                fontWeight: 650,
                padding: "2px 6px",
                borderRadius: 4,
                background: "#eff2f7",
                color: "#77808f",
              }}
            >
              {course.code}
            </span>
          </div>
          <p style={{ margin: "4px 0 0 0", fontSize: 11.5, color: "#8b95a6" }}>
            {course.duration_years} year{course.duration_years === 1 ? "" : "s"} · {course.duration_years * 2} semesters
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", gap: 18 }}>
            <Figure label={classes.length === 1 ? "class" : "classes"} value={classes.length} />
            <Figure label="students" value={studentCount ?? "…"} />
          </div>
          {!readOnly && (
            <div style={{ display: "flex", gap: 6 }}>
              <button type="button" onClick={onEdit} title="Edit" style={iconButtonStyle(false, false)}>
                <PencilIcon style={{ width: 14, height: 14 }} />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                title={classes.length > 0 ? `Has ${classes.length} classes — remove those first` : "Delete course"}
                disabled={classes.length > 0 || deleteCourse.isPending}
                style={iconButtonStyle(true, classes.length > 0 || deleteCourse.isPending)}
              >
                {deleteCourse.isPending ? <Spinner size={14} /> : <TrashIcon style={{ width: 14, height: 14 }} />}
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {batchesInUse.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <LayersIcon style={{ width: 22, height: 22, color: "#c3cad4", margin: "0 auto 8px" }} />
            <p style={{ fontSize: 12.5, fontWeight: 600, color: "#3f4b60", margin: 0 }}>No classes yet.</p>
            <p style={{ fontSize: 11.5, color: "#8b95a6", margin: "4px 0 0 0" }}>
              Until a section exists, the admission form has nowhere to allocate a student on this course.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {batchesInUse.map((batch) => (
              <BatchRow
                key={batch.id}
                batch={batch}
                classes={classes.filter((c) => c.batch_id === batch.id)}
                allClasses={allClasses}
                course={course}
                onEditClass={onEditClass}
                readOnly={readOnly}
              />
            ))}
          </div>
        )}
        {!readOnly && (
          <button
            type="button"
            onClick={onAddSections}
            style={{ ...pageButtonStyle(false), marginTop: 14, width: "100%" }}
          >
            {batchesInUse.length === 0 ? "Add the first sections" : "Sections for another batch"}
          </button>
        )}
      </div>

      {!readOnly && blockers && (
        <CannotDeleteModal open={!!blockers} onClose={() => setBlockers(null)} label={`course "${course.name}"`} blockers={blockers} />
      )}
    </div>
  );
}

interface BatchRowProps {
  batch: Batch;
  classes: SchoolClass[];
  allClasses: SchoolClass[];
  course: Course;
  onEditClass: (c: SchoolClass) => void;
  readOnly?: boolean;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/** First letter A-Z not already used as a section in this batch+course — the label a slot click will create. Renaming a class away from a plain letter frees that letter up again, which is expected. */
function nextAvailableLetter(takenSections: Set<string>): string | null {
  return ALPHABET.find((l) => !takenSections.has(l)) ?? null;
}

function BatchRow({ batch, classes, course, onEditClass, readOnly = false }: BatchRowProps) {
  const classIds = classes.map((c) => c.id);
  const { data: studentCount } = useStudentCount(classIds.length > 0 ? { class_id: classIds[0] } : {});
  const addSlot = useAddSlotClass(course, batch);

  const takenSections = new Set(classes.map((c) => c.section));
  const nextLetter = readOnly ? null : nextAvailableLetter(takenSections);

  return (
    <div style={{ border: "1px solid #eef1f6", borderRadius: 9, padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "#3f4b60" }}>{batch.name}</span>
        <span style={{ fontSize: 11, color: "#96a0b0" }}>
          {classes.length} {classes.length === 1 ? "class" : "classes"}
          {studentCount ? ` · ${studentCount} students` : ""}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {classes.map((cls) =>
          readOnly ? (
            <div
              key={cls.id}
              style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #dfe4ec", background: "#f8fafc", textAlign: "left" }}
            >
              <div style={{ fontSize: 13, fontWeight: 650, color: "#14181f" }}>{cls.section}</div>
              <div style={{ fontSize: 10, color: "#8b95a6", marginTop: 2 }}>
                {cls.current_semester ? `Semester ${cls.current_semester}` : "No semester set"}
              </div>
            </div>
          ) : (
            <button
              key={cls.id}
              type="button"
              onClick={() => onEditClass(cls)}
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid #dfe4ec",
                background: "#f8fafc",
                textAlign: "left",
              }}
              className="hover:border-[#1f4fd8]"
            >
              <div style={{ fontSize: 13, fontWeight: 650, color: "#14181f" }}>{cls.section}</div>
              <div style={{ fontSize: 10, color: "#8b95a6", marginTop: 2 }}>
                {cls.current_semester ? `Semester ${cls.current_semester}` : "No semester set"}
              </div>
            </button>
          ),
        )}

        {nextLetter && (
          <button
            type="button"
            onClick={() => addSlot.create(nextLetter)}
            disabled={addSlot.pending}
            title={`Create section ${nextLetter} for ${batch.name} — rename it afterward from the class editor if you want something else`}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px dashed #dfe4ec",
              background: "#fff",
              color: "#96a0b0",
              textAlign: "left",
            }}
            className="hover:border-[#1f4fd8] hover:text-[#1f4fd8]"
          >
            <div style={{ fontSize: 13, fontWeight: 650 }}>{nextLetter}</div>
            <div style={{ fontSize: 10, marginTop: 2 }}>+ Add</div>
          </button>
        )}
      </div>
    </div>
  );
}

/** Instant single-section creation (empty slot click) — no dialog, matches the reference. Not restricted to A-D. */
function useAddSlotClass(course: Course, batch: Batch) {
  const { show } = useToast();
  const createClass = useCreateClass();

  function create(section: string, onDone?: () => void) {
    createClass
      .mutateAsync({
        batch_id: batch.id,
        department_id: course.department_id,
        course_id: course.id,
        section,
      })
      .then(() => {
        show(`Section ${section} created`, "success");
        onDone?.();
      })
      .catch((err: unknown) => {
        show(err instanceof ApiError ? err.message : "Something went wrong. Please try again.", "error");
      });
  }

  return { create, pending: createClass.isPending };
}
