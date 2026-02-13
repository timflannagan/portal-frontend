import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson, fetchApi } from "@/api/client";
import { appKeys } from "@/api/queries/apps";
import type { App } from "@/api/types";

export function useCreateApp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, ...data }: { teamId: string; name: string; description: string }) =>
      fetchJson<App>(`/teams/${teamId}/apps`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: appKeys.forTeam(vars.teamId) });
      qc.invalidateQueries({ queryKey: appKeys.all });
    },
  });
}

export function useUpdateApp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ appId, ...data }: { appId: string; name: string; description: string }) =>
      fetchJson<void>(`/apps/${appId}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: appKeys.detail(vars.appId) });
      qc.invalidateQueries({ queryKey: appKeys.all });
    },
  });
}

export function useDeleteApp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (appId: string) => fetchApi(`/apps/${appId}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["apps"] });
    },
  });
}

export function useUpsertAppMetadata() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      appId,
      customMetadata,
      rateLimit,
    }: {
      appId: string;
      customMetadata?: Record<string, string>;
      rateLimit?: { requestsPerUnit: string; unit: string };
    }) =>
      fetchJson<void>(`/apps/${appId}/metadata`, {
        method: "POST",
        body: JSON.stringify({ appId, customMetadata, rateLimit }),
      }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: appKeys.detail(vars.appId) });
    },
  });
}
