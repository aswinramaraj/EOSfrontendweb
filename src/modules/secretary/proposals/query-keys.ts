const base = ["secretary", "proposals"] as const;

export const proposalsKeys = {
  serviceRequests: {
    all: () => [...base, "service-requests"] as const,
    list: (status?: string) => [...base, "service-requests", "list", status ?? "all"] as const,
  },
  productRequests: {
    all: () => [...base, "product-requests"] as const,
    list: (status?: string) => [...base, "product-requests", "list", status ?? "all"] as const,
  },
};
