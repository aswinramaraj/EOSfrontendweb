const base = ["hr"] as const;

export const hrKeys = {
  all: base,
  dashboard: () => [...base, "dashboard"] as const,
  departments: {
    all: () => [...base, "departments"] as const,
    detail: (id: number) => [...base, "departments", "detail", id] as const,
  },
  requests: {
    list: (params: object = {}) => [...base, "requests", "list", params] as const,
  },
  appraisalDivisions: () => [...base, "appraisal-divisions"] as const,
  appraisalCriteria: {
    list: (params: object = {}) => [...base, "appraisal-criteria", "list", params] as const,
  },
  appraisalRequests: {
    list: (params: object = {}) => [...base, "appraisal-requests", "list", params] as const,
    detail: (id: number) => [...base, "appraisal-requests", "detail", id] as const,
  },
  payroll: {
    list: (params: object = {}) => [...base, "payroll", "list", params] as const,
  },
  payslipRequests: {
    list: (params: object = {}) => [...base, "payslip-requests", "list", params] as const,
  },
};
