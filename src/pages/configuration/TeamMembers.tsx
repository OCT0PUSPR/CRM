"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, UserCircle, Trash2, TrendingUp, Mail, Phone, CheckCircle2, Target } from "lucide-react"
import { useTranslation } from "react-i18next"
import { apiService } from "../../services/api"
import { useAuth } from "../../../context/auth"
import { useTheme } from "../../../context/theme"
import CRMHeader from "../../components/PagesHeader"
import { PremiumTable, type Column } from "../../components/PremiumTable"
import { Dialog, DialogContent, DialogTitle } from "../../../@/components/ui/dialog"
import { Input } from "../../../@/components/ui/input"
import { Label } from "../../../@/components/ui/label"

// ============================================
// TYPES
// ============================================

interface TeamMember {
  id: number
  display_name: string
  crm_team_id: [number, string] | null
  user_id: [number, string]
  active: boolean
  image_1920: string | false
  image_128: string | false
  name: string
  email: string | false
  phone: string | false
  company_id: [number, string] | null
  assignment_max: number
  lead_day_count: number
  lead_month_count: number
  create_date: string
  write_date: string
}

interface TeamMemberFormData {
  display_name: string
  crm_team_id: number | null
  user_id: number
  active: boolean
  email: string
  phone: string
  company_id: number | null
  assignment_max: number
}

// ============================================
// SCOPED STYLES
// ============================================

const scopedStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

  .team-members-page {
    font-family: 'Space Grotesk', sans-serif !important;
  }
