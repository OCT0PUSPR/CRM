"use client"

import React, { useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Plus,
  FileText,
  DollarSign,
  Calendar,
  User,
  MoreHorizontal,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Eye,
  Download,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  X,
  Pen,
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { useTheme } from "../../context/theme"
import { useRTL } from "../context/rtl"
import CRMHeader from "../components/PagesHeader"
import { PremiumTable, Column } from "../components/PremiumTable"
import { FilterBuilder, buildOdooDomain, FilterCondition, FieldDefinition } from "../components/FilterBuilder"
import { SignatureCanvas } from "../components/SignatureCanvas"
import { useQuotations, useQuotation, useCurrentCurrency } from "../hooks/useApi"

// Quotation type for this page
interface Quotation {
  id: number
  name: string
  date_order: string
  validity_date: string | false
  partner_id: [number, string]
  user_id?: [number, string]
  amount_untaxed?: number
  amount_tax?: number
  amount_total: number
  state: string
  currency_id: [number, string]
  order_line?: number[]
  note?: string
  payment_term_id?: [number, string]
}

// Field definitions for filter builder
const quotationFields: FieldDefinition[] = [
  { name: "name", label: "Reference", type: "string" },
  { name: "partner_id", label: "Customer", type: "many2one" },
  { name: "user_id", label: "Salesperson", type: "many2one" },
  { name: "date_order", label: "Order Date", type: "date" },
  { name: "validity_date", label: "Expiration Date", type: "date" },
  { name: "amount_total", label: "Total Amount", type: "number" },
  { name: "state", label: "Status", type: "selection", options: [
    { value: "draft", label: "Draft" },
    { value: "sent", label: "Sent" },
    { value: "sale", label: "Sales Order" },
    { value: "cancel", label: "Cancelled" },
  ]},
]

// Status helper
const getStatusConfig = (state: string, t: (key: string) => string) => {
  switch (state) {
    case "sale":
      return { bg: "#DCFCE7", text: "#166534", icon: CheckCircle2, label: t("quotations.status.sale") }
    case "sent":
      return { bg: "#DBEAFE", text: "#1E40AF", icon: Send, label: t("quotations.status.sent") }
    case "draft":
      return { bg: "#F3F4F6", text: "#4B5563", icon: FileText, label: t("quotations.status.draft") }
    case "cancel":
      return { bg: "#FEE2E2", text: "#991B1B", icon: XCircle, label: t("quotations.status.cancel") }
    default:
      return { bg: "#F3F4F6", text: "#4B5563", icon: Clock, label: state }
  }
}

// Quotation Card Component
function QuotationCard({
  quotation,
  delay,
  onView,
  formatCurrency,
}: {
  quotation: Quotation
  delay: number
  onView: () => void
  formatCurrency: (amount: number) => string
}) {
  const { t } = useTranslation()
  const { mode } = useTheme()
  const { isRTL } = useRTL()
  const isDark = mode === "dark"
  const status = getStatusConfig(quotation.state, t)
  const StatusIcon = status.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(delay * 0.05, 0.5) }}
      onClick={onView}
      className={`group relative p-6 rounded-[32px] transition-all duration-500 cursor-pointer border ${
        isDark
          ? "bg-[#121417] border-premium-800 hover:border-premium-700 hover:shadow-2xl hover:shadow-black"
          : "bg-white border-premium-100 hover:border-[#4c6b22]/20 hover:shadow-xl hover:shadow-[#4c6b22]/5"
      }`}
    >
      <div className="flex items-start justify-between mb-6">
        <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
          <div className="w-14 h-14 rounded-[20px] bg-premium-50 dark:bg-premium-900 flex items-center justify-center transition-transform group-hover:scale-110 duration-500 border border-premium-100 dark:border-premium-800">
            <FileText className="w-7 h-7 text-[#4c6b22]" strokeWidth={1.5} />
          </div>
          <div className={isRTL ? "text-right" : "text-left"}>
            <h3 className="text-lg font-black tracking-tight text-premium-800 dark:text-premium-50 group-hover:text-[#4c6b22] transition-colors duration-300">
              {quotation.name}
            </h3>
            <div className={`flex items-center gap-2 text-xs font-bold text-premium-400 mt-1 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(quotation.date_order).toLocaleDateString(isRTL ? "ar-SA" : "en-US")}</span>
            </div>
          </div>
        </div>
        <button
          onClick={(e) => e.stopPropagation()}
          className="p-2 opacity-0 group-hover:opacity-100 hover:bg-premium-50 dark:hover:bg-premium-800 rounded-xl transition-all"
        >
          <MoreHorizontal className="w-5 h-5 text-premium-400" />
        </button>
      </div>

      <div className="space-y-4 mb-6">
        <div className={`flex items-center justify-between p-3 rounded-2xl bg-premium-50 dark:bg-premium-900/50 ${isRTL ? "flex-row-reverse" : ""}`}>
          <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
            <div className="w-8 h-8 rounded-xl bg-white dark:bg-premium-800 flex items-center justify-center shadow-sm">
              <Building2 className="w-4 h-4 text-premium-400" />
            </div>
            <div className={`flex flex-col ${isRTL ? "items-end" : "items-start"}`}>
              <span className="text-[10px] font-bold text-premium-400 uppercase tracking-wider">
                {t("quotations.customer")}
              </span>
              <span className="text-xs font-bold text-premium-800 dark:text-premium-100 truncate max-w-[120px]">
                {quotation.partner_id ? quotation.partner_id[1] : "-"}
              </span>
            </div>
          </div>
        </div>

        <div className={`flex items-center justify-between p-3 rounded-2xl bg-premium-50 dark:bg-premium-900/50 ${isRTL ? "flex-row-reverse" : ""}`}>
          <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
            <div className="w-8 h-8 rounded-xl bg-white dark:bg-premium-800 flex items-center justify-center shadow-sm">
              <User className="w-4 h-4 text-premium-400" />
            </div>
            <div className={`flex flex-col ${isRTL ? "items-end" : "items-start"}`}>
              <span className="text-[10px] font-bold text-premium-400 uppercase tracking-wider">
                {t("leads.salesperson")}
              </span>
              <span className="text-xs font-bold text-premium-800 dark:text-premium-100 truncate max-w-[120px]">
                {quotation.user_id ? quotation.user_id[1] : "-"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={`pt-4 border-t border-premium-50 dark:border-premium-800 flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
        <span
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider"
          style={{ backgroundColor: status.bg, color: status.text }}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          {status.label}
        </span>
        <span className="text-lg font-black text-premium-800 dark:text-white tracking-tight">
          {formatCurrency(quotation.amount_total)}
        </span>
      </div>
    </motion.div>
  )
}

