import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/api/client";
import type { Subscription, SubscriptionStatus } from "@/api/types";

export const subscriptionKeys = {
  forApp: (appId: string) => ["subscriptions", "app", appId] as const,
  byStatus: (status: SubscriptionStatus) => ["subscriptions", "status", status] as const,
};

export function useAppSubscriptions(appId: string) {
  return useQuery({
    queryKey: subscriptionKeys.forApp(appId),
    queryFn: async () => {
      const res = await fetchJson<Subscription[] | { message: string }>(`/apps/${appId}/subscriptions`);
      if (res && typeof res === "object" && "message" in res && !Array.isArray(res)) {
        return [];
      }
      return res as Subscription[];
    },
    enabled: !!appId,
  });
}

export function useSubscriptionsByStatus(status: SubscriptionStatus) {
  return useQuery({
    queryKey: subscriptionKeys.byStatus(status),
    queryFn: () => fetchJson<Subscription[]>(`/subscriptions?status=${status}`),
  });
}
