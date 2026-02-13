import { useQuery } from "@tanstack/react-query";
import { fetchJson, ApiError } from "@/api/client";
import type { User } from "@/api/types";

export const userKeys = {
  me: ["user", "me"] as const,
};

export function useCurrentUser(enabled = true) {
  return useQuery({
    queryKey: userKeys.me,
    queryFn: () => fetchJson<User>("/me"),
    enabled,
    // In OIDC mode, 401 means no session — treat as "no user", not an error.
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 401) return false;
      return failureCount < 3;
    },
  });
}
