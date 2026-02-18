// API Service for Odoo Integration

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  records?: T; // For Odoo list responses
  error?: string;
  errors?: any;
}

interface SearchParams {
  domain?: any[];
  limit?: number;
  offset?: number;
  order?: string;
  context?: string;
  fields?: string[];
}

interface CountResponse {
  success: boolean;
  model: string;
  count: number;
  error?: string;
}

interface SumResponse {
  success: boolean;
  model: string;
  field: string;
  sum: number;
  error?: string;
}

interface CurrencyResponse {
  success: boolean;
  currency: {
    id: number;
    name: string;
    symbol?: string;
    currency_unit_label?: string;
    currency_subunit_label?: string;
  } | null;
  error?: string;
}

interface ResPartner {
  id: number;
  name: string;
  display_name: string;
  email: string;
  phone: string;
  mobile: string;
  street: string;
  street2: string;
  city: string;
  state_id: [number, string] | false;
  country_id: [number, string] | false;
  zip: string;
  website: string;
  function: string;
  is_company: boolean;
  company_type: string;
  customer_rank: number;
  supplier_rank: number;
  employee: boolean;
  category_id: [number, string][] | false;
  title: [number, string] | false;
  parent_id: [number, string] | false;
  user_id: [number, string] | false;
  vat: string;
  comment: string;
  barcode: string;
  color: number;
  is_blacklisted: boolean;
  date: string;
  create_date: string;
  write_date: string;
  message_bounce: number;
  commercial_company_name: string;
  commercial_partner_id: [number, string];
  company_name: string;
  lang: string;
  tz: string;
  partner_share: boolean;
  trust: string;
  contract_ids: number[];
  sale_order_count: number;
  sale_order_ids: number[];
  purchase_order_count: number;
  purchase_order_ids: number[];
  invoice_count: number;
  invoice_warn: string;
  invoice_warn_msg: string;
  property_account_position_id: [number, string] | false;
  property_payment_term_id: [number, string] | false;
  property_supplier_payment_term_id: [number, string] | false;
  property_account_payable_id: [number, string] | false;
  property_account_receivable_id: [number, string] | false;
  property_delivery_carrier_id: [number, string] | false;
  property_supplier_currency_id: [number, string] | false;
  property_purchase_currency_id: [number, string] | false;
  property_stock_customer: [number, string] | false;
  property_stock_supplier: [number, string] | false;
  last_time_entries_checked: string;
  debit_limit: number;
  total_invoiced: number;
  total_debit: number;
  total_credit: number;
  total_due: number;
  credit_limit: number;
  invoice_ids: number[];
  contact_address: [number, string] | false;
  team_id: [number, string] | false;
  opportunity_ids: number[];
  meeting_count: number;
  meeting_ids: number[];
  activities_count: number;
  activity_ids: number[];
  activity_state: string;
  activity_user_id: [number, string] | false;
  activity_type_id: [number, string] | false;
  activity_date_deadline: string | false;
  activity_summary: string | false;
  message_ids: number[];
  message_is_follower: boolean;
  message_follower_ids: number[];
  message_partner_ids: number[];
  message_has_error: boolean;
  message_has_error_counter: number;
  message_has_sms_error: boolean;
  message_main_attachment_id: [number, string] | false;
  website_message_ids: number[];
  message_needaction: boolean;
  message_needaction_counter: number;
  message_attachment_count: number;

  rating_last_gratification_gratification: string;
  rating_last_gratification_gratification_level: string;
  rating_last_gratification_gratification_date: string;
  rating_last_gratification_gratification_create_date: string;
  rating_last_gratification_gratification_write_date: string;
  rating_last_gratification_gratification_consumed: boolean;
  rating_ids: number[];
  rating_count: number;
  rating_last_value: number;
  rating_last_feedback: string;
  rating_last_image: string;
  rating_last_partner_id: [number, string] | false;
  rating_last_create_date: string;
  rating_last_write_date: string;
  rating_last_consumed: boolean;
  rating_last_gratification: string;
  rating_last_gratification_level: string;
  rating_last_gratification_date: string;
  rating_last_gratification_create_date: string;
  rating_last_gratification_write_date: string;
  rating_last_gratification_consumed: boolean;
}

