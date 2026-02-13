import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/api/client";
import type { Team, Member } from "@/api/types";

export const teamKeys = {
  all: ["teams"] as const,
  detail: (id: string) => ["teams", id] as const,
  members: (teamId: string) => ["teams", teamId, "members"] as const,
};

export function useTeams() {
  return useQuery({
    queryKey: teamKeys.all,
    queryFn: () => fetchJson<Team[]>("/teams"),
  });
}

export function useTeam(teamId: string) {
  return useQuery({
    queryKey: teamKeys.detail(teamId),
    queryFn: () => fetchJson<Team>(`/teams/${teamId}`),
    enabled: !!teamId,
  });
}

export function useTeamMembers(teamId: string) {
  return useQuery({
    queryKey: teamKeys.members(teamId),
    queryFn: () => fetchJson<Member[]>(`/teams/${teamId}/members`),
    enabled: !!teamId,
  });
}
