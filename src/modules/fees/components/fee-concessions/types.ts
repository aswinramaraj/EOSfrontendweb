export interface FeeConcession {
  id: number;
  concessionAmount: number;
  isSettled: boolean;
  settledDate: string | null;
}

export interface FeeConcessionFormValues {
  concessionAmount: number;
  isSettled: boolean;
  settledDate: string | null;
}
