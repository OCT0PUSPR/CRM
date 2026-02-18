import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { queryKeys } from '../lib/queryClient';
import { useCRMStore } from '../stores/crmStore';

// Types
export interface Lead {
  id: number;
  name: string;
  display_name: string;
  email_from: string;
  phone: string;
  mobile: string;
  partner_id: [number, string] | false;
  partner_name: string | false;
  expected_revenue: number;
  probability: number;
  priority: string;
  stage_id: [number, string] | false;
  user_id: [number, string] | false;
  team_id: [number, string] | false;
  company_id: [number, string] | false;
  country_id: [number, string] | false;
  date_deadline: string | false;
  create_date: string;
  write_date: string;
  description: string | false;
  type: 'lead' | 'opportunity';
  active: boolean;
  tag_ids: number[];
  contact_name: string | false;
  source_id: [number, string] | false;
  medium_id: [number, string] | false;
  campaign_id: [number, string] | false;
}

export interface Company {
  id: number;
  name: string;
  display_name: string;
  email: string;
  phone: string;
  website: string;
  street: string;
  city: string;
  country_id: [number, string] | false;
  is_company: boolean;
  customer_rank: number;
  supplier_rank: number;
  child_ids: number[];
}

export interface Contact {
  id: number;
  name: string;
  display_name: string;
  email: string;
  phone: string;
  mobile: string;
  function: string;
  parent_id: [number, string] | false;
  is_company: boolean;
}

export interface Activity {
  id: number;
  summary: string;
  activity_type_id: [number, string];
  date_deadline: string;
  user_id: [number, string];
  res_model: string;
  res_id: number;
  res_name: string;
  state: string;
  note: string | false;
}

export interface Stage {
  id: number;
  name: string;
  sequence: number;
  fold: boolean;
  probability: number;
}

export interface Tag {
  id: number;
  name: string;
  color: number;
}

export interface Quotation {
  id: number;
  name: string;
  partner_id: [number, string];
  date_order: string;
  validity_date: string | false;
  amount_total: number;
  state: 'draft' | 'sent' | 'sale' | 'cancel';
  order_line: number[];
  currency_id: [number, string];
}

// Hook parameters
interface UseLeadsParams {
  domain?: unknown[];
  limit?: number;
  offset?: number;
  order?: string;
  enabled?: boolean;
}

interface UseCompaniesParams {
  domain?: unknown[];
  limit?: number;
  offset?: number;
  order?: string;
  enabled?: boolean;
}

// ============================================
// LEADS HOOKS
// ============================================

export function useLeads(params: UseLeadsParams = {}) {
  const { domain = [['type', '=', 'lead']], limit = 50, offset = 0, order = 'create_date desc', enabled = true } = params;

  return useQuery({
    queryKey: queryKeys.leads.list({ domain, limit, offset, order }),
    queryFn: async () => {
      const response = await apiService.getLeads({ domain, limit, offset, order, context: 'list' });
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch leads');
      }
      return response.records as Lead[];
    },
    enabled,
  });
}

export function useLead(id: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.leads.detail(id),
    queryFn: async () => {
      const response = await apiService.getLead(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch lead');
      }
      return response.data as Lead;
    },
    enabled: enabled && id > 0,
  });
}

export function useLeadCount(domain: unknown[] = []) {
  return useQuery({
    queryKey: queryKeys.leads.count(domain),
    queryFn: async () => {
      const response = await apiService.getLeadCount(domain);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch lead count');
      }
      return (response as any).count as number;
    },
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  const addNotification = useCRMStore((state) => state.addNotification);

  return useMutation({
    mutationFn: async (data: Partial<Lead>) => {
      const response = await apiService.createLead(data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create lead');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
      addNotification({
        type: 'success',
        title: 'Lead Created',
        message: 'New lead has been created successfully',
      });
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message,
      });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  const addNotification = useCRMStore((state) => state.addNotification);

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Lead> }) => {
      const response = await apiService.updateLead(id, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update lead');
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(variables.id) });
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message,
      });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  const addNotification = useCRMStore((state) => state.addNotification);

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiService.deleteLead(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete lead');
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
      addNotification({
        type: 'success',
        title: 'Lead Deleted',
        message: 'Lead has been deleted successfully',
      });
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message,
      });
    },
  });
}

// ============================================
// OPPORTUNITIES HOOKS
// ============================================

export function useOpportunities(params: UseLeadsParams = {}) {
  const { domain = [['type', '=', 'opportunity']], limit = 100, offset = 0, order = 'create_date desc', enabled = true } = params;

  return useQuery({
    queryKey: queryKeys.opportunities.list({ domain, limit, offset, order }),
    queryFn: async () => {
      const response = await apiService.searchRead<Lead>('crm.lead', { domain, limit, offset, order, context: 'list' });
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch opportunities');
      }
      return response.records as Lead[];
    },
    enabled,
  });
}

// ============================================
// COMPANIES HOOKS
// ============================================

export function useCompanies(params: UseCompaniesParams = {}) {
  const { domain = [['is_company', '=', true]], limit = 50, offset = 0, order = 'name asc', enabled = true } = params;

  return useQuery({
    queryKey: queryKeys.companies.list({ domain, limit, offset, order }),
    queryFn: async () => {
      const response = await apiService.searchRead<Company>('res.partner', { domain, limit, offset, order, context: 'list' });
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch companies');
      }
      return response.records as Company[];
    },
    enabled,
  });
}

