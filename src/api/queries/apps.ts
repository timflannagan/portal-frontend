import { useQuery, useQueries } from "@tanstack/react-query";
import { fetchJson } from "@/api/client";
import type { App, Team } from "@/api/types";

export const appKeys = {
  forTeam: (teamId: string) => ["apps", "team", teamId] as const,
  all: ["apps", "all"] as const,
  detail: (appId: string) => ["apps", appId] as const,
};

export function useTeamApps(teamId: string) {
  return useQuery({
    queryKey: appKeys.forTeam(teamId),
    queryFn: () => fetchJson<App[]>(`/teams/${teamId}/apps`),
    enabled: !!teamId,
  });
}

export function useAllApps(teams: Team[] | undefined) {
  const queries = useQueries({
    queries: (teams ?? []).map((team) => ({
      queryKey: appKeys.forTeam(team.id),
      queryFn: () => fetchJson<App[]>(`/teams/${team.id}/apps`),
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);
  const apps = queries
    .filter((q) => q.isSuccess)
    .flatMap((q) => q.data ?? []);

  return { apps, isLoading, queries };
}

export function useApp(appId: string) {
  return useQuery({
    queryKey: appKeys.detail(appId),
    queryFn: () => fetchJson<App>(`/apps/${appId}`),
    enabled: !!appId,
  });
}
