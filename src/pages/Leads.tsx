"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Building2,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  TrendingUp,
  Edit2,
  Trash2,
  Clock,
  MapPin,
  Tag,
  User,
  ArrowUpRight,
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../context/auth"
import { useTheme } from "../../context/theme"
import CRMHeader from "../components/PagesHeader"
import { PremiumTable, Column } from "../components/PremiumTable"
import { apiService } from "../services/api"

// ============================================
// TYPES
// ============================================
interface Lead {
  id: number
  name: string
  display_name: string
  email_from: string
  phone: string
  mobile: string
  partner_id: [number, string] | false
  partner_name: string | false
  expected_revenue: number
  probability: number
  priority: string
  stage_id: [number, string] | false
  user_id: [number, string] | false
  team_id: [number, string] | false
  company_id: [number, string] | false
  country_id: [number, string] | false
  date_deadline: string | false
  create_date: string
  write_date: string
  description: string | false
  type: "lead" | "opportunity"
  active: boolean
  activity_state: string
  activity_date_deadline: string | false
  activity_summary: string | false
  source_id: [number, string] | false
  medium_id: [number, string] | false
  campaign_id: [number, string] | false
  referred: string
  color: number
  tag_ids: number[]
  company_currency: [number, string] | false
}

// ============================================
// PRIORITY COLORS
// ============================================
const PRIORITY_COLORS = {
  "3": "#FF6D3B", // Very High
  "2": "#FF6D3B", // High
  "1": "#579BFC", // Medium
  "0": "#4ECCC6", // Low
}

const PRIORITY_LABELS = {
  "3": "Very High",
  "2": "High", 
  "1": "Medium",
  "0": "Low",
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
const getPriorityStyle = (priority: string, isDark: boolean) => {
  const color = PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || (isDark ? "#6E7681" : "#97A0AF")
  const label = PRIORITY_LABELS[priority as keyof typeof PRIORITY_LABELS] || "None"
  
  return {
    bg: color,
    text: label,
    color: color,
  }
}

const formatDate = (dateString: string | false) => {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleDateString()
}

const formatCurrency = (amount: number, currency: string = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount || 0)
}

// ============================================
// PRIORITY BADGE COMPONENT
// ============================================
const PriorityBadge: React.FC<{ priority: string; isDark: boolean }> = ({ priority, isDark }) => {
  const style = getPriorityStyle(priority, isDark)
  
  return (
    <span
      className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white rounded-full"
      style={{ backgroundColor: style.bg }}
    >
      {style.text}
    </span>
  )
}

