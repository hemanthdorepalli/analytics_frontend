import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { api } from "./api";
import { getOrgId } from "./auth";
import type { User, Organization, Member, Event, Dashboard, AlertRule, AlertHistory, APIKey } from "./types";

// Single reactive hook for org_id — listens for storage events dispatched by setSession.
function useOrgId(): string | null {
  const [orgId, setOrgId] = useState<string | null>(getOrgId);
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "org_id") setOrgId(e.newValue);
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);
  return orgId;
}

export const useProfile = () => useQuery({ queryKey: ["profile"], queryFn: async () => { const { data } = await api.get<User>("/auth/profile/"); return data; }, retry: false, staleTime: 300000 });

export const useLogin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (b: { email: string; password: string }) => { const { data } = await api.post("/auth/login/", b); return data; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
};

export const useRegister = () => useMutation({
  mutationFn: async (b: any) => { const { data } = await api.post("/auth/register/", b); return data; },
});

export const useLogout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => { await api.post("/auth/logout/"); },
    onSuccess: () => qc.clear(),
  });
};

// Fetch org + member role together after login
export const useMyMembership = () => useQuery({
  queryKey: ["membership"],
  queryFn: async () => {
    const [orgRes, membersRes] = await Promise.all([
      api.get<Organization>("/organizations/"),
      api.get<Member[]>("/organizations/members/"),
    ]);
    return { org: orgRes.data, members: membersRes.data };
  },
  enabled: false, // only called manually after login
});

export const useOrganization = () => {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ["org"],
    queryFn: async () => { const { data } = await api.get<Organization>("/organizations/"); return data; },
    enabled: !!orgId,
  });
};

export const useMembers = () => {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ["members"],
    queryFn: async () => { const { data } = await api.get<Member[]>("/organizations/members/"); return data; },
    enabled: !!orgId,
  });
};

export const useInviteMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (b: { email: string; role: string }) => { const { data } = await api.post("/organizations/members/invite/", b); return data; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members"] }),
  });
};

export const useEvents = () => {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => { const { data } = await api.get<Event[]>("/ingestion/events/stream/"); return data; },
    refetchInterval: 30000,          // poll every 30s instead of 5s
    refetchIntervalInBackground: false, // pause polling when tab is not visible
    enabled: !!orgId,
  });
};

export const useIngestEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (b: any) => { const { data } = await api.post("/ingestion/events/", b); return data; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
};

export const useIngestBatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (events: any[]) => { const { data } = await api.post("/ingestion/events/batch/", { events }); return data; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
};

export const useApiKeys = () => {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ["api-keys"],
    queryFn: async () => { const { data } = await api.get<APIKey[]>("/ingestion/api-keys/"); return data; },
    enabled: !!orgId,
  });
};

export const useCreateApiKey = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (b: { name: string; expires_in_days?: number }) => { const { data } = await api.post<APIKey>("/ingestion/api-keys/", b); return data; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["api-keys"] }),
  });
};

export const useRevokeApiKey = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { await api.delete(`/ingestion/api-keys/${id}/revoke/`); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["api-keys"] }),
  });
};

export const useDashboards = () => {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ["dashboards"],
    queryFn: async () => { const { data } = await api.get<Dashboard[]>("/dashboards/"); return data; },
    enabled: !!orgId,
  });
};

export const useCreateDashboard = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (b: { name: string; description?: string }) => { const { data } = await api.post<Dashboard>("/dashboards/", b); return data; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboards"] }),
  });
};

export const useAlertRules = () => {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ["alert-rules"],
    queryFn: async () => { const { data } = await api.get<AlertRule[]>("/alerts/rules/"); return data; },
    enabled: !!orgId,
  });
};

export const useCreateAlertRule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (b: any) => { const { data } = await api.post("/alerts/rules/", b); return data; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alert-rules"] }),
  });
};

export const useMuteAlert = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { await api.post(`/alerts/rules/${id}/mute/`); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alert-rules"] }),
  });
};

export const useAlertHistory = () => {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ["alert-history"],
    queryFn: async () => { const { data } = await api.get<AlertHistory[]>("/alerts/history/"); return data; },
    enabled: !!orgId,
  });
};