class ApiService {
  private tenantId: string | null = null;
  private sessionId: string | null = null;

  setSession(tenantId: string, sessionId: string) {
    this.tenantId = tenantId;
    this.sessionId = sessionId;
  }

  private ensureSessionFromStorage() {
    if (typeof window === 'undefined') return;
    if (this.tenantId && this.sessionId) return;

    try {
      const storedTenantId = localStorage.getItem('current_tenant_id');
      const storedSessionId = localStorage.getItem('sessionId');

      if (!this.tenantId && storedTenantId) this.tenantId = storedTenantId;
      if (!this.sessionId && storedSessionId) this.sessionId = storedSessionId;
    } catch {
      // ignore storage access errors
    }
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    this.ensureSessionFromStorage();

    console.log('[API] makeRequest called:', {
      endpoint,
      hasTenantId: !!this.tenantId,
      hasSessionId: !!this.sessionId,
      tenantId: this.tenantId,
      sessionId: this.sessionId
    });

    if (!this.tenantId || !this.sessionId) {
      console.log('[API] Missing tenant ID or session ID');
      throw new Error('Tenant ID and Session ID are required');
    }

    const url = `${API_BASE_URL}/smart-fields/data${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'x-odoo-session': this.sessionId,
      'x-tenant-id': this.tenantId,
      ...options.headers,
    };

    console.log('[API] Making request:', {
      url,
      headers: {
        ...headers,
        'x-odoo-session': headers['x-odoo-session'] ? '[REDACTED]' : undefined,
        'x-tenant-id': headers['x-tenant-id']
      }
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('[API] Response status:', response.status);

      const data = await response.json();

      if (!response.ok) {
        console.log('[API] Response error:', data);
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Fetch customers (res.partner where customer_rank > 0 and is_company = false)
  async getCustomers(params: SearchParams = {}): Promise<ApiResponse<ResPartner[]>> {
    const defaultParams = {
      domain: [['customer_rank', '>', 0], ['is_company', '=', false]],
      limit: 80,
      offset: 0,
      order: 'id desc',
      context: 'list',
      ...params,
    };

    const queryParams = new URLSearchParams({
      domain: JSON.stringify(defaultParams.domain),
      limit: defaultParams.limit.toString(),
      offset: defaultParams.offset.toString(),
      order: defaultParams.order,
      context: defaultParams.context,
    });

    return this.makeRequest<ResPartner[]>(`/res.partner?${queryParams}`);
  }

  // Get single customer
  async getCustomer(id: number): Promise<ApiResponse<ResPartner>> {
    return this.makeRequest<ResPartner>(`/res.partner/${id}?context=view`);
  }

  // Create customer
  async createCustomer(data: Partial<ResPartner>): Promise<ApiResponse<ResPartner>> {
    return this.makeRequest<ResPartner>('/res.partner', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  }

  // Update customer
  async updateCustomer(id: number, data: Partial<ResPartner>): Promise<ApiResponse<ResPartner>> {
    return this.makeRequest<ResPartner>(`/res.partner/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  }

