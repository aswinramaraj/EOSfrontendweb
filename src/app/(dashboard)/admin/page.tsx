"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { StatCard } from "@/shared/components/ui/StatCard";
import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";
import { useClasses } from "@/modules/classes/hooks/useClasses";
import { authService } from "@/modules/auth/services/auth.service";
import { requireToken } from "@/shared/lib/auth-token";

export default function AdminDashboardPage() {
  const user = useAuthUser();
  const { data: classes } = useClasses();
  const { data: profile } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authService.getMe(requireToken()),
    enabled: !!user,
  });

  const totalClasses = classes?.length ?? 0;
  const assignedAdvisors = classes?.filter((c) => c.mentor !== null).length ?? 0;
  const unassigned = totalClasses - assignedAdvisors;

  return (
    <div>
      <PageHeader
        title="Admin dashboard"
        description={profile ? `Welcome, ${profile.email}` : "Welcome"}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total classes" value={totalClasses} />
        <StatCard label="Advisors assigned" value={assignedAdvisors} />
        <StatCard label="Classes without an advisor" value={unassigned} />
      </div>
    </div>
  );
}
