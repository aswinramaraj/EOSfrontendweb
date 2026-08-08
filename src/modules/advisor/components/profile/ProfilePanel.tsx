"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { FormField } from "@/shared/components/ui/FormField";
import { TextInput } from "@/shared/components/ui/TextInput";
import { Button } from "@/shared/components/ui/Button";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useOwnProfile, useUpdateOwnProfile } from "@/modules/faculty/hooks/useOwnProfile";
import { useMenteeClasses } from "../../hooks/useStudents";
import type { UpdateOwnProfileInput } from "@/modules/faculty/types";

export function ProfilePanel() {
  const { show } = useToast();
  const { data: profile, isLoading, error } = useOwnProfile();
  const { data: menteeClasses } = useMenteeClasses();
  const updateProfile = useUpdateOwnProfile();

  const { register, handleSubmit, reset } = useForm<UpdateOwnProfileInput>({
    defaultValues: { first_name: "", last_name: "" },
  });

  useEffect(() => {
    if (profile) {
      reset({ first_name: profile.first_name, last_name: profile.last_name ?? "" });
    }
  }, [profile, reset]);

  function onSubmit(values: UpdateOwnProfileInput) {
    updateProfile
      .mutateAsync(values)
      .then(() => show("Profile updated.", "success"))
      .catch((err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"));
  }

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  if (error) {
    const isForbidden = error instanceof ApiError && error.statusCode === 403;
    return (
      <div>
        <PageHeader title="Profile" />
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
          <p className="text-sm font-medium text-slate-700">
            {isForbidden
              ? "You don't have permission to view this profile."
              : "Something went wrong while loading your profile."}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {error instanceof ApiError ? error.message : "Please try again later."}
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  return (
    <div>
      <PageHeader title="Profile" description="Your faculty profile and advisor assignments." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white p-6">
          <div className="mb-5 flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
              {profile.first_name[0]}
              {profile.last_name?.[0] ?? ""}
            </span>
            <div>
              <p className="text-base font-bold text-slate-900">
                {profile.first_name} {profile.last_name}
              </p>
              <p className="text-sm text-slate-500">
                {profile.designation ?? "Faculty"} · {profile.department.name}
              </p>
              <p className="text-sm text-slate-500">
                {profile.email} {profile.phone ? `· ${profile.phone}` : ""}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="First name" htmlFor="profile-first-name">
                <TextInput id="profile-first-name" {...register("first_name")} />
              </FormField>
              <FormField label="Last name" htmlFor="profile-last-name">
                <TextInput id="profile-last-name" {...register("last_name")} />
              </FormField>
            </div>

            <div className="mt-2 flex justify-end">
              <Button type="submit" variant="primary" isPending={updateProfile.isPending}>
                Save changes
              </Button>
            </div>
          </form>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h4 className="mb-3 text-sm font-bold text-slate-900">Advisor assignments</h4>
          {!menteeClasses || menteeClasses.length === 0 ? (
            <p className="text-sm text-slate-500">Not currently assigned as a class advisor.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {menteeClasses.map((c, index) => (
                <li key={`${c.class_id}-${c.academic_year ?? index}`} className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {c.label} <span className="text-slate-400">· {c.academic_year}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
