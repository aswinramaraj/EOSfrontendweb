"use client";

import { useState } from "react";
import { SegmentedControl } from "@/shared/components/ui/SegmentedControl";
import { CategoriesPanel } from "@/modules/library/components/catalogue-setup/CategoriesPanel";
import { RacksPanel } from "@/modules/library/components/catalogue-setup/RacksPanel";

type Tab = "categories" | "racks";

export default function CatalogueSetupPage() {
  const [tab, setTab] = useState<Tab>("categories");

  return (
    <div>
      <div className="mb-6">
        <SegmentedControl
          options={[
            { value: "categories", label: "Categories" },
            { value: "racks", label: "Racks" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>
      {tab === "categories" ? <CategoriesPanel /> : <RacksPanel />}
    </div>
  );
}