export function useCompanyContacts(companyId: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.companies.contacts(companyId),
    queryFn: async () => {
      const response = await apiService.searchRead<Contact>('res.partner', {
        domain: [['parent_id', '=', companyId], ['is_company', '=', false]],
        order: 'name asc',
      });
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch contacts');
      }
      return response.records as Contact[];
    },
    enabled: enabled && companyId > 0,
  });
}

// ============================================
// CONTACTS HOOKS
// ============================================

export function useContacts(params: UseCompaniesParams = {}) {
  const { domain = [['is_company', '=', false], ['customer_rank', '>', 0]], limit = 50, offset = 0, order = 'name asc', enabled = true } = params;

  return useQuery({
    queryKey: queryKeys.contacts.list({ domain, limit, offset, order }),
    queryFn: async () => {
      const response = await apiService.getCustomers({ domain, limit, offset, order, context: 'list' });
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch contacts');
      }
      return response.records;
    },
    enabled,
  });
}

// ============================================
// ACTIVITIES HOOKS
// ============================================

export function useActivities(params: { domain?: unknown[]; limit?: number; enabled?: boolean } = {}) {
  const { domain = [], limit = 50, enabled = true } = params;

  return useQuery({
    queryKey: queryKeys.activities.list({ domain, limit }),
    queryFn: async () => {
      const response = await apiService.searchRead<Activity>('mail.activity', {
        domain,
        limit,
        order: 'date_deadline asc',
      });
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch activities');
      }
      return response.records as Activity[];
    },
    enabled,
  });
}

export function useOverdueActivities() {
  const today = new Date().toISOString().split('T')[0];
  return useActivities({
    domain: [['date_deadline', '<', today]],
    limit: 100,
  });
}

// ============================================
// STAGES HOOKS
// ============================================

export function useStages(enabled = true) {
  return useQuery({
    queryKey: queryKeys.stages.list(),
    queryFn: async () => {
      const response = await apiService.searchRead<Stage>('crm.stage', {
        order: 'sequence asc',
      });
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch stages');
      }
      return response.records as Stage[];
    },
    enabled,
    staleTime: 5 * 60 * 1000, // Stages don't change often
  });
}

// ============================================
// TAGS HOOKS
// ============================================

export function useTags(enabled = true) {
  return useQuery({
    queryKey: queryKeys.tags.list(),
    queryFn: async () => {
      const response = await apiService.searchRead<Tag>('crm.tag', {
        order: 'name asc',
      });
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch tags');
      }
      return response.records as Tag[];
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================
// QUOTATIONS HOOKS
// ============================================

export function useQuotations(params: { domain?: unknown[]; limit?: number; offset?: number; enabled?: boolean } = {}) {
  const { domain = [], limit = 50, offset = 0, enabled = true } = params;

  return useQuery({
    queryKey: queryKeys.quotations.list({ domain, limit, offset }),
    queryFn: async () => {
      const response = await apiService.searchRead<Quotation>('sale.order', {
        domain,
        limit,
        offset,
        order: 'create_date desc',
      });
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch quotations');
      }
      return response.records as Quotation[];
    },
    enabled,
  });
}

export function useQuotation(id: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.quotations.detail(id),
    queryFn: async () => {
      const response = await apiService.getRecord<Quotation>('sale.order', id, { context: 'view' });
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch quotation');
      }
      return response.data as Quotation;
    },
    enabled: enabled && id > 0,
  });
}

// ============================================
// DASHBOARD HOOKS
// ============================================

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: async () => {
      const [totalLeads, wonLeads, totalRevenue, teamMembers, currency] = await Promise.all([
        apiService.getCount('crm.lead', []),
        apiService.getCount('crm.lead', [['won_status', '=', 'won']]),
        apiService.getSum('crm.lead', 'expected_revenue', [['won_status', '=', 'won']]),
        apiService.getCount('crm.team.member', []),
        apiService.getCurrentCompanyCurrency(),
      ]);

      return {
        totalLeads: (totalLeads as any).count ?? 0,
        wonLeads: (wonLeads as any).count ?? 0,
        totalRevenue: (totalRevenue as any).sum ?? 0,
        teamMembers: (teamMembers as any).count ?? 0,
        currency: (currency as any).currency,
      };
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

export function usePipelineMetrics(period: number = 30) {
  return useQuery({
    queryKey: queryKeys.dashboard.pipeline(period),
    queryFn: async () => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - period);
      const dateStr = cutoffDate.toISOString().split('T')[0];

      const stages = await apiService.searchRead<Stage>('crm.stage', { order: 'sequence asc' });

      if (!stages.success || !stages.records) {
        throw new Error('Failed to fetch stages');
      }

      const stageData = await Promise.all(
        (stages.records as Stage[]).map(async (stage) => {
          const countRes = await apiService.getCount('crm.lead', [
            ['type', '=', 'opportunity'],
            ['stage_id', '=', stage.id],
            ['create_date', '>=', dateStr],
          ]);
          const sumRes = await apiService.getSum('crm.lead', 'expected_revenue', [
            ['type', '=', 'opportunity'],
            ['stage_id', '=', stage.id],
            ['create_date', '>=', dateStr],
          ]);

          return {
            stage,
            count: (countRes as any).count ?? 0,
            value: (sumRes as any).sum ?? 0,
          };
        })
      );

      return stageData;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================
// CURRENCY HOOK
// ============================================

export function useCurrentCurrency() {
  return useQuery({
    queryKey: queryKeys.currency.current(),
    queryFn: async () => {
      const response = await apiService.getCurrentCompanyCurrency();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch currency');
      }
      return (response as any).currency;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}
