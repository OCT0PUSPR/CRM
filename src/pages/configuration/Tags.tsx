"use client"

import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search,
    Plus,
    MoreHorizontal,
    Tag as TagIcon,
    Edit2,
    Trash2,
    Save,
    X,
    LayoutGrid,
    List,
    TrendingUp,
    ChevronRight,
    Palette,
    Hash,
    Clock,
    CheckCircle2
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

interface Tag {
    id: number
    display_name: string
    name: string
    color: number
    create_uid: [number, string]
    create_date: string
    write_uid: [number, string]
    write_date: string
}

interface TagFormData {
    display_name: string
    name: string
    color: number
}

// ============================================
// SCOPED STYLES
// ============================================

const scopedStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

  .tags-page {
    font-family: 'Space Grotesk', sans-serif !important;
  }
`

// ============================================
// MAIN COMPONENT
// ============================================

export default function TagsPage() {
    const { t, i18n } = useTranslation()
    const { name } = useAuth()
    const { mode } = useTheme()
    const isDark = mode === "dark"
    const isRTL = i18n.dir() === "rtl"

    const [tags, setTags] = useState<Tag[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [filters, setFilters] = useState<{ [key: string]: any }>({})
    const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban")
    const [sortColumn, setSortColumn] = useState<string>("display_name")
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [selectedTag, setSelectedTag] = useState<Tag | null>(null)
    const [formData, setFormData] = useState<TagFormData>({
        display_name: "",
        name: "",
        color: 0,
    })

    // Tag colors palette
    const tagColors = [
        "#ef4444", "#f97316", "#f59e0b", "#eab308",
        "#84cc16", "#22c55e", "#10b981", "#14b8a6",
        "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
        "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
        "#f43f5e", "#64748b", "#475569", "#1e293b"
    ]

    // Load tags data
    const loadTagsData = async () => {
        try {
            setLoading(true)
            const response = await apiService.searchRead<Tag>("crm.tag", {
                domain: [],
                fields: ["id", "display_name", "name", "color", "create_uid", "create_date", "write_uid", "write_date"],
                offset: 0,
                limit: 100,
                order: "name asc"
            })
            if (response && response.records && Array.isArray(response.records)) {
                setTags(response.records)
            } else if (response && response.data && Array.isArray(response.data)) {
                setTags(response.data)
            } else {
                setTags([])
            }
        } catch (error) {
            console.error("Error loading tags:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadTagsData()
    }, [])

    // Filter and sort tags
    const filteredAndSortedTags = useMemo(() => {
        let filtered = tags.filter(tag =>
            tag.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tag.name.toLowerCase().includes(searchQuery.toLowerCase())
        )

        return filtered.sort((a, b) => {
            let aValue = a[sortColumn as keyof Tag]
            let bValue = b[sortColumn as keyof Tag]

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
    }, [tags, searchQuery, sortColumn, sortDirection])

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortColumn(column)
            setSortDirection("asc")
        }
    }

    const handleCreateTag = () => {
        setFormData({
            display_name: "",
            name: "",
            color: 0,
        })
        setShowCreateDialog(true)
    }

    const handleEditTag = (tag: Tag) => {
        setSelectedTag(tag)
        setFormData({
            display_name: tag.display_name,
            name: tag.name,
            color: tag.color,
        })
        setShowEditDialog(true)
    }

    const handleSaveTag = async () => {
        try {
            const tagData = {
                name: formData.name,
                color: formData.color,
            }

            if (showEditDialog && selectedTag) {
                // Update existing tag via API
                await apiService.update("crm.tag", selectedTag.id, tagData)
            } else {
                // Create new tag via API
                await apiService.create("crm.tag", tagData)
            }
            
            // Reload data from API
            await loadTagsData()
            
            setShowCreateDialog(false)
            setShowEditDialog(false)
            setSelectedTag(null)
        } catch (error) {
            console.error("Error saving tag:", error)
        }
    }

    const handleDeleteTag = async (tagId: number) => {
        if (window.confirm(t("tags.delete_tag", "Are you sure you want to delete this tag?"))) {
            try {
                await apiService.delete("crm.tag", tagId)
                await loadTagsData()
            } catch (error) {
                console.error("Error deleting tag:", error)
            }
        }
    }

    const getTagColor = (colorIndex: number) => {
        return tagColors[colorIndex % tagColors.length]
    }

    // ============================================
    // COLUMNS
    // ============================================

    const tableColumns: Column<Tag>[] = [
        {
            id: 'name',
            header: t("tags.tag_name"),
            icon: Hash,
            accessor: (row) => (
                <div className="flex items-center gap-3">
                    <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm transition-transform hover:scale-110"
                        style={{ backgroundColor: getTagColor(row.color) }}
                    >
                        <Hash className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="font-bold text-premium-800 dark:text-premium-50">{row.display_name}</div>
                        <div className="text-xs font-mono text-premium-400">{row.name}</div>
                    </div>
                </div>
            ),
            width: '300px'
        },
        {
            id: 'color',
            header: t("tags.color"),
            icon: Palette,
            accessor: (row) => (
                <div className="flex items-center gap-2">
                    <div 
                        className="w-6 h-6 rounded-md border border-premium-100 dark:border-premium-700 shadow-sm"
                        style={{ backgroundColor: getTagColor(row.color) }}
                    />
                    <span className="text-xs font-medium text-premium-500 uppercase">{getTagColor(row.color)}</span>
                </div>
            ),
            width: '150px'
        },
        {
            id: 'created',
            header: t("common.created"),
            icon: Clock,
            accessor: (row) => (
                <span className="text-xs text-premium-500">
                    {new Date(row.create_date).toLocaleDateString()}
                </span>
            ),
            width: '150px'
        },
        {
            id: 'updated',
            header: t("common.updated"),
            icon: Edit2,
            accessor: (row) => (
                <span className="text-xs text-premium-500">
                    {new Date(row.write_date).toLocaleDateString()}
                </span>
            ),
            width: '150px'
        }
    ];

    // ============================================
    // DIALOGS
    // ============================================

    const TagDialog = ({ isOpen, onClose, mode }: { isOpen: boolean; onClose: () => void; mode: "create" | "edit" }) => (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-white dark:bg-gray-900 border-0 rounded-2xl">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                    <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                        {mode === "create" ? t("tags.create_new", "Create Tag") : t("tags.edit_tag", "Edit Tag")}
                    </DialogTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {mode === "create" ? "Add a new tag for leads" : "Update tag details"}
                    </p>
                </div>
                <div className="px-6 py-5 space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t("tags.tag_name", "Tag Name")} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter tag name"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("tags.color", "Color")}</Label>
                        <div className="grid grid-cols-10 gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                            {tagColors.map((color, index) => (
                                <div
                                    key={index}
                                    className={`w-7 h-7 rounded-lg cursor-pointer transition-all hover:scale-110 ${
                                        formData.color === index 
                                            ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white scale-110' 
                                            : ''
                                    }`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setFormData(prev => ({ ...prev, color: index }))}
                                />
                            ))}
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
                        onClick={handleSaveTag}
                        disabled={!formData.name.trim()}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {mode === "create" ? t("common.create", "Create Tag") : t("common.save", "Save Changes")}
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
            <div className={`tags-page min-h-screen ${isDark ? "theme-dark" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
                <CRMHeader
                    title={t("tags.title")}
                    totalCount={tags.length}
                    createButtonLabel={t("tags.create_new", "Create Tag")}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    filters={filters}
                    setFilters={setFilters}
                    sortBy={sortColumn || "display_name-asc"}
                    setSortBy={(s) => {
                        const [col, dir] = s.split('-')
                        setSortColumn(col)
                        setSortDirection(dir as "asc" | "desc")
                    }}
                    onAddNew={handleCreateTag}
                    onRefresh={loadTagsData}
                />

                <div className="max-w-[1600px] mx-auto px-8 py-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <div className="w-12 h-12 border-4 border-premium-200 border-t-brand-emerald rounded-full animate-spin"></div>
                            <p className="text-premium-500 font-medium">Loading tags...</p>
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
                                    {filteredAndSortedTags.map((tag, index) => (
                                        <motion.div
                                            key={tag.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`group relative p-6 rounded-[24px] border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer ${
                                                isDark 
                                                    ? "bg-[#1e293b] border-premium-800 hover:border-brand-emerald/50" 
                                                    : "bg-white border-premium-100 hover:border-brand-emerald/30"
                                            }`}
                                            onClick={() => handleEditTag(tag)}
                                        >
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div 
                                                        className="w-14 h-14 rounded-[18px] flex items-center justify-center shadow-lg text-white transition-transform group-hover:scale-110"
                                                        style={{ backgroundColor: getTagColor(tag.color) }}
                                                    >
                                                        <Hash className="w-7 h-7 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg text-premium-800 dark:text-premium-50 group-hover:text-brand-emerald transition-colors">
                                                            {tag.display_name}
                                                        </h3>
                                                        <p className="text-xs font-mono text-premium-400 mt-1">
                                                            {tag.name}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteTag(tag.id); }}
                                                        className="p-2 text-premium-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="pt-4 mt-2 border-t border-premium-50 dark:border-premium-800 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div 
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: getTagColor(tag.color) }}
                                                    />
                                                    <span className="text-xs font-bold text-premium-500 uppercase tracking-wide">
                                                        Color #{tag.color}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-premium-400">
                                                    {new Date(tag.create_date).toLocaleDateString()}
                                                </span>
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
                                        data={filteredAndSortedTags}
                                        columns={tableColumns}
                                        rowIdKey="id"
                                        onEdit={handleEditTag}
                                        onDelete={handleDeleteTag}
                                        searchable={false}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>

                <TagDialog isOpen={showCreateDialog} onClose={() => setShowCreateDialog(false)} mode="create" />
                <TagDialog isOpen={showEditDialog} onClose={() => setShowEditDialog(false)} mode="edit" />
            </div>
        </>
    )
}
