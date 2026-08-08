import type { FacultyMapping } from "../types/faculty-mapping";

export function subjectLabel(mapping: FacultyMapping): string {
  return mapping.subject.name;
}

export function classLabel(mapping: FacultyMapping): string {
  return `${mapping.class.department.code} · Section ${mapping.class.section}`;
}
