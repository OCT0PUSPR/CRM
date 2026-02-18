
"use client"

import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search,
    Plus,
    MoreHorizontal,
    Mail,
    Phone,
    Globe,
    MapPin,
    Building2,
    Users,
    Trash2,
    Edit2,
    X,
    LayoutGrid,
    List,
    TrendingUp,
    ChevronRight,
    Calendar,
    FileText,
    Clock,
    CheckCircle2,
    AlertCircle,
    Package,
    ArrowUpRight,
    ExternalLink
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { apiService } from "../services/api"
import { useAuth } from "../../context/auth"
import { useTheme } from "../../context/theme"
import CRMHeader from "../components/PagesHeader"
import { PremiumTable, Column } from "../components/PremiumTable"
import { Input } from "../../@/components/ui/input"
import { Label } from "../../@/components/ui/label"

// ============================================
// TYPES
// ============================================

interface OdooCompany {
    id: number
    name: string
    email: string | false
    phone: string | false
    website: string | false
    city: string | false
    country_id: [number, string] | false
    user_id: [number, string] | false
    is_company: boolean
    image_1920?: string | false
}

interface MailActivity {
    id: number
    summary: string
    note: string
    date_deadline: string
    activity_type_id: [number, string]
    user_id: [number, string]
    state: string
    create_date: string
}

interface SaleOrder {
    id: number
    name: string
    date_order: string
    amount_total: number
    state: string
}

// ============================================
// STYLES & ASSETS
// ============================================

const GradientIcon = ({ icon: Icon, className = "w-5 h-5" }: { icon: any, className?: string }) => (
    <div className={`relative ${className}`}>
        <svg width="0" height="0" className="absolute">
            <linearGradient id="brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#4c6b22', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#8BB061', stopOpacity: 1 }} />
            </linearGradient>
        </svg>
        <Icon className={className} style={{ stroke: 'url(#brand-gradient)' }} strokeWidth={1.5} />
    </div>
)

// ============================================
// SIDE PANEL COMPONENT
// ============================================

