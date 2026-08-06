import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";

/** Gates publish/withdraw-tier actions across the examination module. */
export function useIsSeniorCoe(): boolean {
  const user = useAuthUser();
  return !!user?.isSeniorCoe;
}
