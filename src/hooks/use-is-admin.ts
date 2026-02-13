import { useAuth } from "./use-auth";

export function useIsAdmin(): boolean {
  const { user } = useAuth();
  return user?.isAdmin === "true";
}