  // Delete customer
  async deleteCustomer(id: number): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/res.partner/${id}`, {
      method: 'DELETE',
    });
  }

  async getCount(model: string, domain: any[] = []): Promise<CountResponse> {
    const queryParams = new URLSearchParams({
      domain: JSON.stringify(domain),
    });
    return this.makeRequest<any>(`/${model}/count?${queryParams}`) as any;
  }

  async getSum(model: string, field: string, domain: any[] = []): Promise<SumResponse> {
    const queryParams = new URLSearchParams({
      domain: JSON.stringify(domain),
    });
    return this.makeRequest<any>(`/${model}/sum/${field}?${queryParams}`) as any;
  }

  async getCurrentCompanyCurrency(): Promise<CurrencyResponse> {
    return this.makeRequest<any>(`/res.currency/current`) as any;
  }

  // Get customer count
  async getCustomerCount(): Promise<ApiResponse<number>> {
    const queryParams = new URLSearchParams({
      domain: JSON.stringify([['customer_rank', '>', 0], ['is_company', '=', false]]),
    });

    return this.makeRequest<number>(`/res.partner/count?${queryParams}`);
  }

  // ============================================
  // LEAD OPERATIONS
  // ============================================

  // Fetch leads (crm.lead where type = 'lead')
  async getLeads(params: SearchParams = {}): Promise<ApiResponse<any[]>> {
    const defaultParams = {
      domain: [['type', '=', 'lead']],
      limit: 80,
      offset: 0,
      order: 'create_date desc',
      context: 'list',
      ...params,
    };

    const queryParams = new URLSearchParams({
      domain: JSON.stringify(defaultParams.domain),
      limit: defaultParams.limit.toString(),
      offset: defaultParams.offset.toString(),
      order: defaultParams.order,
      context: defaultParams.context,
    });

    return this.makeRequest<any[]>(`/crm.lead?${queryParams}`);
  }

  // Get single lead
  async getLead(id: number): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/crm.lead/${id}?context=view`);
  }

  // Create lead
  async createLead(data: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/crm.lead', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  }

  // Update lead
  async updateLead(id: number, data: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/crm.lead/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  }

  // Delete lead
  async deleteLead(id: number): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/crm.lead/${id}`, {
      method: 'DELETE',
    });
  }

  // Get lead count
  async getLeadCount(domain: any[] = []): Promise<ApiResponse<number>> {
    const defaultDomain = [['type', '=', 'lead'], ...domain];
    const queryParams = new URLSearchParams({
      domain: JSON.stringify(defaultDomain),
    });

    return this.makeRequest<number>(`/crm.lead/count?${queryParams}`);
  }

  // Get sum of expected revenue for leads
  async getLeadTotalRevenue(domain: any[] = []): Promise<SumResponse> {
    const defaultDomain = [['type', '=', 'lead'], ...domain];
    const queryParams = new URLSearchParams({
      domain: JSON.stringify(defaultDomain),
    });
    return this.makeRequest<any>(`/crm.lead/sum/expected_revenue?${queryParams}`) as any;
  }

  // Get activities for a customer
  async getCustomerActivities(customerId: number): Promise<ApiResponse<any[]>> {
    // This would need to be implemented based on the mail.activity model
    const queryParams = new URLSearchParams({
      domain: JSON.stringify([['res_model', '=', 'res.partner'], ['res_id', '=', customerId]]),
      order: 'date_deadline desc',
      limit: '50',
    });

    return this.makeRequest<any[]>(`/mail.activity?${queryParams}`);
  }

  // Add note to customer (using mail.message)
  async addCustomerNote(customerId: number, body: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/mail.message', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          res_model: 'res.partner',
          res_id: customerId,
          body: body,
          message_type: 'comment',
          subtype_id: 1, // MT_NOTE
        },
      }),
    });
  }

  // Generic search and read
  async searchRead<T>(model: string, params: SearchParams = {}): Promise<ApiResponse<T[]>> {
    const queryParams = new URLSearchParams();
    if (params.domain) queryParams.append('domain', JSON.stringify(params.domain));
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    if (params.order) queryParams.append('order', params.order);
    if (params.context) queryParams.append('context', params.context);
    if (params.fields) queryParams.append('fields', JSON.stringify(params.fields));

    return this.makeRequest<T[]>(`/${model}?${queryParams.toString()}`);
  }

  // Get single record
  async getRecord<T>(model: string, id: number, params: { context?: string } = {}): Promise<ApiResponse<T>> {
    const queryParams = new URLSearchParams();
    if (params.context) queryParams.append('context', params.context);
    return this.makeRequest<T>(`/${model}/${id}?${queryParams.toString()}`);
  }

  // Create record
  async create<T>(model: string, data: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(`/${model}`, {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  }

  // Update record
  async update<T>(model: string, id: number, data: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(`/${model}/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  }

  // Delete record
  async delete(model: string, id: number): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/${model}/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
export type { ResPartner, SearchParams, ApiResponse };
