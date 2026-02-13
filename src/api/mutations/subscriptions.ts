import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson, fetchApi } from "@/api/client";
import { subscriptionKeys } from "@/api/queries/subscriptions";
import type { Subscription } from "@/api/types";

export function useCreateSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ appId, apiProductId }: { appId: string; apiProductId: string }) =>
      fetchJson<Subscription>(`/apps/${appId}/subscriptions`, {
        method: "POST",
        body: JSON.stringify({ apiProductId }),
      }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: subscriptionKeys.forApp(vars.appId) });
      qc.invalidateQueries({ queryKey: ["subscriptions", "status"] });
    },
  });
}

export function useDeleteSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ subscriptionId }: { subscriptionId: string; appId: string }) =>
      fetchApi(`/subscriptions/${subscriptionId}`, { method: "DELETE" }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: subscriptionKeys.forApp(vars.appId) });
      qc.invalidateQueries({ queryKey: ["subscriptions", "status"] });
    },
  });
}

export function useApproveSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (subscriptionId: string) =>
      fetchJson<void>(`/subscriptions/${subscriptionId}/approve`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subscriptions"] }),
  });
}

export function useRejectSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (subscriptionId: string) =>
      fetchJson<void>(`/subscriptions/${subscriptionId}/reject`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subscriptions"] }),
  });
}

export function useUpsertSubscriptionMetadata() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      subscriptionId,
      customMetadata,
      rateLimit,
    }: {
      subscriptionId: string;
      customMetadata?: Record<string, string>;
      rateLimit?: { requestsPerUnit: string; unit: string };
    }) =>
      fetchJson<void>(`/subscriptions/${subscriptionId}/metadata`, {
        method: "POST",
        body: JSON.stringify({ subscriptionId, customMetadata, rateLimit }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subscriptions"] }),
  });
}
