import { useAuth } from "./use-auth";

export function useIsAdmin(): boolean {
  const { user } = useAuth();
  // Backend may return isAdmin as boolean or string depending on auth mode.
  return user?.isAdmin === true || user?.isAdmin === "true";
}
