"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search,
    Plus,
    MoreHorizontal,
    Mail,
    Phone,
    User,
    Calendar,
    DollarSign,
    Tag,
    Filter,
    ArrowUpDown,
    Layout,
    LayoutGrid,
    ChevronRight,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle,
    Briefcase,
    Target,
    List,
    X,
    Check,
    Edit2,
    Trash2,
    Save,
    MapPin,
    Building2,
    Users,
    Activity,
    Hash
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { apiService } from "../services/api"
import { useAuth } from "../../context/auth"
import { useTheme } from "../../context/theme"
import CRMHeader, { FilterOption, SortOption } from "../components/PagesHeader"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "../../@/components/ui/dialog"
import { Input } from "../../@/components/ui/input"
import { Label } from "../../@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../@/components/ui/select"
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    defaultDropAnimationSideEffects,
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../@/components/ui/table"

// ============================================
// TYPES
// ============================================

interface OdooStage {
    id: number
    name: string
    sequence: number
    fold: boolean
}

interface OdooLead {
    id: number
    name: string
    expected_revenue: number
    partner_id: [number, string] | false
    contact_name: string | false
    email_from: string | false
    phone: string | false
    user_id: [number, string] | false
    date_deadline: string | false
    tag_ids: number[]
    stage_id: [number, string]
    priority: string
    probability: number
    description: string | false
    create_date: string
}

// ============================================
// STYLES
// ============================================

const scopedStyles = `
  @font-face {
    font-family: 'Space Grotesk';
    src: url('/src/assets/Fonts/SPACE/SpaceGrotesk-Regular.ttf') format('truetype');
    font-weight: 400;
  }
  @font-face {
    font-family: 'Space Grotesk';
    src: url('/src/assets/Fonts/SPACE/SpaceGrotesk-Medium.ttf') format('truetype');
    font-weight: 500;
  }
  @font-face {
    font-family: 'Space Grotesk';
    src: url('/src/assets/Fonts/SPACE/SpaceGrotesk-SemiBold.ttf') format('truetype');
    font-weight: 600;
  }
  @font-face {
    font-family: 'Space Grotesk';
    src: url('/src/assets/Fonts/SPACE/SpaceGrotesk-Bold.ttf') format('truetype');
    font-weight: 700;
  }

  .kanban-page {
    font-family: 'Space Grotesk', sans-serif !important;
    --color-1: #EBEFA5;
    --color-2: #C4D86F;
    --color-3: #8BB061;
    --color-4: #578336;
    --color-5: #426932;
  }

  .tag-badge {
    transition: all 0.2s ease;
  }
  .tag-badge:hover {
    filter: brightness(0.9);
    transform: scale(1.05);
  }

  .kanban-container {
    height: calc(100vh - 180px);
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: thin;
    scrollbar-color: var(--color-3) transparent;
  }

  .kanban-container::-webkit-scrollbar {
    height: 6px;
  }

  .kanban-container::-webkit-scrollbar-thumb {
    background-color: var(--color-3);
    border-radius: 10px;
  }

  .kanban-column {
    min-width: 320px;
    max-width: 320px;
    flex-shrink: 0;
  }

  .opportunity-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid transparent;
    cursor: pointer;
  }

  .opportunity-card:hover {
    transform: translateY(-4px) scale(1.01);
    border-color: var(--color-3);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .glass-effect {
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.8);
  }

  .dark .glass-effect {
    background: rgba(22, 27, 34, 0.8);
  }

  .premium-gradient {
    background: linear-gradient(135deg, var(--color-1) 0%, var(--color-2) 100%);
  }

  .header-icon-gradient {
    background: linear-gradient(135deg, #426932 0%, #8BB061 100%);
  }

  .custom-blur-in {
    animation: blurIn 0.8s ease forwards;
  }

  @keyframes blurIn {
    from {
      opacity: 0;
      filter: blur(20px);
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      filter: blur(0);
      transform: scale(1);
    }
  }

  .stagger-item {
    opacity: 0;
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`

// ============================================
// CONSTANTS & UTILS
// ============================================

