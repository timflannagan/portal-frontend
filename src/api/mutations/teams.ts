import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson, fetchApi } from "@/api/client";
import { teamKeys } from "@/api/queries/teams";
import type { Team } from "@/api/types";

export function useCreateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description: string }) =>
      fetchJson<Team>("/teams", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: teamKeys.all }),
  });
}

export function useUpdateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, ...data }: { teamId: string; name: string; description: string }) =>
      fetchJson<void>(`/teams/${teamId}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: teamKeys.all });
      qc.invalidateQueries({ queryKey: teamKeys.detail(vars.teamId) });
    },
  });
}

export function useDeleteTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (teamId: string) => fetchApi(`/teams/${teamId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: teamKeys.all }),
  });
}

export function useAddTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, email }: { teamId: string; email: string }) =>
      fetchJson<void>(`/teams/${teamId}/members`, {
        method: "POST",
        body: JSON.stringify({ email, teamId }),
      }),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: teamKeys.members(vars.teamId) }),
  });
}

export function useRemoveTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, memberId }: { teamId: string; memberId: string }) =>
      fetchApi(`/teams/${teamId}/members/${memberId}`, { method: "DELETE" }),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: teamKeys.members(vars.teamId) }),
  });
}
