"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { StatCard } from "@/shared/components/ui/StatCard";
import { Button } from "@/shared/components/ui/Button";
import {
  BarChartIcon,
  BriefcaseIcon,
  CalendarIcon,
  PeopleIcon,
  PlusIcon,
  RupeeIcon,
  CheckIcon,
} from "@/shared/components/icons";
import { useDashboardSummary } from "@/modules/placement/hooks/useDashboardSummary";
import { OffersByMonthChart } from "@/modules/placement/components/dashboard/OffersByMonthChart";
import { DepartmentPlacementRates } from "@/modules/placement/components/dashboard/DepartmentPlacementRates";
import { UpcomingDrivesCard } from "@/modules/placement/components/dashboard/UpcomingDrivesCard";

export default function PlacementDashboardPage() {
  const router = useRouter();
  const { data, isLoading } = useDashboardSummary();

  const tiles = data
    ? [
        {
          label: "Total companies",
          value: data.totalCompanies,
          icon: BriefcaseIcon,
          caption: `${data.companiesAddedThisMonth} added this month`,
        },
        {
          label: "Active drives",
          value: data.activeDrives,
          icon: CalendarIcon,
          caption: `${data.drivesClosingThisWeek} close this week`,
        },
        {
          label: "Students in process",
          value: data.studentsInProcess,
          icon: PeopleIcon,
          caption: `Across ${data.studentsInProcessDriveCount} drives`,
        },
        {
          label: "Students placed",
          value: data.studentsPlaced,
          icon: CheckIcon,
          caption: `+${data.studentsPlacedYoyPct}% vs last year`,
        },
        {
          label: "Placement percentage",
          value: `${data.placementPercentage}%`,
          icon: BarChartIcon,
        },
        {
          label: "Highest / average",
          value: `₹${data.highestPackageLpa} LPA`,
          icon: RupeeIcon,
          caption: `Average ₹${data.averagePackageLpa} LPA`,
        },
      ]
    : [];

  return (
    <div>
      <PageHeader
        title="Placement Dashboard"
        actions={
          <Button variant="primary" onClick={() => router.push("/placement/drives/new")}>
            <PlusIcon className="h-4 w-4" /> Schedule drive
          </Button>
        }
      />

      {isLoading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32.5 animate-pulse rounded-lg border border-slate-200 bg-slate-50" />
          ))}
        </div>
      )}

      {!isLoading && data && (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {tiles.map((tile) => (
              <StatCard key={tile.label} label={tile.label} value={tile.value} icon={tile.icon} caption={tile.caption} />
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
            <div className="flex flex-col gap-5">
              <OffersByMonthChart data={data.offersByMonth} />
              <UpcomingDrivesCard drives={data.upcomingDrives} />
            </div>
            <DepartmentPlacementRates data={data.placementRateByDepartment} />
          </div>
        </>
      )}
    </div>
  );
}
