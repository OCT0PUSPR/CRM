"use client"

import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search,
    Plus,
    MoreHorizontal,
    AlertCircle,
    Edit2,
    Trash2,
    Save,
    X,
    LayoutGrid,
    List,
    ChevronRight,
    Ban,
    CheckCircle2,
    Calendar,
    ArrowUp
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { apiService } from "../../services/api"
import { useAuth } from "../../../context/auth"
import { useTheme } from "../../../context/theme"
import CRMHeader from "../../components/PagesHeader"
import { PremiumTable, Column } from "../../components/PremiumTable"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../../../@/components/ui/dialog"
import { Input } from "../../../@/components/ui/input"
import { Label } from "../../../@/components/ui/label"

// ============================================
// TYPES
// ============================================

interface LostReason {
    id: number
    name: string
    active: boolean
    create_uid: [number, string]
    create_date: string
    write_uid: [number, string]
    write_date: string
}

interface LostReasonFormData {
    name: string
    active: boolean
}

// ============================================
// SCOPED STYLES
// ============================================

const scopedStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

  .lost-reasons-page {
    font-family: 'Space Grotesk', sans-serif !important;
  }
`

// ============================================
// MAIN COMPONENT
// ============================================

export default function LostReasonsPage() {
    const { t, i18n } = useTranslation()
    const { name } = useAuth()
    const { mode } = useTheme()
    const isDark = mode === "dark"
    const isRTL = i18n.dir() === "rtl"

    const [reasons, setReasons] = useState<LostReason[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [filters, setFilters] = useState<{ [key: string]: any }>({})
    const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban")
    const [sortColumn, setSortColumn] = useState<string>("name")
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [selectedReason, setSelectedReason] = useState<LostReason | null>(null)
    const [formData, setFormData] = useState<LostReasonFormData>({
        name: "",
        active: true,
    })

    // Load reasons data from API
    const loadReasonsData = async () => {
        try {
            setLoading(true)
            const response = await apiService.searchRead<LostReason>("crm.lost.reason", {
                domain: [],
                fields: ["id", "name", "active", "create_uid", "create_date", "write_uid", "write_date"],
                offset: 0,
                limit: 100,
                order: "name asc"
            })
            if (response && response.records && Array.isArray(response.records)) {
                setReasons(response.records)
            } else if (response && response.data && Array.isArray(response.data)) {
                setReasons(response.data)
            } else {
                setReasons([])
            }
        } catch (error) {
            console.error("Error loading lost reasons:", error)
            setReasons([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadReasonsData()
    }, [])

    // Filter and sort reasons
    const filteredAndSortedReasons = useMemo(() => {
        let filtered = reasons.filter(reason =>
            reason.name.toLowerCase().includes(searchQuery.toLowerCase())
        )

        return filtered.sort((a, b) => {
            let aValue = a[sortColumn as keyof LostReason]
            let bValue = b[sortColumn as keyof LostReason]

            if (typeof aValue === "string") {
                return sortDirection === "asc" 
                    ? aValue.localeCompare(bValue as string)
                    : (bValue as string).localeCompare(aValue)
            }

            if (typeof aValue === "number") {
                return sortDirection === "asc" 
                    ? aValue - (bValue as number)
                    : (bValue as number) - aValue
            }

            return 0
        })
    }, [reasons, searchQuery, sortColumn, sortDirection])

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortColumn(column)
            setSortDirection("asc")
        }
    }

    const handleCreateReason = () => {
        setFormData({
            name: "",
            active: true,
        })
        setShowCreateDialog(true)
    }

    const handleEditReason = (reason: LostReason) => {
        setSelectedReason(reason)
        setFormData({
            name: reason.name,
            active: reason.active,
        })
        setShowEditDialog(true)
    }

    const handleSaveReason = async () => {
        try {
            const reasonData = {
                name: formData.name,
                active: formData.active,
            }

            if (showEditDialog && selectedReason) {
                // Update existing reason via API
                await apiService.update("crm.lost.reason", selectedReason.id, reasonData)
            } else {
                // Create new reason via API
                await apiService.create("crm.lost.reason", reasonData)
            }
            
            // Reload data from API
            await loadReasonsData()
            
            setShowCreateDialog(false)
            setShowEditDialog(false)
            setSelectedReason(null)
        } catch (error) {
            console.error("Error saving lost reason:", error)
        }
    }

    const handleDeleteReason = async (reasonId: number) => {
        if (window.confirm(t("lostReasons.delete_reason", "Are you sure you want to delete this reason?"))) {
            try {
                await apiService.delete("crm.lost.reason", reasonId)
                await loadReasonsData()
            } catch (error) {
                console.error("Error deleting lost reason:", error)
            }
        }
    }

    // ============================================
    // COLUMNS
    // ============================================

    const tableColumns: Column<LostReason>[] = [
        {
            id: 'name',
            header: t("lostReasons.reason_name"),
            icon: Ban,
            accessor: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-premium-100 dark:bg-premium-800 flex items-center justify-center text-premium-600 dark:text-premium-400">
                        <Ban className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="font-bold text-premium-800 dark:text-premium-50">{row.name}</div>
                        <div className="text-xs font-mono text-premium-400">ID: {row.id}</div>
                    </div>
                </div>
            ),
            width: '300px'
        },
        {
            id: 'active',
            header: t("common.status"),
            icon: CheckCircle2,
            accessor: (row) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                    row.active 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-premium-50 text-premium-400 border-premium-100'
                }`}>
                    {row.active ? t("common.active") : t("common.inactive")}
                </span>
            ),
            width: '120px',
            align: 'center'
        },
        {
            id: 'created',
            header: t("common.created"),
            icon: Calendar,
            accessor: (row) => (
                <span className="text-xs text-premium-500">
                    {new Date(row.create_date).toLocaleDateString()}
                </span>
            ),
            width: '150px'
        }
    ];

    // ============================================
    // DIALOGS
    // ============================================

    const ReasonDialog = ({ isOpen, onClose, mode }: { isOpen: boolean; onClose: () => void; mode: "create" | "edit" }) => (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-white dark:bg-gray-900 border-0 rounded-2xl">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                    <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                        {mode === "create" ? t("lostReasons.create_new", "Create Lost Reason") : t("lostReasons.edit_reason", "Edit Lost Reason")}
                    </DialogTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {mode === "create" ? "Add a new reason for lost opportunities" : "Update reason details"}
                    </p>
                </div>
                <div className="px-6 py-5 space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t("lostReasons.reason_name", "Reason Name")} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g. Too Expensive"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                        <div className="relative">
                            <input
                                type="checkbox"
                                id="active"
                                checked={formData.active}
                                onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                                className="sr-only peer"
                            />
                            <label
                                htmlFor="active"
                                className="flex items-center justify-center w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer peer-checked:bg-green-500 transition-colors"
                            >
                                <span className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${formData.active ? 'translate-x-2.5' : '-translate-x-2.5'}`} />
                            </label>
                        </div>
                        <div>
                            <Label htmlFor="active" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                                {t("common.active", "Active")}
                            </Label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Enable this reason for selection</p>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        {t("common.cancel", "Cancel")}
                    </button>
                    <button
                        onClick={handleSaveReason}
                        disabled={!formData.name.trim()}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {mode === "create" ? t("common.create", "Create Reason") : t("common.save", "Save Changes")}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )

    // ============================================
    // RENDER
    // ============================================

    return (
        <>
            <style>{scopedStyles}</style>
            <div className={`lost-reasons-page min-h-screen ${isDark ? "theme-dark" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
                <CRMHeader
                    title={t("lostReasons.title")}
                    totalCount={reasons.length}
                    createButtonLabel={t("lostReasons.add_new", "Add Lost Reason")}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    filters={filters}
                    setFilters={setFilters}
                    sortBy={sortColumn || "name-asc"}
                    setSortBy={(s) => {
                        const [col, dir] = s.split('-')
                        setSortColumn(col)
                        setSortDirection(dir as "asc" | "desc")
                    }}
                    onAddNew={handleCreateReason}
                    onRefresh={loadReasonsData}
                />

                <div className="max-w-[1600px] mx-auto px-8 py-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <div className="w-12 h-12 border-4 border-premium-200 border-t-brand-emerald rounded-full animate-spin"></div>
                            <p className="text-premium-500 font-medium">Loading reasons...</p>
                        </div>
                    ) : filteredAndSortedReasons.length === 0 ? (
                        <div className="text-center py-12">
                            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                {t("lostReasons.no_reasons")}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                {t("lostReasons.create_new")}
                            </p>
                            <button
                                onClick={handleCreateReason}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                {t("lostReasons.create_new")}
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
                                    {filteredAndSortedReasons.map((reason, index) => (
                                        <motion.div
                                            key={reason.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`group relative p-6 rounded-[24px] border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer ${
                                                isDark 
                                                    ? "bg-[#1e293b] border-premium-800 hover:border-brand-emerald/50" 
                                                    : "bg-white border-premium-100 hover:border-brand-emerald/30"
                                            }`}
                                            onClick={() => handleEditReason(reason)}
                                        >
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-[18px] flex items-center justify-center bg-gradient-to-br from-brand-emerald to-emerald-600 shadow-lg text-white">
                                                        <Ban className="w-7 h-7 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg text-premium-800 dark:text-premium-50 group-hover:text-brand-emerald transition-colors">
                                                            {reason.name}
                                                        </h3>
                                                        <p className="text-xs text-premium-400 mt-1 font-mono">
                                                            ID: {reason.id}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteReason(reason.id); }}
                                                        className="p-2 text-premium-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                                        reason.active 
                                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                                            : 'bg-premium-50 text-premium-400 border-premium-100'
                                                    }`}>
                                                        {reason.active ? t("common.active") : t("common.inactive")}
                                                    </span>
                                                    <span className="text-xs text-premium-400">
                                                        {new Date(reason.create_date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
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
                                        data={filteredAndSortedReasons}
                                        columns={tableColumns}
                                        rowIdKey="id"
                                        onEdit={handleEditReason}
                                        onDelete={handleDeleteReason}
                                        searchable={false}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>

                <ReasonDialog isOpen={showCreateDialog} onClose={() => setShowCreateDialog(false)} mode="create" />
                <ReasonDialog isOpen={showEditDialog} onClose={() => setShowEditDialog(false)} mode="edit" />
            </div>
        </>
    )
}
