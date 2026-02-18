"use client"

import React, { useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  Search,
  Target,
  Activity,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  Clock,
  Zap,
  Plus,
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { useTheme } from "../../context/theme"
import { useAuth } from "../../context/auth"
import { useRTL } from "../context/rtl"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  useDashboardStats,
  usePipelineMetrics,
  useLeads,
  useActivities,
  useCurrentCurrency,
} from "../hooks/useApi"

type SortField = "name" | "email" | "probability" | "expected_revenue"
type SortOrder = "asc" | "desc"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 28
    }
  }
}

// Skeleton Component
function Skeleton({ className }: { className?: string }) {
  const { mode } = useTheme()
  const isDark = mode === "dark"

  return (
    <div
      className={`animate-pulse rounded ${isDark ? "bg-slate-800" : "bg-slate-100"} ${className}`}
    />
  )
}

// Stat Card Skeleton
function StatCardSkeleton() {
  const { mode } = useTheme()
  const isDark = mode === "dark"

  return (
    <div className={`rounded-lg p-4 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} border`}>
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-5 rounded" />
      </div>
      <Skeleton className="h-7 w-28 mb-1" />
      <Skeleton className="h-3 w-16" />
    </div>
  )
}

// Stats Cards Component
function StatsCards() {
  const { t } = useTranslation()
  const { mode } = useTheme()
  const { isRTL } = useRTL()
  const isDark = mode === "dark"

  const { data: stats, isLoading, error } = useDashboardStats()
  const { data: currency } = useCurrentCurrency()

  const formatCurrency = (value: number) => {
    if (!value) return "—"
    try {
      const currencyCode = currency?.name || 'USD'
      return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
        style: 'currency',
        currency: currencyCode,
        maximumFractionDigits: 0
      }).format(value)
    } catch {
      const prefix = currency?.symbol || '$'
      return `${prefix}${Math.round(value).toLocaleString()}`
    }
  }

  const formatNumber = (value: number) => {
    if (!value && value !== 0) return "—"
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US').format(value)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)}
      </div>
    )
  }

  if (error) {
    return (
      <div className={`rounded-lg p-4 ${isDark ? "bg-red-500/10 border-red-500/20" : "bg-red-50 border-red-100"} border`}>
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">{t('errors.loadFailed')}</span>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: t('dashboard.generatedRevenue'),
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: DollarSign,
      trend: "+12.5%",
      trendUp: true,
      iconColor: "text-emerald-500"
    },
    {
      title: t('dashboard.signedClients'),
      value: formatNumber(stats?.wonLeads || 0),
      icon: Users,
      trend: "+8.2%",
      trendUp: true,
      iconColor: "text-blue-500"
    },
    {
      title: t('dashboard.totalLeads'),
      value: formatNumber(stats?.totalLeads || 0),
      icon: Target,
      trend: "+23.1%",
      trendUp: true,
      iconColor: "text-violet-500"
    },
    {
      title: t('dashboard.teamMembers'),
      value: formatNumber(stats?.teamMembers || 0),
      icon: Zap,
      trend: "+2",
      trendUp: true,
      iconColor: "text-amber-500"
    },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 lg:grid-cols-4 gap-3"
    >
      {statCards.map((stat, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className={`group rounded-lg p-4 transition-all duration-200 ${
            isDark
              ? "bg-slate-900 border border-slate-800 hover:border-slate-700"
              : "bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {stat.title}
            </span>
            <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
          </div>

          <h3 className={`text-xl font-semibold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            {stat.value}
          </h3>
          <div className={`flex items-center gap-1 mt-1 ${stat.trendUp ? "text-emerald-500" : "text-red-500"}`}>
            {stat.trendUp ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDown className="w-3 h-3" />
            )}
            <span className="text-xs font-medium">{stat.trend}</span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

// Pipeline Chart Component
function PipelineChart() {
  const { t } = useTranslation()
  const { mode } = useTheme()
  const isDark = mode === "dark"
  const [period, setPeriod] = useState(30)

  const { data: pipelineData, isLoading } = usePipelineMetrics(period)
  const { data: currency } = useCurrentCurrency()

  const chartData = useMemo(() => {
    if (!pipelineData) return []
    return pipelineData.map((item) => ({
      name: item.stage.name,
      count: item.count,
      value: item.value,
    }))
  }, [pipelineData])

  const formatValue = (value: number) => {
    if (!currency) return `$${Math.round(value / 1000)}K`
    const symbol = currency.symbol || '$'
    return `${symbol}${Math.round(value / 1000)}K`
  }

  return (
    <motion.div
      variants={itemVariants}
      className={`rounded-lg overflow-hidden ${
        isDark
          ? "bg-slate-900 border border-slate-800"
          : "bg-white border border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
            {t('dashboard.pipelineOverview')}
          </h3>
          <p className={`text-xs mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            {t('dashboard.dealsByStage') || "Deals by stage"}
          </p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(Number(e.target.value))}
          className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
            isDark
              ? "bg-slate-800 border-slate-700 text-slate-300"
              : "bg-slate-50 border-slate-200 text-slate-600"
          } border focus:outline-none focus:ring-1 focus:ring-violet-500`}
        >
          <option value={7}>{t('dashboard.last7Days')}</option>
          <option value={30}>{t('dashboard.last30Days')}</option>
          <option value={90}>{t('dashboard.last90Days')}</option>
        </select>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="h-[240px] flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
          </div>
        ) : (
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? "#1e293b" : "#f1f5f9"}
                  horizontal={true}
                  vertical={false}
                />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: isDark ? "#64748b" : "#94a3b8" }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b", fontWeight: 500 }}
                  width={80}
                />
                <Tooltip
                  cursor={{ fill: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className={`rounded-lg p-2 shadow-lg border text-xs ${
                          isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                        }`}>
                          <p className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                            {payload[0].payload.name}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={isDark ? "text-slate-400" : "text-slate-500"}>
                              {payload[0].payload.count} deals
                            </span>
                            <span className={isDark ? "text-white" : "text-slate-900"}>
                              {formatValue(payload[0].payload.value)}
                            </span>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="count" fill="url(#barGradient)" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Activities Widget Component
function ActivitiesWidget() {
  const { t } = useTranslation()
  const { mode } = useTheme()
  const { isRTL } = useRTL()
  const isDark = mode === "dark"

  const today = new Date().toISOString().split('T')[0]
  const { data: activities, isLoading } = useActivities({
    domain: [['date_deadline', '<=', today]],
    limit: 5
  })

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return t('common.today')
    if (diffDays === 1) return t('common.yesterday')
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })
  }

  const getActivityColor = (state: string) => {
    switch (state) {
      case 'overdue': return 'text-red-500'
      case 'today': return 'text-amber-500'
      default: return 'text-blue-500'
    }
  }

  return (
    <motion.div
      variants={itemVariants}
      className={`rounded-lg overflow-hidden h-full ${
        isDark
          ? "bg-slate-900 border border-slate-800"
          : "bg-white border border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
            {t('dashboard.upcomingActivities')}
          </h3>
          <p className={`text-xs mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            {t('dashboard.scheduledTasks') || "Scheduled tasks"}
          </p>
        </div>
        <Activity className={`w-4 h-4 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
      </div>

      <div className="p-2">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-2 p-2">
                <Skeleton className="w-4 h-4 rounded shrink-0 mt-0.5" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-3/4 mb-1.5" />
                  <Skeleton className="h-2.5 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="space-y-0.5">
            {activities.map((activity, idx) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`flex items-start gap-2.5 p-2.5 rounded transition-colors cursor-pointer ${
                  isDark ? "hover:bg-slate-800" : "hover:bg-slate-50"
                }`}
              >
                <Clock className={`w-4 h-4 shrink-0 mt-0.5 ${getActivityColor(activity.state)}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                    {activity.summary || activity.activity_type_id[1]}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className={`text-[11px] truncate ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      {activity.res_name}
                    </p>
                    <span className={`text-[11px] ${getActivityColor(activity.state)}`}>
                      {formatDate(activity.date_deadline)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <Calendar className={`w-5 h-5 mb-2 ${isDark ? "text-slate-600" : "text-slate-300"}`} />
            <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {t('activities.noActivities')}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Leads Table Component
function LeadsTable() {
  const { t } = useTranslation()
  const { mode } = useTheme()
  const { isRTL } = useRTL()
  const isDark = mode === "dark"
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("expected_revenue")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const { data: currency } = useCurrentCurrency()
  const { data: leadsData, isLoading } = useLeads({
    domain: [['type', '=', 'lead']],
    limit: 50,
    order: 'create_date desc'
  })

  const formatCurrency = (value: number) => {
    if (!value) return "—"
    try {
      const currencyCode = currency?.name || 'USD'
      return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
        style: 'currency',
        currency: currencyCode,
        maximumFractionDigits: 0
      }).format(value)
    } catch {
      return `$${Math.round(value).toLocaleString()}`
    }
  }

  const filteredAndSortedLeads = useMemo(() => {
    if (!leadsData) return []

    let result = leadsData.filter((lead) => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        lead.name?.toLowerCase().includes(query) ||
        lead.email_from?.toLowerCase().includes(query) ||
        lead.partner_name?.toString().toLowerCase().includes(query)
      )
    })

    result.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case "name":
          comparison = (a.name || "").localeCompare(b.name || "")
          break
        case "email":
          comparison = (a.email_from || "").localeCompare(b.email_from || "")
          break
        case "probability":
          comparison = (a.probability || 0) - (b.probability || 0)
          break
        case "expected_revenue":
          comparison = (a.expected_revenue || 0) - (b.expected_revenue || 0)
          break
        default:
          comparison = 0
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

    return result
  }, [leadsData, searchQuery, sortField, sortOrder])

  const totalPages = Math.ceil(filteredAndSortedLeads.length / itemsPerPage)
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAndSortedLeads.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAndSortedLeads, currentPage])

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      '0': isDark ? 'text-slate-500' : 'text-slate-400',
      '1': 'text-blue-500',
      '2': 'text-amber-500',
      '3': 'text-red-500',
    }
    return colors[priority] || colors['0']
  }

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      '0': t('leads.priority.low'),
      '1': t('leads.priority.medium'),
      '2': t('leads.priority.high'),
      '3': t('leads.priority.veryHigh'),
    }
    return labels[priority] || labels['0']
  }

  return (
    <motion.div
      variants={itemVariants}
      className={`rounded-lg overflow-hidden ${
        isDark
          ? "bg-slate-900 border border-slate-800"
          : "bg-white border border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
            {t('dashboard.recentLeads')}
          </h3>
          <p className={`text-xs mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            {t('dashboard.latestProspects') || "Latest prospects"}
          </p>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-colors ${
          isDark
            ? "bg-slate-800 border border-slate-700"
            : "bg-slate-50 border border-slate-200"
        }`}>
          <Search className={`w-3.5 h-3.5 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
          <input
            type="text"
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`bg-transparent border-none outline-none text-xs w-32 ${
              isDark ? "text-white placeholder-slate-500" : "text-slate-900 placeholder-slate-400"
            }`}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className={isDark ? "bg-slate-800/50" : "bg-slate-50"}>
                {[
                  { key: "name", label: t('common.name'), sortable: true },
                  { key: "priority", label: t('leads.priority.label'), sortable: false },
                  { key: "email", label: t('common.email'), sortable: true },
                  { key: "stage", label: t('leads.stage'), sortable: false },
                  { key: "probability", label: t('leads.probability'), sortable: true },
                  { key: "expected_revenue", label: t('leads.expectedRevenue'), sortable: true },
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && toggleSort(col.key as SortField)}
                    className={`px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-left ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    } ${col.sortable ? "cursor-pointer hover:text-violet-500" : ""}`}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {col.sortable && sortField === col.key && (
                        sortOrder === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedLeads.map((lead, idx) => (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className={`border-t transition-colors cursor-pointer ${
                    isDark
                      ? "border-slate-800 hover:bg-slate-800/50"
                      : "border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                        <span className="text-[10px] font-semibold text-white">
                          {(lead.name || "?").charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className={`text-xs font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                          {lead.name}
                        </span>
                        {lead.partner_name && (
                          <p className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                            {lead.partner_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${getPriorityColor(lead.priority)}`}>
                      {getPriorityLabel(lead.priority)}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {lead.email_from || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {lead.stage_id ? (
                      <span className={`text-xs font-medium ${isDark ? "text-violet-400" : "text-violet-600"}`}>
                        {lead.stage_id[1]}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`relative w-12 h-1 rounded-full overflow-hidden ${
                        isDark ? "bg-slate-800" : "bg-slate-100"
                      }`}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${lead.probability || 0}%` }}
                          transition={{ duration: 0.4, delay: idx * 0.03 }}
                          className="absolute inset-y-0 rounded-full bg-emerald-500"
                          style={{ [isRTL ? 'right' : 'left']: 0 }}
                        />
                      </div>
                      <span className={`text-[10px] font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        {lead.probability || 0}%
                      </span>
                    </div>
                  </td>
                  <td className={`px-4 py-3 text-xs font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                    {formatCurrency(lead.expected_revenue)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!isLoading && filteredAndSortedLeads.length > 0 && (
        <div className={`flex items-center justify-between px-4 py-3 border-t ${
          isDark ? "border-slate-800" : "border-slate-100"
        }`}>
          <span className={`text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredAndSortedLeads.length)} of {filteredAndSortedLeads.length}
          </span>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`p-1.5 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                isDark
                  ? "hover:bg-slate-800 text-slate-400"
                  : "hover:bg-slate-100 text-slate-500"
              }`}
            >
              {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <span className={`px-2 text-xs font-medium ${isDark ? "text-white" : "text-slate-700"}`}>
              {currentPage}/{totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`p-1.5 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                isDark
                  ? "hover:bg-slate-800 text-slate-400"
                  : "hover:bg-slate-100 text-slate-500"
              }`}
            >
              {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

// Header Component
function DashboardHeader() {
  const { t } = useTranslation()
  const { mode } = useTheme()
  const { isRTL } = useRTL()
  const isDark = mode === "dark"
  const { name } = useAuth()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return t('dashboard.goodMorning')
    if (hour < 17) return t('dashboard.goodAfternoon')
    return t('dashboard.goodEvening')
  }

  const firstName = name ? name.split(' ')[0] : ''

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
          {getGreeting()}{firstName ? `, ${firstName}` : ''}
        </h1>
        <p className={`text-xs mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          {t('dashboard.welcomeMessage')}
        </p>
      </div>

      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <button className={`flex items-center gap-1.5 h-8 px-3 rounded text-xs font-medium transition-colors ${
          isDark
            ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200"
        }`}>
          <Calendar className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('dashboard.schedule') || "Schedule"}</span>
        </button>
        <button className="flex items-center gap-1.5 h-8 px-3 rounded text-xs font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors">
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('dashboard.newDeal') || "New Deal"}</span>
        </button>
      </div>
    </div>
  )
}

// Main Dashboard Component
export default function Dashboard() {
  const { mode } = useTheme()
  const isDark = mode === "dark"

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`flex-1 overflow-auto p-4 lg:p-6 space-y-4 w-full min-h-screen ${
        isDark ? "bg-[#0f0f14]" : "bg-slate-50"
      }`}
    >
      <div className="space-y-4 max-w-[1400px] mx-auto">
        <DashboardHeader />
        <StatsCards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <PipelineChart />
          </div>
          <div className="lg:col-span-1">
            <ActivitiesWidget />
          </div>
        </div>

        <LeadsTable />
      </div>
    </motion.main>
  )
}
