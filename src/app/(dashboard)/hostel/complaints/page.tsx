"use client";

import { useState } from "react";
import { SegmentedControl } from "@/shared/components/ui/SegmentedControl";
import { ComplaintsPanel } from "@/modules/hostel/components/complaints/ComplaintsPanel";
import { MessFeedbackPanel } from "@/modules/hostel/components/complaints/MessFeedbackPanel";

type Tab = "complaints" | "mess-feedback";

export default function ComplaintsAndFeedbackPage() {
  const [tab, setTab] = useState<Tab>("complaints");

  return (
    <div>
      <div className="mb-6">
        <SegmentedControl
          options={[
            { value: "complaints", label: "Complaints" },
            { value: "mess-feedback", label: "Mess feedback" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>
      {tab === "complaints" ? <ComplaintsPanel /> : <MessFeedbackPanel />}
    </div>
  );
}