const ODOO_TAG_COLORS: { [key: number]: { bg: string, text: string, border: string } } = {
    0: { bg: 'rgba(203, 213, 225, 0.2)', text: '#64748b', border: '#cbd5e1' }, // Gray
    1: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: '#fca5a5' },   // Red
    2: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', border: '#fbbf24' },  // Orange
    3: { bg: 'rgba(251, 191, 36, 0.1)', text: '#d97706', border: '#fcd34d' },  // Yellow
    4: { bg: 'rgba(132, 204, 22, 0.1)', text: '#65a30d', border: '#bef264' },  // Light Green
    5: { bg: 'rgba(34, 197, 94, 0.1)', text: '#16a34a', border: '#86efac' },   // Green
    6: { bg: 'rgba(20, 184, 166, 0.1)', text: '#0d9488', border: '#5eead4' },   // Teal
    7: { bg: 'rgba(6, 182, 212, 0.1)', text: '#0891b2', border: '#67e8f9' },   // Cyan
    8: { bg: 'rgba(59, 130, 246, 0.1)', text: '#2563eb', border: '#93c5fd' },   // Blue
    9: { bg: 'rgba(99, 102, 241, 0.1)', text: '#4f46e5', border: '#a5b4fc' },  // Indigo
    10: { bg: 'rgba(168, 85, 247, 0.1)', text: '#9333ea', border: '#c084fc' }, // Purple
    11: { bg: 'rgba(236, 72, 153, 0.1)', text: '#db2777', border: '#f9a8d4' }, // Pink
}

const getTagStyle = (colorId: number = 0) => {
    return ODOO_TAG_COLORS[colorId] || ODOO_TAG_COLORS[0]
}

const EmptyState: React.FC<{ icon: any, title: string, description: string }> = ({ icon: Icon, title, description }) => {
    const { mode } = useTheme()
    const isDark = mode === "dark"
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 px-8 text-center"
        >
            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 relative ${isDark ? "bg-zinc-900" : "bg-white"} shadow-2xl`}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#EBEFA5] to-[#8BB061] opacity-20 rounded-3xl blur-xl" />
                <Icon className="w-10 h-10 text-[#426932] relative z-10" />
            </div>
            <h3 className={`text-xl font-black mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>{title}</h3>
            <p className={`text-sm ${isDark ? "text-zinc-500" : "text-slate-500"} max-w-[280px]`}>{description}</p>
        </motion.div>
    )
}

// ============================================
// COMPONENTS
// ============================================

