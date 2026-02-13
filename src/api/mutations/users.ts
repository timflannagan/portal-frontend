import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/api/client";
import { userKeys } from "@/api/queries/users";

export function useSyncUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => fetchJson<void>("/me", { method: "PUT" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.me }),
  });
}
