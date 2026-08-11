"use client";

import { useState } from "react";
import { SegmentedControl } from "@/shared/components/ui/SegmentedControl";
import { RoomsPanel } from "@/modules/hostel/components/rooms/RoomsPanel";
import { RoomTypesPanel } from "@/modules/hostel/components/rooms/RoomTypesPanel";

type Tab = "rooms" | "room-types";

export default function RoomsAndOccupancyPage() {
  const [tab, setTab] = useState<Tab>("rooms");

  return (
    <div>
      <div className="mb-6">
        <SegmentedControl
          options={[
            { value: "rooms", label: "Rooms" },
            { value: "room-types", label: "Room types" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>
      {tab === "rooms" ? <RoomsPanel /> : <RoomTypesPanel />}
    </div>
  );
}
