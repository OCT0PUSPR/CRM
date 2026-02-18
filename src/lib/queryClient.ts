import { QueryClient } from '@tanstack/react-query';

// Query key factory for type-safe query keys
export const queryKeys = {
  // Leads
  leads: {
    all: ['leads'] as const,
    lists: () => [...queryKeys.leads.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.leads.lists(), filters] as const,
    details: () => [...queryKeys.leads.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.leads.details(), id] as const,
    count: (domain?: unknown[]) => [...queryKeys.leads.all, 'count', domain] as const,
  },

  // Opportunities
  opportunities: {
    all: ['opportunities'] as const,
    lists: () => [...queryKeys.opportunities.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.opportunities.lists(), filters] as const,
    details: () => [...queryKeys.opportunities.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.opportunities.details(), id] as const,
    byStage: () => [...queryKeys.opportunities.all, 'byStage'] as const,
  },

  // Companies
  companies: {
    all: ['companies'] as const,
    lists: () => [...queryKeys.companies.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.companies.lists(), filters] as const,
    details: () => [...queryKeys.companies.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.companies.details(), id] as const,
    contacts: (companyId: number) => [...queryKeys.companies.detail(companyId), 'contacts'] as const,
  },

  // Contacts
  contacts: {
    all: ['contacts'] as const,
    lists: () => [...queryKeys.contacts.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.contacts.lists(), filters] as const,
    details: () => [...queryKeys.contacts.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.contacts.details(), id] as const,
  },

  // Activities
  activities: {
    all: ['activities'] as const,
    lists: () => [...queryKeys.activities.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.activities.lists(), filters] as const,
    details: () => [...queryKeys.activities.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.activities.details(), id] as const,
    overdue: () => [...queryKeys.activities.all, 'overdue'] as const,
    due: (period: string) => [...queryKeys.activities.all, 'due', period] as const,
  },

  // Quotations
  quotations: {
    all: ['quotations'] as const,
    lists: () => [...queryKeys.quotations.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.quotations.lists(), filters] as const,
    details: () => [...queryKeys.quotations.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.quotations.details(), id] as const,
  },

  // Stages
  stages: {
    all: ['stages'] as const,
    list: () => [...queryKeys.stages.all, 'list'] as const,
  },

  // Tags
  tags: {
    all: ['tags'] as const,
    list: () => [...queryKeys.tags.all, 'list'] as const,
  },

  // Teams
  teams: {
    all: ['teams'] as const,
    list: () => [...queryKeys.teams.all, 'list'] as const,
    members: (teamId: number) => [...queryKeys.teams.all, 'members', teamId] as const,
  },

  // Users
  users: {
    all: ['users'] as const,
    list: () => [...queryKeys.users.all, 'list'] as const,
    current: () => [...queryKeys.users.all, 'current'] as const,
  },

  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    pipeline: (period: number) => [...queryKeys.dashboard.all, 'pipeline', period] as const,
    activities: (period: number) => [...queryKeys.dashboard.all, 'activities', period] as const,
    conversions: (period: number) => [...queryKeys.dashboard.all, 'conversions', period] as const,
    revenue: (period: number) => [...queryKeys.dashboard.all, 'revenue', period] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
  },

  // Currency
  currency: {
    current: () => ['currency', 'current'] as const,
  },
};

// Query client configuration with caching and retry settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export default queryClient;
