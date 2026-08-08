// Same resourceKeys() factory hostel/library use — params objects hash
// structurally into the key array.
function resourceKeys(all: readonly unknown[]) {
  return {
    all: () => all,
    list: (params: object = {}) => [...all, "list", params] as const,
    detail: (id: number | string) => [...all, "detail", id] as const,
  };
}

const base = ["iqac"] as const;

export const iqacKeys = {
  all: base,
  dashboardSummary: () => [...base, "dashboard", "summary"] as const,
  dashboardLiveStatus: () => [...base, "dashboard", "live-status"] as const,
  venues: resourceKeys([...base, "venues"]),
  venueBookings: resourceKeys([...base, "venue-bookings"]),
  studentOds: resourceKeys([...base, "student-ods"]),
  facultyOds: resourceKeys([...base, "faculty-ods"]),
  reports: {
    preview: (type: string, filters: object = {}) => [...base, "reports", type, filters] as const,
    venueHistory: (date: string) => [...base, "reports", "venue-history", date] as const,
  },
};
