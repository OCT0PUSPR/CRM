
"use client"

import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Plus,
    FileText,
    Edit2,
    Trash2,
    ListTodo,
    ArrowUpRight,
    Settings2,
    Zap,
    Users,
    Repeat,
    Lock,
    TrendingUp,
    Send,
    CheckCircle2,
    Clock
} from "lucide-react"
import { useTranslation } from "react-i18next"
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

interface ActivityPlan {
    id: number
    name: string
    res_model: string
    active: boolean
    steps_count: number
    create_uid: [number, string]
    create_date: string
    write_uid: [number, string]
    write_date: string
}

interface ActivityPlanFormData {
    name: string
    res_model: string
    active: boolean
}

// ============================================
// HELPERS
// ============================================

const getPlanIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('onboarding')) return Zap;
    if (n.includes('follow')) return Send;
    if (n.includes('closure')) return Lock;
    if (n.includes('partner')) return Users;
    if (n.includes('renewal')) return Repeat;
    if (n.includes('upsell')) return TrendingUp;
    return ListTodo;
};

const getStatusBadge = (active: boolean) => {
    return active ? (
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#f3f4ee] text-[#4c6b22] text-[11px] font-bold border border-[#4c6b22]/10">
            Completed
        </span>
    ) : (
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-premium-50 text-premium-400 text-[11px] font-bold border border-premium-100">
            Pending
        </span>
    );
};

// ============================================
// SUB-COMPONENTS
// ============================================