const EditOpportunityModal: React.FC<{
    opportunity: OdooLead | null,
    isOpen: boolean,
    onClose: () => void,
    onSave: (data: any) => void,
    allTags: any[]
}> = ({ opportunity, isOpen, onClose, onSave, allTags }) => {
    const [formData, setFormData] = useState<any>({})

    useEffect(() => {
        if (opportunity) {
            setFormData({
                name: opportunity.name,
                expected_revenue: opportunity.expected_revenue,
                probability: opportunity.probability,
                email_from: opportunity.email_from || "",
                phone: opportunity.phone || "",
                description: opportunity.description || "",
                date_deadline: opportunity.date_deadline || "",
                tag_ids: opportunity.tag_ids || []
            })
        }
    }, [opportunity])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
        onClose()
    }

    if (!opportunity) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] font-['Space_Grotesk']">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Edit2 className="w-5 h-5 text-[#578336]" />
                        Edit Opportunity
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="name">Opportunity Name</Label>
                            <Input
                                id="name"
                                value={formData.name || ""}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="border-slate-200 focus:border-[#8BB061]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="revenue">Expected Revenue</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    id="revenue"
                                    type="number"
                                    value={formData.expected_revenue || 0}
                                    onChange={(e) => setFormData({ ...formData, expected_revenue: parseFloat(e.target.value) })}
                                    className="pl-9 border-slate-200 focus:border-[#8BB061]"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="probability">Probability (%)</Label>
                            <Input
                                id="probability"
                                type="number"
                                value={formData.probability || 0}
                                onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) })}
                                className="border-slate-200 focus:border-[#8BB061]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email_from || ""}
                                onChange={(e) => setFormData({ ...formData, email_from: e.target.value })}
                                className="border-slate-200 focus:border-[#8BB061]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={formData.phone || ""}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="border-slate-200 focus:border-[#8BB061]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="deadline">Expected Closing</Label>
                            <Input
                                id="deadline"
                                type="date"
                                value={formData.date_deadline || ""}
                                onChange={(e) => setFormData({ ...formData, date_deadline: e.target.value })}
                                className="border-slate-200 focus:border-[#8BB061]"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Tags</Label>
                        <div className="flex flex-wrap gap-2 p-3 border rounded-xl border-slate-100 dark:border-zinc-800">
                            {allTags.map((tag) => {
                                const isSelected = formData.tag_ids?.includes(tag.id)
                                const style = getTagStyle(tag.color)
                                return (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => {
                                            const currentTags = formData.tag_ids || []
                                            const newTags = isSelected
                                                ? currentTags.filter((id: number) => id !== tag.id)
                                                : [...currentTags, tag.id]
                                            setFormData({ ...formData, tag_ids: newTags })
                                        }}
                                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${isSelected
                                            ? "shadow-sm scale-105"
                                            : "opacity-40 grayscale hover:opacity-100 hover:grayscale-0"
                                            }`}
                                        style={{
                                            backgroundColor: style.bg,
                                            color: style.text,
                                            borderColor: isSelected ? style.text : 'transparent'
                                        }}
                                    >
                                        {tag.name}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <textarea
                            id="description"
                            rows={3}
                            value={formData.description || ""}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-[#8BB061] transition-colors"
                        />
                    </div>
                </form>
                <DialogFooter>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-[#426932] text-white rounded-lg text-sm font-bold shadow-lg hover:bg-[#578336] transition-colors"
                    >
                        Save Changes
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const AddOpportunityModal: React.FC<{
    isOpen: boolean,
    onClose: () => void,
    onSave: (data: any) => void,
    stages: OdooStage[],
    partners: [number, string][]
}> = ({ isOpen, onClose, onSave, stages, partners }) => {
    const [formData, setFormData] = useState<any>({
        name: "",
        expected_revenue: 0,
        probability: 10,
        partner_id: false,
        stage_id: stages.length > 0 ? stages[0].id : false,
        priority: "1",
        type: 'opportunity'
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (formData.name) {
            onSave(formData)
            onClose()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] font-['Space_Grotesk']">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Plus className="w-5 h-5 text-[#578336]" />
                        Create New Opportunity
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="new-name">Opportunity Name</Label>
                            <Input
                                id="new-name"
                                placeholder="e.g. Website Overhaul"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="border-slate-200 focus:border-[#8BB061]"
                                required
                            />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="partner">Customer</Label>
                            <Select
                                value={formData.partner_id ? formData.partner_id.toString() : ""}
                                onValueChange={(val) => setFormData({ ...formData, partner_id: parseInt(val) })}
                            >
                                <SelectTrigger className="border-slate-200 focus:border-[#8BB061]">
                                    <SelectValue placeholder="Select a customer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {partners.map((p) => (
                                        <SelectItem key={p[0]} value={p[0].toString()}>
                                            {p[1]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-revenue">Expected Revenue</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    id="new-revenue"
                                    type="number"
                                    value={formData.expected_revenue}
                                    onChange={(e) => setFormData({ ...formData, expected_revenue: parseFloat(e.target.value) })}
                                    className="pl-9 border-slate-200 focus:border-[#8BB061]"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-stage">Initial Stage</Label>
                            <Select
                                value={formData.stage_id ? formData.stage_id.toString() : ""}
                                onValueChange={(val) => setFormData({ ...formData, stage_id: parseInt(val) })}
                            >
                                <SelectTrigger className="border-slate-200 focus:border-[#8BB061]">
                                    <SelectValue placeholder="Select stage" />
                                </SelectTrigger>
                                <SelectContent>
                                    {stages.map((s) => (
                                        <SelectItem key={s.id} value={s.id.toString()}>
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-probability">Probability (%)</Label>
                            <Input
                                id="new-probability"
                                type="number"
                                min="0"
                                max="100"
                                value={formData.probability}
                                onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) })}
                                className="border-slate-200 focus:border-[#8BB061]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-priority">Priority</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(val) => setFormData({ ...formData, priority: val })}
                            >
                                <SelectTrigger className="border-slate-200 focus:border-[#8BB061]">
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Low</SelectItem>
                                    <SelectItem value="1">Medium</SelectItem>
                                    <SelectItem value="2">High</SelectItem>
                                    <SelectItem value="3">Very High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </form>
                <DialogFooter>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!formData.name}
                        className="px-6 py-2 bg-[#426932] text-white rounded-lg text-sm font-bold shadow-lg hover:bg-[#578336] transition-colors disabled:opacity-50"
                    >
                        Create Opportunity
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const OpportunityCard: React.FC<{ lead: OdooLead; delay: number; onClick: () => void; allTags: any[] }> = ({ lead, delay, onClick, allTags }) => {
    const { mode } = useTheme()
    const isDark = mode === "dark"

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: lead.id,
        data: {
            type: "Opportunity",
            lead,
        },
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    }

    // Priority Colors - Gradient strips
    const getPriorityColor = (p: string) => {
        switch (p) {
            case '3': return 'linear-gradient(to bottom, #426932, #8BB061)'; // High
            case '2': return 'linear-gradient(to bottom, #8BB061, #EBEFA5)'; // Medium
            default: return 'linear-gradient(to bottom, #E0E0E0, #F5F5F5)'; // Low
        }
    }

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: Math.min(delay * 0.05, 0.5) }}
            onClick={onClick}
            className={`opportunity-card mb-4 p-5 rounded-[24px] ${isDark ? "bg-[#161b22] border-[#30363d]" : "bg-white border-slate-100"
                } border shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] group relative overflow-hidden`}
        >
            {/* Gradient Border Effect */}
            <div className="absolute inset-0 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br from-[#426932] to-[#8BB061]" style={{ padding: '1px', mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'exclude' }} />

            <div className="pl-1 relative z-10">
                <div className="flex justify-between items-start mb-3">
                    <h4 className={`text-[15px] font-bold leading-snug line-clamp-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                        {lead.name}
                    </h4>
                    <div className={`p-1 -mr-2 -mt-2 rounded-full ${isDark ? "hover:bg-zinc-800 text-zinc-500" : "hover:bg-slate-50 text-slate-400"} transition-colors opacity-0 group-hover:opacity-100`}>
                        <MoreHorizontal className="w-4 h-4" />
                    </div>
                </div>

                {/* Tags */}
                {lead.tag_ids && lead.tag_ids.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {lead.tag_ids.map(tagId => {
                            const tag = allTags.find(t => t.id === tagId)
                            if (!tag) return null
                            const style = getTagStyle(tag.color)
                            return (
                                <span
                                    key={tagId}
                                    className="px-2 py-0.5 rounded-md text-[10px] font-bold border tag-badge"
                                    style={{
                                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                        color: style.text,
                                        borderColor: style.border
                                    }}
                                >
                                    {tag.name}
                                </span>
                            )
                        })}
                    </div>
                )}

                {/* Metrics Row */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4" style={{ stroke: 'url(#header-icon-gradient)', strokeWidth: 2.5 }} />
                        <span className={`text-[14px] font-black tracking-tight ${isDark ? "text-zinc-200" : "text-slate-700"}`}>
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(lead.expected_revenue)}
                        </span>
                    </div>
                    
                    {lead.probability > 0 && (
                        <div className="flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5" style={{ stroke: 'url(#header-icon-gradient)', strokeWidth: 2.5 }} />
                            <span className={`text-[12px] font-bold ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                                {lead.probability}%
                            </span>
                        </div>
                    )}
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                    {lead.partner_id && (
                        <div className="flex items-center gap-2 text-[13px] text-slate-500 dark:text-zinc-400">
                            <Building2 className="w-3.5 h-3.5" style={{ stroke: 'url(#header-icon-gradient)' }} />
                            <span className="truncate font-semibold">{lead.partner_id[1]}</span>
                        </div>
                    )}
                    
                    {(lead.email_from || lead.phone) && (
                        <div className="flex flex-col gap-1.5 mt-2 pl-0.5">
                            {lead.email_from && (
                                <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-zinc-500">
                                    <Mail className="w-3 h-3" />
                                    <span className="truncate">{lead.email_from}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`flex items-center justify-between pt-3 border-t ${isDark ? "border-zinc-800" : "border-slate-100"}`}>
                    <div className="flex items-center gap-2">
                         {/* User Avatar - Clean gradient text instead of background */}
                        <div className="flex items-center gap-1.5">
                             <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm" style={{ background: 'linear-gradient(135deg, #426932 0%, #8BB061 100%)', color: 'white' }}>
                                {lead.user_id ? lead.user_id[1].charAt(0) : "U"}
                            </div>
                            <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                                {lead.user_id ? lead.user_id[1].split(' ')[0] : "Unassigned"}
                            </span>
                        </div>
                    </div>

                    {lead.date_deadline && (
                        <div className={`flex items-center gap-1.5 text-[10px] font-bold ${
                            new Date(lead.date_deadline) < new Date() ? "text-red-400" : "text-slate-400 dark:text-zinc-500"
                        }`}>
                            <Calendar className="w-3 h-3" style={{ stroke: new Date(lead.date_deadline) < new Date() ? 'currentColor' : 'url(#header-icon-gradient)' }} />
                            <span>{new Date(lead.date_deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

const KanbanColumn: React.FC<{ stage: OdooStage; leads: OdooLead[]; index: number; onEditLead: (lead: OdooLead) => void; allTags: any[] }> = ({ stage, leads, index, onEditLead, allTags }) => {
    const { mode } = useTheme()
    const isDark = mode === "dark"

    const totalRevenue = useMemo(() => {
        return leads.reduce((sum, lead) => sum + (lead.expected_revenue || 0), 0)
    }, [leads])

    return (
        <div className="kanban-column flex flex-col h-full px-3">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-center justify-between py-5 mb-2 sticky top-0 z-20 bg-inherit backdrop-blur-sm"
            >
                <div className="flex items-center gap-3">
                    <h3 className={`text-[13px] font-black uppercase tracking-widest ${isDark ? "text-zinc-300" : "text-slate-600"}`}>
                        {stage.name}
                    </h3>
                    <div className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-md text-[10px] font-bold shadow-sm ${
                        isDark ? "bg-[#161b22] text-zinc-400 border border-zinc-800" : "bg-white text-slate-500 border border-slate-200"
                    }`}>
                        {leads.length}
                    </div>
                </div>
                
                {totalRevenue > 0 && (
                    <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" style={{ stroke: 'url(#header-icon-gradient)' }} />
                        <span className={`text-[11px] font-bold ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                            {new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(totalRevenue)}
                        </span>
                    </div>
                )}
            </motion.div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide pb-20 space-y-4">
                <SortableContext 
                    id={stage.id.toString()}
                    items={leads.map(l => l.id)} 
                    strategy={verticalListSortingStrategy}
                >
                    <AnimatePresence mode="popLayout">
                        {leads.map((lead, i) => (
                            <OpportunityCard 
                                key={lead.id} 
                                lead={lead} 
                                delay={i} 
                                onClick={() => onEditLead(lead)} 
                                allTags={allTags}
                            />
                        ))}
                    </AnimatePresence>
                </SortableContext>
                
                {leads.length === 0 && (
                    <div className={`h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 ${
                        isDark ? "border-zinc-800 bg-zinc-900/20" : "border-slate-100 bg-slate-50/50"
                    }`}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-inherit">
                            <Plus className="w-4 h-4 opacity-20" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">No Opportunities</span>
                    </div>
                )}
            </div>
        </div>
    )
}

const AddStageModal: React.FC<{
    isOpen: boolean,
    onClose: () => void,
    onSave: (data: any) => void
}> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState("")
    const [won, setWon] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (name.trim()) {
            onSave({ name, is_won: won })
            setName("")
            setWon(false)
            onClose()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px] font-['Space_Grotesk']">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Plus className="w-5 h-5 text-[#578336]" />
                        Add New Stage
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="stage-name">Stage Name</Label>
                        <Input
                            id="stage-name"
                            placeholder="e.g. Negotiation"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="border-slate-200 focus:border-[#8BB061]"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="is-won"
                            checked={won}
                            onChange={(e) => setWon(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-[#426932] focus:ring-[#8BB061]"
                        />
                        <Label htmlFor="is-won" className="cursor-pointer">This is a 'Won' stage</Label>
                    </div>
                </div>
                <DialogFooter>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!name.trim()}
                        className="px-6 py-2 bg-[#426932] text-white rounded-lg text-sm font-bold shadow-lg hover:bg-[#578336] transition-colors disabled:opacity-50"
                    >
                        Create Stage
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function OpportunitiesKanban() {
    const { mode } = useTheme()
    const { sessionId } = useAuth()
    const { t } = useTranslation()
    const isDark = mode === "dark"

    // State
    const [stages, setStages] = useState<OdooStage[]>([])
    const [leads, setLeads] = useState<OdooLead[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
    const [filters, setFilters] = useState<Record<string, any>>({})
    const [sortBy, setSortBy] = useState("id-desc")

    // Filter options for the header
    const filterOptions: FilterOption[] = [
        {
            id: 'priority',
            label: 'Priority',
            field: 'priority',
            type: 'select',
            options: [
                { value: '1', label: 'Low' },
                { value: '2', label: 'Medium' },
                { value: '3', label: 'High' }
            ]
        }
    ]

    // Sort options for the header
    const sortOptions: SortOption[] = [
        { id: 'expected_revenue-desc', label: 'Expected Revenue (High to Low)', field: 'expected_revenue', direction: 'desc' },
        { id: 'expected_revenue-asc', label: 'Expected Revenue (Low to High)', field: 'expected_revenue', direction: 'asc' },
        { id: 'id-desc', label: 'Recently Added', field: 'id', direction: 'desc' },
        { id: 'probability-desc', label: 'Probability (High to Low)', field: 'probability', direction: 'desc' }
    ]

    // Modals State
    const [editingLead, setEditingLead] = useState<OdooLead | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isAddStageModalOpen, setIsAddStageModalOpen] = useState(false)
    const [isAddOpportunityModalOpen, setIsAddOpportunityModalOpen] = useState(false)
    const [partners, setPartners] = useState<[number, string][]>([])
    const [allTags, setAllTags] = useState<any[]>([])
    const [activeLead, setActiveLead] = useState<OdooLead | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    )

    useEffect(() => {
        if (sessionId) {
            fetchData()
        }
    }, [sessionId])

    const fetchData = async () => {
        const tenantId = localStorage.getItem('current_tenant_id')
        if (!tenantId || !sessionId) return

        apiService.setSession(tenantId, sessionId)

        try {
            setLoading(true)

            // Fetch Stages
            const stagesRes = await apiService.searchRead<OdooStage>("crm.stage", {
                order: "sequence asc"
            })
            if (stagesRes.success) {
                const data = (stagesRes as any).records || (stagesRes as any).data || []
                setStages(data)
            }

            // Fetch Leads
            const leadsRes = await apiService.searchRead<OdooLead>("crm.lead", {
                domain: [['type', '=', 'opportunity']],
                fields: ["name", "expected_revenue", "partner_id", "contact_name", "email_from", "phone", "user_id", "date_deadline", "tag_ids", "stage_id", "priority", "probability", "description", "create_date"]
            })
            if (leadsRes.success) setLeads(leadsRes.records)

            // Fetch Partners for selector
            const partnersRes = await apiService.searchRead<any>("res.partner", {
                domain: [['is_company', '=', false]],
                fields: ["id", "display_name"],
                limit: 100
            })
            if (partnersRes.success) {
                setPartners(partnersRes.records.map((r: any) => [r.id, r.display_name] as [number, string]))
            }

            // Fetch Tags
            const tagsRes = await apiService.searchRead<any>("crm.tag", {
                fields: ["id", "name", "color"]
            })
            if (tagsRes.success) setAllTags(tagsRes.records)
        } catch (err) {
            console.error("Error fetching data:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveLead = async (updateData: any) => {
        if (!editingLead) return
        try {
            const res = await apiService.update("crm.lead", editingLead.id, updateData)
            if (res.success) {
                fetchData() // Refresh
            }
        } catch (err) {
            console.error("Error updating lead:", err)
        }
    }

    const handleCreateStage = async (stageData: any) => {
        try {
            const lastStage = stages[stages.length - 1]
            const sequence = lastStage ? lastStage.sequence + 1 : 1
            const res = await apiService.create("crm.stage", { ...stageData, sequence })
            if (res.success) {
                fetchData() // Refresh
            }
        } catch (err) {
            console.error("Error creating stage:", err)
        }
    }

    const filteredAndSortedLeads = useMemo(() => {
        let result = [...leads]

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(l =>
                l.name.toLowerCase().includes(query) ||
                (l.partner_id && l.partner_id[1].toLowerCase().includes(query)) ||
                (l.email_from && l.email_from.toLowerCase().includes(query))
            )
        }

        // Priority Filter
        if (filters.priority) {
            result = result.filter(l => l.priority === filters.priority)
        }

        // Sorting (handled by API mostly, but client-side for immediate response)
        const [field, direction] = sortBy.split('-')
        result.sort((a: any, b: any) => {
            let valA = a[field]
            let valB = b[field]

            if (field === 'value') {
                valA = a.expected_revenue
                valB = b.expected_revenue
            }

            if (valA < valB) return direction === 'asc' ? -1 : 1
            if (valA > valB) return direction === 'asc' ? 1 : -1
            return 0
        })

        return result
    }, [leads, searchQuery, filters, sortBy])

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        const lead = leads.find((l) => l.id === active.id)
        if (lead) setActiveLead(lead)
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over) return

        const activeId = active.id
        const overId = over.id

        if (activeId === overId) return

        const activeLead = leads.find((l) => l.id === activeId)
        const overLead = leads.find((l) => l.id === overId)

        // If dropping over a column/stage directly
        const overStage = stages.find((s) => s.id === overId)

        if (activeLead && (overLead || overStage)) {
            const newStageId = overStage ? overStage.id : (overLead?.stage_id ? overLead.stage_id[0] : null)
            if (newStageId && activeLead.stage_id[0] !== newStageId) {
                setLeads((prev) => {
                    const stage = stages.find(s => s.id === newStageId)
                    return prev.map((l) =>
                        l.id === activeId ? { ...l, stage_id: [newStageId, stage?.name || ""] as [number, string] } : l
                    )
                })
            }
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        setActiveLead(null)

        if (!over) return

        const activeId = active.id
        const overId = over.id

        const activeLead = leads.find((l) => l.id === activeId)
        if (!activeLead) return

        const overStage = stages.find((s) => s.id === overId)
        const overLead = leads.find((l) => l.id === overId)
        const newStageId = overStage ? overStage.id : (overLead?.stage_id ? overLead.stage_id[0] : null)

        if (newStageId) {
            try {
                await apiService.update("crm.lead", activeId as number, { stage_id: newStageId })
            } catch (err) {
                console.error("Error updating stage:", err)
                fetchData() // Revert on failure
            }
        }
    }

    const groupedLeads = useMemo(() => {
        const groups: { [key: number]: OdooLead[] } = {}
        stages.forEach(s => groups[s.id] = [])
        filteredAndSortedLeads.forEach(l => {
            const stageId = l.stage_id ? l.stage_id[0] : null
            if (stageId && groups[stageId]) {
                groups[stageId].push(l)
            }
        })
        return groups
    }, [stages, filteredAndSortedLeads])

    const saveNewOpportunity = async (data: any) => {
        try {
            const res = await apiService.create("crm.lead", data)
            if (res.success) fetchData()
        } catch (err) {
            console.error("Error creating opportunity:", err)
        }
    }

    const totalValue = useMemo(() => {
        return filteredAndSortedLeads.reduce((sum, l) => sum + (l.expected_revenue || 0), 0)
    }, [filteredAndSortedLeads])

    return (
        <div className={`kanban-page min-h-screen ${isDark ? "bg-[#0A0A0A]" : "bg-[#F8F9FA]"}`}>
            <style dangerouslySetInnerHTML={{ __html: scopedStyles }} />

            <CRMHeader
                title={t('opportunities.title')}
                totalCount={filteredAndSortedLeads.length}
                totalValue={`$${totalValue.toLocaleString()}`}
                createButtonLabel={t('opportunities.add_new', 'Add Opportunity')}
                viewMode={viewMode}
                setViewMode={setViewMode}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filters={filters}
                setFilters={setFilters}
                sortBy={sortBy}
                setSortBy={setSortBy}
                onAddNew={() => setIsAddOpportunityModalOpen(true)}
                onRefresh={fetchData}
            />

            <AddOpportunityModal
                isOpen={isAddOpportunityModalOpen}
                onClose={() => setIsAddOpportunityModalOpen(false)}
                onSave={saveNewOpportunity}
                stages={stages}
                partners={partners}
            />

            <main className="px-8 mt-4">
                {loading ? (
                    <div className="flex items-center justify-center h-[60vh]">
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-[#EBEFA5] border-t-[#426932] rounded-full animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center font-black text-[12px] text-[#426932]">
                                ODOO
                            </div>
                        </div>
                    </div>
                ) : filteredAndSortedLeads.length === 0 ? (
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <EmptyState
                            icon={Search}
                            title="No Results Found"
                            description={`We couldn't find any opportunities matching "${searchQuery}". Try a different search term or clear filters.`}
                        />
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                    >
                        {viewMode === 'kanban' ? (
                            <div className="kanban-container flex flex-nowrap pb-6">
                                {stages.map((stage, idx) => (
                                    <KanbanColumn
                                        key={stage.id}
                                        stage={stage}
                                        leads={groupedLeads[stage.id] || []}
                                        index={idx}
                                        onEditLead={(lead) => {
                                            setEditingLead(lead)
                                            setIsEditModalOpen(true)
                                        }}
                                        allTags={allTags}
                                    />
                                ))}

                                {/* Add Stage Column */}
                                <div className="kanban-column flex flex-col h-full px-3">
                                    <div className="flex items-center justify-between py-6 mb-2">
                                        <button
                                            onClick={() => setIsAddStageModalOpen(true)}
                                            className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed transition-all hover:scale-[1.02] active:scale-[0.98] ${isDark ? "border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300" : "border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600"
                                                }`}
                                        >
                                            <Plus className="w-5 h-5 border-2 rounded-lg p-0.5" />
                                            <span className="text-sm font-black uppercase tracking-widest">Add Stage</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`rounded-[32px] overflow-hidden border ${isDark ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-slate-100"} shadow-xl shadow-black/5`}
                            >
                                <Table>
                                    <TableHeader>
                                        <TableRow className={`${isDark ? "hover:bg-zinc-800" : "hover:bg-slate-50"} border-b ${isDark ? "border-zinc-800" : "border-slate-100"}`}>
                                            <TableHead className="font-bold">Opportunity</TableHead>
                                            <TableHead className="font-bold">Contact</TableHead>
                                            <TableHead className="font-bold">Revenue</TableHead>
                                            <TableHead className="font-bold">Probability</TableHead>
                                            <TableHead className="font-bold">Stage</TableHead>
                                            <TableHead className="font-bold">Deadline</TableHead>
                                            <TableHead className="text-right font-bold">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredAndSortedLeads.map((lead) => (
                                            <TableRow
                                                key={lead.id}
                                                className={`cursor-pointer ${isDark ? "hover:bg-zinc-800/50" : "hover:bg-slate-50/50"} transition-colors`}
                                                onClick={() => {
                                                    setEditingLead(lead)
                                                    setIsEditModalOpen(true)
                                                }}
                                            >
                                                <TableCell className="font-bold">{lead.name}</TableCell>
                                                <TableCell className="text-slate-500">{lead.partner_id ? lead.partner_id[1] : "-"}</TableCell>
                                                <TableCell>
                                                    <span className="font-bold text-[#426932]">
                                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(lead.expected_revenue)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-[#8BB061]" style={{ width: `${lead.probability}%` }} />
                                                        </div>
                                                        <span className="text-xs font-bold">{lead.probability}%</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${isDark ? "bg-zinc-800 text-zinc-400" : "bg-slate-100 text-slate-500"}`}>
                                                        {lead.stage_id[1]}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-xs font-medium text-slate-400">
                                                    {lead.date_deadline || "-"}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <button className="p-2 hover:bg-[#8BB061]/10 rounded-lg transition-colors">
                                                        <MoreHorizontal className="w-4 h-4 text-slate-400" />
                                                    </button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </motion.div>
                        )}

                        <DragOverlay dropAnimation={{
                            sideEffects: defaultDropAnimationSideEffects({
                                styles: {
                                    active: {
                                        opacity: '0.4',
                                    },
                                },
                            }),
                        }}>
                            {activeLead ? (
                                <OpportunityCard
                                    lead={activeLead}
                                    delay={0}
                                    onClick={() => { }}
                                    allTags={allTags}
                                />
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                )}
            </main>

            {/* Modals */}
            <EditOpportunityModal
                opportunity={editingLead}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSaveLead}
                allTags={allTags}
            />

            <AddStageModal
                isOpen={isAddStageModalOpen}
                onClose={() => setIsAddStageModalOpen(false)}
                onSave={handleCreateStage}
            />
        </div>
    )
}
