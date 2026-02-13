import { useCallback, useSyncExternalStore } from "react";
import { getToken, setToken, clearToken } from "@/api/client";
import { useCurrentUser } from "@/api/queries/users";
import { useSyncUser } from "@/api/mutations/users";
import { queryClient } from "@/lib/query-client";

// Simple external store for token reactivity
let listeners: Array<() => void> = [];
function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}
function emitChange() {
  for (const listener of listeners) listener();
}

export function useAuth() {
  const token = useSyncExternalStore(subscribe, getToken, () => null);
  const isAuthenticated = !!token;

  const { data: user, isLoading: isLoadingUser } = useCurrentUser(isAuthenticated);
  const syncUser = useSyncUser();

  const login = useCallback(
    async (newToken: string) => {
      setToken(newToken);
      emitChange();
      // Sync user with backend on first auth
      try {
        await syncUser.mutateAsync();
      } catch {
        // sync is best-effort
      }
    },
    [syncUser],
  );

  const logout = useCallback(() => {
    clearToken();
    emitChange();
    queryClient.clear();
  }, []);

  return {
    token,
    user,
    isAuthenticated,
    isLoadingUser,
    login,
    logout,
  };
}
