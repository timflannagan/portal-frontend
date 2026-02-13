import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson, fetchApi } from "@/api/client";
import { oauthKeys } from "@/api/queries/oauth";
import type { OauthCredential } from "@/api/types";

export function useCreateOauthCredential() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (appId: string) =>
      fetchJson<OauthCredential>(`/apps/${appId}/oauth-credentials`, { method: "POST" }),
    onSuccess: (_, appId) => qc.invalidateQueries({ queryKey: oauthKeys.forApp(appId) }),
  });
}

export function useDeleteOauthCredential() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ credentialId }: { credentialId: string; appId: string }) =>
      fetchApi(`/oauth-credentials/${credentialId}`, { method: "DELETE" }),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: oauthKeys.forApp(vars.appId) }),
  });
}
