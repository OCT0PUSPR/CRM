"use client"

import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ChevronDown, Moon, Sun, Bell, Globe, Settings, LogOut, User } from "lucide-react"
import { useTheme } from "../../context/theme"
import { useAuth } from "../../context/auth"
import { io, Socket } from "socket.io-client"
import NotificationDropdown from "./NotificationDropdown"
import { motion, AnimatePresence } from "framer-motion"

interface HeaderNavbarProps {
  sidebarLeft?: number
  isRTL?: boolean
}

export default function HeaderNavbar({ sidebarLeft = 0, isRTL = false }: HeaderNavbarProps) {
  const { t, i18n } = useTranslation()
  const { mode, setMode } = useTheme()
  const isDark = mode === "dark"
  const { name, signOut, partnerId } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const userRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<Socket | null>(null)
  const navigate = useNavigate()
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  const toggleTheme = () => setMode(isDark ? "light" : "dark")

  const handleSignOut = () => {
    signOut()
    navigate("/signin", { replace: true })
  }

  const firstLetter = (name || "?").toString().charAt(0).toUpperCase()
  const getInitials = () => {
    if (!name) return 'U'
    const names = name.split(' ')
    return names.length >= 2
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase()
  }

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!partnerId) return
    try {
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
      const tenantId = localStorage.getItem('current_tenant_id')
      if (tenantId) {
        headers['X-Tenant-ID'] = tenantId
      }
      const response = await fetch(`${API_BASE_URL}/workflow/notifications/${partnerId}`, {
        headers
      })
      const data = await response.json()
      if (data.success) {
        const notificationsList = data.data || []
        setNotifications(notificationsList)
        const unread = notificationsList.filter((n: any) => !n.read_at).length
        setUnreadCount(unread)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  // Initialize socket.io connection for real-time notifications
  useEffect(() => {
    if (!partnerId) return

    const socket = io(API_BASE_URL || 'http://localhost:3007', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
      auth: {
        userId: partnerId,
        token: localStorage.getItem('token')
      }
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('[HeaderNavbar] Socket connected')
      socket.emit('join-user-room', { userId: partnerId })
    })

    socket.on('new-notification', (notification: any) => {
      setNotifications((prev) => [notification, ...prev])
      setUnreadCount((prev) => prev + 1)
    })

    socket.on('notification-updated', (updatedNotification: any) => {
      setNotifications((prev) => {
        const updated = prev.map((n) => (n.id === updatedNotification.id ? updatedNotification : n))
        const unread = updated.filter((n: any) => !n.read_at).length
        setUnreadCount(unread)
        return updated
      })
    })

    socket.on('disconnect', () => {
      console.log('[HeaderNavbar] Socket disconnected')
    })

    socket.on('error', (error) => {
      console.error('[HeaderNavbar] Socket error:', error)
    })

    fetchNotifications()

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [partnerId])

  useEffect(() => {
    const unread = notifications.filter((n: any) => !n.read_at).length
    setUnreadCount(unread)
  }, [notifications])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node
      if (showUserMenu && userRef.current && !userRef.current.contains(target)) setShowUserMenu(false)
      if (showNotificationDropdown && notificationRef.current && !notificationRef.current.contains(target)) {
        setShowNotificationDropdown(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowUserMenu(false)
        setShowNotificationDropdown(false)
      }
    }
    document.addEventListener("mousedown", onDocClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDocClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [showUserMenu, showNotificationDropdown])

  return (
    <header
      className={`fixed top-0 z-50 h-16 flex items-center justify-end px-4 gap-2 transition-colors duration-200 ${
        isDark
          ? "bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5"
          : "bg-white/80 backdrop-blur-xl border-b border-slate-100"
      }`}
      style={{
        insetInlineStart: sidebarLeft,
        width: `calc(100vw - ${sidebarLeft}px)`,
      }}
    >
      {/* Language Toggle */}
      <button
        onClick={() => {
          setShowNotificationDropdown(false)
          setShowUserMenu(false)
          i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en')
        }}
        className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
          isDark
            ? "hover:bg-white/5 text-slate-400 hover:text-white"
            : "hover:bg-slate-100 text-slate-500 hover:text-slate-700"
        }`}
        title={i18n.language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
      >
        <Globe className="w-[18px] h-[18px]" />
        <span className={`absolute -bottom-0.5 -right-0.5 text-[9px] font-bold uppercase ${
          isDark ? "text-violet-400" : "text-violet-600"
        }`}>
          {i18n.language === 'en' ? 'AR' : 'EN'}
        </span>
      </button>

      {/* Notification Bell */}
      <div ref={notificationRef} className="relative">
        <button
          onClick={() => {
            setShowUserMenu(false)
            setShowNotificationDropdown(!showNotificationDropdown)
            if (!showNotificationDropdown && notifications.length === 0) {
              fetchNotifications()
            }
          }}
          className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
            showNotificationDropdown
              ? isDark
                ? "bg-white/10 text-white"
                : "bg-slate-100 text-slate-700"
              : isDark
                ? "hover:bg-white/5 text-slate-400 hover:text-white"
                : "hover:bg-slate-100 text-slate-500 hover:text-slate-700"
          }`}
        >
          <Bell className="w-[18px] h-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-[#0a0a0f]" />
          )}
        </button>

        {showNotificationDropdown && (
          <NotificationDropdown
            isOpen={showNotificationDropdown}
            onClose={() => setShowNotificationDropdown(false)}
            userId={Number(partnerId)}
          />
        )}
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
          isDark
            ? "hover:bg-white/5 text-slate-400 hover:text-white"
            : "hover:bg-slate-100 text-slate-500 hover:text-slate-700"
        }`}
        aria-label="Toggle theme"
      >
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div
              key="sun"
              initial={{ scale: 0.5, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.5, rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Sun className="w-[18px] h-[18px] text-amber-400" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ scale: 0.5, rotate: 90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.5, rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Moon className="w-[18px] h-[18px]" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* User Menu */}
      <div ref={userRef} className="relative">
        <button
          onClick={() => {
            setShowNotificationDropdown(false)
            setShowUserMenu((v) => !v)
          }}
          className={`flex items-center gap-2.5 h-10 px-2 pr-3 rounded-xl transition-all duration-200 ${
            showUserMenu
              ? isDark
                ? "bg-white/10"
                : "bg-slate-100"
              : isDark
                ? "hover:bg-white/5"
                : "hover:bg-slate-50"
          }`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold ${
            isDark
              ? "bg-gradient-to-br from-violet-500 to-indigo-600 text-white"
              : "bg-gradient-to-br from-violet-500 to-indigo-600 text-white"
          }`}>
            {getInitials()}
          </div>
          <span className={`text-sm font-medium max-w-[100px] truncate hidden sm:block ${
            isDark ? "text-slate-200" : "text-slate-700"
          }`}>
            {name || t("Guest")}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
            isDark ? "text-slate-500" : "text-slate-400"
          } ${showUserMenu ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {showUserMenu && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className={`absolute top-full right-0 mt-2 w-56 rounded-xl border overflow-hidden z-[110] ${
                isDark
                  ? "bg-[#16161f] border-slate-800 shadow-xl shadow-black/40"
                  : "bg-white border-slate-200 shadow-xl shadow-slate-200/50"
              }`}
            >
              {/* User Info Header */}
              <div className={`px-4 py-3 border-b ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                <p className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                  {name || 'User'}
                </p>
                <p className={`text-xs mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  Workspace Pro
                </p>
              </div>

              <div className="p-1.5">
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    navigate("/settings")
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    isDark
                      ? "hover:bg-white/5 text-slate-300"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <Settings className="w-4 h-4 opacity-60" />
                  {t("Settings")}
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    navigate("/profile")
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    isDark
                      ? "hover:bg-white/5 text-slate-300"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <User className="w-4 h-4 opacity-60" />
                  {t("Profile") || "Profile"}
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
                  {t("Sign Out")}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