// ============================================
// LEAD CARD COMPONENT
// ============================================
const LeadCard: React.FC<{ lead: Lead; isDark: boolean; onEdit: (lead: Lead) => void; onDelete: (id: number) => void }> = ({ 
  lead, 
  isDark, 
  onEdit, 
  onDelete 
}) => {
  const [showActions, setShowActions] = useState(false)

  return (
    <div
      className={`group relative p-6 rounded-[32px] transition-all duration-500 cursor-pointer border ${
        isDark
          ? "bg-[#121417] border-premium-800 hover:border-premium-700 hover:shadow-2xl hover:shadow-black"
          : "bg-white border-premium-100 hover:border-[#4c6b22]/20 hover:shadow-xl hover:shadow-[#4c6b22]/5"
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 rounded-[20px] bg-premium-50 dark:bg-premium-900 flex items-center justify-center transition-transform group-hover:scale-110 duration-500 border border-premium-100 dark:border-premium-800 shrink-0">
            <User className="w-7 h-7 text-premium-400" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-black tracking-tight text-premium-800 dark:text-premium-50 truncate group-hover:text-[#4c6b22] transition-colors duration-300">
              {lead.name}
            </h3>
            <div className="flex items-center gap-2 text-xs font-bold text-premium-400 mt-1 min-w-0">
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{lead.partner_id?.[1] || lead.partner_name || "Unassigned"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PriorityBadge priority={lead.priority} isDark={isDark} />
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(lead)
              }}
              className="p-2 hover:bg-premium-50 dark:hover:bg-premium-800 rounded-xl transition-all"
            >
              <Edit2 className="w-4 h-4 text-premium-400" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(lead.id)
              }}
              className="p-2 hover:bg-brand-rose/5 rounded-xl transition-all"
            >
              <Trash2 className="w-4 h-4 text-brand-rose" />
            </button>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-xs font-bold text-premium-500 dark:text-premium-400 group/link p-2 rounded-xl hover:bg-premium-50 dark:hover:bg-premium-800/50 transition-colors">
          <Mail className="w-4 h-4 text-premium-300 group-hover/link:text-[#4c6b22] transition-colors" />
          <span className="truncate">{lead.email_from || "No direct email"}</span>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold text-premium-500 dark:text-premium-400 group/link p-2 rounded-xl hover:bg-premium-50 dark:hover:bg-premium-800/50 transition-colors">
          <Phone className="w-4 h-4 text-premium-300 group-hover/link:text-[#4c6b22] transition-colors" />
          <span className="truncate">{lead.phone || "No phone"}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-premium-50 dark:bg-premium-900 border border-premium-100 dark:border-premium-800">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-premium-400 mb-2">
            <DollarSign className="w-4 h-4 text-premium-300" />
            Expected Revenue
          </div>
          <div className="text-sm font-black tabular-nums text-premium-800 dark:text-premium-50">
            {lead.expected_revenue ? formatCurrency(lead.expected_revenue) : "—"}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-premium-50 dark:bg-premium-900 border border-premium-100 dark:border-premium-800">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-premium-400 mb-2">
            <TrendingUp className="w-4 h-4 text-premium-300" />
            Probability
          </div>
          <div className="text-sm font-black tabular-nums text-premium-800 dark:text-premium-50">
            {lead.probability ? `${Math.round(lead.probability)}%` : "—"}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-premium-50 dark:border-premium-800 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 text-xs font-bold text-premium-400 min-w-0">
            <Tag className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{lead.stage_id?.[1] || "No stage"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-premium-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(lead.date_deadline)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#4c6b22] bg-[#f3f4ee] px-2 py-1 rounded-lg">
          Lead <ArrowUpRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  )
}

// ============================================
// MAIN LEADS PAGE COMPONENT
// ============================================
const LeadsPage: React.FC = () => {
  const { t } = useTranslation()
  const { mode } = useTheme()
  const { sessionId } = useAuth()
  const isDark = mode === "dark"
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Header state
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [sortBy, setSortBy] = useState("name-asc")
  const [totalCount, setTotalCount] = useState(0)

  // Check if user is authenticated
  useEffect(() => {
    console.log('[LEADS] User auth check:', {
      hasSessionId: !!sessionId,
      sessionId,
      tenantIdFromStorage: localStorage.getItem('current_tenant_id')
    });

    if (!sessionId) {
      console.log('[LEADS] Authentication failed - no session');
      setError("Authentication required. Please log in again.")
      setLoading(false)
      return
    }

    // Get tenant ID from localStorage
    const tenantId = localStorage.getItem('current_tenant_id');
    if (!tenantId) {
      console.log('[LEADS] Authentication failed - no tenant ID');
      setError("Tenant ID required. Please select a tenant.")
      setLoading(false)
      return
    }

    console.log('[LEADS] Setting up API service with:', { tenantId, sessionId });
    // Set up API service
    apiService.setSession(tenantId, sessionId)
  }, [sessionId])

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    if (!sessionId) return

    // Get tenant ID from localStorage
    const tenantId = localStorage.getItem('current_tenant_id');
    if (!tenantId) return

    console.log('[LEADS] fetchLeads called with:', {
      hasSessionId: !!sessionId,
      tenantId,
      searchQuery,
      filters,
      sortBy
    });

    try {
      setLoading(true)
      setError(null)

      // Build domain filter for leads only
      let domain: any[] = [['type', '=', 'lead']]
      
      // Add search filter
      if (searchQuery) {
        domain.push(['name', 'ilike', searchQuery])
      }
      
      // Add additional filters
      Object.entries(filters).forEach(([field, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (field === 'priority') {
            domain.push(['priority', '=', value])
          } else if (field === 'stage_id') {
            domain.push(['stage_id', '=', typeof value === 'string' ? parseInt(value) : value])
          }
        }
      })

      // Add sorting
      let order = 'create_date desc'
      if (sortBy === 'name-asc') order = 'name asc'
      else if (sortBy === 'name-desc') order = 'name desc'
      else if (sortBy === 'date-newest') order = 'create_date desc'
      else if (sortBy === 'date-oldest') order = 'create_date asc'
      else if (sortBy === 'revenue-desc') order = 'expected_revenue desc'
      else if (sortBy === 'revenue-asc') order = 'expected_revenue asc'

      const response = await apiService.getLeads({
        domain,
        limit: 100,
        offset: 0,
        order,
        context: 'list',
      })

      if (response.success && response.records) {
        setLeads(response.records)
        setTotalCount(response.records.length)
      } else {
        throw new Error(response.error || 'Failed to fetch leads')
      }
    } catch (err) {
      console.error('Error fetching leads:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch leads')
    } finally {
      setLoading(false)
    }
  }, [sessionId, searchQuery, filters, sortBy])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  // Table columns
  const columns: Column<Lead>[] = useMemo(() => [
    {
      id: 'name',
      header: 'Lead Name',
      accessor: 'name',
      width: '200px',
      sortable: true,
    },
    {
      id: 'email_from',
      header: 'Email',
      accessor: 'email_from',
      width: '200px',
      sortable: false,
    },
    {
      id: 'phone',
      header: 'Phone',
      accessor: 'phone',
      width: '150px',
      sortable: false,
    },
    {
      id: 'partner_id',
      header: 'Contact',
      accessor: (row) => row.partner_id?.[1] || row.partner_name || '-',
      width: '180px',
      sortable: false,
    },
    {
      id: 'expected_revenue',
      header: 'Expected Revenue',
      accessor: (row) => row.expected_revenue ? formatCurrency(row.expected_revenue) : '-',
      width: '150px',
      align: 'right',
      sortable: true,
    },
    {
      id: 'probability',
      header: 'Probability',
      accessor: (row) => row.probability ? `${Math.round(row.probability)}%` : '-',
      width: '120px',
      align: 'right',
      sortable: true,
    },
    {
      id: 'priority',
      header: 'Priority',
      accessor: (row) => <PriorityBadge priority={row.priority} isDark={isDark} />,
      width: '120px',
      sortable: false,
    },
    {
      id: 'stage_id',
      header: 'Stage',
      accessor: (row) => row.stage_id?.[1] || '-',
      width: '150px',
      sortable: false,
    },
    {
      id: 'date_deadline',
      header: 'Expected Closing',
      accessor: (row) => formatDate(row.date_deadline),
      width: '150px',
      sortable: true,
    },
    {
      id: 'create_date',
      header: 'Created',
      accessor: (row) => formatDate(row.create_date),
      width: '150px',
      sortable: true,
    },
  ], [isDark])

  // Event handlers
  const handleAddNew = () => {
    console.log('Add new lead')
  }

  const handleRefresh = () => {
    fetchLeads()
  }

  const handleEdit = (lead: Lead) => {
    console.log('Edit lead:', lead)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this lead?')) return
    
    try {
      await apiService.deleteLead(id)
      setLeads(prev => prev.filter(lead => lead.id !== id))
      setTotalCount(prev => prev - 1)
    } catch (err) {
      console.error('Error deleting lead:', err)
      alert('Failed to delete lead')
    }
  }

  // Filter options for header
  const filterOptions = [
    { 
      id: 'priority', 
      label: 'Priority', 
      field: 'priority', 
      type: 'select' as const, 
      options: [
        { value: '3', label: 'Very High' }, 
        { value: '2', label: 'High' }, 
        { value: '1', label: 'Medium' }, 
        { value: '0', label: 'Low' }
      ]
    },
  ]

  const sortOptions = [
    { id: 'name-asc', label: 'Name (A-Z)', field: 'name', direction: 'asc' as const },
    { id: 'name-desc', label: 'Name (Z-A)', field: 'name', direction: 'desc' as const },
    { id: 'date-newest', label: 'Recently Created', field: 'create_date', direction: 'desc' as const },
    { id: 'date-oldest', label: 'Oldest Created', field: 'create_date', direction: 'asc' as const },
    { id: 'revenue-desc', label: 'Expected Revenue (High)', field: 'expected_revenue', direction: 'desc' as const },
    { id: 'revenue-asc', label: 'Expected Revenue (Low)', field: 'expected_revenue', direction: 'asc' as const },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${isDark ? "bg-[#09090b] text-white" : "bg-[#FBFBFC]"}`}>
      {/* Header */}
      <CRMHeader
        title="Leads"
        totalCount={totalCount}
        createButtonLabel="Add Lead"
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filters={filters}
        setFilters={setFilters}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onAddNew={handleAddNew}
        onRefresh={handleRefresh}
      />

      {/* Content */}
      <div className="max-w-[1600px] mx-auto px-10 pb-20">
        {viewMode === 'list' ? (
          <div className="mt-8">
            <PremiumTable
              data={leads}
              columns={columns}
              rowIdKey="id"
              onEdit={handleEdit}
              onDelete={handleDelete}
              pageSize={20}
              searchable={false}
              showExport={true}
            />
          </div>
        ) : (
          <div className="mt-8">
            {leads.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">No leads found</div>
                <button
                  onClick={handleAddNew}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add your first lead
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-10">
                {leads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    isDark={isDark}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default LeadsPage
