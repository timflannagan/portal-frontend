import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/api/client";
import type { OauthCredential } from "@/api/types";

export const oauthKeys = {
  forApp: (appId: string) => ["oauth", appId] as const,
};

export function useOauthCredentials(appId: string) {
  return useQuery({
    queryKey: oauthKeys.forApp(appId),
    queryFn: () => fetchJson<OauthCredential>(`/apps/${appId}/oauth-credentials`),
    enabled: !!appId,
    retry: false,
  });
}