`

// ============================================
// MAIN COMPONENT
// ============================================

export default function TeamMembersPage() {
  const { t, i18n } = useTranslation()
  const { name } = useAuth()
  const { mode } = useTheme()
  const isDark = mode === "dark"
  const isRTL = i18n.dir() === "rtl"

  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<{ [key: string]: any }>({})
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban")
  const [sortColumn, setSortColumn] = useState<string>("display_name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [formData, setFormData] = useState<TeamMemberFormData>({
    display_name: "",
    crm_team_id: null,
    user_id: 0,
    active: true,
    email: "",
    phone: "",
    company_id: null,
    assignment_max: 10,
  })

  // Load members data from API
  const loadMembersData = async () => {
    try {
      setLoading(true)
      const response = await apiService.searchRead<TeamMember>("crm.team.member", {
        domain: [],
        fields: [
          "id",
          "display_name",
          "crm_team_id",
          "user_id",
          "active",
          "name",
          "email",
          "phone",
          "company_id",
          "assignment_max",
          "lead_day_count",
          "lead_month_count",
          "create_date",
          "write_date",
        ],
        offset: 0,
        limit: 100,
        order: "id asc",
      })
      if (response && response.records && Array.isArray(response.records)) {
        setMembers(response.records)
      } else if (response && response.data && Array.isArray(response.data)) {
        setMembers(response.data)
      } else {
        setMembers([])
      }
    } catch (error) {
      console.error("Error loading members:", error)
      setMembers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMembersData()
  }, [])

  // Filter and sort members
  const filteredAndSortedMembers = useMemo(() => {
    const filtered = members.filter(
      (member) =>
        member.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.email && member.email.toLowerCase().includes(searchQuery.toLowerCase())),
    )

    return filtered.sort((a, b) => {
      const aValue = a[sortColumn as keyof TeamMember]
      const bValue = b[sortColumn as keyof TeamMember]

      if (typeof aValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue)
      }

      if (typeof aValue === "number") {
        return sortDirection === "asc" ? aValue - (bValue as number) : (bValue as number) - aValue
      }

      return 0
    })
  }, [members, searchQuery, sortColumn, sortDirection])

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const handleCreateMember = () => {
    setFormData({
      display_name: "",
      crm_team_id: null,
      user_id: 0,
      active: true,
      email: "",
      phone: "",
      company_id: null,
      assignment_max: 10,
    })
    setShowCreateDialog(true)
  }

  const handleEditMember = (member: TeamMember) => {
    setSelectedMember(member)
    setFormData({
      display_name: member.display_name,
      crm_team_id: member.crm_team_id?.[0] || null,
      user_id: member.user_id[0],
      active: member.active,
      email: member.email || "",
      phone: member.phone || "",
      company_id: member.company_id?.[0] || null,
      assignment_max: member.assignment_max,
    })
    setShowEditDialog(true)
  }

  const handleSaveMember = async () => {
    try {
      const memberData = {
        active: formData.active,
        assignment_max: formData.assignment_max,
        ...(formData.crm_team_id && { crm_team_id: formData.crm_team_id }),
        ...(formData.user_id && { user_id: formData.user_id }),
      }

      if (showEditDialog && selectedMember) {
        // Update existing member via API
        await apiService.update("crm.team.member", selectedMember.id, memberData)
      } else {
        // Create new member via API
        await apiService.create("crm.team.member", memberData)
      }

      // Reload data from API
      await loadMembersData()

      setShowCreateDialog(false)
      setShowEditDialog(false)
      setSelectedMember(null)
    } catch (error) {
      console.error("Error saving member:", error)
    }
  }

  const handleDeleteMember = async (memberId: number) => {
    if (window.confirm(t("teamMembers.delete_member", "Are you sure you want to delete this member?"))) {
      try {
        await apiService.delete("crm.team.member", memberId)
        await loadMembersData()
      } catch (error) {
        console.error("Error deleting member:", error)
      }
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const getRandomColor = (id: number) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-cyan-500",
    ]
    return colors[id % colors.length]
  }

  // ============================================
  // COLUMNS
  // ============================================

  const tableColumns: Column<TeamMember>[] = [
    {
      id: "name",
      header: t("teamMembers.salesperson"),
      icon: UserCircle,
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm ${getRandomColor(row.id)}`}
          >
            {getInitials(row.display_name)}
          </div>
          <div>
            <div className="font-bold text-premium-800 dark:text-premium-50">{row.display_name}</div>
            <div className="text-xs text-premium-400">{row.email}</div>
          </div>
        </div>
      ),
      width: "280px",
    },
    {
      id: "team",
      header: t("teamMembers.team"),
      icon: Users,
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-premium-600 dark:text-premium-300">
            {row.crm_team_id?.[1] || "Unassigned"}
          </span>
        </div>
      ),
      width: "200px",
    },
    {
      id: "leads",
      header: t("teamMembers.leads_30d"),
      icon: TrendingUp,
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-black text-premium-800 dark:text-premium-50">{row.lead_month_count}</span>
          <span className="text-xs text-premium-400">leads</span>
        </div>
      ),
      width: "150px",
    },
    {
      id: "capacity",
      header: t("teamMembers.capacity"),
      icon: Target,
      accessor: (row) => (
        <div className="w-full max-w-[100px]">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-bold">{row.lead_month_count}</span>
            <span className="text-premium-400">/ {row.assignment_max}</span>
          </div>
          <div className="h-1.5 w-full bg-premium-100 dark:bg-premium-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-emerald rounded-full"
              style={{ width: `${Math.min(100, (row.lead_month_count / row.assignment_max) * 100)}%` }}
            />
          </div>
        </div>
      ),
      width: "180px",
    },
    {
      id: "active",
      header: t("common.status"),
      icon: CheckCircle2,
      accessor: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
            row.active
              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
              : "bg-premium-50 text-premium-400 border-premium-100"
          }`}
        >
          {row.active ? t("common.active") : t("common.inactive")}
        </span>
      ),
      width: "120px",
      align: "center",
    },
  ]

  // ============================================
  // DIALOGS
  // ============================================

  const MemberDialog = ({
    isOpen,
    onClose,
    mode,
  }: { isOpen: boolean; onClose: () => void; mode: "create" | "edit" }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white dark:bg-gray-900 border-0 rounded-2xl">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            {mode === "create"
              ? t("teamMembers.create_new", "Add Team Member")
              : t("teamMembers.edit_member", "Edit Team Member")}
          </DialogTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {mode === "create" ? "Add a new salesperson to your team" : "Update team member details"}
          </p>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold text-white ${getRandomColor(selectedMember?.id || 1)}`}
            >
              {formData.display_name ? getInitials(formData.display_name) : "?"}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {formData.display_name || "New Member"}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{formData.email || "No email"}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="display_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("teamMembers.salesperson", "Name")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, display_name: e.target.value }))}
                placeholder="Enter name"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignment_max" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("teamMembers.capacity", "Lead Capacity")}
              </Label>
              <Input
                id="assignment_max"
                type="number"
                value={formData.assignment_max}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, assignment_max: Number.parseInt(e.target.value) || 0 }))
                }
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("common.email", "Email")}
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="email@example.com"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("common.phone", "Phone")}
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+1234567890"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <div className="relative">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData((prev) => ({ ...prev, active: e.target.checked }))}
                className="sr-only peer"
              />
              <label
                htmlFor="active"
                className="flex items-center justify-center w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer peer-checked:bg-green-500 transition-colors"
              >
                <span
                  className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${formData.active ? "translate-x-2.5" : "-translate-x-2.5"}`}
                />
              </label>
            </div>
            <div>
              <Label htmlFor="active" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                {t("teamMembers.active", "Active")}
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">Enable this member for lead assignments</p>
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
            onClick={handleSaveMember}
            className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            {mode === "create" ? t("common.create", "Add Member") : t("common.save", "Save Changes")}
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
      <div className={`team-members-page min-h-screen ${isDark ? "theme-dark" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
        <CRMHeader
          title={t("teamMembers.title")}
          totalCount={members.length}
          createButtonLabel={t("teamMembers.add_new", "Add Team Member")}
          viewMode={viewMode}
          setViewMode={setViewMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filters={filters}
          setFilters={setFilters}
          sortBy={sortColumn || "display_name-asc"}
          setSortBy={(s) => {
            const [col, dir] = s.split("-")
            setSortColumn(col)
            setSortDirection(dir as "asc" | "desc")
          }}
          onAddNew={handleCreateMember}
          onRefresh={loadMembersData}
        />

        <div className="max-w-[1600px] mx-auto px-8 py-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-12 h-12 border-4 border-premium-200 border-t-brand-emerald rounded-full animate-spin"></div>
              <p className="text-premium-500 font-medium">Loading members...</p>
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
                  {filteredAndSortedMembers.map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`group relative p-6 rounded-[24px] border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer ${
                        isDark
                          ? "bg-[#1e293b] border-premium-800 hover:border-brand-emerald/50"
                          : "bg-white border-premium-100 hover:border-brand-emerald/30"
                      }`}
                      onClick={() => handleEditMember(member)}
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-14 h-14 rounded-[18px] flex items-center justify-center shadow-lg ${getRandomColor(member.id)} text-white font-bold text-xl`}
                          >
                            {member.image_1920 ? (
                              <img
                                src={member.image_1920 || "/placeholder.svg"}
                                alt={member.display_name}
                                className="w-full h-full object-cover rounded-[18px]"
                              />
                            ) : (
                              getInitials(member.display_name)
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-premium-800 dark:text-premium-50 group-hover:text-brand-emerald transition-colors">
                              {member.display_name}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1">
                              <Users className="w-3.5 h-3.5 text-premium-400" />
                              <span className="text-xs font-medium text-premium-500">
                                {member.crm_team_id?.[1] || "Unassigned"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteMember(member.id)
                            }}
                            className="p-2 text-premium-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-premium-50 dark:bg-premium-900/50">
                            <div className="text-[10px] font-bold text-premium-400 uppercase tracking-wider mb-1">
                              Leads (30d)
                            </div>
                            <div className="text-lg font-black text-premium-800 dark:text-premium-50">
                              {member.lead_month_count}
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-premium-50 dark:bg-premium-900/50">
                            <div className="text-[10px] font-bold text-premium-400 uppercase tracking-wider mb-1">
                              Capacity
                            </div>
                            <div className="text-lg font-black text-premium-800 dark:text-premium-50">
                              {member.assignment_max}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs font-medium text-premium-500">
                            <Mail className="w-3.5 h-3.5 text-premium-400" />
                            {member.email || "No email"}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-medium text-premium-500">
                            <Phone className="w-3.5 h-3.5 text-premium-400" />
                            {member.phone || "No phone"}
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
                    data={filteredAndSortedMembers}
                    columns={tableColumns}
                    rowIdKey="id"
                    onEdit={handleEditMember}
                    onDelete={handleDeleteMember}
                    searchable={false}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        <MemberDialog isOpen={showCreateDialog} onClose={() => setShowCreateDialog(false)} mode="create" />
        <MemberDialog isOpen={showEditDialog} onClose={() => setShowEditDialog(false)} mode="edit" />
      </div>
    </>
  )
}
