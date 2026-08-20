"use client";

import { useState } from "react";
import { GlobeIcon, PackageIcon } from "@/shared/components/icons";
import { ProductRequestsPanel } from "./ProductRequestsPanel";
import { ServiceRequestsPanel } from "./ServiceRequestsPanel";

type ProposalTab = "pop" | "sop";

export function ProposalsWorkspace() {
  const [tab, setTab] = useState<ProposalTab>("pop");

  return (
    <div>
      <div className="mx-auto mb-[22px] max-w-[1180px]">
        <div className="inline-flex gap-1 rounded-[14px] border border-blue-200 bg-blue-50 p-1">
          <button
            onClick={() => setTab("pop")}
            className={`flex items-center gap-2 rounded-[11px] px-5 py-[9px] text-[14.5px] font-semibold transition-colors ${
              tab === "pop" ? "bg-blue-600 text-white shadow-[0_2px_6px_rgba(37,99,235,0.25)]" : "text-blue-700"
            }`}
          >
            <PackageIcon className="h-4 w-4" /> POP
          </button>
          <button
            onClick={() => setTab("sop")}
            className={`flex items-center gap-2 rounded-[11px] px-5 py-[9px] text-[14.5px] font-semibold transition-colors ${
              tab === "sop" ? "bg-blue-600 text-white shadow-[0_2px_6px_rgba(37,99,235,0.25)]" : "text-blue-700"
            }`}
          >
            <GlobeIcon className="h-4 w-4" /> SOP
          </button>
        </div>
      </div>
      {tab === "pop" ? <ProductRequestsPanel /> : <ServiceRequestsPanel />}
    </div>
  );
}
