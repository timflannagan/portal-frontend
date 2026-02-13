import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson, fetchApi } from "@/api/client";
import { apiKeyKeys } from "@/api/queries/api-keys";
import type { ApiKey } from "@/api/types";

export function useCreateApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ appId, apiKeyName }: { appId: string; apiKeyName: string }) =>
      fetchJson<ApiKey>(`/apps/${appId}/api-keys`, {
        method: "POST",
        body: JSON.stringify({ apiKeyName }),
      }),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: apiKeyKeys.forApp(vars.appId) }),
  });
}

export function useDeleteApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ keyId }: { keyId: string; appId: string }) =>
      fetchApi(`/api-keys/${keyId}`, { method: "DELETE" }),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: apiKeyKeys.forApp(vars.appId) }),
  });
}
