import { useQuery, useQueries } from "@tanstack/react-query";
import { fetchJson } from "@/api/client";
import type { Subscription, SubscriptionStatus, App } from "@/api/types";
import { useTeams } from "./teams";

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

function getSubscriptionStatus(sub: Subscription): SubscriptionStatus {
  if (sub.approved) return "approved";
  if (sub.rejected) return "rejected";
  return "pending";
}

export function useAllSubscriptions() {
  const { data: teams, isLoading: teamsLoading } = useTeams();

  const appQueries = useQueries({
    queries: (teams ?? []).map((team) => ({
      queryKey: ["apps", "team", team.id] as const,
      queryFn: () => fetchJson<App[]>(`/teams/${team.id}/apps`),
      enabled: !!teams?.length,
    })),
  });

  const apps = appQueries.flatMap((q) => q.data ?? []);
  const appsLoading = appQueries.some((q) => q.isLoading);

  const subQueries = useQueries({
    queries: apps.map((app) => ({
      queryKey: subscriptionKeys.forApp(app.id),
      queryFn: async () => {
        const res = await fetchJson<Subscription[] | { message: string }>(`/apps/${app.id}/subscriptions`);
        if (res && typeof res === "object" && "message" in res && !Array.isArray(res)) {
          return [];
        }
        return res as Subscription[];
      },
      enabled: apps.length > 0,
    })),
  });

  const subsLoading = subQueries.some((q) => q.isLoading);
  const allSubs = subQueries.flatMap((q) => q.data ?? []);

  // Build a map of productId -> best status
  const statusByProduct = new Map<string, SubscriptionStatus>();
  for (const sub of allSubs) {
    const subStatus = getSubscriptionStatus(sub);
    const existing = statusByProduct.get(sub.apiProductId);
    // Priority: approved > pending > rejected
    if (!existing || 
        (subStatus === "approved") ||
        (subStatus === "pending" && existing === "rejected")) {
      statusByProduct.set(sub.apiProductId, subStatus);
    }
  }

  return {
    subscriptions: allSubs,
    statusByProduct,
    isLoading: teamsLoading || appsLoading || subsLoading,
  };
}

export function useProductSubscriptionStatus(productId: string) {
  const { data: teams, isLoading: teamsLoading } = useTeams();

  const appQueries = useQueries({
    queries: (teams ?? []).map((team) => ({
      queryKey: ["apps", "team", team.id] as const,
      queryFn: () => fetchJson<App[]>(`/teams/${team.id}/apps`),
      enabled: !!teams?.length,
    })),
  });

  const apps = appQueries.flatMap((q) => q.data ?? []);
  const appsLoading = appQueries.some((q) => q.isLoading);

  const subQueries = useQueries({
    queries: apps.map((app) => ({
      queryKey: subscriptionKeys.forApp(app.id),
      queryFn: async () => {
        const res = await fetchJson<Subscription[] | { message: string }>(`/apps/${app.id}/subscriptions`);
        if (res && typeof res === "object" && "message" in res && !Array.isArray(res)) {
          return [];
        }
        return res as Subscription[];
      },
      enabled: apps.length > 0,
    })),
  });

  const subsLoading = subQueries.some((q) => q.isLoading);
  const allSubs = subQueries.flatMap((q) => q.data ?? []);

  const productSubs = allSubs.filter((s) => s.apiProductId === productId);

  // Determine the "best" status for display: approved > pending > rejected
  const statuses = productSubs.map(getSubscriptionStatus);
  let status: SubscriptionStatus | null = null;
  if (statuses.includes("approved")) {
    status = "approved";
  } else if (statuses.includes("pending")) {
    status = "pending";
  } else if (statuses.includes("rejected")) {
    status = "rejected";
  }

  return {
    status,
    subscriptions: productSubs,
    isLoading: teamsLoading || appsLoading || subsLoading,
  };
}
