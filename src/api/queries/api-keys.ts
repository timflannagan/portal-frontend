import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/api/client";
import type { ApiKey } from "@/api/types";

export const apiKeyKeys = {
  forApp: (appId: string) => ["api-keys", appId] as const,
};

export function useApiKeys(appId: string) {
  return useQuery({
    queryKey: apiKeyKeys.forApp(appId),
    queryFn: () => fetchJson<ApiKey[]>(`/apps/${appId}/api-keys`),
    enabled: !!appId,
  });
}
