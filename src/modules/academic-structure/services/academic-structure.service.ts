import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import type {
  AssignHodInput,
  Batch,
  ClassSubject,
  Course,
  CreateBatchInput,
  CreateClassInput,
  CreateCourseInput,
  CreateDepartmentInput,
  Department,
  FacultyOption,
  PaginatedResponse,
  SchoolClass,
  UpdateBatchInput,
  UpdateClassInput,
  UpdateCourseInput,
  UpdateDepartmentInput,
} from "../types";

export const academicStructureService = {
  // Departments
  listDepartments: (): Promise<Department[]> => apiClient.get("/departments", requireToken()),
  createDepartment: (input: CreateDepartmentInput): Promise<Department> =>
    apiClient.post("/departments", input, requireToken()),
  updateDepartment: (id: number, input: UpdateDepartmentInput): Promise<Department> =>
    apiClient.patch(`/departments/${id}`, input, requireToken()),
  deleteDepartment: (id: number): Promise<{ message: string }> =>
    apiClient.delete(`/departments/${id}`, requireToken()),
  assignHod: (id: number, input: AssignHodInput): Promise<Department> =>
    apiClient.patch(`/departments/${id}/hod`, input, requireToken()),

  // Courses
  listCourses: (): Promise<Course[]> => apiClient.get("/courses", requireToken()),
  createCourse: (input: CreateCourseInput): Promise<Course> =>
    apiClient.post("/courses", input, requireToken()),
  updateCourse: (id: number, input: UpdateCourseInput): Promise<Course> =>
    apiClient.patch(`/courses/${id}`, input, requireToken()),
  deleteCourse: (id: number): Promise<{ message: string }> =>
    apiClient.delete(`/courses/${id}`, requireToken()),

  // Batches
  listBatches: (): Promise<Batch[]> => apiClient.get("/batches", requireToken()),
  createBatch: (input: CreateBatchInput): Promise<Batch> =>
    apiClient.post("/batches", input, requireToken()),
  updateBatch: (id: number, input: UpdateBatchInput): Promise<Batch> =>
    apiClient.patch(`/batches/${id}`, input, requireToken()),
  deleteBatch: (id: number): Promise<{ message: string }> =>
    apiClient.delete(`/batches/${id}`, requireToken()),

  // Classes
  listClasses: (): Promise<SchoolClass[]> => apiClient.get("/classes", requireToken()),
  createClass: (input: CreateClassInput): Promise<SchoolClass> =>
    apiClient.post("/classes", input, requireToken()),
  updateClass: (id: number, input: UpdateClassInput): Promise<SchoolClass> =>
    apiClient.patch(`/classes/${id}`, input, requireToken()),
  deleteClass: (id: number): Promise<{ message: string }> =>
    apiClient.delete(`/classes/${id}`, requireToken()),
  classSubjects: (id: number): Promise<ClassSubject[]> =>
    apiClient.get(`/classes/${id}/subjects`, requireToken()),

  // Faculty lookup, scoped to a department — for the HoD picker.
  facultyInDepartment: (departmentId: number): Promise<PaginatedResponse<FacultyOption>> =>
    apiClient.get(`/me/faculty?department_id=${departmentId}&status=active&limit=100`, requireToken()),
};
