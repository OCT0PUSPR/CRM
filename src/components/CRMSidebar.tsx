"use client"

import {
  Users,
  Settings,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  UserCircle,
  Building2,
  Target,
  Calendar,
  FileText,
  TrendingUp,
  Tag,
  Briefcase,
  LogOut,
  PanelLeftOpen,
  PanelLeftClose,
  Sun,
  Moon,
  Database,
  AlertCircle,
  type LucideIcon,
  Zap
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../context/auth"
import { useSidebar } from "../../context/sidebar"
import { useTheme } from "../../context/theme"
import { useRTL } from "../context/rtl"
import { motion, AnimatePresence } from "framer-motion"

type MenuItem = {
  title: string
  icon: LucideIcon
  url?: string
  items?: SubMenuItem[]
  badge?: string
}

type SubMenuItem = {
  title: string
  icon: LucideIcon
  url?: string
}

const getMenuItems = (t: any): MenuItem[] => [
  {
    title: t('common.dashboard'),
    icon: LayoutDashboard,
    url: "/dashboard",
  },
  {
    title: t('sidebar.prospects'),
    icon: Target,
    items: [
      { title: t('common.leads'), icon: Target, url: "/leads" },
      { title: t('common.contacts'), icon: Users, url: "/contacts" },
      { title: t('common.companies'), icon: Building2, url: "/companies" },
    ],
  },
  {
    title: t('common.deals'),
    icon: Briefcase,
    items: [
      { title: t('common.opportunities'), icon: TrendingUp, url: "/opportunities" },
      { title: t('sidebar.quotations'), icon: FileText, url: "/quotations" },
    ],
  },
  {
    title: t('common.activities'),
    icon: Calendar,
    url: "/activities",
  },
  {
    title: t('common.configuration'),
    icon: Settings,
    items: [
      { title: "Personnel", icon: Users, url: "/configuration/personnel" },
      { title: t('sidebar.sales_teams'), icon: Users, url: "/configuration/sales-teams" },
      { title: t('sidebar.team_members'), icon: UserCircle, url: "/configuration/team-members" },
      { title: t('sidebar.activity_types'), icon: Calendar, url: "/configuration/activity-types" },
      { title: t('sidebar.activity_plans'), icon: FileText, url: "/configuration/activity-plans" },
      { title: t('sidebar.stages'), icon: TrendingUp, url: "/configuration/stages" },
      { title: t('sidebar.tags'), icon: Tag, url: "/configuration/tags" },
      { title: t('sidebar.lost_reasons'), icon: AlertCircle, url: "/configuration/lost-reasons" },
      { title: t('sidebar.fields'), icon: Database, url: "/configuration/fields" },
    ],
  },
]

export function CRMSidebar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { name } = useAuth()
  const location = useLocation()
  const { signOut } = useAuth()
  const { isCollapsed, toggleSidebar } = useSidebar()
  const { isRTL } = useRTL()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [showUserModal, setShowUserModal] = useState(false)
  const { mode, setMode } = useTheme()
  const isDark = mode === "dark"
  const userMenuRef = useRef<HTMLDivElement>(null)

  const menuItems = getMenuItems(t)

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title],
    )
  }

  const isActive = (url: string) => location.pathname === url

  const handleNavigation = (url: string) => navigate(url)

  const handleSignOut = () => {
    signOut()
    setShowUserModal(false)
  }

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node
      if (showUserModal && userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserModal(false)
      }
    }
    if (showUserModal) document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [showUserModal])

  const getInitials = (fullName: string) => {
    if (!fullName) return 'U'
    const names = fullName.split(' ')
    return names.length >= 2
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : fullName.substring(0, 2).toUpperCase()
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 264 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className={`fixed top-0 bottom-0 h-screen flex flex-col z-40
        ${isRTL ? 'right-0' : 'left-0'}
        ${isDark
          ? "bg-[#0d0d12] border-[#1f1f2e]"
          : "bg-white border-slate-100"
        } border-r`}
      style={{
        boxShadow: isDark
          ? '1px 0 0 0 rgba(255,255,255,0.03)'
          : '1px 0 20px -5px rgba(0,0,0,0.05)'
      }}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-between px-4 shrink-0">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 via-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                  <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-[#0d0d12]" />
              </div>
              <div>
                <h1 className={`text-base font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                  Velocity
                </h1>
                <p className={`text-[10px] font-medium uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  CRM
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-lg transition-all duration-200 ${
            isCollapsed ? "mx-auto" : ""
          } ${isDark
            ? "hover:bg-white/5 text-slate-400 hover:text-white"
            : "hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          }`}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 custom-scrollbar">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isItemExpanded = expandedItems.includes(item.title)
            const isGroupActive = item.items?.some(sub => isActive(sub.url || ""))
            const isItemActive = isActive(item.url || "")

            return (
              <div key={item.title}>
                {item.items ? (
                  <>
                    <button
                      onClick={() => !isCollapsed && toggleExpanded(item.title)}
                      className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                        isCollapsed ? "justify-center" : "justify-start"
                      } ${isGroupActive
                        ? isDark
                          ? "bg-violet-500/10 text-violet-400"
                          : "bg-violet-50 text-violet-600"
                        : isDark
                          ? "text-slate-400 hover:bg-white/5 hover:text-white"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <item.icon className={`w-[18px] h-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                        isGroupActive ? "" : "opacity-70 group-hover:opacity-100"
                      }`} />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-[13px] font-medium text-left truncate">
                            {item.title}
                          </span>
                          <motion.div
                            animate={{ rotate: isItemExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-4 h-4 opacity-50" />
                          </motion.div>
                        </>
                      )}
                    </button>

                    <AnimatePresence>
                      {!isCollapsed && isItemExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className={`mt-1 ml-4 pl-3 space-y-0.5 border-l ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                            {item.items.map((subItem) => (
                              <button
                                key={subItem.title}
                                onClick={() => subItem.url && handleNavigation(subItem.url)}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-lg transition-all duration-150 ${
                                  isActive(subItem.url || "")
                                    ? isDark
                                      ? "bg-violet-500/15 text-violet-300 font-medium"
                                      : "bg-violet-50 text-violet-700 font-medium"
                                    : isDark
                                      ? "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  isActive(subItem.url || "")
                                    ? "bg-violet-500"
                                    : isDark ? "bg-slate-700" : "bg-slate-300"
                                }`} />
                                <span className="truncate">{subItem.title}</span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <button
                    onClick={() => item.url && handleNavigation(item.url)}
                    className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                      isCollapsed ? "justify-center" : "justify-start"
                    } ${isItemActive
                      ? isDark
                        ? "bg-gradient-to-r from-violet-500/20 to-violet-500/5 text-white border border-violet-500/20"
                        : "bg-gradient-to-r from-violet-50 to-violet-50/50 text-violet-700 border border-violet-100"
                      : isDark
                        ? "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                    }`}
                  >
                    <item.icon className={`w-[18px] h-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      isItemActive ? "" : "opacity-70 group-hover:opacity-100"
                    }`} />
                    {!isCollapsed && (
                      <span className="text-[13px] font-medium truncate">
                        {item.title}
                      </span>
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </nav>

      {/* Footer / User Section */}
      <div className={`p-3 shrink-0 border-t ${isDark ? "border-slate-800/50" : "border-slate-100"}`}>
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => !isCollapsed && setShowUserModal(!showUserModal)}
            className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-200 group ${
              isCollapsed ? "justify-center" : "justify-start"
            } ${isDark ? "hover:bg-white/5" : "hover:bg-slate-50"}`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold shrink-0 transition-transform duration-200 group-hover:scale-105 ${
              isDark
                ? "bg-gradient-to-br from-slate-700 to-slate-800 text-slate-300 ring-1 ring-white/10"
                : "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 ring-1 ring-black/5"
            }`}>
              {getInitials(name || '')}
            </div>

            {!isCollapsed && (
              <>
                <div className="flex-1 text-left min-w-0">
                  <p className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                    {name || 'User'}
                  </p>
                  <p className={`text-[11px] truncate ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    Workspace Pro
                  </p>
                </div>
                <ChevronUp className={`w-4 h-4 transition-transform duration-200 ${isDark ? "text-slate-500" : "text-slate-400"} ${showUserModal ? "rotate-180" : ""}`} />
              </>
            )}
          </button>

          {/* User Menu Popover */}
          <AnimatePresence>
            {showUserModal && !isCollapsed && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className={`absolute bottom-full left-0 right-0 mb-2 rounded-xl border overflow-hidden z-[110] ${
                  isDark
                    ? "bg-[#16161f] border-slate-800 shadow-xl shadow-black/40"
                    : "bg-white border-slate-200 shadow-xl shadow-slate-200/50"
                }`}
              >
                <div className="p-1.5">
                  <button
                    onClick={() => {
                      setShowUserModal(false)
                      setMode(isDark ? "light" : "dark")
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                      isDark
                        ? "hover:bg-white/5 text-slate-300"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    {isDark ? (
                      <Sun className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Moon className="w-4 h-4 text-slate-400" />
                    )}
                    {isDark ? t('settings.lightMode') || "Light Mode" : t('settings.darkMode') || "Dark Mode"}
                  </button>

                  <div className={`h-px mx-2 my-1 ${isDark ? "bg-slate-800" : "bg-slate-100"}`} />

                  <button
                    onClick={handleSignOut}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                      isDark
                        ? "hover:bg-red-500/10 text-red-400"
                        : "hover:bg-red-50 text-red-600"
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                    {t('common.signOut') || "Sign Out"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  )
}

export default CRMSidebar