const PlanCard = ({ plan, onEdit, onDelete }: { 
    plan: ActivityPlan; 
    onEdit: (p: ActivityPlan) => void; 
    onDelete: (id: number) => void 
}) => {
    const Icon = getPlanIcon(plan.name);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group relative bg-white dark:bg-premium-900 border border-premium-100 dark:border-premium-800 rounded-[32px] p-8 shadow-sm hover:shadow-2xl hover:shadow-premium-100/40 dark:hover:shadow-black/30 transition-all duration-500 cursor-pointer"
            onClick={() => onEdit(plan)}
        >
            <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[20px] bg-premium-50 dark:bg-premium-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <Icon className="w-7 h-7 text-premium-800 dark:text-premium-50" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-xl text-premium-800 dark:text-premium-50 truncate leading-tight tracking-tight group-hover:text-[#4c6b22] transition-colors">
                            {plan.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-emerald" />
                            <span className="text-xs font-bold text-premium-400 uppercase tracking-widest">{plan.res_model}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(plan.id); }}
                        className="p-2.5 text-premium-400 hover:text-brand-rose hover:bg-brand-rose/5 rounded-2xl transition-all"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-premium-400 uppercase tracking-widest">Progress</span>
                    <span className="font-black text-premium-800 dark:text-premium-100 tabular-nums">{plan.steps_count} Steps</span>
                </div>

                <div className="h-2 w-full bg-premium-50 dark:bg-premium-800 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (plan.steps_count / 15) * 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-[#4c6b22] to-[#6a9431] rounded-full" 
                    />
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-premium-300">
                        <Clock className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{new Date(plan.create_date).toLocaleDateString()}</span>
                    </div>
                    {getStatusBadge(plan.active)}
                </div>
            </div>
        </motion.div>
    )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ActivityPlansPage() {
    const { t } = useTranslation()
    const { mode } = useTheme()
    const [plans, setPlans] = useState<ActivityPlan[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [filters, setFilters] = useState<{ [key: string]: any }>({})
    const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban")
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState<ActivityPlan | null>(null)
    const [formData, setFormData] = useState<ActivityPlanFormData>({
        name: "",
        res_model: "crm.lead",
        active: true,
    })

    const loadPlansData = async () => {
        try {
            setLoading(true)
            const mockPlans: ActivityPlan[] = [
                { id: 1008, name: "Strategic Onboarding", res_model: "crm.lead", active: true, steps_count: 6, create_uid: [1, "Admin"], create_date: "2024-12-17T10:00:00Z", write_uid: [1, "Admin"], write_date: "2024-12-17T10:00:00Z" },
                { id: 1007, name: "Enterprise Follow-up", res_model: "crm.lead", active: false, steps_count: 8, create_uid: [1, "Admin"], create_date: "2024-12-16T10:00:00Z", write_uid: [1, "Admin"], write_date: "2024-12-16T10:00:00Z" },
                { id: 1006, name: "Closure Protocol", res_model: "crm.lead", active: true, steps_count: 4, create_uid: [1, "Admin"], create_date: "2024-12-16T10:00:00Z", write_uid: [1, "Admin"], write_date: "2024-12-16T10:00:00Z" },
                { id: 1005, name: "Partner Lifecycle", res_model: "res.partner", active: true, steps_count: 12, create_uid: [1, "Admin"], create_date: "2024-12-16T10:00:00Z", write_uid: [1, "Admin"], write_date: "2024-12-16T10:00:00Z" },
                { id: 1004, name: "Renewal Automation", res_model: "sale.order", active: true, steps_count: 3, create_uid: [1, "Admin"], create_date: "2024-12-15T10:00:00Z", write_uid: [1, "Admin"], write_date: "2024-12-15T10:00:00Z" },
                { id: 1003, name: "High-Value Upsell", res_model: "crm.lead", active: true, steps_count: 5, create_uid: [1, "Admin"], create_date: "2024-12-16T10:00:00Z", write_uid: [1, "Admin"], write_date: "2024-12-16T10:00:00Z" },
            ]
            setPlans(mockPlans)
        } catch (error) {
            console.error("Error loading activity plans:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadPlansData() }, [])

    const filteredPlans = useMemo(() => {
        return plans.filter(plan =>
            plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            plan.res_model.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [plans, searchQuery])

    const handleEditPlan = (plan: ActivityPlan) => {
        setSelectedPlan(plan)
        setFormData({ name: plan.name, res_model: plan.res_model, active: plan.active })
        setShowEditDialog(true)
    }

    const handleCreatePlan = () => {
        setSelectedPlan(null)
        setFormData({ name: "", res_model: "crm.lead", active: true })
        setShowCreateDialog(true)
    }

    const handleCloseDialog = () => {
        setShowCreateDialog(false)
        setShowEditDialog(false)
        setSelectedPlan(null)
    }

    const handleSavePlan = () => {
        if (showEditDialog && selectedPlan) {
            setPlans(prev => prev.map(p => p.id === selectedPlan.id ? {
                ...p,
                ...formData,
                write_uid: [1, "Admin"],
                write_date: new Date().toISOString(),
            } : p))
        } else {
            const now = new Date().toISOString()
            const newPlan: ActivityPlan = {
                id: Math.floor(Math.random() * 1000) + 2000,
                ...formData,
                steps_count: 0,
                create_uid: [1, "Admin"],
                create_date: now,
                write_uid: [1, "Admin"],
                write_date: now,
            }
            setPlans(prev => [newPlan, ...prev])
        }
        handleCloseDialog()
    }

    const tableColumns: Column<ActivityPlan>[] = [
        { 
            id: 'id', 
            header: t('common.id', 'ID'),
            accessor: (row) => <span className="text-premium-400 font-bold">#{row.id}</span>,
            width: '120px'
        },
        { 
            id: 'name', 
            header: t('activityPlans.plan_name', 'Plan Name'), 
            accessor: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-premium-50 dark:bg-premium-800 flex items-center justify-center font-bold text-xs text-premium-400 border border-premium-100">
                        {row.name.charAt(0)}
                    </div>
                    <span className="font-bold">{row.name}</span>
                </div>
            ),
            width: '320px'
        },
        { 
            id: 'model', 
            header: t('activityPlans.target_model', 'Target Model'), 
            accessor: (row) => <span className="font-bold text-premium-500 uppercase text-[11px] tracking-widest">{row.res_model}</span>,
            width: '220px'
        },
        { 
            id: 'status', 
            header: t('common.status', 'Status'), 
            accessor: (row) => getStatusBadge(row.active),
            width: '160px',
            align: 'center'
        },
        { 
            id: 'steps', 
            header: t('activityPlans.steps', 'Steps'), 
            accessor: (row) => <span className="font-black tabular-nums">{row.steps_count}</span>,
            width: '120px',
            align: 'center'
        },
        {
            id: 'created',
            header: t('common.created', 'Created'),
            accessor: (row) => (
                <span className="text-premium-400">
                    {new Date(row.create_date).toLocaleDateString()}
                </span>
            ),
            width: '160px',
        },
        {
            id: 'updated',
            header: t('common.updated', 'Updated'),
            accessor: (row) => (
                <span className="text-premium-400">
                    {new Date(row.write_date).toLocaleDateString()}
                </span>
            ),
            width: '160px',
        },
    ];

    return (
        <div className="min-h-screen bg-[#FBFBFC] dark:bg-[#0F1115] font-sans transition-colors duration-300">
            <CRMHeader
                title={t('activityPlans.title', 'Activity Plans')}
                totalCount={plans.length}
                createButtonLabel={t('activityPlans.add_new', 'Add Activity Plan')}
                viewMode={viewMode}
                setViewMode={setViewMode}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filters={filters}
                setFilters={setFilters}
                sortBy="name-asc"
                setSortBy={() => {}}
                onAddNew={handleCreatePlan}
                onRefresh={loadPlansData}
            />

            <main className="max-w-[1600px] mx-auto px-8 py-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4">
                        <div className="w-16 h-16 rounded-[24px] border-4 border-premium-50 border-t-[#4c6b22] animate-spin" />
                        <span className="text-xs font-black uppercase tracking-widest text-premium-400">Synchronizing Logic...</span>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {viewMode === "kanban" ? (
                            <motion.div 
                                key="kanban"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                            >
                                {filteredPlans.map((plan) => (
                                    <PlanCard 
                                        key={plan.id} 
                                        plan={plan} 
                                        onEdit={handleEditPlan} 
                                        onDelete={(id) => setPlans(prev => prev.filter(p => p.id !== id))} 
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
                                    data={filteredPlans}
                                    columns={tableColumns}
                                    rowIdKey="id"
                                    onEdit={handleEditPlan}
                                    onDelete={(id) => setPlans(prev => prev.filter(p => p.id !== id))}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </main>

            {/* Dialogs */}
            <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(v) => { if(!v) { setShowCreateDialog(false); setShowEditDialog(false); } }}>
                <DialogContent className="sm:max-w-[540px] rounded-[40px] border-none shadow-2xl p-10 overflow-hidden font-sans bg-white dark:bg-premium-900">
                    <DialogHeader className="mb-8">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-12 h-12 rounded-[18px] bg-[#f3f4ee] flex items-center justify-center">
                                <Settings2 className="w-6 h-6 text-[#4c6b22]" />
                            </div>
                            <DialogTitle className="text-3xl font-black tracking-tight text-premium-800 dark:text-premium-50">
                                {showEditDialog ? t('common.edit', 'Edit') : t('common.create', 'Create')}
                            </DialogTitle>
                        </div>
                    </DialogHeader>
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-premium-300 ml-1">{t('activityPlans.plan_name', 'Plan Name')}</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g. High-Velocity Prospecting"
                                className="h-14 rounded-2xl border-premium-100 bg-premium-50/50 px-6 focus:ring-brand-emerald/20 font-bold text-base"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-premium-300 ml-1">{t('activityPlans.target_model', 'Target Model')}</Label>
                            <Select
                                value={formData.res_model}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, res_model: value }))}
                            >
                                <SelectTrigger className="h-14 rounded-2xl border-premium-100 bg-premium-50/50 px-6 font-bold text-base">
                                    <SelectValue placeholder="Target Model" />
                                </SelectTrigger>
                                <SelectContent className="rounded-3xl border-premium-100 shadow-2xl">
                                    <SelectItem value="crm.lead" className="rounded-2xl my-1 font-bold">Leads & Opportunities</SelectItem>
                                    <SelectItem value="res.partner" className="rounded-2xl my-1 font-bold">Partners & Contacts</SelectItem>
                                    <SelectItem value="sale.order" className="rounded-2xl my-1 font-bold">Sales Orders</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <input
                                id="active"
                                type="checkbox"
                                checked={formData.active}
                                onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                                className="w-5 h-5 rounded-[6px] border-premium-200 accent-premium-900 cursor-pointer"
                            />
                            <Label htmlFor="active" className="text-[11px] font-black uppercase tracking-[0.2em] text-premium-300">
                                {t('common.active', 'Active')}
                            </Label>
                        </div>
                    </div>
                    <DialogFooter className="mt-12 sm:justify-end gap-4">
                        <button
                            onClick={handleCloseDialog}
                            className="px-8 py-4 text-xs font-black uppercase tracking-widest text-premium-400 hover:text-premium-800 transition-colors"
                        >
                            {t('common.cancel', 'Cancel')}
                        </button>
                        <button
                            onClick={handleSavePlan}
                            className="px-10 py-4 bg-premium-900 dark:bg-premium-50 text-white dark:text-premium-900 rounded-3xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:opacity-90 active:scale-95 transition-all"
                        >
                            {t('common.save', 'Save')}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
