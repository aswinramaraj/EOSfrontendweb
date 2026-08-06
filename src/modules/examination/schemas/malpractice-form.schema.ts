import { z } from "zod";
import { optionalNumber, optionalText } from "@/shared/lib/zod-helpers";

const NATURE_VALUES = [
  "unauthorised_material",
  "copying",
  "mobile_device",
  "impersonation",
  "misbehaviour_with_invigilator",
  "answer_script_tampering",
] as const;

const ACTION_VALUES = [
  "reported_to_coe",
  "warning_issued",
  "paper_cancelled",
  "semester_cancelled",
  "debarred_one_year",
  "case_under_enquiry",
] as const;

export const malpracticeFormSchema = z
  .object({
    student_id: optionalNumber({ int: true, min: 1 }),
    exam_subject_mapping_id: optionalNumber({ int: true, min: 1 }),
    venue_id: optionalNumber({ int: true, min: 1 }),
    incident_date: z.string().min(1, "Date is required"),
    session: z.enum(["FN", "AN"]),
    seat_number: optionalText(20),
    nature: z.enum(NATURE_VALUES),
    action_taken: z.enum(ACTION_VALUES),
    invigilator_remarks: optionalText(1000),
    reported_by_faculty_id: optionalNumber({ int: true, min: 1 }),
  })
  .refine((v) => v.student_id !== undefined, {
    path: ["student_id"],
    message: "Student ID is required",
  });

export type MalpracticeFormValues = z.infer<typeof malpracticeFormSchema>;

export const NATURE_LABELS: Record<(typeof NATURE_VALUES)[number], string> = {
  unauthorised_material: "Unauthorised material",
  copying: "Copying",
  mobile_device: "Mobile device",
  impersonation: "Impersonation",
  misbehaviour_with_invigilator: "Misbehaviour with invigilator",
  answer_script_tampering: "Answer script tampering",
};

export const ACTION_LABELS: Record<(typeof ACTION_VALUES)[number], string> = {
  reported_to_coe: "Reported to COE",
  warning_issued: "Warning issued",
  paper_cancelled: "Paper cancelled",
  semester_cancelled: "Semester cancelled",
  debarred_one_year: "Debarred one year",
  case_under_enquiry: "Case under enquiry",
};
