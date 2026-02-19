    "use client"

import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search,
    Plus,
    MoreHorizontal,
    TrendingUp,
    Edit2,
    Trash2,
    Save,
    X, 
    LayoutGrid,
    List,
    ChevronRight,
    Hash,
    Target,
    CheckCircle2,
    AlertTriangle,
    BarChart3,
    FileText,
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

interface Stage {
    id: number
    display_name: string
    name: string
    sequence: number
    is_won: boolean
    rotting_threshold_days: number
    requirements: string
    fold: boolean
    color: number
    create_uid: [number, string]
    create_date: string
    write_uid: [number, string]
    write_date: string
}

interface StageFormData {
    name: string
    sequence: number
    is_won: boolean
    rotting_threshold_days: number
    requirements: string
    fold: boolean
}

// ============================================
// SCOPED STYLES
// ============================================

const scopedStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

  .stages-page {
    font-family: 'Space Grotesk', sans-serif !important;
  }
`

// ============================================
// MAIN COMPONENT
// ============================================

export default function StagesPage() {
    const { t, i18n } = useTranslation()
    const { name } = useAuth()
    const { mode } = useTheme()
    const isDark = mode === "dark"
    const isRTL = i18n.dir() === "rtl"

    const [stages, setStages] = useState<Stage[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [filters, setFilters] = useState<{ [key: string]: any }>({})
    const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban")
    const [sortColumn, setSortColumn] = useState<string>("sequence")
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [selectedStage, setSelectedStage] = useState<Stage | null>(null)
    const [formData, setFormData] = useState<StageFormData>({
        name: "",
        sequence: 1,
        is_won: false,
        rotting_threshold_days: 0,
        requirements: "",
        fold: false,
    })

    // Load stages data from API
    const loadStagesData = async () => {
        try {
            setLoading(true)
            const response = await apiService.searchRead<Stage>("crm.stage", {
                domain: [],
                fields: ["id", "display_name", "name", "sequence", "is_won", "rotting_threshold_days", "requirements", "fold", "color", "create_uid", "create_date", "write_uid", "write_date"],
                offset: 0,
                limit: 100,
                order: "sequence asc"
            })
            if (response && response.records && Array.isArray(response.records)) {
                setStages(response.records)
            } else if (response && response.data && Array.isArray(response.data)) {
                setStages(response.data)
            } else {
                setStages([])
            }
        } catch (error) {
            console.error("Error loading stages:", error)
            setStages([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadStagesData()
    }, [])

    // Filter and sort stages
    const filteredAndSortedStages = useMemo(() => {
        let filtered = stages.filter(stage =>
            stage.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            stage.name.toLowerCase().includes(searchQuery.toLowerCase())
        )

        return filtered.sort((a, b) => {
            let aValue = a[sortColumn as keyof Stage]
            let bValue = b[sortColumn as keyof Stage]

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
    }, [stages, searchQuery, sortColumn, sortDirection])

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortColumn(column)
            setSortDirection("asc")
        }
    }

    const handleCreateStage = () => {
        setFormData({
            name: "",
            sequence: stages.length + 1,
            is_won: false,
            rotting_threshold_days: 0,
            requirements: "",
            fold: false,
        })
        setShowCreateDialog(true)
    }

    const handleEditStage = (stage: Stage) => {
        setSelectedStage(stage)
        setFormData({
            name: stage.name,
            sequence: stage.sequence,
            is_won: stage.is_won,
            rotting_threshold_days: stage.rotting_threshold_days || 0,
            requirements: stage.requirements || "",
            fold: stage.fold,
        })
        setShowEditDialog(true)
    }

    const handleSaveStage = async () => {
        try {
            const stageData = {
                name: formData.name,
                sequence: formData.sequence,
                is_won: formData.is_won,
                rotting_threshold_days: formData.rotting_threshold_days,
                requirements: formData.requirements,
                fold: formData.fold,
            }

            if (showEditDialog && selectedStage) {
                // Update existing stage via API
                await apiService.update("crm.stage", selectedStage.id, stageData)
            } else {
                // Create new stage via API
                await apiService.create("crm.stage", stageData)
            }
            
            // Reload data from API
            await loadStagesData()
            
            setShowCreateDialog(false)
            setShowEditDialog(false)
            setSelectedStage(null)
        } catch (error) {
            console.error("Error saving stage:", error)
        }
    }

    const handleDeleteStage = async (stageId: number) => {
        if (window.confirm(t("stages.delete_stage", "Are you sure you want to delete this stage?"))) {
            try {
                await apiService.delete("crm.stage", stageId)
                await loadStagesData()
            } catch (error) {
                console.error("Error deleting stage:", error)
            }
        }
    }

    const getStageColor = (colorIndex: number) => {
        const colors = [
            "bg-gray-500", "bg-blue-500", "bg-green-500", "bg-yellow-500",
            "bg-red-500", "bg-purple-500", "bg-pink-500", "bg-indigo-500"
        ]
        return colors[colorIndex % colors.length]
    }

    // ============================================
    // COLUMNS
    // ============================================

    const tableColumns: Column<Stage>[] = [
        {
            id: 'sequence',
            header: t("stages.sequence"),
            icon: ArrowUp,
            accessor: (row) => <span className="font-mono text-sm font-bold text-premium-500">{row.sequence}</span>,
            width: '100px',
            align: 'center'
        },
        {
            id: 'name',
            header: t("stages.stage_name"),
            icon: TrendingUp,
            accessor: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-emerald to-emerald-600 flex items-center justify-center text-white shadow-sm">
                        <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="font-bold text-premium-800 dark:text-premium-50">{row.display_name}</div>
                        <div className="text-xs font-mono text-premium-400">{row.name}</div>
                    </div>
                </div>
            ),
            width: '250px'
        },
        {
            id: 'is_won',
            header: t("stages.is_won", "Won Stage"),
            icon: CheckCircle2,
            accessor: (row) => (
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
                    row.is_won 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-gray-50 text-gray-400 border-gray-100'
                }`}>
                    {row.is_won ? <CheckCircle2 className="w-3 h-3" /> : <Target className="w-3 h-3" />}
                    {row.is_won ? 'Won' : 'In Progress'}
                </span>
            ),
            width: '150px'
        },
        {
            id: 'requirements',
            header: t("stages.requirements"),
            icon: FileText,
            accessor: (row) => (
                <div className="text-xs text-premium-500 truncate max-w-[200px]">
                    {row.requirements || "-"}
                </div>
            ),
            width: '250px'
        },
        {
            id: 'fold',
            header: t("stages.fold"),
            icon: Hash,
            accessor: (row) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                    row.fold 
                        ? 'bg-premium-100 text-premium-600 border-premium-200' 
                        : 'bg-white text-premium-400 border-premium-100'
                }`}>
                    {row.fold ? 'Yes' : 'No'}
                </span>
            ),
            width: '100px',
            align: 'center'
        }
    ];

    // ============================================
    // DIALOGS
    // ============================================

    const StageDialog = ({ isOpen, onClose, mode }: { isOpen: boolean; onClose: () => void; mode: "create" | "edit" }) => (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white dark:bg-gray-900 border-0 rounded-2xl">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                    <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                        {mode === "create" ? t("stages.create_new", "Create Stage") : t("stages.edit_stage", "Edit Stage")}
                    </DialogTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {mode === "create" ? "Add a new pipeline stage" : "Update stage details"}
                    </p>
                </div>
                
                <div className="px-6 py-5 space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t("stages.stage_name", "Stage Name")} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter stage name"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="sequence" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("stages.sequence", "Sequence")}
                            </Label>
                            <Input
                                id="sequence"
                                type="number"
                                value={formData.sequence}
                                onChange={(e) => setFormData(prev => ({ ...prev, sequence: parseInt(e.target.value) || 0 }))}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="rotting_threshold_days" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("stages.rotting_days", "Days to Rot")}
                            </Label>
                            <Input
                                id="rotting_threshold_days"
                                type="number"
                                min="0"
                                value={formData.rotting_threshold_days}
                                onChange={(e) => setFormData(prev => ({ ...prev, rotting_threshold_days: parseInt(e.target.value) || 0 }))}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="requirements" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t("stages.requirements", "Requirements")}
                        </Label>
                        <textarea
                            id="requirements"
                            value={formData.requirements}
                            onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                            placeholder="Describe the requirements for this stage..."
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none h-20"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    id="is_won"
                                    checked={formData.is_won}
                                    onChange={(e) => setFormData(prev => ({ ...prev, is_won: e.target.checked }))}
                                    className="sr-only peer"
                                />
                                <label
                                    htmlFor="is_won"
                                    className="flex items-center justify-center w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer peer-checked:bg-green-500 transition-colors"
                                >
                                    <span className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${formData.is_won ? 'translate-x-2.5' : '-translate-x-2.5'}`} />
                                </label>
                            </div>
                            <div>
                                <Label htmlFor="is_won" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                                    {t("stages.is_won", "Won Stage")}
                                </Label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Mark as winning stage</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    id="fold"
                                    checked={formData.fold}
                                    onChange={(e) => setFormData(prev => ({ ...prev, fold: e.target.checked }))}
                                    className="sr-only peer"
                                />
                                <label
                                    htmlFor="fold"
                                    className="flex items-center justify-center w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer peer-checked:bg-blue-500 transition-colors"
                                >
                                    <span className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${formData.fold ? 'translate-x-2.5' : '-translate-x-2.5'}`} />
                                </label>
                            </div>
                            <div>
                                <Label htmlFor="fold" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                                    {t("stages.fold", "Fold")}
                                </Label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Fold in kanban view</p>
                            </div>
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
                        onClick={handleSaveStage}
                        disabled={!formData.name.trim()}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {mode === "create" ? t("common.create", "Create Stage") : t("common.save", "Save Changes")}
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
            <div className={`stages-page min-h-screen ${isDark ? "theme-dark" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
                <CRMHeader
                    title={t("stages.title")}
                    totalCount={stages.length}
                    createButtonLabel={t("stages.add_new", "Add Stage")}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    filters={filters}
                    setFilters={setFilters}
                    sortBy={sortColumn || "sequence-asc"}
                    setSortBy={(s) => {
                        const [col, dir] = s.split('-')
                        setSortColumn(col)
                        setSortDirection(dir as "asc" | "desc")
                    }}
                    onAddNew={handleCreateStage}
                    onRefresh={loadStagesData}
                />

                <div className="max-w-[1600px] mx-auto px-8 py-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <div className="w-12 h-12 border-4 border-premium-200 border-t-brand-emerald rounded-full animate-spin"></div>
                            <p className="text-premium-500 font-medium">Loading stages...</p>
                        </div>
                    ) : filteredAndSortedStages.length === 0 ? (
                        <div className="text-center py-12">
                            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                {t("stages.no_stages")}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                {t("stages.create_new")}
                            </p>
                            <button
                                onClick={handleCreateStage}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                {t("stages.create_new")}
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
                                    {filteredAndSortedStages.map((stage, index) => (
                                        <motion.div
                                            key={stage.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`group relative p-6 rounded-[24px] border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer ${
                                                isDark 
                                                    ? "bg-[#1e293b] border-premium-800 hover:border-brand-emerald/50" 
                                                    : "bg-white border-premium-100 hover:border-brand-emerald/30"
                                            }`}
                                            onClick={() => handleEditStage(stage)}
                                        >
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-[18px] flex items-center justify-center bg-gradient-to-br from-brand-emerald to-emerald-600 shadow-lg text-white font-bold text-xl">
                                                        {stage.sequence}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg text-premium-800 dark:text-premium-50 group-hover:text-brand-emerald transition-colors">
                                                            {stage.display_name}
                                                        </h3>
                                                        <div className="flex items-center gap-1.5 mt-1">
                                                            <div className={`w-2 h-2 rounded-full ${
                                                                stage.is_won ? 'bg-emerald-500' : 'bg-blue-500'
                                                            }`} />
                                                            <span className="text-xs font-medium text-premium-500">
                                                                {stage.is_won ? 'Won Stage' : 'In Progress'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteStage(stage.id); }}
                                                        className="p-2 text-premium-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                {stage.requirements && (
                                                    <div className="p-3 rounded-xl bg-premium-50 dark:bg-premium-900/50 text-xs text-premium-600 dark:text-premium-300 leading-relaxed">
                                                        {stage.requirements}
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                                        stage.fold 
                                                            ? 'bg-premium-100 text-premium-600 border-premium-200' 
                                                            : 'bg-white text-premium-400 border-premium-100'
                                                    }`}>
                                                        {stage.fold ? "Folded" : "Unfolded"}
                                                    </span>
                                                    <span className="text-xs text-premium-400">
                                                        {new Date(stage.create_date).toLocaleDateString()}
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
                                        data={filteredAndSortedStages}
                                        columns={tableColumns}
                                        rowIdKey="id"
                                        onEdit={handleEditStage}
                                        onDelete={handleDeleteStage}
                                        searchable={false}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>

                <StageDialog isOpen={showCreateDialog} onClose={() => setShowCreateDialog(false)} mode="create" />
                <StageDialog isOpen={showEditDialog} onClose={() => setShowEditDialog(false)} mode="edit" />
            </div>
        </>
    )
}
