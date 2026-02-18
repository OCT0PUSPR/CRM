"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo, useRef, memo, Suspense } from "react"
import {
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  HelpCircle,
  User,
  Users,
  Building2,
  DollarSign,
  Info,
  List,
  ChevronUp,
  Calendar,
  Mail,
  PhoneCall,
  Video,
  ArrowUpDown,
  GripVertical,
  PlusIcon,
  Save,
  Sun,
  Moon,
  Layers,
  FileText,
  Settings,
  Bell,
  LayoutGrid,
  UserCircle,
  MessageSquare,
  X,
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { apiService } from "../services/api"
import { useAuth } from "../../context/auth"
import { API_CONFIG } from "../config/api"
import CRMHeader from "../components/PagesHeader"

// ============================================
// SCOPED STYLES - Premium CRM Design System
// ============================================
const scopedStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

  .crm-container {
    font-family: 'Space Grotesk', sans-serif !important;
  }

  .crm-container * {
    font-family: 'Space Grotesk', sans-serif !important;
  }

  /* Custom scrollbar styling for horizontal scroll */
  .custom-scrollbar::-webkit-scrollbar {
    height: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #D1D5DB;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #9CA3AF;
  }
  .theme-dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #374151;
  }
  .theme-dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #4B5563;
  }

  /* Scrollbar hide utility */
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  /* Animation keyframes */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes blurIn {
    from {
      opacity: 0;
      filter: blur(10px);
    }
    to {
      opacity: 1;
      filter: blur(0);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out forwards;
  }

  .animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
  }

  .animate-slide-in-right {
    animation: slideInRight 0.5s ease-out forwards;
  }

  .animate-blur-in {
    animation: blurIn 0.6s ease-out forwards;
  }

  .animate-scale-in {
    animation: scaleIn 0.4s ease-out forwards;
  }

  .stagger-1 { animation-delay: 0.05s; }
  .stagger-2 { animation-delay: 0.1s; }
  .stagger-3 { animation-delay: 0.15s; }
  .stagger-4 { animation-delay: 0.2s; }
  .stagger-5 { animation-delay: 0.25s; }
  .stagger-6 { animation-delay: 0.3s; }
  .stagger-7 { animation-delay: 0.35s; }
  .stagger-8 { animation-delay: 0.4s; }
  .stagger-9 { animation-delay: 0.45s; }
  .stagger-10 { animation-delay: 0.5s; }

  /* Updated premium light mode with white background */
  .theme-light {
    --bg-primary: #FFFFFF;
    --bg-secondary: #FFFFFF;
    --bg-tertiary: #F8F9FA;
    --bg-hover: #F4F5F7;
    --text-primary: #1A1D21;
    --text-secondary: #5E6C84;
    --text-tertiary: #97A0AF;
    --border-color: #E4E7EB;
    --border-subtle: #EBEEF2;
    --accent-primary: #0066FF;
    --accent-glow: rgba(0, 102, 255, 0.1);
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);
    --shadow-md: 0 4px 12px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04);
    --shadow-lg: 0 12px 40px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04);
    --shadow-glow: 0 0 40px rgba(0, 102, 255, 0.15);
  }

  /* Dark mode */
  .theme-dark {
    --bg-primary: #0D1117;
    --bg-secondary: #161B22;
    --bg-tertiary: #21262D;
    --bg-hover: #30363D;
    --text-primary: #F0F6FC;
    --text-secondary: #8B949E;
    --text-tertiary: #6E7681;
    --border-color: #30363D;
    --border-subtle: #21262D;
    --accent-primary: #58A6FF;
    --accent-glow: rgba(88, 166, 255, 0.15);
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.2);
    --shadow-md: 0 4px 12px rgba(0,0,0,0.3);
    --shadow-lg: 0 12px 40px rgba(0,0,0,0.4);
    --shadow-glow: 0 0 40px rgba(88, 166, 255, 0.2);
  }

  /* Premium input focus */
  .premium-input:focus {
    box-shadow: 0 0 0 3px var(--accent-glow), var(--shadow-sm);
  }

  /* Premium button hover */
  .premium-btn {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .premium-btn:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  .premium-btn:active {
    transform: translateY(0);
  }

  /* Table row hover effect */
  .premium-row {
    transition: all 0.2s ease;
  }

  .premium-row:hover {
    background: var(--bg-hover) !important;
  }

  /* Glass morphism effect */
  .glass-effect {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  /* Gradient text */
  .gradient-text {
    background: linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`

// ============================================
// TYPES
// ============================================
interface Activity {
  id: number
  activity_type_id: [number, string] | false
  summary: string | false
  date_deadline: string | false
  note: string | false
  res_model: string
  res_id: number
  user_id?: [number, string] | false
  activity_category: string
  state: string
}

interface Deal {
  id: number
  name: string
  amount_total: number
  state: string
  date_order: string
}

interface Subitem {
  id: number
  name: string
  owner: string
  status: string
  date: string
}

interface Customer {
  id: number
  name: string
  display_name: string
  email: string
  phone: string
  mobile: string
  street: string
  street2: string
  city: string
  state_id: [number, string] | false
  country_id: [number, string] | false
  zip: string
  website: string
  function: string
  is_company: boolean
  company_type: string
  customer_rank: number
  supplier_rank: number
  employee: boolean
  category_id: [number, string][] | false
  title: [number, string] | false
  parent_id: [number, string] | false
  user_id: [number, string] | false
  vat: string
  comment: string
  barcode: string
  color: number
  is_blacklisted: boolean
  date: string
  create_date: string
  write_date: string
  message_bounce: number
  commercial_company_name: string
  commercial_partner_id: [number, string]
  company_name: string
  lang: string
  tz: string
  partner_share: boolean
  trust: string
  contract_ids: number[]
  sale_order_count: number
  sale_order_ids: number[]
  purchase_order_count: number
  purchase_order_ids: number[]
  invoice_count: number
  invoice_ids: number[]
  invoice_warn: string
  invoice_warn_msg: string
  property_account_position_id: [number, string] | false
  property_payment_term_id: [number, string] | false
  property_supplier_payment_term_id: [number, string] | false
  property_account_payable_id: [number, string] | false
  property_account_receivable_id: [number, string] | false
  property_delivery_carrier_id: [number, string] | false
  property_supplier_currency_id: [number, string] | false
  property_purchase_currency_id: [number, string] | false
  property_stock_customer: [number, string] | false
  property_stock_supplier: [number, string] | false
  last_time_entries_checked: string
  debit_limit: number
  total_invoiced: number
  total_debit: number
  total_credit: number
  total_due: number
  credit_limit: number
  contact_address: [number, string] | false
  team_id: [number, string] | false
  opportunity_ids: number[]
  meeting_count: number
  meeting_ids: number[]
  activities_count: number
  activity_ids_db: number[] // Renamed from activity_ids to avoid conflict
  activity_state: string
  activity_user_id: [number, string] | false
  activity_type_id: [number, string] | false
  activity_date_deadline: string | false
  activity_summary: string | false
  message_ids: number[]
  message_is_follower: boolean
  message_follower_ids: number[]
  message_partner_ids: number[]
  message_has_error: boolean
  message_has_error_counter: number
  message_has_sms_error: boolean
  message_main_attachment_id: [number, string] | false
  website_message_ids: number[]
  message_needaction: boolean
  message_needaction_counter: number
  message_attachment_count: number
  rating_ids: number[]
  rating_count: number
  rating_last_value: number
  rating_last_feedback: string
  rating_last_image: string
  rating_last_partner_id: [number, string] | false
  rating_last_create_date: string
  rating_last_write_date: string
  rating_last_consumed: boolean
  rating_last_gratification: string
  rating_last_gratification_level: string
  rating_last_gratification_date: string
  rating_last_gratification_create_date: string
  rating_last_gratification_write_date: string
  rating_last_gratification_consumed: boolean
  // Additional fields for UI compatibility
  activity_ids?: Activity[] // UI activities array
  order_ids?: Deal[]
  subitems?: Subitem[]
  priority?: string
  type?: string
  expected_revenue?: number
  probability?: number
  stage_id?: [number, string] | false
  partner_id?: [number, string] | false
  partner_name?: string | false
  contact_name?: string | false
  company_id?: [number, string] | false
  active?: boolean
}

interface GroupedCustomers {
  [key: string]: Customer[]
}

interface Column {
  id: string
  label: string
  width: number
  sortable: boolean
  resizable: boolean
}

interface SelectionOption {
  value: string
  label: string
}

// ============================================
// PRIORITY COLORS
// ============================================
const PRIORITY_COLORS = {
  HIGH: "#FF6D3B",
  MEDIUM: "#579BFC",
  LOW: "#4ECCC6",
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
const getActivityTypeInfo = (activityTypeName: string) => {
  const lower = activityTypeName?.toLowerCase() || ""
  if (lower.includes("call") || lower.includes("phone")) {
    return { icon: PhoneCall, label: "Call", color: "#67CCFF" }
  }
  if (lower.includes("meeting")) {
    return { icon: Video, label: "Meeting", color: "#FF5AC4" }
  }
  if (lower.includes("email") || lower.includes("mail")) {
    return { icon: Mail, label: "Incoming email", color: "#FF5AC4" }
  }
  if (lower.includes("task")) {
    return { icon: Calendar, label: "Task", color: "#67CCFF" }
  }
  return { icon: Calendar, label: "Activity", color: "#A78BFA" }
}

// ============================================
// ANIMATED WRAPPER COMPONENT
// ============================================
const AnimatedElement: React.FC<{
  children: React.ReactNode
  animation?: "fade-in-up" | "fade-in" | "slide-in-right" | "blur-in" | "scale-in"
  delay?: number
  className?: string
}> = ({ children, animation = "fade-in-up", delay = 0, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`${className} ${isVisible ? `animate-${animation}` : "opacity-0"}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

// ACTIVITY TIMELINE COMPONENT
// ============================================
const ActivityTimeline: React.FC<{ activities?: Activity[]; customerId: number; isDark: boolean }> = memo(
  ({ activities = [], customerId, isDark }) => {
    // Generate last 45 days
    const days = useMemo(() => {
      const result = []
      const today = new Date()
      for (let i = 44; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        result.push(date.toISOString().split("T")[0])
      }
      return result
    }, [customerId])

    // Check if each day has activities
    const activitiesByDay = useMemo(() => {
      const map: Record<string, boolean> = {}
      if (activities && Array.isArray(activities)) {
        activities.forEach((activity) => {
          if (activity.date_deadline) {
            const dateStr = activity.date_deadline.split("T")[0]
            map[dateStr] = true
          }
        })
      }
      return map
    }, [activities])

    return (
      <div className="flex items-center gap-[2px]">
        {days.map((day, index) => {
          const hasActivity = activitiesByDay[day] || false

          return (
            <div
              key={index}
              className="w-[3px] h-[20px] rounded-[1px]"
              style={{
                backgroundColor: hasActivity
                  ? (isDark ? "#58A6FF" : "#0066FF")
                  : (isDark ? "#30363D" : "#E4E7EB"),
                opacity: hasActivity ? 1 : 0.3,
              }}
            />
          )
        })}
      </div>
    )
  }
)

ActivityTimeline.displayName = "ActivityTimeline"

// ============================================
// SELECTION DROPDOWN COMPONENT
// ============================================
interface SelectionDropdownProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (value: string) => void
  options: SelectionOption[]
  currentValue: string
  fieldType: "type" | "priority"
  position: "type" | "priority"
  getOptionStyle: (value: string, label?: string) => { bg: string; text: string; label: string }
  isDark: boolean
}

const SelectionDropdown: React.FC<SelectionDropdownProps> = ({
  isOpen,
  onClose,
  onSelect,
  options,
  currentValue,
  fieldType,
  getOptionStyle,
  isDark,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute rounded-xl p-2 min-w-[200px] max-h-[300px] overflow-y-auto animate-scale-in glass-effect"
      style={{
        top: "calc(100% + 4px)",
        left: 0,
        zIndex: 9999,
        backgroundColor: isDark ? "rgba(22, 27, 34, 0.98)" : "rgba(255, 255, 255, 0.98)",
        border: `1px solid ${isDark ? "#30363D" : "#E4E7EB"}`,
        boxShadow: isDark ? "0 12px 40px rgba(0,0,0,0.4)" : "0 12px 40px rgba(0,0,0,0.12)",
      }}
    >
      {options.map((option) => {
        const style = getOptionStyle(option.value, option.label)
        const isSelected = option.value === currentValue

        return (
          <button
            key={option.value}
            onClick={() => {
              onSelect(option.value)
              onClose()
            }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center"
            style={{
              backgroundColor: isSelected ? (isDark ? "#21262D" : "#F0F2F5") : "transparent",
              color: isDark ? "#F0F6FC" : "#1A1D21",
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.backgroundColor = isDark ? "#21262D" : "#F4F5F7"
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.backgroundColor = "transparent"
              }
            }}
          >
            <span
              className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full"
              style={{
                backgroundColor: fieldType === "priority" ? style.bg : style.bg,
                color: fieldType === "priority" ? "white" : style.text,
              }}
            >
              {style.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ============================================
// PRIORITY BADGE COMPONENT
// ============================================
const PriorityBadge: React.FC<{
  priority: string
  customerId: number
  onUpdate?: (customerId: number, value: string) => void
  isDark: boolean
}> = ({ priority, customerId, onUpdate, isDark }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isNoteDropdownOpen, setIsNoteDropdownOpen] = useState(false)
  const [note, setNote] = useState("")
  const [options] = useState<SelectionOption[]>([
    { value: "3", label: "Very High" },
    { value: "2", label: "High" },
    { value: "1", label: "Medium" },
    { value: "0", label: "Low" },
  ])

  const getPriorityStyle = (value: string) => {
    switch (value) {
      case "3":
        return { bg: PRIORITY_COLORS.HIGH, text: "Very High", label: "Very High" }
      case "2":
        return { bg: PRIORITY_COLORS.HIGH, text: "High", label: "High" }
      case "1":
        return { bg: PRIORITY_COLORS.MEDIUM, text: "Medium", label: "Medium" }
      case "0":
        return { bg: PRIORITY_COLORS.LOW, text: "Low", label: "Low" }
      default:
        return { bg: isDark ? "#6E7681" : "#97A0AF", text: "None", label: "None" }
    }
  }

  const style = getPriorityStyle(priority)

  const handleSelect = async (value: string) => {
    if (onUpdate) {
      onUpdate(customerId, value)
    }
  }

  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsNoteDropdownOpen(true)
    setIsDropdownOpen(false)
  }

  const handleNoteSubmit = async () => {
    if (note.trim()) {
      // Here you would typically save the note to the backend
      console.log(`Adding note for customer ${customerId}: ${note}`)
      setNote("")
      setIsNoteDropdownOpen(false)
    }
  }

  return (
    <div
      className="relative inline-flex justify-center w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ zIndex: isDropdownOpen ? 9999 : 1 }}
    >
      <div
        className="relative inline-flex items-center overflow-visible cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          setIsDropdownOpen(true)
        }}
      >
        <span
          className={`px-3 py-1.5 text-xs font-semibold text-white rounded-full transition-all duration-200 relative flex items-center gap-1.5 ${isHovered ? "pr-8" : "pr-3"
            }`}
          style={{
            backgroundColor: style.bg,
            boxShadow: isHovered ? `0 4px 12px ${style.bg}40` : "none",
          }}
        >
          <span>{style.text}</span>
        </span>
        <div
          className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full transition-all duration-200 ${isHovered ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
            }`}
          style={{ backgroundColor: "rgba(255, 255, 255, 0.25)" }}
          onClick={handlePlusClick}
        >
          <PlusIcon className="w-3 h-3 text-white" />
        </div>
      </div>
      <SelectionDropdown
        isOpen={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
        onSelect={handleSelect}
        options={options}
        currentValue={priority}
        fieldType="priority"
        position="priority"
        getOptionStyle={getPriorityStyle}
        isDark={isDark}
      />

      {/* Note Dropdown */}
      {isNoteDropdownOpen && (
        <div
          className="absolute top-full mt-2 right-0 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 w-64"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Add Note
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter your note..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
              rows={3}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsNoteDropdownOpen(false)}
              className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleNoteSubmit}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// TYPE BADGE COMPONENT
// ============================================
const TypeBadge: React.FC<{
  type: string
  customerId: number
  onUpdate?: (customerId: number, value: string) => void
  isDark: boolean
}> = ({ type, customerId, onUpdate, isDark }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [options] = useState<SelectionOption[]>([
    { value: "customer", label: "Customer" },
    { value: "opportunity", label: "Partner" },
  ])

  const getTypeStyle = (value: string, label?: string) => {
    const displayLabel = label || (value === "customer" ? "Customer" : value === "opportunity" ? "Partner" : "Lead")

    switch (value) {
      case "customer":
        return {
          bg: isDark ? "rgba(88, 166, 255, 0.15)" : "rgba(0, 102, 255, 0.1)",
          text: isDark ? "#58A6FF" : "#0066FF",
          label: displayLabel,
        }
      case "opportunity":
        return {
          bg: isDark ? "rgba(255, 109, 59, 0.15)" : "rgba(255, 109, 59, 0.1)",
          text: PRIORITY_COLORS.HIGH,
          label: displayLabel,
        }
      default:
        return {
          bg: isDark ? "rgba(88, 166, 255, 0.15)" : "rgba(0, 102, 255, 0.1)",
          text: isDark ? "#58A6FF" : "#0066FF",
          label: displayLabel,
        }
    }
  }

  const style = getTypeStyle(type)

  const handleSelect = async (value: string) => {
    if (onUpdate) {
      onUpdate(customerId, value)
    }
  }

  return (
    <div
      className="relative inline-flex justify-center w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ zIndex: isDropdownOpen ? 9999 : 1 }}
    >
      <div
        className="relative inline-flex items-center overflow-visible cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          setIsDropdownOpen(true)
        }}
      >
        <span
          className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 relative flex items-center gap-1.5 ${isHovered ? "pr-8" : "pr-3"
            }`}
          style={{ backgroundColor: style.bg, color: style.text }}
        >
          <span>{style.label}</span>
        </span>
        <div
          className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full transition-all duration-200 ${isHovered ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
            }`}
          style={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
        >
          <PlusIcon className="w-3 h-3" style={{ color: style.text }} />
        </div>
      </div>
      <SelectionDropdown
        isOpen={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
        onSelect={handleSelect}
        options={options}
        currentValue={type}
        fieldType="type"
        position="type"
        getOptionStyle={getTypeStyle}
        isDark={isDark}
      />
    </div>
  )
}

// ============================================
// ACCOUNT BADGE COMPONENT
// ============================================
const AccountBadge: React.FC<{ name: string; isDark: boolean }> = ({ name, isDark }) => {
  return (
    <div className="flex justify-center w-full">
      <span
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:scale-105"
        style={{
          backgroundColor: isDark ? "rgba(88, 166, 255, 0.15)" : "rgba(0, 102, 255, 0.08)",
          color: isDark ? "#58A6FF" : "#0066FF",
        }}
      >
        <Building2 className="w-3.5 h-3.5" />
        <span className="truncate max-w-[100px]">{name}</span>
      </span>
    </div>
  )
}

// ============================================
// DEAL BADGE COMPONENT
// ============================================
const DealBadge: React.FC<{ deals: Deal[]; isDark: boolean }> = ({ deals, isDark }) => {
  const [showTooltip, setShowTooltip] = useState(false)

  if (!deals || deals.length === 0) {
    return (
      <span style={{ color: isDark ? "#6E7681" : "#97A0AF" }} className="flex justify-center w-full">
        -
      </span>
    )
  }

  const firstDeal = deals[0]
  const remainingCount = deals.length - 1

  return (
    <div className="relative inline-flex justify-center w-full">
      <div
        className="flex items-center gap-2"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: isDark ? "rgba(78, 204, 198, 0.15)" : "rgba(78, 204, 198, 0.1)",
            color: PRIORITY_COLORS.LOW,
          }}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span className="truncate max-w-[80px]">{firstDeal.name || `Deal ${firstDeal.id}`}</span>
        </span>
        {remainingCount > 0 && (
          <span
            className="px-2 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: isDark ? "#21262D" : "#F0F2F5",
              color: isDark ? "#8B949E" : "#5E6C84",
            }}
          >
            +{remainingCount}
          </span>
        )}
      </div>

      {showTooltip && remainingCount > 0 && (
        <div
          className="absolute text-xs rounded-xl p-4 min-w-[220px] pointer-events-none glass-effect animate-scale-in"
          style={{
            left: "0",
            bottom: "100%",
            marginBottom: "12px",
            backgroundColor: isDark ? "rgba(22, 27, 34, 0.95)" : "rgba(255, 255, 255, 0.95)",
            border: `1px solid ${isDark ? "#30363D" : "#E4E7EB"}`,
            boxShadow: isDark ? "0 12px 40px rgba(0,0,0,0.4)" : "0 12px 40px rgba(0,0,0,0.12)",
            color: isDark ? "#F0F6FC" : "#1A1D21",
            zIndex: 9999,
          }}
        >
          <div className="font-semibold mb-3 text-sm">All Deals ({deals.length})</div>
          <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
            {deals.map((deal) => (
              <div key={deal.id} className="flex items-center justify-between gap-3">
                <div className="font-medium truncate">{deal.name || `Deal ${deal.id}`}</div>
                <div style={{ color: PRIORITY_COLORS.LOW }} className="font-semibold">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 0,
                  }).format(deal.amount_total || 0)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// EDITABLE CELL COMPONENT
// ============================================
interface EditableCellProps {
  value: string | number | undefined | null
  field: string
  customerId: number
  onSave: (customerId: number, field: string, value: string | number) => void
  format?: (value: string | number | undefined | null) => string
  parse?: (value: string) => string | number
  type?: "text" | "email" | "number" | "currency"
  className?: string
  isDark: boolean
}

const EditableCell: React.FC<EditableCellProps> = memo(
  ({ value, field, customerId, onSave, format, parse, type = "text", className = "", isDark }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [editValue, setEditValue] = useState<string>("")
    const inputRef = useRef<HTMLInputElement>(null)

    const displayValue = format ? format(value) : value === undefined || value === null ? "-" : value.toString()
    const isEmpty = !value || value === "-" || value === ""

    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    }, [isEditing])

    const handleClick = () => {
      setEditValue(value?.toString() || "")
      setIsEditing(true)
    }

    const handleBlur = () => {
      setIsEditing(false)
      if (editValue !== (value?.toString() || "")) {
        // Compare with original value string representation
        const parsedValue = parse ? parse(editValue) : editValue
        onSave(customerId, field, parsedValue)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault()
        inputRef.current?.blur()
      } else if (e.key === "Escape") {
        setIsEditing(false)
        setEditValue(value?.toString() || "")
      }
    }

    if (isEditing) {
      return (
        <input
          ref={inputRef}
          type={type === "currency" ? "number" : type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`w-full px-3 py-1.5 text-sm rounded-lg premium-input ${className}`}
          style={{
            backgroundColor: isDark ? "#21262D" : "#FFFFFF",
            border: `2px solid ${isDark ? "#58A6FF" : "#0066FF"}`,
            color: isDark ? "#F0F6FC" : "#1A1D21",
            outline: "none",
          }}
        />
      )
    }

    if (type === "email" && value && !isEmpty) {
      return (
        <a
          href={`mailto:${value}`}
          onClick={(e) => {
            e.preventDefault()
            handleClick()
          }}
          className={`cursor-text rounded-lg px-2 py-1 transition-all duration-200 hover:underline block hover:bg-opacity-50 ${className}`}
          style={{
            color: isDark ? "#58A6FF" : "#0066FF",
          }}
          title="Click to edit"
        >
          {displayValue}
        </a>
      )
    }

    return (
      <div
        onClick={handleClick}
        className={`cursor-text rounded-lg px-2 py-1 transition-all duration-200 ${className}`}
        style={{
          color: isEmpty ? (isDark ? "#6E7681" : "#97A0AF") : isDark ? "#F0F6FC" : "#1A1D21",
        }}
        title="Click to edit"
      >
        {displayValue}
      </div>
    )
  },
)

EditableCell.displayName = "EditableCell"

// ============================================
// COLUMN HEADER COMPONENT
// ============================================
interface ColumnHeaderProps {
  column: Column
  onSort?: () => void
  onResize?: (newWidth: number) => void
  onDragStart?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  isDragging?: boolean
  sortDirection?: "asc" | "desc" | null
  children?: React.ReactNode
  isDark: boolean
}

const ColumnHeader: React.FC<ColumnHeaderProps> = ({
  column,
  onSort,
  onResize,
  onDragStart,
  onDragOver,
  onDrop,
  sortDirection,
  children,
  isDark,
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isResizing, setIsResizing] = useState(false)

  // Calculate left position for sticky columns
  const getStickyLeft = (columnId: string, allColumns: Column[]): number => {
    if (columnId === "contact") {
      // Contact column should be sticky after checkbox (50px) and spacer (40px)
      return 90 // 50 + 40
    }
    return 0
  }

  const isSticky = column.id === "contact"
  const stickyLeft = isSticky ? getStickyLeft(column.id, []) : 0

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!onResize) return
    e.preventDefault()
    setIsResizing(true)
    const startX = e.clientX
    const startWidth = column.width

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX
      const newWidth = Math.max(80, startWidth + diff)
      onResize(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  return (
    <th
      className={`px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider whitespace-nowrap relative group select-none ${isSticky ? "sticky" : ""
        }`}
      style={{
        width: `${column.width}px`,
        minWidth: `${column.width}px`,
        maxWidth: `${column.width}px`,
        backgroundColor: isDark ? "#161B22" : "#F8F9FA",
        color: isDark ? "#8B949E" : "#5E6C84",
        borderBottom: `1px solid ${isDark ? "#30363D" : "#E4E7EB"}`,
        left: isSticky ? `${stickyLeft}px` : "auto",
        zIndex: isSticky ? 20 : 1,
      }}
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-2">
        {onDragStart && (
          <GripVertical
            className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 cursor-move transition-opacity"
            style={{ color: isDark ? "#6E7681" : "#97A0AF" }}
          />
        )}
        {children}
        {column.sortable && isHovered && (
          <button
            onClick={onSort}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-black/5"
          >
            <ArrowUpDown className="w-3.5 h-3.5" style={{ color: isDark ? "#58A6FF" : "#0066FF" }} />
          </button>
        )}
        {sortDirection && (
          <span style={{ color: isDark ? "#58A6FF" : "#0066FF" }} className="text-xs font-bold">
            {sortDirection === "asc" ? "↑" : "↓"}
          </span>
        )}
      </div>
      {column.resizable && onResize && (
        <div
          className="absolute top-0 right-0 w-1 h-full cursor-col-resize opacity-0 group-hover:opacity-100 transition-opacity"
          onMouseDown={handleMouseDown}
          style={{
            cursor: isResizing ? "col-resize" : "default",
            backgroundColor: isDark ? "#58A6FF" : "#0066FF",
          }}
        />
      )}
    </th>
  )
}

// ============================================
// TABLE HEADER COMPONENT
// ============================================
interface TableHeaderProps {
  columns: Column[]
  onColumnResize: (columnId: string, newWidth: number) => void
  onColumnReorder: (fromIndex: number, toIndex: number) => void
  sortColumn: string | null
  sortDirection: "asc" | "desc" | null
  onSort: (columnId: string) => void
  isDark: boolean
}

const TableHeader: React.FC<TableHeaderProps> = ({
  columns,
  onColumnResize,
  onColumnReorder,
  sortColumn,
  sortDirection,
  onSort,
  isDark,
}) => {
  const [draggedColumn, setDraggedColumn] = useState<number | null>(null)

  const handleDragStart = (index: number) => (e: React.DragEvent) => {
    setDraggedColumn(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = () => (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (index: number) => (e: React.DragEvent) => {
    e.preventDefault()
    if (draggedColumn !== null && draggedColumn !== index) {
      onColumnReorder(draggedColumn, index)
    }
    setDraggedColumn(null)
  }

  return (
    <thead>
      <tr>
        <th
          className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider whitespace-nowrap sticky left-0"
          style={{
            backgroundColor: isDark ? "#161B22" : "#F8F9FA",
            borderBottom: `1px solid ${isDark ? "#30363D" : "#E4E7EB"}`,
            zIndex: 10,
            width: "50px",
            minWidth: "50px",
          }}
        >
          <input
            type="checkbox"
            className="w-4 h-4 rounded-md cursor-pointer"
            style={{
              accentColor: isDark ? "#58A6FF" : "#0066FF",
            }}
          />
        </th>
        <th
          className="px-2 py-4 text-left text-[11px] font-bold uppercase tracking-wider whitespace-nowrap sticky"
          style={{
            backgroundColor: isDark ? "#161B22" : "#F8F9FA",
            borderBottom: `1px solid ${isDark ? "#30363D" : "#E4E7EB"}`,
            left: "50px",
            zIndex: 10,
            width: "40px",
            minWidth: "40px",
          }}
        />
        {columns.map((column, index) => (
          <ColumnHeader
            key={column.id}
            column={column}
            onSort={column.sortable ? () => onSort(column.id) : undefined}
            onResize={column.resizable ? (newWidth) => onColumnResize(column.id, newWidth) : undefined}
            onDragStart={handleDragStart(index)}
            onDragOver={handleDragOver()}
            onDrop={handleDrop(index)}
            isDragging={draggedColumn === index}
            sortDirection={sortColumn === column.id ? sortDirection : null}
            isDark={isDark}
          >
            <span className="flex items-center gap-1.5">
              {column.label}
              {(column.label === "Accounts" || column.label === "Deals" || column.label === "Deals value") && (
                <Info className="w-3.5 h-3.5" style={{ color: isDark ? "#6E7681" : "#97A0AF" }} />
              )}
            </span>
          </ColumnHeader>
        ))}
        <th
          className="px-2 py-4 text-left text-[11px] font-bold uppercase tracking-wider whitespace-nowrap"
          style={{
            width: "80px",
            minWidth: "80px",
            maxWidth: "80px",
            backgroundColor: isDark ? "#161B22" : "#F8F9FA",
            color: isDark ? "#8B949E" : "#5E6C84",
            borderBottom: `1px solid ${isDark ? "#30363D" : "#E4E7EB"}`,
          }}
        />
      </tr>
    </thead>
  )
}

// ============================================
// SUBITEM ROW COMPONENT
// ============================================
const SubitemRow: React.FC<{
  subitem: Subitem
  isDark: boolean
  onUpdate: (subitemId: number, field: string, value: string) => void
}> = ({ subitem, isDark, onUpdate }) => {
  return (
    <tr
      className="premium-row group"
      style={{
        backgroundColor: isDark ? "#161B22" : "#FAFBFC",
      }}
    >
      <td
        className="px-4 py-3 sticky left-0"
        style={{
          borderBottom: `1px solid ${isDark ? "#21262D" : "#EBEEF2"}`,
          backgroundColor: isDark ? "#161B22" : "#FAFBFC",
          zIndex: 5,
        }}
      >
        <input
          type="checkbox"
          className="w-4 h-4 rounded-md cursor-pointer"
          style={{ accentColor: isDark ? "#58A6FF" : "#0066FF" }}
        />
      </td>
      <td
        className="px-2 py-3 sticky"
        style={{
          borderBottom: `1px solid ${isDark ? "#21262D" : "#EBEEF2"}`,
          backgroundColor: isDark ? "#161B22" : "#FAFBFC",
          left: "50px",
          zIndex: 5,
          width: "40px",
        }}
      />
      <td className="px-4 py-3 pl-12" style={{ borderBottom: `1px solid ${isDark ? "#21262D" : "#EBEEF2"}` }}>
        <EditableCell
          value={subitem.name}
          field="name"
          customerId={subitem.id}
          onSave={(id, field, value) => onUpdate(id, field, value.toString())}
          className="text-sm"
          isDark={isDark}
        />
      </td>
      <td className="px-4 py-3" style={{ borderBottom: `1px solid ${isDark ? "#21262D" : "#EBEEF2"}` }}>
        <div className="flex items-center justify-center gap-2">
          <UserCircle className="w-5 h-5" style={{ color: isDark ? "#6E7681" : "#97A0AF" }} />
          <span className="text-sm" style={{ color: isDark ? "#8B949E" : "#5E6C84" }}>
            {subitem.owner || "-"}
          </span>
        </div>
      </td>
      <td className="px-4 py-3" style={{ borderBottom: `1px solid ${isDark ? "#21262D" : "#EBEEF2"}` }}>
        <div className="flex justify-center">
          <span
            className="px-3 py-1.5 text-xs font-semibold rounded-full"
            style={{
              backgroundColor: isDark ? "rgba(78, 204, 198, 0.15)" : "rgba(78, 204, 198, 0.1)",
              color: PRIORITY_COLORS.LOW,
            }}
          >
            {subitem.status || "Pending"}
          </span>
        </div>
      </td>
      <td className="px-4 py-3" style={{ borderBottom: `1px solid ${isDark ? "#21262D" : "#EBEEF2"}` }}>
        <div className="flex justify-center">
          <span className="text-sm" style={{ color: isDark ? "#8B949E" : "#5E6C84" }}>
            {subitem.date || "-"}
          </span>
        </div>
      </td>
      <td className="px-4 py-3" style={{ borderBottom: `1px solid ${isDark ? "#21262D" : "#EBEEF2"}` }}>
        <button
          className="p-1.5 rounded-lg transition-all duration-200"
          style={{ color: isDark ? "#6E7681" : "#97A0AF" }}
        >
          <Plus className="w-4 h-4" />
        </button>
      </td>
      {/* Empty cells for remaining columns */}
      <td colSpan={6} style={{ borderBottom: `1px solid ${isDark ? "#21262D" : "#EBEEF2"}` }} />
    </tr>
  )
}

// ============================================
// ADD SUBITEM ROW COMPONENT
// ============================================
const AddSubitemRow: React.FC<{ isDark: boolean; onAdd: () => void }> = ({ isDark, onAdd }) => {
  return (
    <tr
      className="cursor-pointer transition-all duration-200"
      style={{ backgroundColor: isDark ? "#161B22" : "#FAFBFC" }}
      onClick={onAdd}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = isDark ? "#21262D" : "#F4F5F7"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isDark ? "#161B22" : "#FAFBFC"
      }}
    >
      <td
        className="px-4 py-2 sticky left-0"
        style={{
          borderBottom: `1px solid ${isDark ? "#21262D" : "#EBEEF2"}`,
          backgroundColor: "inherit",
          zIndex: 5,
        }}
      />
      <td
        className="px-2 py-2 sticky"
        style={{
          borderBottom: `1px solid ${isDark ? "#21262D" : "#EBEEF2"}`,
          backgroundColor: "inherit",
          left: "50px",
          zIndex: 5,
        }}
      />
      <td
        colSpan={12}
        className="px-4 py-2 pl-12"
        style={{ borderBottom: `1px solid ${isDark ? "#21262D" : "#EBEEF2"}` }}
      >
        <div className="flex items-center gap-2 text-sm font-medium" style={{ color: isDark ? "#6E7681" : "#97A0AF" }}>
          <Plus className="w-4 h-4" />
          <span>Add subitem</span>
        </div>
      </td>
    </tr>
  )
}

// ============================================
// SUBITEM HEADER ROW COMPONENT
// ============================================
const SubitemHeaderRow: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  return (
    <tr style={{ backgroundColor: isDark ? "#161B22" : "#FAFBFC" }}>
      <td
        className="px-4 py-2 sticky left-0"
        style={{
          borderBottom: `1px solid ${isDark ? "#21262D" : "#EBEEF2"}`,
          backgroundColor: isDark ? "#161B22" : "#FAFBFC",
          zIndex: 5,
        }}
      />
      <td
        className="px-2 py-2 sticky"
        style={{
          borderBottom: `1px solid ${isDark ? "#21262D" : "#EBEEF2"}`,
          backgroundColor: isDark ? "#161B22" : "#FAFBFC",
          left: "50px",
          zIndex: 5,
        }}
      />
      <td className="px-4 py-2 pl-12" style={{ borderBottom: `1px solid ${isDark ? "#21262D" : "#EBEEF2"}` }}>
        <span
          className="text-[10px] font-bold uppercase tracking-wider"
          style={{ color: isDark ? "#6E7681" : "#97A0AF" }}
        >
          Subitem
        </span>
      </td>
      <td className="px-4 py-2 text-center" style={{ borderBottom: `1px solid ${isDark ? "#21262D" : "#EBEEF2"}` }}>
        <span
          className="text-[10px] font-bold uppercase tracking-wider"
          style={{ color: isDark ? "#6E7681" : "#97A0AF" }}
        >
          Owner
        </span>
      </td>
      <td className="px-4 py-2 text-center" style={{ borderBottom: `1px solid ${isDark ? "#21262D" : "#EBEEF2"}` }}>
        <span
          className="text-[10px] font-bold uppercase tracking-wider"
          style={{ color: isDark ? "#6E7681" : "#97A0AF" }}
        >
          Status
        </span>
      </td>
      <td className="px-4 py-2 text-center" style={{ borderBottom: `1px solid ${isDark ? "#21262D" : "#EBEEF2"}` }}>
        <span
          className="text-[10px] font-bold uppercase tracking-wider"
          style={{ color: isDark ? "#6E7681" : "#97A0AF" }}
        >
          Date
        </span>
      </td>
      <td className="px-4 py-2" style={{ borderBottom: `1px solid ${isDark ? "#21262D" : "#EBEEF2"}` }}>
        <Plus className="w-4 h-4" style={{ color: isDark ? "#6E7681" : "#97A0AF" }} />
      </td>
      <td colSpan={6} style={{ borderBottom: `1px solid ${isDark ? "#21262D" : "#EBEEF2"}` }} />
    </tr>
  )
}

// ============================================
// TABLE ROW COMPONENT
// ============================================
const TableRow: React.FC<{
  customer: Customer
  columns: Column[]
  onUpdate?: (customerId: number, field: string, value: string) => void
  pendingChanges?: Record<number, Record<string, any>>
  onFieldChange?: (customerId: number, field: string, value: any) => void
  onSaveChanges?: (customerId: number) => void
  isDark: boolean
  animationDelay: number
  onAddSubitem?: (customerId: number) => void
  onUpdateSubitem?: (customerId: number, subitemId: number, field: string, value: string) => void
}> = memo(
  ({
    customer,
    columns,
    onUpdate,
    pendingChanges,
    onFieldChange,
    onSaveChanges,
    isDark,
    animationDelay,
    onAddSubitem,
    onUpdateSubitem,
  }) => {
    const [isExpanded, setIsExpanded] = useState(false)

    const formatCurrency = (value: number | null | undefined) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value || 0)
    }

    const getJobPosition = () => {
      if (customer.function) return customer.function
      return "-"
    }

    const getContactName = () => {
      if (customer.contact_name) return customer.contact_name
      if (customer.partner_id && Array.isArray(customer.partner_id)) return customer.partner_id[1]
      return customer.name
    }

    const getCompanyName = () => {
      if (customer.partner_name) return customer.partner_name
      if (customer.company_id && Array.isArray(customer.company_id)) return customer.company_id[1]
      return customer.name.split(" ")[0] || "Unknown"
    }

    const getCellValue = useCallback(
      (columnId: string): any => {
        const changes = pendingChanges?.[customer.id] || {}
        switch (columnId) {
          case "contact":
            return changes.contact_name !== undefined ? changes.contact_name : getContactName()
          case "email":
            return changes.email !== undefined ? changes.email : customer.email
          case "phone":
            return changes.phone !== undefined ? changes.phone : customer.phone
          case "deals_value":
            return changes.expected_revenue !== undefined ? changes.expected_revenue : customer.expected_revenue
          case "title":
            return changes.function !== undefined ? changes.function : getJobPosition()
          default:
            return null
        }
      },
      [customer, pendingChanges],
    )

    const cellValues = useMemo(
      () => ({
        contact: getCellValue("contact"),
        email: getCellValue("email"),
        phone: getCellValue("phone"),
        deals_value: getCellValue("deals_value"),
        title: getCellValue("title"),
      }),
      [getCellValue],
    )

    const getCellContent = useCallback(
      (columnId: string) => {
        switch (columnId) {
          case "contact":
            return (
              <div className="flex items-center gap-2">
                <EditableCell
                  value={cellValues.contact}
                  field="contact_name"
                  customerId={customer.id}
                  onSave={(id, field, value) => onFieldChange?.(id, field, value)}
                  className="font-semibold text-sm flex-1"
                  isDark={isDark}
                />
                <button
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all duration-200"
                  style={{ backgroundColor: isDark ? "#21262D" : "#F0F2F5" }}
                >
                  <List className="w-4 h-4" style={{ color: isDark ? "#8B949E" : "#5E6C84" }} />
                </button>
              </div>
            )
          case "email":
            return (
              <EditableCell
                value={cellValues.email || ""}
                field="email"
                customerId={customer.id}
                onSave={(id, field, value) => onFieldChange?.(id, field, value)}
                type="email"
                format={(val) => (val ? val.toString() : "-")}
                className="text-sm"
                isDark={isDark}
              />
            )
          case "activities":
            return <ActivityTimeline activities={customer.activity_ids} customerId={customer.id} isDark={isDark} />
          case "accounts":
            return <AccountBadge name={getCompanyName()} isDark={isDark} />
          case "deals":
            return <DealBadge deals={customer.order_ids || []} isDark={isDark} />
          case "deals_value":
            return (
              <EditableCell
                value={cellValues.deals_value || 0}
                field="expected_revenue"
                customerId={customer.id}
                onSave={(id, field, value) => onFieldChange?.(id, field, value)}
                format={formatCurrency}
                parse={(val) => Number.parseFloat(val) || 0}
                type="currency"
                className="text-sm font-semibold"
                isDark={isDark}
              />
            )
          case "phone":
            return (
              <div className="flex items-center gap-1 whitespace-nowrap">
                <CountryFlag phoneNumber={cellValues.phone || ""} />
                <EditableCell
                  value={cellValues.phone || ""}
                  field="phone"
                  customerId={customer.id}
                  onSave={(id, field, value) => onFieldChange?.(id, field, value)}
                  type="text"
                  className="text-sm"
                  isDark={isDark}
                />
              </div>
            )
          case "title":
            return (
              <div className="flex justify-center w-full">
                <span
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: isDark ? "rgba(78, 204, 198, 0.15)" : "rgba(78, 204, 198, 0.1)",
                    color: PRIORITY_COLORS.LOW,
                  }}
                >
                  {cellValues.title || "-"}
                </span>
              </div>
            )
          case "type":
            return (
              <TypeBadge
                type={customer.type}
                customerId={customer.id}
                onUpdate={(id, value) => onUpdate?.(id, "type", value)}
                isDark={isDark}
              />
            )
          case "priority":
            return (
              <PriorityBadge
                priority={customer.priority}
                customerId={customer.id}
                onUpdate={(id, value) => onUpdate?.(id, "priority", value)}
                isDark={isDark}
              />
            )
          default:
            return null
        }
      },
      [cellValues, customer, onUpdate, onFieldChange, isDark],
    )

    const hasChanges = useMemo(() => {
      return pendingChanges?.[customer.id] && Object.keys(pendingChanges[customer.id]).length > 0
    }, [pendingChanges, customer.id])

    const hasSubitems = customer.subitems && customer.subitems.length > 0

    return (
      <>
        <tr
          className="premium-row group animate-fade-in"
          style={{
            backgroundColor: isDark ? "#0D1117" : "#FFFFFF",
            animationDelay: `${animationDelay}ms`,
          }}
        >
          <td
            className="px-4 py-4 sticky left-0"
            style={{
              borderBottom: `1px solid ${isDark ? "#21262D" : "#EBEEF2"}`,
              backgroundColor: isDark ? "#0D1117" : "#FFFFFF",
              zIndex: 5,
            }}
          >
            <input
              type="checkbox"
              className="w-4 h-4 rounded-md cursor-pointer"
              style={{ accentColor: isDark ? "#58A6FF" : "#0066FF" }}
            />
          </td>
          <td
            className="px-2 py-4 sticky"
            style={{
              borderBottom: `1px solid ${isDark ? "#21262D" : "#EBEEF2"}`,
              backgroundColor: isDark ? "#0D1117" : "#FFFFFF",
              left: "50px",
              zIndex: 5,
            }}
          >
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded transition-all duration-200"
              style={{ color: isDark ? "#6E7681" : "#97A0AF" }}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </td>
          {columns.map((column) => {
            const isSticky = column.id === "contact"
            const stickyLeft = isSticky ? 90 : 0 // Same as header

            return (
              <td
                key={column.id}
                className={`px-4 py-4 ${isSticky ? "sticky" : ""}`}
                style={{
                  width: `${column.width}px`,
                  minWidth: `${column.width}px`,
                  maxWidth: `${column.width}px`,
                  borderBottom: `1px solid ${isDark ? "#21262D" : "#EBEEF2"}`,
                  left: isSticky ? `${stickyLeft}px` : "auto",
                  zIndex: isSticky ? 15 : 1,
                  backgroundColor: isDark ? "#0D1117" : "#FFFFFF",
                }}
              >
                {getCellContent(column.id)}
              </td>
            )
          })}
          <td
            className="px-2 py-4"
            style={{
              width: "80px",
              minWidth: "80px",
              maxWidth: "80px",
              borderBottom: `1px solid ${isDark ? "#21262D" : "#EBEEF2"}`,
            }}
          >
            {hasChanges && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSaveChanges?.(customer.id)
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-white rounded-full text-xs font-semibold transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: isDark ? "#58A6FF" : "#0066FF",
                  boxShadow: `0 4px 12px ${isDark ? "rgba(88, 166, 255, 0.3)" : "rgba(0, 102, 255, 0.3)"}`,
                }}
                title="Save changes"
              >
                <Save className="w-3 h-3" />
                Save
              </button>
            )}
          </td>
        </tr>
        {isExpanded && (
          <>
            <SubitemHeaderRow isDark={isDark} />
            {hasSubitems &&
              customer.subitems?.map((subitem) => (
                <SubitemRow
                  key={subitem.id}
                  subitem={subitem}
                  isDark={isDark}
                  onUpdate={(subitemId, field, value) => onUpdateSubitem?.(customer.id, subitemId, field, value)}
                />
              ))}
            <AddSubitemRow isDark={isDark} onAdd={() => onAddSubitem?.(customer.id)} />
          </>
        )}
      </>
    )
  },
)

TableRow.displayName = "TableRow"

// ============================================
// ADD CONTACT ROW COMPONENT
// ============================================
const AddContactRow: React.FC<{ columns: Column[]; isDark: boolean }> = ({ columns, isDark }) => {
  return (
    <tr
      className="cursor-pointer transition-all duration-200"
      style={{ backgroundColor: isDark ? "#0D1117" : "#FFFFFF" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = isDark ? "#161B22" : "#F8F9FA"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isDark ? "#0D1117" : "#FFFFFF"
      }}
    >
      <td
        className="px-4 py-3 sticky left-0"
        style={{
          borderBottom: `1px solid ${isDark ? "#21262D" : "#EBEEF2"}`,
          backgroundColor: "inherit",
          zIndex: 5,
        }}
      />
      <td
        className="px-2 py-3 sticky"
        style={{
          borderBottom: `1px solid ${isDark ? "#21262D" : "#EBEEF2"}`,
          backgroundColor: "inherit",
          left: "50px",
          zIndex: 5,
        }}
      />
      <td
        colSpan={columns.length + 1}
        className="px-4 py-3"
        style={{ borderBottom: `1px solid ${isDark ? "#21262D" : "#EBEEF2"}` }}
      >
        <div className="flex items-center gap-2 text-sm font-medium" style={{ color: isDark ? "#6E7681" : "#97A0AF" }}>
          <Plus className="w-4 h-4" />
          <span>Add contact</span>
        </div>
      </td>
    </tr>
  )
}

// ============================================
// GROUP SECTION COMPONENT
// ============================================
const GroupSection: React.FC<{
  title: string
  customers: Customer[]
  color: string
  isExpanded: boolean
  onToggle: () => void
  columns: Column[]
  onColumnResize: (columnId: string, newWidth: number) => void
  onColumnReorder: (fromIndex: number, toIndex: number) => void
  sortColumn: string | null
  sortDirection: "asc" | "desc" | null
  onSort: (columnId: string) => void
  onUpdate?: (customerId: number, field: string, value: string) => void
  pendingChanges?: Record<number, Record<string, any>>
  onFieldChange?: (customerId: number, field: string, value: any) => void
  onSaveChanges?: (customerId: number) => void
  isDark: boolean
  onAddSubitem?: (customerId: number) => void
  onUpdateSubitem?: (customerId: number, subitemId: number, field: string, value: string) => void
}> = ({
  title,
  customers,
  color,
  isExpanded,
  onToggle,
  columns,
  onColumnResize,
  onColumnReorder,
  sortColumn,
  sortDirection,
  onSort,
  onUpdate,
  pendingChanges,
  onFieldChange,
  onSaveChanges,
  isDark,
  onAddSubitem,
  onUpdateSubitem,
}) => {
    return (
      <AnimatedElement animation="fade-in-up" className="mb-8">
        {/* Group Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onToggle}
            className="flex items-center gap-3 text-left py-2 px-3 rounded-xl transition-all duration-200"
            style={{ backgroundColor: isDark ? "#161B22" : "#F4F5F7" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? "#21262D" : "#EBEEF2"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? "#161B22" : "#F4F5F7"
            }}
          >
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" style={{ color: isDark ? "#8B949E" : "#5E6C84" }} />
            ) : (
              <ChevronRight className="w-5 h-5" style={{ color: isDark ? "#8B949E" : "#5E6C84" }} />
            )}
            <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: color }} />
            <span className="font-bold text-lg" style={{ color }}>
              {title}
            </span>
            <span
              className="text-sm font-medium px-2.5 py-0.5 rounded-full"
              style={{
                backgroundColor: isDark ? "#21262D" : "#EBEEF2",
                color: isDark ? "#8B949E" : "#5E6C84",
              }}
            >
              {customers.length}
            </span>
          </button>
        </div>

        {/* Group Content */}
        {isExpanded && (
          <div
            className="rounded-2xl overflow-hidden animate-scale-in"
            style={{
              backgroundColor: isDark ? "#0D1117" : "#FFFFFF",
              border: `1px solid ${isDark ? "#30363D" : "#E4E7EB"}`,
              borderLeft: `4px solid ${color}`,
              boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)",
            }}
          >
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full border-collapse" style={{ minWidth: "1400px" }}>
                <TableHeader
                  columns={columns}
                  onColumnResize={onColumnResize}
                  onColumnReorder={onColumnReorder}
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={onSort}
                  isDark={isDark}
                />
                <tbody>
                  {customers.map((customer, index) => (
                    <TableRow
                      key={`customer-${customer.id}`}
                      customer={customer}
                      columns={columns}
                      onUpdate={onUpdate}
                      pendingChanges={pendingChanges}
                      onFieldChange={onFieldChange}
                      onSaveChanges={onSaveChanges}
                      isDark={isDark}
                      animationDelay={index * 50}
                      onAddSubitem={onAddSubitem}
                      onUpdateSubitem={onUpdateSubitem}
                    />
                  ))}
                  <AddContactRow columns={columns} isDark={isDark} />
                </tbody>
              </table>
            </div>
          </div>
        )}
      </AnimatedElement>
    )
  }

// ============================================
// COUNTRY FLAG COMPONENT
// ============================================
// Assuming a dummy implementation for demonstration
const CountryFlag: React.FC<{ phoneNumber: string }> = ({ phoneNumber }) => {
  const getCountryCode = (phone: string) => {
    // Simplified logic: checks for common US prefixes
    if (phone.startsWith("+1")) return "US"
    return "UN" // Unknown
  }
  const countryCode = getCountryCode(phoneNumber)
  return (
    <span className={`fi fi-${countryCode.toLowerCase()} rounded-sm h-4 w-6`} style={{ transform: "scale(0.8)" }} />
  )
}

// ============================================
// MAIN CONTACTS COMPONENT
// ============================================
const ContactsContent: React.FC = () => {
  const { sessionId } = useAuth()
  const { t } = useTranslation()
  const [isDark, setIsDark] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<{ [key: string]: any }>({})
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({
    [t('contacts.groups.active')]: true,
    [t('contacts.groups.inactive')]: false,
  })
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null)
  const [pendingChanges, setPendingChanges] = useState<Record<number, Record<string, any>>>({})

  // Find the DEFAULT_COLUMNS and update widths
  const DEFAULT_COLUMNS: Column[] = [
    { id: "contact", label: t('contacts.columns.contact'), width: 180, sortable: true, resizable: true },
    { id: "email", label: t('contacts.columns.email'), width: 220, sortable: true, resizable: true },
    { id: "activities", label: t('contacts.columns.activities'), width: 140, sortable: false, resizable: true },
    { id: "accounts", label: t('contacts.columns.accounts'), width: 140, sortable: true, resizable: true },
    { id: "deals", label: t('contacts.columns.deals'), width: 150, sortable: false, resizable: true },
    { id: "deals_value", label: t('contacts.columns.deals_value'), width: 130, sortable: true, resizable: true },
    { id: "phone", label: t('contacts.columns.phone'), width: 180, sortable: true, resizable: true },
    { id: "title", label: t('contacts.columns.title'), width: 120, sortable: true, resizable: true },
    { id: "type", label: t('contacts.columns.type'), width: 130, sortable: true, resizable: true },
    { id: "priority", label: t('contacts.columns.priority'), width: 110, sortable: true, resizable: true },
  ]
  const [columns, setColumns] = useState<Column[]>(DEFAULT_COLUMNS)

  // Helper function to get Odoo headers
  const getOdooHeaders = useCallback((): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add tenant ID if available
    const tenantId = localStorage.getItem('current_tenant_id');
    if (tenantId) {
      headers['X-Tenant-ID'] = tenantId;
    }

    // Add session ID if available
    if (sessionId) {
      headers['x-odoo-session'] = sessionId;
    }

    return headers;
  }, [sessionId]);

  // Load real data from API
  const loadCustomersData = useCallback(async () => {
    if (!sessionId) {
      setError(t('contacts.messages.no_session'))
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('Making API call with session:', sessionId)

      // Use GET with query parameters like the apiService does
      // Try a broader query first to see what partners exist
      const queryParams = new URLSearchParams({
        domain: JSON.stringify([['is_company', '=', false]]),
        limit: '80',
        offset: '0',
        order: 'id desc',
        context: 'list',
      });

      const res = await fetch(`${API_CONFIG.BACKEND_BASE_URL}/smart-fields/data/res.partner?${queryParams}`, {
        method: "GET",
        headers: getOdooHeaders(),
      })

      console.log('API response status:', res.status)

      if (!res.ok) {
        const errorText = await res.text()
        console.error(`Failed to fetch customers: ${res.status} ${res.statusText}`, errorText)

        // Handle session expired error
        if (res.status === 500 && errorText.includes("Session expired")) {
          setError(t('contacts.messages.session_expired'))
          // Clear session data
          localStorage.removeItem('sessionId')
          localStorage.removeItem('uid')
          localStorage.removeItem('partnerId')
          localStorage.removeItem('name')
          // Redirect to login page after a short delay
          setTimeout(() => {
            window.location.href = '/signin'
          }, 2000)
          return
        }

        setError(`${t('contacts.messages.error_loading')}: ${res.status} ${res.statusText}`)
        return
      }

      const data = await res.json()
      console.log('API response data:', data)

      if (data.success && Array.isArray(data.records)) {
        console.log(`Found ${data.records.length} customers`)

        if (data.records.length === 0) {
          console.log('No customers found, using mock data for demonstration')
          // Use mock data for demonstration when no real data exists
          const mockCustomers: Customer[] = [
            {
              // Core res.partner fields - minimal required for Customer interface
              id: 1,
              name: "Robert Thompson",
              display_name: "Robert Thompson",
              email: "robert@amazon.com",
              phone: "+1 734 844 2393",
              mobile: "",
              street: "",
              street2: "",
              city: "Seattle",
              state_id: false as const,
              country_id: [233, "United States"] as [number, string],
              zip: "98101",
              website: "https://amazon.com",
              function: "COO",
              is_company: false,
              company_type: "person",
              customer_rank: 1,
              supplier_rank: 0,
              employee: false,
              category_id: false as const,
              title: false as const,
              parent_id: false as const,
              user_id: [1, "Sales Rep"] as [number, string],
              vat: "",
              comment: "",
              barcode: "",
              color: 0,
              is_blacklisted: false,
              date: "2024-01-15",
              create_date: "2024-01-15",
              write_date: "2024-01-20",
              message_bounce: 0,
              commercial_company_name: "Amazon",
              commercial_partner_id: [1, "Robert Thompson"] as [number, string],
              company_name: "Amazon",
              lang: "en_US",
              tz: "UTC",
              partner_share: false,
              trust: "normal",
              contract_ids: [],
              sale_order_count: 0,
              sale_order_ids: [],
              purchase_order_count: 0,
              purchase_order_ids: [],
              invoice_count: 0,
              invoice_ids: [],
              invoice_warn: "no-message",
              invoice_warn_msg: "",
              property_account_position_id: false as const,
              property_payment_term_id: false as const,
              property_supplier_payment_term_id: false as const,
              property_account_payable_id: false as const,
              property_account_receivable_id: false as const,
              property_delivery_carrier_id: false as const,
              property_supplier_currency_id: false as const,
              property_purchase_currency_id: false as const,
              property_stock_customer: false as const,
              property_stock_supplier: false as const,
              last_time_entries_checked: "",
              debit_limit: 0,
              total_invoiced: 0,
              total_debit: 0,
              total_credit: 0,
              total_due: 0,
              credit_limit: 0,
              contact_address: false as const,
              team_id: false as const,
              opportunity_ids: [],
              meeting_count: 0,
              meeting_ids: [],
              activities_count: 0,
              activity_ids_db: [],
              activity_state: "planned",
              activity_user_id: false as const,
              activity_type_id: false as const,
              activity_date_deadline: false as const,
              activity_summary: "",
              message_ids: [],
              message_is_follower: false,
              message_follower_ids: [],
              message_partner_ids: [],
              message_has_error: false,
              message_has_error_counter: 0,
              message_has_sms_error: false,
              message_main_attachment_id: false as const,
              website_message_ids: [],
              message_needaction: false,
              message_needaction_counter: 0,
              message_attachment_count: 0,
              rating_ids: [],
              rating_count: 0,
              rating_last_value: 0,
              rating_last_feedback: "",
              rating_last_image: "",
              rating_last_partner_id: false as const,
              rating_last_create_date: "",
              rating_last_write_date: "",
              rating_last_consumed: false,
              rating_last_gratification: "",
              rating_last_gratification_level: "",
              rating_last_gratification_date: "",
              rating_last_gratification_create_date: "",
              rating_last_gratification_write_date: "",
              rating_last_gratification_consumed: false,
              // UI compatibility fields
              partner_id: false as const,
              partner_name: "Amazon",
              contact_name: "Robert Thompson",
              company_id: false as const,
              stage_id: false as const,
              expected_revenue: 155000,
              probability: 75,
              priority: "2",
              type: "customer",
              active: true,
              activity_ids: [],
              order_ids: [],
              subitems: [],
            },
            {
              // Core res.partner fields - minimal required for Customer interface
              id: 2,
              name: "Steven Smith",
              display_name: "Steven Smith",
              email: "steven@google.com",
              phone: "+1 415 373 9914",
              mobile: "",
              street: "",
              street2: "",
              city: "Mountain View",
              state_id: false as const,
              country_id: [233, "United States"] as [number, string],
              zip: "94043",
              website: "https://google.com",
              function: "CTO",
              is_company: false,
              company_type: "person",
              customer_rank: 1,
              supplier_rank: 0,
              employee: false,
              category_id: false as const,
              title: false as const,
              parent_id: false as const,
              user_id: [1, "Sales Rep"] as [number, string],
              vat: "",
              comment: "",
              barcode: "",
              color: 0,
              is_blacklisted: false,
              date: "2024-01-10",
              create_date: "2024-01-10",
              write_date: "2024-01-18",
              message_bounce: 0,
              commercial_company_name: "Google",
              commercial_partner_id: [2, "Steven Smith"] as [number, string],
              company_name: "Google",
              lang: "en_US",
              tz: "UTC",
              partner_share: false,
              trust: "normal",
              contract_ids: [],
              sale_order_count: 0,
              sale_order_ids: [],
              purchase_order_count: 0,
              purchase_order_ids: [],
              invoice_count: 0,
              invoice_ids: [],
              invoice_warn: "no-message",
              invoice_warn_msg: "",
              property_account_position_id: false as const,
              property_payment_term_id: false as const,
              property_supplier_payment_term_id: false as const,
              property_account_payable_id: false as const,
              property_account_receivable_id: false as const,
              property_delivery_carrier_id: false as const,
              property_supplier_currency_id: false as const,
              property_purchase_currency_id: false as const,
              property_stock_customer: false as const,
              property_stock_supplier: false as const,
              last_time_entries_checked: "",
              debit_limit: 0,
              total_invoiced: 0,
              total_debit: 0,
              total_credit: 0,
              total_due: 0,
              credit_limit: 0,
              contact_address: false as const,
              team_id: false as const,
              opportunity_ids: [],
              meeting_count: 0,
              meeting_ids: [],
              activities_count: 0,
              activity_ids_db: [],
              activity_state: "planned",
              activity_user_id: false as const,
              activity_type_id: false as const,
              activity_date_deadline: false as const,
              activity_summary: "",
              message_ids: [],
              message_is_follower: false,
              message_follower_ids: [],
              message_partner_ids: [],
              message_has_error: false,
              message_has_error_counter: 0,
              message_has_sms_error: false,
              message_main_attachment_id: false as const,
              website_message_ids: [],
              message_needaction: false,
              message_needaction_counter: 0,
              message_attachment_count: 0,
              rating_ids: [],
              rating_count: 0,
              rating_last_value: 0,
              rating_last_feedback: "",
              rating_last_image: "",
              rating_last_partner_id: false as const,
              rating_last_create_date: "",
              rating_last_write_date: "",
              rating_last_consumed: false,
              rating_last_gratification: "",
              rating_last_gratification_level: "",
              rating_last_gratification_date: "",
              rating_last_gratification_create_date: "",
              rating_last_gratification_write_date: "",
              rating_last_gratification_consumed: false,
              // UI compatibility fields
              partner_id: false as const,
              partner_name: "Google",
              contact_name: "Steven Smith",
              company_id: false as const,
              stage_id: false as const,
              expected_revenue: 70000,
              probability: 60,
              priority: "2",
              type: "customer",
              active: true,
              activity_ids: [],
              order_ids: [],
              subitems: [],
            }
          ]
          setCustomers(mockCustomers)
        } else {
          // Transform the data to include UI compatibility fields
          const transformedCustomers = data.records.map((partner: any) => ({
            ...partner,
            // UI compatibility fields
            partner_id: partner.parent_id || (false as const),
            partner_name: partner.commercial_company_name || partner.company_name || "",
            contact_name: partner.name !== partner.display_name ? partner.name : "",
            company_id: partner.parent_id || (false as const),
            stage_id: false as const,
            expected_revenue: 0,
            probability: 0,
            priority: "0",
            type: "customer",
            active: partner.active !== false,
            // Fetch activities for this customer
            activity_ids: [], // Will be populated separately
            order_ids: [], // Will be populated separately
            subitems: [], // Will be populated separately
          }))

          setCustomers(transformedCustomers)
        }
      } else {
        console.error('API Error:', data)
        setError(data.error || "Failed to load customers")
      }
    } catch (err: any) {
      console.error('Network error:', err)
      setError(`Network error occurred while loading customers: ${err.message || err}`)
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, getOdooHeaders]);

  useEffect(() => {
    loadCustomersData()
  }, [loadCustomersData])

  const handleColumnResize = useCallback((columnId: string, newWidth: number) => {
    setColumns((prev) => prev.map((col) => (col.id === columnId ? { ...col, width: newWidth } : col)))
  }, [])

  const handleColumnReorder = useCallback((fromIndex: number, toIndex: number) => {
    setColumns((prev) => {
      const newColumns = [...prev]
      const [moved] = newColumns.splice(fromIndex, 1)
      newColumns.splice(toIndex, 0, moved)
      return newColumns
    })
  }, [])

  const handleSort = useCallback(
    (columnId: string) => {
      if (sortColumn === columnId) {
        if (sortDirection === "asc") {
          setSortDirection("desc")
        } else if (sortDirection === "desc") {
          setSortColumn(null)
          setSortDirection(null)
        } else {
          setSortDirection("asc")
        }
      } else {
        setSortColumn(columnId)
        setSortDirection("asc")
      }
    },
    [sortColumn, sortDirection],
  )

  const handleFieldChange = useCallback((customerId: number, field: string, value: any) => {
    setPendingChanges((prev) => ({
      ...prev,
      [customerId]: {
        ...prev[customerId],
        [field]: value,
      },
    }))
  }, [])

  const handleLeadUpdate = useCallback(async (customerId: number, field: string, value: string) => {
    setCustomers((prev) => prev.map((customer) => (customer.id === customerId ? { ...customer, [field]: value } : customer)))
  }, [])

  const handleSaveChanges = useCallback(
    async (customerId: number) => {
      const changes = pendingChanges[customerId]
      if (!changes || Object.keys(changes).length === 0) return

      setCustomers((prev) => prev.map((customer) => (customer.id === customerId ? { ...customer, ...changes } : customer)))

      setPendingChanges((prev) => {
        const newChanges = { ...prev }
        delete newChanges[customerId]
        return newChanges
      })
    },
    [pendingChanges],
  )

  const handleAddSubitem = useCallback((customerId: number) => {
    setCustomers((prev) =>
      prev.map((customer) => {
        if (customer.id === customerId) {
          const newSubitem: Subitem = {
            id: Date.now(),
            name: "New subitem",
            owner: "",
            status: "Pending",
            date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          }
          return {
            ...customer,
            subitems: [...(customer.subitems || []), newSubitem],
          }
        }
        return customer
      }),
    )
  }, [])

  const handleUpdateSubitem = useCallback((customerId: number, subitemId: number, field: string, value: string) => {
    setCustomers((prev) =>
      prev.map((customer) => {
        if (customer.id === customerId) {
          return {
            ...customer,
            subitems: customer.subitems?.map((subitem) =>
              subitem.id === subitemId ? { ...subitem, [field]: value } : subitem,
            ),
          }
        }
        return customer
      }),
    )
  }, [])

  const sortedLeads = useMemo(() => {
    if (!sortColumn || !sortDirection) return customers

    return [...customers].sort((a, b) => {
      let aVal: any
      let bVal: any

      switch (sortColumn) {
        case "contact":
          aVal = a.contact_name || (a.partner_id && Array.isArray(a.partner_id) ? a.partner_id[1] : a.name)
          bVal = b.contact_name || (b.partner_id && Array.isArray(b.partner_id) ? b.partner_id[1] : b.name)
          break
        case "email":
          aVal = a.email || ""
          bVal = b.email || ""
          break
        case "deals_value":
          aVal = a.expected_revenue || 0
          bVal = b.expected_revenue || 0
          break
        case "priority":
          aVal = Number.parseInt(a.priority || "0")
          bVal = Number.parseInt(b.priority || "0")
          break
        default:
          aVal = a[sortColumn as keyof Customer] || ""
          bVal = b[sortColumn as keyof Customer] || ""
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }

      return sortDirection === "asc" ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1
    })
  }, [customers, sortColumn, sortDirection])

  const groupedCustomers: GroupedCustomers = useMemo(() => {
    const filtered = sortedLeads.filter(
      (customer) =>
        !searchQuery ||
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase())),
    )

    return {
      "Active Contacts": filtered.filter((customer) => customer.active !== false),
      "Inactive Contacts": filtered.filter((customer) => customer.active === false),
    }
  }, [sortedLeads, searchQuery])

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }))
  }

  return (
    <>
      <style>{scopedStyles}</style>
      <div
        className={`crm-container min-h-screen ${isDark ? "theme-dark" : "theme-light"}`}
        style={{ backgroundColor: isDark ? "#0D1117" : "#FFFFFF" }}
      >
        <CRMHeader
          title={t('contacts.title')}
          totalCount={sortedLeads.length}
          createButtonLabel={t('contacts.add_new', 'Add Contact')}
          viewMode="list"
          setViewMode={() => { }}
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
          onAddNew={() => { }} // TODO: Add New Modal
          onRefresh={loadCustomersData}
        />

        {/* Main Content */}
        <main className="p-6" style={{ backgroundColor: isDark ? "#0D1117" : "#FFFFFF" }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full animate-spin"
                  style={{
                    border: `3px solid ${isDark ? "#21262D" : "#E4E7EB"}`,
                    borderTopColor: isDark ? "#58A6FF" : "#0066FF",
                  }}
                />
                <p style={{ color: isDark ? "#8B949E" : "#5E6C84" }} className="text-sm font-medium">
                  {t('common.loading')}
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div
                className="px-6 py-4 rounded-2xl mb-4"
                style={{
                  backgroundColor: isDark ? "rgba(255, 109, 59, 0.1)" : "rgba(255, 109, 59, 0.08)",
                  color: PRIORITY_COLORS.HIGH,
                }}
              >
                <p className="font-semibold">{t('contacts.messages.error_loading')}</p>
                <p className="text-sm mt-1 opacity-80">{error}</p>
              </div>
              <button
                className="px-5 py-2.5 text-white rounded-xl text-sm font-semibold transition-all duration-200 premium-btn"
                style={{
                  backgroundColor: isDark ? "#58A6FF" : "#0066FF",
                  boxShadow: `0 4px 14px ${isDark ? "rgba(88, 166, 255, 0.35)" : "rgba(0, 102, 255, 0.35)"}`,
                }}
              >
                {t('common.cancel')}
              </button>
            </div>
          ) : (
            <>
              {/* Active Contacts Group */}
              <GroupSection
                title={t('contacts.groups.active')}
                customers={groupedCustomers[t('contacts.groups.active')] || []}
                color={PRIORITY_COLORS.LOW}
                isExpanded={expandedGroups[t('contacts.groups.active')]}
                onToggle={() => toggleGroup(t('contacts.groups.active'))}
                columns={columns}
                onColumnResize={handleColumnResize}
                onColumnReorder={handleColumnReorder}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                onUpdate={handleLeadUpdate}
                pendingChanges={pendingChanges}
                onFieldChange={handleFieldChange}
                onSaveChanges={handleSaveChanges}
                isDark={isDark}
                onAddSubitem={handleAddSubitem}
                onUpdateSubitem={handleUpdateSubitem}
              />

              {/* Inactive Contacts Group */}
              <GroupSection
                title={t('contacts.groups.inactive')}
                customers={groupedCustomers[t('contacts.groups.inactive')] || []}
                color={PRIORITY_COLORS.HIGH}
                isExpanded={expandedGroups[t('contacts.groups.inactive')]}
                onToggle={() => toggleGroup(t('contacts.groups.inactive'))}
                columns={columns}
                onColumnResize={handleColumnResize}
                onColumnReorder={handleColumnReorder}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                onUpdate={handleLeadUpdate}
                pendingChanges={pendingChanges}
                onFieldChange={handleFieldChange}
                onSaveChanges={handleSaveChanges}
                isDark={isDark}
                onAddSubitem={handleAddSubitem}
                onUpdateSubitem={handleUpdateSubitem}
              />

              {/* Add New Group Button */}
              <AnimatedElement animation="fade-in" delay={300}>
                <button
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 mt-4"
                  style={{ color: isDark ? "#6E7681" : "#97A0AF" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? "#161B22" : "#F4F5F7"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent"
                  }}
                >
                  <Plus className="w-4 h-4" />
                  {t('contacts.actions.add_contact')}
                </button>
              </AnimatedElement>
            </>
          )}
        </main>

        {/* Help Button */}
        <button
          className="fixed bottom-6 right-6 px-5 py-3 text-white rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 premium-btn"
          style={{
            backgroundColor: isDark ? "#58A6FF" : "#0066FF",
            boxShadow: `0 8px 24px ${isDark ? "rgba(88, 166, 255, 0.4)" : "rgba(0, 102, 255, 0.4)"}`,
          }}
        >
          <HelpCircle className="w-4 h-4" />
          Help
        </button>
      </div>
    </>
  )
}

export default function Contacts() {
  return (
    <Suspense fallback={null}>
      <ContactsContent />
    </Suspense>
  )
}
