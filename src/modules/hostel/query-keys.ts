// See library/query-keys.ts's comment — params objects are passed straight
// into the key array (structural hashing), and `object` is used instead of
// Record<string, unknown> so declared params interfaces don't need a cast.
function resourceKeys(all: readonly unknown[]) {
  return {
    all: () => all,
    list: (params: object = {}) => [...all, "list", params] as const,
    detail: (id: number | string) => [...all, "detail", id] as const,
  };
}

const base = ["hostel"] as const;

export const hostelKeys = {
  all: base,
  dashboard: () => [...base, "dashboard"] as const,
  hostels: resourceKeys([...base, "hostels"]),
  roomTypes: resourceKeys([...base, "room-types"]),
  rooms: resourceKeys([...base, "rooms"]),
  residents: resourceKeys([...base, "residents"]),
  outings: resourceKeys([...base, "outings"]),
  gateLog: resourceKeys([...base, "gate-log"]),
  complaints: resourceKeys([...base, "complaints"]),
  messFeedback: resourceKeys([...base, "mess-feedback"]),
  fees: resourceKeys([...base, "fees"]),
  settings: () => [...base, "settings"] as const,
  reports: {
    preview: (key: string, filters: object = {}) =>
      [...base, "reports", key, filters] as const,
  },
};