const CompanyDetailsSidePanel: React.FC<{
    company: OdooCompany | null,
    isOpen: boolean,
    onClose: () => void,
    onSave: (data: any) => void
}> = ({ company, isOpen, onClose, onSave }) => {
    const { t } = useTranslation()
    const { mode } = useTheme()
    const isDark = mode === "dark"
    const [formData, setFormData] = useState<any>({})
    const [loadingData, setLoadingData] = useState(false)
    const [activities, setActivities] = useState<MailActivity[]>([])
    const [orders, setOrders] = useState<SaleOrder[]>([])

    useEffect(() => {
        if (company) {
            setFormData({
                name: company.name,
                email: company.email || "",
                phone: company.phone || "",
                website: company.website || "",
                city: company.city || ""
            })
            fetchRelatedData(company.id)
        } else {
            setFormData({
                name: "",
                email: "",
                phone: "",
                website: "",
                city: "",
                is_company: true
            })
            setActivities([])
            setOrders([])
        }
    }, [company])

    const fetchRelatedData = async (companyId: number) => {
        setLoadingData(true)
        try {
            const activitiesRes = await apiService.searchRead<MailActivity>("mail.activity", {
                domain: [["request_partner_id", "=", companyId]],
                fields: ["summary", "note", "date_deadline", "activity_type_id", "user_id", "state", "create_date"],
                order: "date_deadline desc"
            })
            if (activitiesRes.success) setActivities((activitiesRes as any).records || [])

            const ordersRes = await apiService.searchRead<SaleOrder>("sale.order", {
                domain: [["partner_id", "=", companyId]],
                fields: ["name", "date_order", "amount_total", "state"],
                order: "date_order desc",
                limit: 5
            })
            if (ordersRes.success) setOrders((ordersRes as any).records || [])
        } catch (error) {
            console.error("Error fetching related data:", error)
        } finally {
            setLoadingData(false)
        }
    }

    const inputClass = `w-full bg-premium-50 dark:bg-premium-900 border-none rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 ring-brand-emerald/10 transition-all outline-none placeholder:text-premium-300`
    const labelClass = `text-[10px] font-black uppercase tracking-widest text-premium-400 mb-2 block ml-1`

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
                    />
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className={`fixed right-0 top-0 bottom-0 w-full max-w-[560px] z-[110] shadow-2xl flex flex-col overflow-hidden ${isDark ? "bg-[#09090b] border-l border-premium-800" : "bg-white"}`}
                    >
                        {/* Header */}
                        <div className="px-8 py-10 flex items-center justify-between border-b border-premium-50 dark:border-premium-800">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-[20px] bg-premium-50 dark:bg-premium-900 flex items-center justify-center">
                                    <GradientIcon icon={Building2} className="w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tighter">
                                        {company ? company.name : "New Entity"}
                                    </h2>
                                    <p className="text-[11px] font-bold text-premium-400 uppercase tracking-widest mt-1">
                                        Business Profile
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-3 hover:bg-premium-50 dark:hover:bg-premium-800 rounded-2xl transition-all">
                                <X className="w-5 h-5 text-premium-400" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar px-10 py-12 space-y-12">
                            {/* General Details */}
                            <section className="space-y-8">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#4c6b22]">Core Information</h3>
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-2">
                                        <Label className={labelClass}>Company Name</Label>
                                        <Input
                                            value={formData.name || ""}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className={inputClass}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className={labelClass}>Email Address</Label>
                                            <Input
                                                value={formData.email || ""}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className={inputClass}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className={labelClass}>Primary Phone</Label>
                                            <Input
                                                value={formData.phone || ""}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className={labelClass}>Website URL</Label>
                                            <Input
                                                value={formData.website || ""}
                                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                                className={inputClass}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className={labelClass}>Operational City</Label>
                                            <Input
                                                value={formData.city || ""}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Recent Activity */}
                            <section className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#4c6b22]">Recent Log</h3>
                                    <button className="text-[10px] font-black uppercase text-premium-400 hover:text-premium-800">View All</button>
                                </div>
                                {loadingData ? (
                                    <div className="py-10 flex justify-center"><div className="w-6 h-6 border-2 border-[#4c6b22] border-t-transparent rounded-full animate-spin" /></div>
                                ) : activities.length === 0 ? (
                                    <div className="bg-premium-50 dark:bg-premium-900 rounded-[24px] p-8 text-center text-xs font-bold text-premium-400 italic">No recent activities found.</div>
                                ) : (
                                    <div className="space-y-4">
                                        {activities.slice(0, 3).map(activity => (
                                            <div key={activity.id} className="p-5 rounded-[24px] border border-premium-100 dark:border-premium-800 flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-premium-50 dark:bg-premium-800 flex items-center justify-center shrink-0">
                                                    <Calendar className="w-4 h-4 text-[#4c6b22]" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold tracking-tight">{activity.summary || "Internal Update"}</h4>
                                                    <p className="text-[11px] text-premium-400 mt-1 line-clamp-2 leading-relaxed">
                                                        {activity.note ? activity.note.replace(/<[^>]*>/g, '') : "Status synchronized."}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-3 text-[10px] font-black uppercase tracking-widest text-premium-400">
                                                        <span className="bg-premium-50 dark:bg-premium-800 px-2 py-1 rounded">{new Date(activity.create_date).toLocaleDateString()}</span>
                                                        <span>{activity.user_id ? activity.user_id[1] : "System"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Latest Deals */}
                            <section className="space-y-6 pb-12">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#4c6b22]">Latest Opportunities</h3>
                                    <button className="text-[10px] font-black uppercase text-premium-400 hover:text-premium-800">Revenue Hub</button>
                                </div>
                                {loadingData ? (
                                    <div className="py-10 flex justify-center"><div className="w-6 h-6 border-2 border-[#4c6b22] border-t-transparent rounded-full animate-spin" /></div>
                                ) : orders.length === 0 ? (
                                    <div className="bg-premium-50 dark:bg-premium-900 rounded-[24px] p-8 text-center text-xs font-bold text-premium-400 italic">No active deals.</div>
                                ) : (
                                    <div className="space-y-3">
                                        {orders.map(order => (
                                            <div key={order.id} className="p-4 rounded-2xl bg-premium-50 dark:bg-premium-900/50 flex items-center justify-between hover:bg-premium-100 dark:hover:bg-premium-800 transition-all cursor-pointer group">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="w-4 h-4 text-premium-300 group-hover:text-[#4c6b22]" />
                                                    <span className="text-xs font-bold">{order.name}</span>
                                                </div>
                                                <span className="text-xs font-black text-premium-800 dark:text-premium-100">
                                                    ${order.amount_total.toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* Footer */}
                        <div className="p-8 border-t border-premium-50 dark:border-premium-800 flex items-center justify-end gap-4">
                            <button onClick={onClose} className="px-6 py-3 text-xs font-black uppercase tracking-widest text-premium-400 hover:text-premium-800 transition-all">
                                Discard
                            </button>
                            <button 
                                onClick={() => { onSave(formData); onClose(); }}
                                className="px-10 py-3.5 bg-premium-900 dark:bg-premium-100 text-white dark:text-premium-900 rounded-[18px] text-xs font-black uppercase tracking-[0.15em] shadow-xl hover:opacity-95 transition-all"
                            >
                                Update Profile
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

// ============================================
// COMPANY CARD COMPONENT
// ============================================

const CompanyCard: React.FC<{ company: OdooCompany; delay: number; onClick: () => void }> = ({ company, delay, onClick }) => {
    const { mode } = useTheme()
    const isDark = mode === "dark"

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: Math.min(delay * 0.05, 0.5) }}
            onClick={onClick}
            className={`group relative p-6 rounded-[32px] transition-all duration-500 cursor-pointer border ${isDark ? "bg-[#121417] border-premium-800 hover:border-premium-700 hover:shadow-2xl hover:shadow-black" : "bg-white border-premium-100 hover:border-[#4c6b22]/20 hover:shadow-xl hover:shadow-[#4c6b22]/5"}`}
        >
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[20px] bg-premium-50 dark:bg-premium-900 flex items-center justify-center transition-transform group-hover:scale-110 duration-500 border border-premium-100 dark:border-premium-800">
                        <GradientIcon icon={Building2} className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black tracking-tight text-premium-800 dark:text-premium-50 group-hover:text-[#4c6b22] transition-colors duration-300">
                            {company.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs font-bold text-premium-400 mt-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{company.city || "Unassigned Region"}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button className="p-2 hover:bg-premium-50 dark:hover:bg-premium-800 rounded-xl transition-all">
                        <MoreHorizontal className="w-5 h-5 text-premium-400" />
                    </button>
                </div>
            </div>

            <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-xs font-bold text-premium-500 dark:text-premium-400 group/link p-2 rounded-xl hover:bg-premium-50 dark:hover:bg-premium-800/50 transition-colors">
                    <Mail className="w-4 h-4 text-premium-300 group-hover/link:text-[#4c6b22] transition-colors" />
                    <span className="truncate">{company.email || "No direct email"}</span>
                </div>
                
                <div className="flex items-center gap-3 text-xs font-bold text-premium-500 dark:text-premium-400 group/link p-2 rounded-xl hover:bg-premium-50 dark:hover:bg-premium-800/50 transition-colors">
                    <Globe className="w-4 h-4 text-premium-300 group-hover/link:text-[#4c6b22] transition-colors" />
                    <span className="truncate">{company.website || "No URL"}</span>
                </div>
            </div>

            <div className="pt-4 border-t border-premium-50 dark:border-premium-800 flex items-center justify-between">
                <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-7 h-7 rounded-lg border-2 border-white dark:border-[#121417] bg-premium-100 dark:bg-premium-800 flex items-center justify-center text-[10px] font-black uppercase text-premium-400">
                            {String.fromCharCode(64 + i)}
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#4c6b22] bg-[#f3f4ee] px-2 py-1 rounded-lg">
                    Profile <ArrowUpRight className="w-3 h-3" />
                </div>
            </div>
        </motion.div>
    )
}

// ============================================
// MAIN PAGE
// ============================================

export default function Companies() {
    const { t } = useTranslation()
    const { mode } = useTheme()
    const { sessionId } = useAuth()
    const isDark = mode === "dark"

    const [companies, setCompanies] = useState<OdooCompany[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
    const [sortBy, setSortBy] = useState("name-asc")
    const [selectedCompany, setSelectedCompany] = useState<OdooCompany | null>(null)
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)

    const fetchData = async () => {
        const tenantId = localStorage.getItem('current_tenant_id')
        if (!tenantId || !sessionId) return
        apiService.setSession(tenantId, sessionId)
        try {
            setLoading(true)
            const res = await apiService.searchRead<OdooCompany>("res.partner", {
                domain: [["is_company", "=", true]],
                order: sortBy.replace('-', ' ')
            })
            if (res.success) setCompanies((res as any).records || [])
        } catch (err) {
            console.error("Error fetching companies:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { if (sessionId) fetchData() }, [sessionId, sortBy])

    const handleSaveCompany = async (formData: any) => {
        try {
            if (selectedCompany) {
                const res = await apiService.update("res.partner", selectedCompany.id, formData)
                if (res.success) fetchData()
            } else {
                const res = await apiService.create("res.partner", formData)
                if (res.success) fetchData()
            }
        } catch (err) {
            console.error("Error saving company:", err)
        }
    }

    const handleDeleteCompany = async (id: string | number) => {
        if (window.confirm("Are you sure you want to delete this company?")) {
            try {
                await apiService.delete("res.partner", Number(id));
                fetchData();
            } catch (err) {
                console.error("Error deleting company:", err);
            }
        }
    }

    const filteredCompanies = useMemo(() => {
        let result = [...companies]
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(c =>
                c.name.toLowerCase().includes(query) ||
                (c.email && c.email.toLowerCase().includes(query)) ||
                (c.city && c.city.toLowerCase().includes(query))
            )
        }
        return result
    }, [companies, searchQuery])

    // Premium Table Config
    const tableColumns: Column<OdooCompany>[] = [
        { 
            id: 'name', 
            header: 'Corporate Identity', 
            icon: Building2,
            width: '320px',
            accessor: (row) => (
                <div className="flex items-center gap-4 px-4 h-full group/row">
                    <div className="w-9 h-9 rounded-xl bg-premium-50 dark:bg-premium-800 flex items-center justify-center">
                        <GradientIcon icon={Building2} className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm tracking-tight">{row.name}</span>
                </div>
            )
        },
        { 
            id: 'email', 
            header: 'Main Email', 
            icon: Mail,
            width: '240px',
            accessor: (row) => <span className="px-4 text-premium-400 font-medium">{row.email || '—'}</span>
        },
        { 
            id: 'phone', 
            header: 'Operational Phone', 
            icon: Phone,
            width: '200px',
            accessor: (row) => <span className="px-4 text-premium-500 font-bold tabular-nums">{row.phone || '—'}</span>
        },
        { 
            id: 'city', 
            header: 'Region', 
            icon: MapPin,
            width: '180px',
            accessor: (row) => (
                <div className="px-4 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-[#f3f4ee] dark:bg-premium-800 text-[#4c6b22] text-[10px] font-black uppercase tracking-widest border border-[#4c6b22]/10">
                        {row.city || 'GLOBAL'}
                    </span>
                </div>
            )
        },
        { 
            id: 'website', 
            header: 'Digital Hub', 
            icon: Globe,
            width: '260px',
            accessor: (row) => (
                <div className="px-4 flex items-center gap-2 text-brand-indigo group/web hover:underline cursor-pointer">
                    <Globe className="w-3.5 h-3.5 opacity-40 group-hover/web:opacity-100" />
                    <span className="text-xs font-bold truncate">{row.website || 'No digital presence'}</span>
                </div>
            )
        }
    ];

    return (
        <div className={`min-h-screen font-sans transition-colors duration-500 ${isDark ? "bg-[#09090b] text-white" : "bg-[#FBFBFC]"}`}>
            <CRMHeader
                title="Business Partners"
                totalCount={filteredCompanies.length}
                createButtonLabel="Add Entity"
                viewMode={viewMode}
                setViewMode={setViewMode}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filters={{}}
                setFilters={() => {}}
                sortBy={sortBy}
                setSortBy={setSortBy}
                onAddNew={() => { setSelectedCompany(null); setIsSidePanelOpen(true); }}
                onRefresh={fetchData}
            />

            <main className="max-w-[1600px] mx-auto px-10 py-12">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-6">
                        <div className="w-16 h-16 rounded-3xl border-4 border-premium-100 border-t-[#4c6b22] animate-spin" />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-premium-400">Syncing Intelligence...</span>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {viewMode === 'kanban' ? (
                            <motion.div 
                                key="kanban"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20"
                            >
                                {filteredCompanies.map((company, idx) => (
                                    <CompanyCard
                                        key={company.id}
                                        company={company}
                                        delay={idx}
                                        onClick={() => { setSelectedCompany(company); setIsSidePanelOpen(true); }}
                                    />
                                ))}

                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    onClick={() => { setSelectedCompany(null); setIsSidePanelOpen(true); }}
                                    className={`group flex flex-col items-center justify-center p-12 rounded-[40px] border-2 border-dashed transition-all hover:scale-[1.02] active:scale-[0.98] ${isDark ? "border-premium-800 hover:border-premium-600" : "border-premium-100 hover:border-[#4c6b22]/20"}`}
                                >
                                    <div className="w-16 h-16 rounded-3xl bg-premium-50 dark:bg-premium-900 flex items-center justify-center mb-6 group-hover:bg-[#4c6b22]/5 transition-colors">
                                        <Plus className="w-7 h-7 text-premium-300 group-hover:text-[#4c6b22]" />
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-widest text-premium-400 group-hover:text-premium-800">Enroll New Partner</span>
                                </motion.button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <PremiumTable 
                                    data={filteredCompanies}
                                    columns={tableColumns}
                                    rowIdKey="id"
                                    onEdit={(row) => { setSelectedCompany(row); setIsSidePanelOpen(true); }}
                                    onDelete={handleDeleteCompany}
                                    searchable={false}
                                    showExport={true}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </main>

            <CompanyDetailsSidePanel
                company={selectedCompany}
                isOpen={isSidePanelOpen}
                onClose={() => setIsSidePanelOpen(false)}
                onSave={handleSaveCompany}
            />
        </div>
    )
}
