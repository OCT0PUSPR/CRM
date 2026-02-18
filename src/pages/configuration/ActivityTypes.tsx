"use client"

import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search,
    Plus,
    MoreHorizontal,
    Calendar,
    Edit2,
    Trash2,
    Save,
    X,
    LayoutGrid,
    List,
    ChevronRight,
    Clock,
    AlertCircle,
    CheckCircle2,
    FileText,
    Mail,
    Phone,
    Users,
    Tag,
    ListTodo
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../@/components/ui/select"

// ============================================
// TYPES
// ============================================

interface ActivityType {
    id: number
    name: string
    summary: string
    icon: string
    days: number
    category: 'default' | 'upload_file' | 'phonecall' | 'meeting'
    active: boolean
    create_uid: [number, string]
    create_date: string
    write_uid: [number, string]
    write_date: string
}

interface ActivityTypeFormData {
    name: string
    summary: string
    icon: string
    days: number
    category: 'default' | 'upload_file' | 'phonecall' | 'meeting'
    active: boolean
}

// ============================================
// SCOPED STYLES
// ============================================

const scopedStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

  .activity-types-page {
    font-family: 'Space Grotesk', sans-serif !important;
  }
`

// ============================================
// MAIN COMPONENT
// ============================================

export default function ActivityTypesPage() {
    const { t, i18n } = useTranslation()
    const { name } = useAuth()
    const { mode } = useTheme()
    const isDark = mode === "dark"
    const isRTL = i18n.dir() === "rtl"

    const [types, setTypes] = useState<ActivityType[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [filters, setFilters] = useState<{ [key: string]: any }>({})
    const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban")
    const [sortColumn, setSortColumn] = useState<string>("name")
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [selectedType, setSelectedType] = useState<ActivityType | null>(null)
    const [formData, setFormData] = useState<ActivityTypeFormData>({
        name: "",
        summary: "",
        icon: "fa-tasks",
        days: 0,
        category: "default",
        active: true,
    })

    // Load types data
    const loadTypesData = async () => {
        try {
            setLoading(true)
            // Mock data
            const mockTypes: ActivityType[] = [
                {
                    id: 1,
                    name: "Email",
                    summary: "Send an email",
                    icon: "fa-envelope",
                    days: 1,
                    category: "default",
                    active: true,
                    create_uid: [1, "Admin"],
                    create_date: "2024-01-15T10:00:00Z",
                    write_uid: [1, "Admin"],
                    write_date: "2024-01-15T10:00:00Z",
                },
                {
                    id: 2,
                    name: "Call",
                    summary: "Call the customer",
                    icon: "fa-phone",
                    days: 2,
                    category: "phonecall",
                    active: true,
                    create_uid: [1, "Admin"],
                    create_date: "2024-01-16T10:00:00Z",
                    write_uid: [1, "Admin"],
                    write_date: "2024-01-16T10:00:00Z",
                },
                {
                    id: 3,
                    name: "Meeting",
                    summary: "Schedule a meeting",
                    icon: "fa-users",
                    days: 5,
                    category: "meeting",
                    active: true,
                    create_uid: [1, "Admin"],
                    create_date: "2024-01-17T10:00:00Z",
                    write_uid: [1, "Admin"],
                    write_date: "2024-01-17T10:00:00Z",
                },
                {
                    id: 4,
                    name: "To Do",
                    summary: "Task to complete",
                    icon: "fa-check-square",
                    days: 3,
                    category: "default",
                    active: true,
                    create_uid: [1, "Admin"],
                    create_date: "2024-01-18T10:00:00Z",
                    write_uid: [1, "Admin"],
                    write_date: "2024-01-18T10:00:00Z",
                },
                {
                    id: 5,
                    name: "Upload Document",
                    summary: "Upload required files",
                    icon: "fa-upload",
                    days: 7,
                    category: "upload_file",
                    active: true,
                    create_uid: [1, "Admin"],
                    create_date: "2024-01-19T10:00:00Z",
                    write_uid: [1, "Admin"],
                    write_date: "2024-01-19T10:00:00Z",
                },
            ]
            setTypes(mockTypes)
        } catch (error) {
            console.error("Error loading activity types:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadTypesData()
    }, [])

    // Filter and sort types
    const filteredAndSortedTypes = useMemo(() => {
        let filtered = types.filter(type =>
            type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            type.summary.toLowerCase().includes(searchQuery.toLowerCase())
        )

        return filtered.sort((a, b) => {
            let aValue = a[sortColumn as keyof ActivityType]
            let bValue = b[sortColumn as keyof ActivityType]

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
    }, [types, searchQuery, sortColumn, sortDirection])

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortColumn(column)
            setSortDirection("asc")
        }
    }

    const handleCreateType = () => {
        setFormData({
            name: "",
            summary: "",
            icon: "fa-tasks",
            days: 0,
            category: "default",
            active: true,
        })
        setShowCreateDialog(true)
    }

    const handleEditType = (type: ActivityType) => {
        setSelectedType(type)
        setFormData({
            name: type.name,
            summary: type.summary,
            icon: type.icon,
            days: type.days,
            category: type.category,
            active: type.active,
        })
        setShowEditDialog(true)
    }

    const handleSaveType = async () => {
        try {
            if (showEditDialog && selectedType) {
                // Update existing type
                setTypes(prev => prev.map(type => 
                    type.id === selectedType.id 
                        ? { 
                            ...type, 
                            ...formData,
                            write_uid: [1, "Admin"],
                            write_date: new Date().toISOString() 
                        }
                        : type
                ))
            } else {
                // Create new type
                const newType: ActivityType = {
                    id: Math.max(...types.map(t => t.id)) + 1,
                    ...formData,
                    create_uid: [1, "Admin"],
                    create_date: new Date().toISOString(),
                    write_uid: [1, "Admin"],
                    write_date: new Date().toISOString(),
                }
                setTypes(prev => [...prev, newType])
            }
            
            setShowCreateDialog(false)
            setShowEditDialog(false)
            setSelectedType(null)
        } catch (error) {
            console.error("Error saving activity type:", error)
        }
    }

    const handleDeleteType = async (typeId: number) => {
        if (window.confirm(t("activityTypes.delete_type"))) {
            try {
                setTypes(prev => prev.filter(type => type.id !== typeId))
            } catch (error) {
                console.error("Error deleting activity type:", error)
            }
        }
    }

    const getIconComponent = (iconName: string) => {
        switch (iconName) {
            case "fa-envelope": return <Mail className="w-6 h-6" />
            case "fa-phone": return <Phone className="w-6 h-6" />
            case "fa-users": return <Users className="w-6 h-6" />
            case "fa-check-square": return <CheckCircle2 className="w-6 h-6" />
            case "fa-upload": return <FileText className="w-6 h-6" />
            default: return <ListTodo className="w-6 h-6" />
        }
    }

    // ============================================
    // COLUMNS
    // ============================================

    const tableColumns: Column<ActivityType>[] = [
        {
            id: 'name',
            header: t("activityTypes.type_name"),
            icon: ListTodo,
            accessor: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-premium-100 dark:bg-premium-800 flex items-center justify-center text-premium-600 dark:text-premium-400">
                        {React.cloneElement(getIconComponent(row.icon) as React.ReactElement<any>, { className: "w-4 h-4" })}
                    </div>
                    <div>
                        <div className="font-bold text-premium-800 dark:text-premium-50">{row.name}</div>
                        <div className="text-xs text-premium-400 truncate max-w-[200px]">{row.summary}</div>
                    </div>
                </div>
            ),
            width: '280px'
        },
        {
            id: 'category',
            header: t("activityTypes.category"),
            icon: Tag,
            accessor: (row) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-premium-50 text-premium-600 border border-premium-100 dark:bg-premium-800 dark:text-premium-300 dark:border-premium-700">
                    {row.category}
                </span>
            ),
            width: '180px'
        },
        {
            id: 'days',
            header: "Days Due",
            icon: Clock,
            accessor: (row) => (
                <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-premium-400" />
                    <span className="font-mono text-sm">{row.days}</span>
                </div>
            ),
            width: '120px'
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

    const TypeDialog = ({ isOpen, onClose, mode }: { isOpen: boolean; onClose: () => void; mode: "create" | "edit" }) => (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "create" ? t("activityTypes.create_new") : t("activityTypes.edit_type")}
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">{t("activityTypes.type_name")}</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g. Email"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="summary">Summary</Label>
                        <Input
                            id="summary"
                            value={formData.summary}
                            onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                            placeholder="e.g. Send an email"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="category">{t("activityTypes.category")}</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="default">Default</SelectItem>
                                    <SelectItem value="upload_file">Upload Document</SelectItem>
                                    <SelectItem value="phonecall">Phonecall</SelectItem>
                                    <SelectItem value="meeting">Meeting</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="days">Days Due</Label>
                            <Input
                                id="days"
                                type="number"
                                value={formData.days}
                                onChange={(e) => setFormData(prev => ({ ...prev, days: parseInt(e.target.value) || 0 }))}
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="icon">{t("activityTypes.icon")}</Label>
                        <Select
                            value={formData.icon}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select icon" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="fa-tasks">Tasks</SelectItem>
                                <SelectItem value="fa-envelope">Email</SelectItem>
                                <SelectItem value="fa-phone">Phone</SelectItem>
                                <SelectItem value="fa-users">Meeting</SelectItem>
                                <SelectItem value="fa-check-square">To Do</SelectItem>
                                <SelectItem value="fa-upload">Upload</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="active"
                            checked={formData.active}
                            onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor="active">Active</Label>
                    </div>
                </div>
                <DialogFooter>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                        {t("common.cancel")}
                    </button>
                    <button
                        onClick={handleSaveType}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                    >
                        {t("common.save")}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

    // ============================================
    // RENDER
    // ============================================

    return (
        <>
            <style>{scopedStyles}</style>
            <div className={`activity-types-page min-h-screen ${isDark ? "theme-dark" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
                <CRMHeader
                    title={t("activityTypes.title")}
                    totalCount={types.length}
                    createButtonLabel={t("activityTypes.add_new", "Add Activity Type")}
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
                    onAddNew={handleCreateType}
                    onRefresh={loadTypesData}
                />

                <div className="max-w-[1600px] mx-auto px-8 py-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <div className="w-12 h-12 border-4 border-premium-200 border-t-brand-emerald rounded-full animate-spin"></div>
                            <p className="text-premium-500 font-medium">Loading activity types...</p>
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
                                    {filteredAndSortedTypes.map((type, index) => (
                                        <motion.div
                                            key={type.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`group relative p-6 rounded-[24px] border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer ${
                                                isDark 
                                                    ? "bg-[#1e293b] border-premium-800 hover:border-brand-emerald/50" 
                                                    : "bg-white border-premium-100 hover:border-brand-emerald/30"
                                            }`}
                                            onClick={() => handleEditType(type)}
                                        >
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-[18px] flex items-center justify-center bg-gradient-to-br from-brand-emerald to-emerald-600 shadow-lg text-white">
                                                        {React.cloneElement(getIconComponent(type.icon) as React.ReactElement<any>, { className: "w-7 h-7 text-white" })}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg text-premium-800 dark:text-premium-50 group-hover:text-brand-emerald transition-colors">
                                                            {type.name}
                                                        </h3>
                                                        <p className="text-xs text-premium-400 mt-1 line-clamp-1">
                                                            {type.summary}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteType(type.id); }}
                                                        className="p-2 text-premium-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-3 rounded-xl bg-premium-50 dark:bg-premium-900/50">
                                                    <div className="flex items-center gap-2">
                                                        <Tag className="w-4 h-4 text-premium-400" />
                                                        <span className="text-xs font-bold text-premium-600 dark:text-premium-300 uppercase tracking-wide">Category</span>
                                                    </div>
                                                    <span className="text-xs font-bold bg-white dark:bg-premium-800 px-2 py-1 rounded-md border border-premium-100 dark:border-premium-700">
                                                        {type.category}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                                        type.active 
                                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                                            : 'bg-premium-50 text-premium-400 border-premium-100'
                                                    }`}>
                                                        {type.active ? "Active" : "Inactive"}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 text-premium-400">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span className="text-xs font-mono">{type.days}d</span>
                                                    </div>
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
                                        data={filteredAndSortedTypes}
                                        columns={tableColumns}
                                        rowIdKey="id"
                                        onEdit={handleEditType}
                                        onDelete={handleDeleteType}
                                        searchable={false}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>

                <TypeDialog isOpen={showCreateDialog} onClose={() => setShowCreateDialog(false)} mode="create" />
                <TypeDialog isOpen={showEditDialog} onClose={() => setShowEditDialog(false)} mode="edit" />
            </div>
        </>
    )
}