// Quotation Detail Modal
function QuotationDetailModal({
  quotation,
  isOpen,
  onClose,
  formatCurrency,
}: {
  quotation: Quotation | null
  isOpen: boolean
  onClose: () => void
  formatCurrency: (amount: number) => string
}) {
  const { t } = useTranslation()
  const { mode } = useTheme()
  const { isRTL } = useRTL()
  const isDark = mode === "dark"
  const [showSignature, setShowSignature] = useState(false)

  if (!quotation) return null

  const status = getStatusConfig(quotation.state, t)
  const StatusIcon = status.icon

  const handleSignature = (signature: string) => {
    console.log("Signature saved:", signature)
    setShowSignature(false)
    // Here you would send the signature to the backend
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl md:max-h-[90vh] overflow-y-auto rounded-2xl z-50 ${
              isDark ? "bg-zinc-900" : "bg-white"
            } shadow-2xl`}
          >
            {/* Header */}
            <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${
              isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"
            }`}>
              <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{quotation.name}</h2>
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium mt-1"
                    style={{ backgroundColor: status.bg, color: status.text }}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? "hover:bg-zinc-800 text-zinc-400" : "hover:bg-gray-100 text-gray-500"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Customer & Salesperson */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl ${isDark ? "bg-zinc-800" : "bg-gray-50"}`}>
                  <div className={`flex items-center gap-2 mb-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">
                      {t("quotations.customer")}
                    </span>
                  </div>
                  <p className={`font-semibold text-gray-900 dark:text-white ${isRTL ? "text-right" : "text-left"}`}>
                    {quotation.partner_id?.[1] || "-"}
                  </p>
                </div>
                <div className={`p-4 rounded-xl ${isDark ? "bg-zinc-800" : "bg-gray-50"}`}>
                  <div className={`flex items-center gap-2 mb-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">
                      {t("leads.salesperson")}
                    </span>
                  </div>
                  <p className={`font-semibold text-gray-900 dark:text-white ${isRTL ? "text-right" : "text-left"}`}>
                    {quotation.user_id?.[1] || "-"}
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl ${isDark ? "bg-zinc-800" : "bg-gray-50"}`}>
                  <div className={`flex items-center gap-2 mb-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">
                      {t("quotations.columns.date")}
                    </span>
                  </div>
                  <p className={`font-semibold text-gray-900 dark:text-white ${isRTL ? "text-right" : "text-left"}`}>
                    {new Date(quotation.date_order).toLocaleDateString(isRTL ? "ar-SA" : "en-US")}
                  </p>
                </div>
                <div className={`p-4 rounded-xl ${isDark ? "bg-zinc-800" : "bg-gray-50"}`}>
                  <div className={`flex items-center gap-2 mb-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">
                      {t("quotations.validity_date")}
                    </span>
                  </div>
                  <p className={`font-semibold text-gray-900 dark:text-white ${isRTL ? "text-right" : "text-left"}`}>
                    {quotation.validity_date
                      ? new Date(quotation.validity_date).toLocaleDateString(isRTL ? "ar-SA" : "en-US")
                      : "-"}
                  </p>
                </div>
              </div>

              {/* Totals */}
              <div className={`p-4 rounded-xl border ${isDark ? "bg-zinc-800/50 border-zinc-700" : "bg-gray-50 border-gray-200"}`}>
                <div className="space-y-3">
                  <div className={`flex items-center justify-between text-sm ${isRTL ? "flex-row-reverse" : ""}`}>
                    <span className="text-gray-500 dark:text-zinc-400">{t("common.subtotal")}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(quotation.amount_untaxed)}
                    </span>
                  </div>
                  <div className={`flex items-center justify-between text-sm ${isRTL ? "flex-row-reverse" : ""}`}>
                    <span className="text-gray-500 dark:text-zinc-400">{t("common.tax")}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(quotation.amount_tax)}
                    </span>
                  </div>
                  <div className={`flex items-center justify-between pt-3 border-t ${isDark ? "border-zinc-600" : "border-gray-200"} ${isRTL ? "flex-row-reverse" : ""}`}>
                    <span className="font-semibold text-gray-900 dark:text-white">{t("common.total")}</span>
                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(quotation.amount_total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Signature Section */}
              {quotation.state === "sent" && (
                <div className={`p-4 rounded-xl border ${isDark ? "bg-zinc-800/50 border-zinc-700" : "bg-blue-50 border-blue-200"}`}>
                  <div className={`flex items-center gap-2 mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <Pen className="w-5 h-5 text-blue-600" />
                    <h3 className={`font-semibold text-gray-900 dark:text-white ${isRTL ? "text-right" : "text-left"}`}>
                      {t("quotations.signature.title")}
                    </h3>
                  </div>

                  {showSignature ? (
                    <SignatureCanvas
                      onSave={handleSignature}
                      onClear={() => setShowSignature(false)}
                      width={500}
                      height={200}
                    />
                  ) : (
                    <button
                      onClick={() => setShowSignature(true)}
                      className="w-full py-4 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-xl text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      {t("quotations.signature.sign_here")}
                    </button>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className={`flex flex-wrap gap-2 pt-4 border-t ${isDark ? "border-zinc-800" : "border-gray-200"} ${isRTL ? "flex-row-reverse" : ""}`}>
                <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDark ? "bg-zinc-800 hover:bg-zinc-700 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}>
                  <Download className="w-4 h-4" />
                  {t("quotations.actions.download_pdf")}
                </button>
                <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDark ? "bg-zinc-800 hover:bg-zinc-700 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}>
                  <Copy className="w-4 h-4" />
                  {t("quotations.actions.duplicate")}
                </button>
                {quotation.state === "draft" && (
                  <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white ${isRTL ? "mr-auto" : "ml-auto"}`}>
                    <Send className="w-4 h-4" />
                    {t("quotations.actions.send")}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Main Quotations Component
export default function Quotations() {
  const { t } = useTranslation()
  const { mode } = useTheme()
  const { isRTL } = useRTL()
  const isDark = mode === "dark"

  const [viewMode, setViewMode] = useState<"kanban" | "list">("list")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([])
  const [sortBy, setSortBy] = useState("date_order-desc")
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Build domain from filters
  const domain = useMemo(() => {
    const filterDomain = buildOdooDomain(filterConditions)
    if (searchQuery) {
      return [
        ...filterDomain,
        "|",
        ["name", "ilike", searchQuery],
        ["partner_id", "ilike", searchQuery],
      ]
    }
    return filterDomain
  }, [filterConditions, searchQuery])

  // Fetch quotations using TanStack Query
  const { data: quotations, isLoading, error, refetch } = useQuotations({
    domain: domain.length > 0 ? domain : [],
    limit: 100,
  })

  // Get currency for formatting
  const { data: currency } = useCurrentCurrency()

  const formatCurrency = useCallback(
    (amount: number) => {
      try {
        const currencyCode = currency?.name || "USD"
        return new Intl.NumberFormat(isRTL ? "ar-SA" : "en-US", {
          style: "currency",
          currency: currencyCode,
          maximumFractionDigits: 0,
        }).format(amount)
      } catch {
        return `$${Math.round(amount).toLocaleString()}`
      }
    },
    [currency, isRTL]
  )

  const handleViewQuotation = (quotation: Quotation) => {
    setSelectedQuotation(quotation)
    setIsDetailOpen(true)
  }

  // Table columns
  const tableColumns: Column<Quotation>[] = useMemo(
    () => [
      {
        id: "name",
        header: t("quotations.columns.reference"),
        icon: FileText,
        width: "200px",
        accessor: (row) => (
          <div className={`flex items-center gap-3 font-bold text-premium-800 dark:text-premium-100 ${isRTL ? "flex-row-reverse" : ""}`}>
            <div className="w-8 h-8 rounded-lg bg-[#EBEFA5] flex items-center justify-center text-[#426932]">
              <FileText className="w-4 h-4" />
            </div>
            {row.name}
          </div>
        ),
      },
      {
        id: "partner",
        header: t("quotations.columns.customer"),
        icon: Building2,
        width: "200px",
        accessor: (row) => row.partner_id?.[1] || "-",
      },
      {
        id: "user",
        header: t("leads.salesperson"),
        icon: User,
        width: "180px",
        accessor: (row) => row.user_id?.[1] || "-",
      },
      {
        id: "date",
        header: t("quotations.columns.date"),
        icon: Calendar,
        width: "140px",
        accessor: (row) => new Date(row.date_order).toLocaleDateString(isRTL ? "ar-SA" : "en-US"),
      },
      {
        id: "total",
        header: t("quotations.columns.total"),
        icon: DollarSign,
        width: "150px",
        accessor: (row) => (
          <span className="font-black text-premium-800 dark:text-premium-50">
            {formatCurrency(row.amount_total)}
          </span>
        ),
      },
      {
        id: "status",
        header: t("quotations.columns.status"),
        icon: CheckCircle2,
        width: "130px",
        align: "center",
        accessor: (row) => {
          const status = getStatusConfig(row.state, t)
          const StatusIcon = status.icon
          return (
            <span
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider"
              style={{ backgroundColor: status.bg, color: status.text }}
            >
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
          )
        },
      },
      {
        id: "actions",
        header: "",
        width: "80px",
        align: "center",
        accessor: (row) => (
          <button
            onClick={() => handleViewQuotation(row)}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? "hover:bg-zinc-800 text-zinc-400" : "hover:bg-gray-100 text-gray-500"
            }`}
          >
            <Eye className="w-4 h-4" />
          </button>
        ),
      },
    ],
    [t, isRTL, isDark, formatCurrency]
  )

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#09090b]" : "bg-[#F8F9FA]"}`}>
      <CRMHeader
        title={t("quotations.title")}
        totalCount={quotations?.length || 0}
        createButtonLabel={t("quotations.add_new")}
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filters={{}}
        setFilters={() => {}}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onAddNew={() => {}}
        onRefresh={() => refetch()}
      />

      <main className="max-w-[1600px] mx-auto px-8 mt-6 pb-12">
        {/* Filter Builder */}
        <div className="mb-6">
          <FilterBuilder
            fields={quotationFields}
            value={filterConditions}
            onChange={setFilterConditions}
            onApply={() => refetch()}
            onClear={() => setFilterConditions([])}
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
            <span className="text-sm font-medium text-gray-500 dark:text-zinc-400">
              {t("common.loading")}
            </span>
          </div>
        ) : error ? (
          <div className={`flex flex-col items-center justify-center h-[60vh] gap-4 ${isDark ? "text-zinc-400" : "text-gray-500"}`}>
            <AlertCircle className="w-12 h-12 text-red-500" />
            <span className="text-sm font-medium">{t("errors.generic")}</span>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              {t("common.retry")}
            </button>
          </div>
        ) : quotations && quotations.length === 0 ? (
          <div className={`flex flex-col items-center justify-center h-[60vh] gap-4 ${isDark ? "text-zinc-400" : "text-gray-500"}`}>
            <FileText className="w-16 h-16 opacity-30" />
            <span className="text-lg font-medium">{t("quotations.no_quotations")}</span>
            <button className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              <Plus className="w-4 h-4 inline-block mr-2" />
              {t("quotations.add_new")}
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === "kanban" ? (
              <motion.div
                key="kanban"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {(quotations || []).map((quotation, idx) => (
                  <QuotationCard
                    key={quotation.id}
                    quotation={quotation as unknown as Quotation}
                    delay={idx}
                    onView={() => handleViewQuotation(quotation as unknown as Quotation)}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <PremiumTable
                  data={(quotations || []) as Quotation[]}
                  columns={tableColumns}
                  rowIdKey="id"
                  pageSize={10}
                  searchable={false}
                  showExport={true}
                  onEdit={handleViewQuotation}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Quotation Detail Modal */}
      <QuotationDetailModal
        quotation={selectedQuotation}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        formatCurrency={formatCurrency}
      />
    </div>
  )
}
