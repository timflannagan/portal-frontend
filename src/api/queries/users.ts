import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/api/client";
import type { User } from "@/api/types";

export const userKeys = {
  me: ["user", "me"] as const,
};

export function useCurrentUser(enabled = true) {
  return useQuery({
    queryKey: userKeys.me,
    queryFn: () => fetchJson<User>("/me"),
    enabled,
  });
}
