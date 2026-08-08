"use client";

import { useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { ApiError } from "@/shared/lib/api-client";
import { useStudentProfile, useStudentReport } from "../../hooks/useStudents";

interface StudentProfileModalProps {
  studentId: number | null;
  onClose: () => void;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-sm text-slate-800">{value ?? "—"}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-slate-100 pt-4 first:border-t-0 first:pt-0">
      <h4 className="mb-3 text-sm font-bold text-slate-900">{title}</h4>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">{children}</div>
    </div>
  );
}

export function StudentProfileModal({ studentId, onClose }: StudentProfileModalProps) {
  const open = studentId !== null;
  const { data: profile, isLoading, error } = useStudentProfile(studentId ?? undefined);
  const [showSensitive, setShowSensitive] = useState(false);
  const { data: report, isLoading: reportLoading } = useStudentReport(
    studentId ?? undefined,
    showSensitive,
  );

  return (
    <Modal open={open} onClose={onClose} title="Student profile" widthClassName="max-w-3xl">
      {isLoading && <p className="text-sm text-slate-500">Loading…</p>}
      {error && (
        <p className="text-sm text-red-600">
          {error instanceof ApiError ? error.message : "Failed to load profile."}
        </p>
      )}

      {profile && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
              {profile.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </span>
            <div>
              <p className="text-base font-bold text-slate-900">{profile.name}</p>
              <p className="text-sm text-slate-500">
                {profile.student_id_no} · {profile.course.code}
                {profile.class ? ` · ${profile.class.section}` : ""}
              </p>
            </div>
          </div>

          <Section title="Personal">
            <Field label="Roll no." value={profile.roll_no} />
            <Field label="Register no." value={profile.register_no} />
            <Field
              label="Date of birth"
              value={profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : null}
            />
            <Field label="Blood group" value={profile.blood_group} />
            <Field label="Gender" value={profile.gender} />
            <Field label="Mobile" value={profile.contacts?.student_mobile ?? profile.phone} />
            <Field label="Email" value={profile.email} />
            <Field
              label="Address"
              value={profile.addresses[0]?.address_line
                ? `${profile.addresses[0].address_line}, ${profile.addresses[0].city ?? ""}`
                : null}
            />
          </Section>

          <Section title="Academic">
            <Field label="Course" value={profile.course.name} />
            <Field label="Batch" value={profile.batch.name} />
            <Field label="Quota" value={profile.quota?.name} />
            <Field label="Department" value={profile.class?.department.name} />
          </Section>

          <Section title="Guardian">
            <Field label="Father" value={profile.family_details?.father_name} />
            <Field label="Father contact" value={profile.family_details?.father_mobile} />
            <Field label="Mother" value={profile.family_details?.mother_name} />
            <Field label="Mother contact" value={profile.family_details?.mother_mobile} />
          </Section>

          {profile.profile_links && (
            <Section title="Profile links">
              <Field
                label="LinkedIn"
                value={
                  profile.profile_links.linkedin_url ? (
                    <a href={profile.profile_links.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                      View
                    </a>
                  ) : null
                }
              />
              <Field
                label="GitHub"
                value={
                  profile.profile_links.github_url ? (
                    <a href={profile.profile_links.github_url} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                      View
                    </a>
                  ) : null
                }
              />
              <Field
                label="Resume"
                value={
                  profile.profile_links.resume_url ? (
                    <a href={profile.profile_links.resume_url} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                      View
                    </a>
                  ) : null
                }
              />
            </Section>
          )}

          <div className="border-t border-slate-100 pt-4">
            {!showSensitive ? (
              <Button size="sm" variant="secondary" onClick={() => setShowSensitive(true)}>
                View sensitive report (Aadhar/PAN)
              </Button>
            ) : reportLoading ? (
              <p className="text-sm text-slate-500">Loading sensitive report…</p>
            ) : report ? (
              <Section title="Sensitive report">
                <Field label="Aadhar number" value={report.aadhar_number} />
                <Field label="PAN number" value={report.pan_number} />
                <Field label="Official email" value={report.official_email} />
              </Section>
            ) : null}
          </div>
        </div>
      )}
    </Modal>
  );
}
