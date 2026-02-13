import { useCallback, useSyncExternalStore } from "react";
import { getToken, setToken, clearToken } from "@/api/client";
import { useCurrentUser } from "@/api/queries/users";
import { useSyncUser } from "@/api/mutations/users";
import { queryClient } from "@/lib/query-client";
import { env } from "@/config/env";

// Simple external store for token reactivity (token mode only)
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
  const syncUser = useSyncUser();

  // In OIDC mode, always try to fetch the user (session cookie handles auth).
  // In token mode, only fetch when a token is present.
  const shouldFetchUser = env.oidcEnabled ? true : !!token;

  const { data: user, isLoading: isLoadingUser } = useCurrentUser(shouldFetchUser);

  // In OIDC mode, we're authenticated if /v1/me returned a user.
  // In token mode, we're authenticated if a token exists.
  const isAuthenticated = env.oidcEnabled ? !!user : !!token;

  const login = useCallback(
    async (newToken?: string) => {
      if (env.oidcEnabled) {
        // Redirect to the OIDC login path — ExtAuth handles the rest.
        window.location.href = env.oidcCallbackPath;
        return;
      }
      if (!newToken) return;
      setToken(newToken);
      emitChange();
      try {
        await syncUser.mutateAsync();
      } catch {
        // sync is best-effort
      }
    },
    [syncUser],
  );

  const logout = useCallback(() => {
    if (env.oidcEnabled) {
      // Redirect to the OIDC logout path — ExtAuth clears the session.
      window.location.href = env.oidcLogoutPath;
      return;
    }
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
