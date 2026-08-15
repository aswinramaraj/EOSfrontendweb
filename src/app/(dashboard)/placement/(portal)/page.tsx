"use client";

import { useRouter } from "next/navigation";
import { PlacementStatCard } from "@/modules/placement/components/PlacementStatCard";
import { useDashboardSummary } from "@/modules/placement/hooks/useDashboardSummary";
import { PlacementFunnelChart } from "@/modules/placement/components/dashboard/PlacementFunnelChart";
import { DepartmentPlacementRates } from "@/modules/placement/components/dashboard/DepartmentPlacementRates";
import { PackageDistributionDonut } from "@/modules/placement/components/dashboard/PackageDistributionDonut";
import { SixYearTrendChart } from "@/modules/placement/components/dashboard/SixYearTrendChart";
import { UpcomingDrivesCard } from "@/modules/placement/components/dashboard/UpcomingDrivesCard";
import { TopRecruitersCard } from "@/modules/placement/components/dashboard/TopRecruitersCard";
import { NeedsAttentionCard } from "@/modules/placement/components/dashboard/NeedsAttentionCard";
import { pageButtonStyle } from "@/modules/placement/lib/pageButtonStyle";

export default function PlacementDashboardPage() {
  const router = useRouter();
  const { data, isLoading } = useDashboardSummary();

  const eligiblePlacedPct =
    data && data.eligibleStudentsTotal > 0
      ? Math.round((data.studentsPlaced / data.eligibleStudentsTotal) * 1000) / 10
      : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <h1 style={{ margin: 0, fontSize: 26, letterSpacing: "-.7px", fontWeight: 680 }}>Placement Dashboard</h1>
          <p style={{ margin: "5px 0 0 0", fontSize: 13, color: "#77808f" }}>
            Drives, students, recruiters and outcomes for this placement cycle.
          </p>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <button style={pageButtonStyle(false)} className="hover:brightness-[1.07]">
            Export
          </button>
          <button
            onClick={() => router.push("/placement/drives/new")}
            style={pageButtonStyle(true)}
            className="hover:brightness-[1.07]"
          >
            Create drive
          </button>
        </div>
      </div>

      {isLoading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(206px,1fr))", gap: 12 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-[110px] animate-pulse rounded-xl border border-[#eef1f6] bg-[#f7f9fc]" />
          ))}
        </div>
      )}

      {!isLoading && data && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(206px,1fr))", gap: 12 }}>
            <PlacementStatCard
              label="Registered students"
              value={data.eligibleStudentsTotal.toLocaleString("en-IN")}
              caption={`Across ${data.placementRateByDepartment.length} departments`}
              progressPercent={100}
            />
            <PlacementStatCard
              label="Students placed"
              value={data.studentsPlaced.toLocaleString("en-IN")}
              caption={`of ${data.eligibleStudentsTotal.toLocaleString("en-IN")} registered`}
              progressPercent={eligiblePlacedPct}
            />
            <PlacementStatCard
              label="Placement percentage"
              value={`${data.placementPercentage}%`}
              caption={`${data.studentsPlaced.toLocaleString("en-IN")} of ${data.eligibleStudentsTotal.toLocaleString("en-IN")} registered`}
            />
            <PlacementStatCard
              label="Active drives"
              value={data.activeDrives}
              caption={`${data.drivesClosingThisWeek} closing this week`}
            />
            <PlacementStatCard
              label="Companies onboarded"
              value={data.totalCompanies}
              caption={`${data.companiesAddedThisMonth} added this month`}
            />
            <PlacementStatCard
              label="Offers released"
              value={data.funnel.offers.toLocaleString("en-IN")}
              caption={`${data.acceptedOffersCount.toLocaleString("en-IN")} accepted`}
            />
            <PlacementStatCard label="Average package" value={`₹${data.averagePackageLpa} LPA`} />
            <PlacementStatCard label="Highest package" value={`₹${data.highestPackageLpa} LPA`} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 14, alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <PlacementFunnelChart data={data.funnel} />
              <DepartmentPlacementRates data={data.placementRateByDepartment} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14 }}>
                <PackageDistributionDonut data={data.packageBands} />
                <SixYearTrendChart data={data.sixYearTrend} />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <UpcomingDrivesCard drives={data.upcomingDrives} />
              <TopRecruitersCard data={data.topRecruiters} />
              <NeedsAttentionCard data={data.attentionFlags} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
