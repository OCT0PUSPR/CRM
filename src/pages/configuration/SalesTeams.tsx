"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, UserCircle, Trash2, CheckCircle2, Hash } from "lucide-react"
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

interface SalesTeam {
  id: number
  name: string
  user_id: [number, string] | null
  member_ids: [number, string][]
  active: boolean
  company_id: [number, string] | null
  sequence: number
  color: number
  create_date: string
  write_date: string
}

interface SalesTeamFormData {
  name: string
  user_id: number | null
  active: boolean
  company_id: number | null
  sequence: number
  color: number
}

// ============================================
// SCOPED STYLES
// ============================================

const scopedStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

  .sales-teams-page {
    font-family: 'Space Grotesk', sans-serif !important;
  }
`

// ============================================
// MAIN COMPONENT
// ============================================

export default function SalesTeamsPage() {
  const { t, i18n } = useTranslation()
  const { name } = useAuth()
  const { mode } = useTheme()
  const isDark = mode === "dark"
  const isRTL = i18n.dir() === "rtl"

  const [teams, setTeams] = useState<SalesTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<{ [key: string]: any }>({})
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban")
  const [sortColumn, setSortColumn] = useState<string>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<SalesTeam | null>(null)
  const [formData, setFormData] = useState<SalesTeamFormData>({
    name: "",
    user_id: null,
    active: true,
    company_id: null,
    sequence: 10,
    color: 0,
  })

  // Load teams data from API
  const loadTeamsData = async () => {
    try {
      setLoading(true)
      const response = await apiService.searchRead<SalesTeam>("crm.team", {
        domain: [],
        fields: [
          "id",
          "name",
          "user_id",
          "member_ids",
          "active",
          "company_id",
          "sequence",
          "color",
          "create_date",
          "write_date",
        ],
        offset: 0,
        limit: 100,
        order: "sequence asc",
      })
      const rawRecords =
        response && Array.isArray((response as any).records)
          ? (response as any).records
          : response && Array.isArray((response as any).data)
            ? (response as any).data
            : []

      const normalized: SalesTeam[] = rawRecords.map((r: SalesTeam) => ({
        ...r,
        member_ids: Array.isArray((r as any).member_ids) ? (r as any).member_ids : [],
      }))

      setTeams(normalized)
    } catch (error) {
      console.error("Error loading teams:", error)
      setTeams([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTeamsData()
  }, [])

  // Filter and sort teams
  const filteredAndSortedTeams = useMemo(() => {
    const filtered = teams.filter((team) => team.name.toLowerCase().includes(searchQuery.toLowerCase()))

    return filtered.sort((a, b) => {
      const aValue = a[sortColumn as keyof SalesTeam]
      const bValue = b[sortColumn as keyof SalesTeam]

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
  }, [teams, searchQuery, sortColumn, sortDirection])

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const handleCreateTeam = () => {
    setFormData({
      name: "",
      user_id: null,
      active: true,
      company_id: null,
      sequence: teams.length + 1,
      color: 0,
    })
    setShowCreateDialog(true)
  }

  const handleEditTeam = (team: SalesTeam) => {
    setSelectedTeam(team)
    setFormData({
      name: team.name,
      user_id: team.user_id?.[0] || null,
      active: team.active,
      company_id: team.company_id?.[0] || null,
      sequence: team.sequence,
      color: team.color,
    })
    setShowEditDialog(true)
  }

  const handleSaveTeam = async () => {
    try {
      const teamData = {
        name: formData.name,
        active: formData.active,
        sequence: formData.sequence,
        color: formData.color,
      }

      if (showEditDialog && selectedTeam) {
        // Update existing team via API
        await apiService.update("crm.team", selectedTeam.id, teamData)
      } else {
        // Create new team via API
        await apiService.create("crm.team", teamData)
      }

      // Reload data from API
      await loadTeamsData()

      setShowCreateDialog(false)
      setShowEditDialog(false)
      setSelectedTeam(null)
    } catch (error) {
      console.error("Error saving team:", error)
    }
  }

  const handleDeleteTeam = async (teamId: number) => {
    if (window.confirm(t("salesTeams.delete_team", "Are you sure you want to delete this team?"))) {
      try {
        await apiService.delete("crm.team", teamId)
        await loadTeamsData()
      } catch (error) {
        console.error("Error deleting team:", error)
      }
    }
  }

  const getTeamColor = (colorIndex: number) => {
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
    return colors[colorIndex % colors.length]
  }

  // ============================================
  // COLUMNS
  // ============================================

  const tableColumns: Column<SalesTeam>[] = [
    {
      id: "name",
      header: t("salesTeams.team_name"),
      icon: Users,
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm ${getTeamColor(row.color)}`}
          >
            {row.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-bold text-premium-800 dark:text-premium-50">{row.name}</span>
        </div>
      ),
      width: "250px",
    },
    {
      id: "leader",
      header: t("salesTeams.team_leader"),
      icon: UserCircle,
      accessor: (row) => (
        <div className="flex items-center gap-2">
          {row.user_id ? (
            <>
              <div className="w-6 h-6 rounded-full bg-premium-100 dark:bg-premium-800 flex items-center justify-center text-[10px] font-bold text-premium-600">
                {row.user_id[1].charAt(0)}
              </div>
              <span>{row.user_id[1]}</span>
            </>
          ) : (
            <span className="text-premium-400 text-xs italic">Unassigned</span>
          )}
        </div>
      ),
      width: "200px",
    },
    {
      id: "members",
      header: t("salesTeams.members"),
      icon: Users,
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {row.member_ids.slice(0, 3).map((member) => (
              <div
                key={member[0]}
                className="w-6 h-6 rounded-full bg-premium-50 dark:bg-premium-800 border-2 border-white dark:border-[#0f172a] flex items-center justify-center text-[10px] font-bold text-premium-500"
                title={member[1]}
              >
                {member[1].charAt(0).toUpperCase()}
              </div>
            ))}
            {row.member_ids.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-premium-100 dark:bg-premium-800 border-2 border-white dark:border-[#0f172a] flex items-center justify-center text-[10px] font-bold text-premium-600">
                +{row.member_ids.length - 3}
              </div>
            )}
          </div>
          <span className="text-xs font-bold text-premium-500">({row.member_ids.length})</span>
        </div>
      ),
      width: "180px",
    },
    {
      id: "sequence",
      header: t("salesTeams.sequence"),
      icon: Hash,
      accessor: (row) => <span className="font-mono text-xs">{row.sequence}</span>,
      width: "100px",
      align: "center",
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

  const colorOptions = [
    { value: 0, label: "Gray", bg: "bg-gray-500" },
    { value: 1, label: "Blue", bg: "bg-blue-500" },
    { value: 2, label: "Green", bg: "bg-green-500" },
    { value: 3, label: "Yellow", bg: "bg-yellow-500" },
    { value: 4, label: "Red", bg: "bg-red-500" },
    { value: 5, label: "Purple", bg: "bg-purple-500" },
    { value: 6, label: "Pink", bg: "bg-pink-500" },
    { value: 7, label: "Indigo", bg: "bg-indigo-500" },
  ]

  const TeamDialog = ({ isOpen, onClose, mode }: { isOpen: boolean; onClose: () => void; mode: "create" | "edit" }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white dark:bg-gray-900 border-0 rounded-2xl">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            {mode === "create"
              ? t("salesTeams.create_new", "Create Sales Team")
              : t("salesTeams.edit_team", "Edit Sales Team")}
          </DialogTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {mode === "create" ? "Add a new sales team to your organization" : "Update the sales team details"}
          </p>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("salesTeams.team_name", "Team Name")} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter team name"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sequence" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("salesTeams.sequence", "Sequence")}
              </Label>
              <Input
                id="sequence"
                type="number"
                value={formData.sequence}
                onChange={(e) => setFormData((prev) => ({ ...prev, sequence: Number.parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("salesTeams.color", "Color")}
              </Label>
              <div className="flex items-center gap-2 flex-wrap">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, color: color.value }))}
                    className={`w-8 h-8 rounded-lg ${color.bg} transition-all ${formData.color === color.value ? "ring-2 ring-offset-2 ring-gray-900 dark:ring-white scale-110" : "hover:scale-105"}`}
                    title={color.label}
                  />
                ))}
              </div>
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
                {t("salesTeams.active", "Active")}
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">Enable this team for lead assignments</p>
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
            onClick={handleSaveTeam}
            disabled={!formData.name.trim()}
            className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {mode === "create" ? t("common.create", "Create Team") : t("common.save", "Save Changes")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )

  return (
    <>
      <style>{scopedStyles}</style>
      <div className={`sales-teams-page min-h-screen ${isDark ? "theme-dark" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
        <CRMHeader
          title={t("salesTeams.title")}
          totalCount={teams.length}
          createButtonLabel={t("salesTeams.add_new", "Add Sales Team")}
          viewMode={viewMode}
          setViewMode={setViewMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filters={filters}
          setFilters={setFilters}
          sortBy={sortColumn || "name-asc"}
          setSortBy={(s) => {
            const [col, dir] = s.split("-")
            setSortColumn(col)
            setSortDirection(dir as "asc" | "desc")
          }}
          onAddNew={handleCreateTeam}
          onRefresh={loadTeamsData}
        />

        <div className="max-w-[1600px] mx-auto px-8 py-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-12 h-12 border-4 border-premium-200 border-t-brand-emerald rounded-full animate-spin"></div>
              <p className="text-premium-500 font-medium">Loading teams...</p>
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
                  {filteredAndSortedTeams.map((team, index) => (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`group relative p-6 rounded-[24px] border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer ${
                        isDark
                          ? "bg-[#1e293b] border-premium-800 hover:border-brand-emerald/50"
                          : "bg-white border-premium-100 hover:border-brand-emerald/30"
                      }`}
                      onClick={() => handleEditTeam(team)}
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-[16px] flex items-center justify-center shadow-lg ${getTeamColor(team.color)} text-white font-bold text-xl`}
                          >
                            {team.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-premium-800 dark:text-premium-50 group-hover:text-brand-emerald transition-colors">
                              {team.name}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1">
                              <UserCircle className="w-3.5 h-3.5 text-premium-400" />
                              <span className="text-xs font-medium text-premium-500">
                                {team.user_id?.[1] || "No Leader"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteTeam(team.id)
                            }}
                            className="p-2 text-premium-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-premium-50 dark:bg-premium-900/50">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-premium-400" />
                            <span className="text-xs font-bold text-premium-600 dark:text-premium-300 uppercase tracking-wide">
                              Members
                            </span>
                          </div>
                          <span className="text-sm font-black text-premium-800 dark:text-premium-100">
                            {team.member_ids?.length ?? 0}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                              team.active
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : "bg-premium-50 text-premium-400 border-premium-100"
                            }`}
                          >
                            {team.active ? "Active" : "Inactive"}
                          </span>
                          <span className="text-xs font-mono text-premium-400">#{team.sequence}</span>
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
                    data={filteredAndSortedTeams}
                    columns={tableColumns}
                    rowIdKey="id"
                    onEdit={handleEditTeam}
                    onDelete={handleDeleteTeam}
                    searchable={false}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        <TeamDialog isOpen={showCreateDialog} onClose={() => setShowCreateDialog(false)} mode="create" />
        <TeamDialog isOpen={showEditDialog} onClose={() => setShowEditDialog(false)} mode="edit" />
      </div>
    </>
  )
}
