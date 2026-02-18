
"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, Plus, Users, Zap, SlidersHorizontal, LayoutGrid, ArrowRight, 
  ClipboardList, Layout, X, MoreHorizontal, Mail, Phone, MapPin, 
  Calendar, Building2, UserCircle, Briefcase, List, ChevronDown, 
  Check, Filter, Headphones, Rocket, Target, Shield, Settings, 
  Globe, BarChart3, TrendingUp, DollarSign, PlusCircle
} from "lucide-react"
import { apiService } from "../../services/api"
import { useTheme } from "../../../context/theme"
import UserDropdown from "../../components/UserDropdown"
import SelectWithIcon from "../../components/SelectWithIcon"
import AvatarList from "../../components/AvatarList"

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
  x_avatar_style?: string
  x_avatar_image?: string
}

interface SalesTeam {
  id: number
  name: string
  user_id: [number, string] | null
  member_ids: number[] // IDs of members
  crm_team_member_ids: number[]
  active: boolean
  company_id: [number, string] | null
  sequence: number
  color: number
  create_date: string
  write_date: string
  alias_email: string | false
  invoiced_target: number
  lead_all_assigned_month_count: number
  assignment_max: number
}

// ============================================
// PLACEHOLDER AVATAR URLS - 2D Illustrated Style
// ============================================

const avatarPlaceholders = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Toby",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Caleb",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jocelyn",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=George",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Willow",
]

// ============================================
// MAIN COMPONENT
// ============================================

export default function TeamsPage() {
  const themeContext = useTheme ? useTheme() : { mode: 'light' };
  const isDark = themeContext.mode === "dark"

  const [activeTab, setActiveTab] = useState<"members" | "teams">("members")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [selectedItem, setSelectedItem] = useState<TeamMember | SalesTeam | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false)
  
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [teamFilter, setTeamFilter] = useState<string>("all")
  const [companyFilter, setCompanyFilter] = useState<string>("all")
  const [leaderFilter, setLeaderFilter] = useState<string>("all")
  
  const [members, setMembers] = useState<TeamMember[]>([])
  const [teams, setTeams] = useState<SalesTeam[]>([])
  const [users, setUsers] = useState<[number, string][]>([])
  const [companies, setCompanies] = useState<[number, string][]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [unassignedUsers, setUnassignedUsers] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showAddMemberInTeam, setShowAddMemberInTeam] = useState(false)
  const [newTeamMemberId, setNewTeamMemberId] = useState<string>("")

  // Load unassigned users
  const loadUnassignedUsers = async (search: string = "") => {
    setSearchLoading(true)
    try {
      // Get all members to filter them out
      const memberUserIds = members.map(m => m.user_id[0])
      
      const domain: any[] = [['share', '=', false]]
      if (search) {
        domain.push(['name', 'ilike', search])
      }
      
      const response = await apiService.searchRead<any>("res.users", {
        domain,
        fields: ["id", "display_name", "email", "x_avatar_style", "x_avatar_image"],
        limit: 50
      })
      
      const rawUsers = response?.records || response?.data || []
      // Filter out users who are already members
      const filtered = rawUsers.filter((u: any) => !memberUserIds.includes(u.id))
      setUnassignedUsers(filtered)
    } catch (error) {
      console.error("Error loading unassigned users:", error)
    } finally {
      setSearchLoading(false)
    }
  }

  useEffect(() => {
    if (isAddMemberOpen || (selectedItem && !('crm_team_id' in selectedItem) && isEditing)) {
      loadUnassignedUsers()
    }
  }, [isAddMemberOpen, isEditing, selectedItem, members])

  const getUserAvatarUrl = (user: any) => {
    if (user && user.x_avatar_style && user.x_avatar_image) {
      return `https://api.dicebear.com/9.x/${user.x_avatar_style}/svg?seed=${user.x_avatar_image}`
    }
    const seed = user?.display_name || user?.name || 'User'
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
  }
  const [newMemberData, setNewMemberData] = useState({
    user_id: 0,
    crm_team_id: 0,
    assignment_max: 30
  })
  const [newTeamData, setNewTeamData] = useState({
    name: "",
    user_id: 0,
    company_id: 0
  })

  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  }

  // Load members data
  const loadMembersData = async () => {
    try {
      if (!apiService) return;
      const response = await apiService.searchRead<TeamMember>("crm.team.member", {
        domain: [],
        fields: [
          "id", "display_name", "crm_team_id", "user_id", "active", "name",
          "email", "phone", "company_id", "assignment_max", "lead_day_count",
          "lead_month_count", "create_date", "write_date", "image_128",
          "x_avatar_style", "x_avatar_image"
        ],
        offset: 0,
        limit: 100,
        order: "id asc",
      })
      if (response?.records) {
        setMembers(response.records)
      } else if (response?.data) {
        setMembers(response.data)
      } else {
        setMembers([])
      }
    } catch (error) {
      console.error("Error loading members:", error)
      setMembers([])
    }
  }

  // Load teams data
  const loadTeamsData = async () => {
    try {
      if (!apiService) return;
      const response = await apiService.searchRead<SalesTeam>("crm.team", {
        domain: [],
        fields: [
          "id", "name", "user_id", "member_ids", "active", "company_id",
          "sequence", "color", "create_date", "write_date", "alias_email",
          "invoiced_target", "lead_all_assigned_month_count", "assignment_max"
        ],
        offset: 0,
        limit: 100,
        order: "sequence asc",
      })
      const rawRecords = response?.records || response?.data || []
      setTeams(rawRecords)
    } catch (error) {
      console.error("Error loading teams:", error)
      setTeams([])
    }
  }

  // Load users data for dropdowns
  const loadUsersData = async () => {
    try {
      if (!apiService) return;
      const response = await apiService.searchRead<any>("res.users", {
        domain: [['share', '=', false]],
        fields: ["id", "display_name"],
      })
      if (response?.records) {
        setUsers(response.records.map((r: any) => [r.id, r.display_name]))
      }
    } catch (error) {
      console.error("Error loading users:", error)
    }
  }

  // Load companies data for dropdowns
  const loadCompaniesData = async () => {
    try {
      if (!apiService) return;
      const response = await apiService.searchRead<any>("res.company", {
        domain: [],
        fields: ["id", "display_name"],
      })
      if (response?.records) {
        setCompanies(response.records.map((r: any) => [r.id, r.display_name]))
      }
    } catch (error) {
      console.error("Error loading companies:", error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        loadMembersData(), 
        loadTeamsData(),
        loadUsersData(),
        loadCompaniesData()
      ])
      setLoading(false)
    }
    loadData()
  }, [])

  // Create new team member
  const handleAddMember = async () => {
    if (!newMemberData.user_id || !newMemberData.crm_team_id) {
      alert("Please fill in all required fields")
      return
    }
    setIsSaving(true)
    try {
      await apiService.create("crm.team.member", {
        user_id: newMemberData.user_id,
        crm_team_id: newMemberData.crm_team_id,
        assignment_max: newMemberData.assignment_max
      })
      setIsAddMemberOpen(false)
      loadMembersData()
    } catch (error) {
      console.error("Error creating member:", error)
      alert("Failed to create member")
    } finally {
      setIsSaving(false)
    }
  }

  // Add member to specific team
  const handleAddMemberToTeam = async (userId: number, teamId: number) => {
    setIsSaving(true)
    try {
      await apiService.create("crm.team.member", {
        user_id: userId,
        crm_team_id: teamId,
        assignment_max: 30 // Default capacity
      })
      await loadMembersData() // Reload members to update UI
      setShowAddMemberInTeam(false)
      setNewTeamMemberId("")
    } catch (error) {
      console.error("Error adding member to team:", error)
      alert("Failed to add member to team")
    } finally {
      setIsSaving(false)
    }
  }

  // Update team data
  const handleUpdateTeam = async () => {
    if (!selectedItem || 'crm_team_id' in selectedItem) return
    setIsSaving(true)
    try {
      const vals: any = { name: selectedItem.name }
      if (selectedItem.user_id) vals.user_id = selectedItem.user_id[0]
      if (selectedItem.company_id) vals.company_id = selectedItem.company_id[0]
      
      await apiService.update("crm.team", selectedItem.id, vals)
      await loadTeamsData()
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating team:", error)
      alert("Failed to update team")
    } finally {
      setIsSaving(false)
    }
  }

  // Update member data
  const handleUpdateMember = async () => {
    if (!selectedItem || !('crm_team_id' in selectedItem)) return
    setIsSaving(true)
    try {
      const vals: any = { 
        assignment_max: selectedItem.assignment_max,
        active: selectedItem.active
      }
      if (selectedItem.crm_team_id) vals.crm_team_id = selectedItem.crm_team_id[0]
      
      await apiService.update("crm.team.member", selectedItem.id, vals)
      await loadMembersData()
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating member:", error)
      alert("Failed to update member")
    } finally {
      setIsSaving(false)
    }
  }
  // Create new team
  const handleAddTeam = async () => {
    if (!newTeamData.name) {
      alert("Please enter a team name")
      return
    }
    setIsSaving(true)
    try {
      const vals: any = { name: newTeamData.name }
      if (newTeamData.user_id) vals.user_id = newTeamData.user_id
      if (newTeamData.company_id) vals.company_id = newTeamData.company_id
      
      await apiService.create("crm.team", vals)
      setIsAddTeamOpen(false)
      loadTeamsData()
    } catch (error) {
      console.error("Error creating team:", error)
      alert("Failed to create team")
    } finally {
      setIsSaving(false)
    }
  }

  // Filter members
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        member.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.email && (member.email as string).toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && member.active) || 
        (statusFilter === "inactive" && !member.active)

      const matchesTeam = teamFilter === "all" || 
        (member.crm_team_id && member.crm_team_id[1] === teamFilter)

      const matchesCompany = companyFilter === "all" ||
        (member.company_id && member.company_id[1] === companyFilter)
        
      return matchesSearch && matchesStatus && matchesTeam && matchesCompany
    })
  }, [members, searchQuery, statusFilter, teamFilter, companyFilter])

  // Filter teams
  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && team.active) || 
        (statusFilter === "inactive" && !team.active)

      const matchesCompany = companyFilter === "all" ||
        (team.company_id && team.company_id[1] === companyFilter)

      const matchesLeader = leaderFilter === "all" ||
        (team.user_id && team.user_id[1] === leaderFilter)
        
      return matchesSearch && matchesStatus && matchesCompany && matchesLeader
    })
  }, [teams, searchQuery, statusFilter, companyFilter, leaderFilter])

  // Get unique teams for filter
  const uniqueTeams = useMemo(() => {
    const teamNames = new Set<string>()
    members.forEach(m => {
      if (m.crm_team_id) teamNames.add(m.crm_team_id[1])
    })
    return Array.from(teamNames)
  }, [members])

  const uniqueCompanies = useMemo(() => {
    const companies = new Set<string>()
    members.forEach(m => {
      if (m.company_id) companies.add(m.company_id[1])
    })
    teams.forEach(t => {
      if (t.company_id) companies.add(t.company_id[1])
    })
    return Array.from(companies)
  }, [members, teams])

  const uniqueLeaders = useMemo(() => {
    const leaders = new Set<string>()
    teams.forEach(t => {
      if (t.user_id) leaders.add(t.user_id[1])
    })
    return Array.from(leaders)
  }, [teams])

  // Get members for a specific team
  const getTeamMembers = (teamId: number) => {
    return members.filter(m => m.crm_team_id && m.crm_team_id[0] === teamId)
  }

  const getAvatarUrl = (id: number) => {
    return avatarPlaceholders[id % avatarPlaceholders.length]
  }

  const getStatusBadge = (member: TeamMember) => {
    if (!member.active) {
      return { text: "Inactive", type: "inactive" }
    }
    const statuses = [
      { text: "Active", type: "active" },
      { text: "Remote", type: "remote" },
      { text: "Part-time", type: "parttime" },
    ]
    return statuses[member.id % statuses.length]
  }

  const getTeamIcon = (name: string, size: number = 28) => {
    const n = name.toLowerCase()
    if (n.includes("sales")) return <Zap size={size} />
    if (n.includes("support")) return <Headphones size={size} />
    if (n.includes("market")) return <TrendingUp size={size} />
    if (n.includes("tech") || n.includes("it")) return <Rocket size={size} />
    if (n.includes("operat")) return <Settings size={size} />
    if (n.includes("hq") || n.includes("corp")) return <Building2 size={size} />
    if (n.includes("global")) return <Globe size={size} />
    return <Target size={size} />
  }

  const getTeamColor = (id: number) => {
    const colors = [
      "rgb(59, 130, 246)", "rgb(34, 197, 94)", "rgb(234, 179, 8)",
      "rgb(239, 68, 68)", "rgb(168, 85, 247)", "rgb(236, 72, 153)",
      "rgb(99, 102, 241)", "rgb(6, 182, 212)",
    ]
    return colors[id % colors.length]
  }

  const getRoleName = (member: TeamMember) => {
    const roles = [
      "UI Designer", "Chief Operating Officer", "Project Lead",
      "Process Manager", "Vice President", "Executive",
      "Hiring Manager", "UX Engineer",
    ]
    return roles[member.id % roles.length]
  }

  const getDepartmentName = (member: TeamMember) => {
    const depts = ["Product", "Engineering", "Human Resources", "Manning", "Operations", "Maintenance", "HSEQ", "IT"]
    return depts[member.id % depts.length]
  }

  // Updated styles to match screenshot exactly
  const styles = {
    container: {
      fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      height: "calc(100vh - 64px)", // Navbar is assumed 64px
      display: "flex",
      flexDirection: "column" as const,
      backgroundColor: isDark ? "#0c0c0e" : "#ffffff",
      color: isDark ? "#f8fafc" : "#0f172a",
      overflow: "hidden",
    },
    header: {
      padding: "32px 64px 0",
      flexShrink: 0,
    },
    breadcrumb: {
      fontSize: "13px",
      fontWeight: "500",
      color: isDark ? "#64748b" : "#94a3b8",
      marginBottom: "12px",
    },
    titleRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "32px",
    },
    title: {
      fontSize: "44px",
      fontWeight: "700",
      color: isDark ? "#f8fafc" : "#0f172a",
      margin: 0,
    },
    buttonGroup: {
      display: "flex",
      gap: "12px",
    },
    primaryButton: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "12px 24px",
      backgroundColor: isDark ? "#f8fafc" : "#1e1e21",
      color: isDark ? "#0f172a" : "#ffffff",
      border: "none",
      borderRadius: "10px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "opacity 0.2s",
    },
    secondaryButton: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "12px 24px",
      backgroundColor: "transparent",
      color: isDark ? "#f8fafc" : "#1e1e21",
      border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
      borderRadius: "10px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
    },
    tabsContainer: {
      display: "flex",
      gap: "40px",
      borderBottom: `1px solid ${isDark ? "#1e293b" : "#f1f5f9"}`,
      padding: "0 64px",
      flexShrink: 0,
    },
    tab: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "16px 0",
      backgroundColor: "transparent",
      border: "none",
      fontSize: "15px",
      fontWeight: "600",
      cursor: "pointer",
      position: "relative" as const,
      color: isDark ? "#475569" : "#94a3b8",
      transition: "color 0.2s",
    },
    activeTab: {
      color: isDark ? "#f8fafc" : "#0f172a",
    },
    tabIndicator: {
      position: "absolute" as const,
      bottom: "-1px",
      left: 0,
      right: 0,
      height: "2px",
      backgroundColor: isDark ? "#f8fafc" : "#0f172a",
    },
    content: {
      padding: "32px 64px 64px",
      flex: 1,
      overflowY: "auto" as const,
      display: "flex",
      flexDirection: "column" as const,
    },
    sectionHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "28px",
    },
    sectionTitle: {
      fontSize: "22px",
      fontWeight: "700",
      color: isDark ? "#f8fafc" : "#0f172a",
    },
    controls: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
    },
    searchContainer: {
      position: "relative" as const,
      display: "flex",
      alignItems: "center",
    },
    searchIcon: {
      position: "absolute" as const,
      left: "14px",
      color: isDark ? "#64748b" : "#94a3b8",
    },
    searchHint: {
      position: "absolute" as const,
      right: "14px",
      fontSize: "12px",
      fontWeight: "600",
      color: isDark ? "#475569" : "#cbd5e1",
      padding: "2px 6px",
      borderRadius: "4px",
      border: `1px solid ${isDark ? "#334155" : "#f1f5f9"}`,
    },
    searchInput: {
      padding: "11px 50px 11px 44px",
      width: "240px",
      backgroundColor: "transparent",
      border: `1px solid ${isDark ? "#334155" : "#f1f5f9"}`,
      borderRadius: "10px",
      fontSize: "14px",
      fontWeight: "500",
      color: isDark ? "#f8fafc" : "#0f172a",
      outline: "none",
    },
    filterButton: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "11px 20px",
      backgroundColor: "transparent",
      border: `1px solid ${isDark ? "#334155" : "#f1f5f9"}`,
      borderRadius: "10px",
      fontSize: "14px",
      fontWeight: "600",
      color: isDark ? "#94a3b8" : "#64748b",
      cursor: "pointer",
    },
    gridButton: {
      padding: "11px",
      backgroundColor: "transparent",
      border: `1px solid ${isDark ? "#334155" : "#f1f5f9"}`,
      borderRadius: "10px",
      color: isDark ? "#94a3b8" : "#64748b",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    cardsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
      gap: "24px",
    },
    memberCard: {
      backgroundColor: isDark ? "#161618" : "#ffffff",
      border: `1px solid ${isDark ? "#1e1e21" : "#f1f5f9"}`,
      borderRadius: "20px",
      padding: "24px",
      position: "relative" as const,
      transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      cursor: "pointer",
      boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
    },
    filterDropdown: {
      position: "absolute" as const,
      top: "100%",
      right: 0,
      marginTop: "12px",
      width: "320px",
      backgroundColor: isDark ? "#111113" : "#ffffff",
      border: `1px solid ${isDark ? "#1e1e21" : "#f1f5f9"}`,
      borderRadius: "24px",
      padding: "24px",
      boxShadow: isDark ? "0 20px 50px rgba(0,0,0,0.5)" : "0 20px 50px rgba(0,0,0,0.1)",
      zIndex: 100,
    },
    filterSection: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "8px",
    },
    filterLabel: {
      fontSize: "11px",
      fontWeight: "700",
      color: isDark ? "#475569" : "#94a3b8",
      textTransform: "uppercase" as const,
      letterSpacing: "0.05em",
      marginBottom: "4px",
      padding: "0 12px",
    },
    filterOption: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "10px 12px",
      borderRadius: "12px",
      cursor: "pointer",
      transition: "all 0.2s",
      fontSize: "14px",
      fontWeight: "600",
      color: isDark ? "#94a3b8" : "#64748b",
    },
    filterDivider: {
      height: "1px",
      backgroundColor: isDark ? "#1e1e21" : "#f1f5f9",
      margin: "16px 0",
    },
    cardTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "20px",
    },
    avatar: {
      width: "64px",
      height: "64px",
      borderRadius: "18px",
      overflow: "hidden",
      backgroundColor: isDark ? "#1e1e21" : "#f8fafc",
    },
    avatarImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover" as const,
    },
    statusBadge: {
      padding: "6px 12px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: "700",
    },
    statusActive: {
      backgroundColor: "rgba(34, 197, 94, 0.1)",
      color: "#22c55e",
    },
    statusRemote: {
      backgroundColor: "rgba(234, 179, 8, 0.1)",
      color: "#eab308",
    },
    statusParttime: {
      backgroundColor: "rgba(168, 85, 247, 0.1)",
      color: "#a855f7",
    },
    statusInactive: {
      backgroundColor: "rgba(239, 68, 68, 0.1)",
      color: "#ef4444",
    },
    memberName: {
      fontSize: "18px",
      fontWeight: "700",
      color: isDark ? "#f8fafc" : "#0f172a",
      marginBottom: "4px",
    },
    memberRole: {
      fontSize: "14px",
      fontWeight: "500",
      color: isDark ? "#64748b" : "#64748b",
      marginBottom: "20px",
    },
    infoGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "16px",
      marginBottom: "24px",
    },
    infoItem: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "4px",
    },
    infoLabel: {
      fontSize: "11px",
      fontWeight: "700",
      color: isDark ? "#475569" : "#94a3b8",
      textTransform: "uppercase" as const,
      letterSpacing: "0.05em",
    },
    infoValue: {
      fontSize: "13px",
      fontWeight: "600",
      color: isDark ? "#e2e8f0" : "#1e293b",
    },
    contactSection: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: "20px",
    },
    contactInfo: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "2px",
    },
    contactText: {
      fontSize: "13px",
      fontWeight: "600",
      color: isDark ? "#94a3b8" : "#64748b",
    },
    arrowButton: {
      width: "40px",
      height: "40px",
      borderRadius: "12px",
      backgroundColor: isDark ? "#1e1e21" : "#f8fafc",
      border: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: isDark ? "#f8fafc" : "#0f172a",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    tableContainer: {
      backgroundColor: isDark ? "#161618" : "#ffffff",
      border: `1px solid ${isDark ? "#1e1e21" : "#f1f5f9"}`,
      borderRadius: "20px",
      overflow: "hidden",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse" as const,
    },
    th: {
      textAlign: "left" as const,
      padding: "16px 24px",
      fontSize: "12px",
      fontWeight: "700",
      color: isDark ? "#475569" : "#94a3b8",
      textTransform: "uppercase" as const,
      letterSpacing: "0.05em",
      borderBottom: `1px solid ${isDark ? "#1e1e21" : "#f1f5f9"}`,
    },
    td: {
      padding: "16px 24px",
      fontSize: "14px",
      color: isDark ? "#e2e8f0" : "#1e293b",
      borderBottom: `1px solid ${isDark ? "#111113" : "#f8fafc"}`,
    },
    teamIcon: {
      width: "48px",
      height: "48px",
      borderRadius: "14px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#ffffff",
      position: "relative" as const,
      overflow: "hidden",
    },
    teamIconPattern: {
      position: "absolute" as const,
      inset: 0,
      opacity: 0.2,
      backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)",
      backgroundSize: "8px 8px",
    },
    teamIconGradient: {
      position: "absolute" as const,
      inset: 0,
      background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)",
    },
    overlay: {
      position: "fixed" as const,
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.4)",
      backdropFilter: "blur(4px)",
      zIndex: 1000,
      opacity: 0,
      pointerEvents: "none" as const,
      transition: "opacity 0.3s ease",
    },
    overlayOpen: {
      opacity: 1,
      pointerEvents: "auto" as const,
    },
    drawer: {
      position: "fixed" as const,
      top: 0,
      right: 0,
      bottom: 0,
      width: "480px",
      backgroundColor: isDark ? "#111113" : "#ffffff",
      zIndex: 1001,
      transform: "translateX(100%)",
      transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      display: "flex",
      flexDirection: "column" as const,
      boxShadow: "-20px 0 50px rgba(0,0,0,0.2)",
    },
    drawerOpen: {
      transform: "translateX(0)",
    },
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.breadcrumb}>Configuration / Personnel</div>
        <div style={styles.titleRow}>
          <h1 style={styles.title}>Personnel</h1>
          <div style={styles.buttonGroup}>
            <button style={styles.primaryButton} onClick={() => setIsAddMemberOpen(true)}>
              <Plus size={18} />
              <span>Add member</span>
            </button>
            <button style={styles.secondaryButton} onClick={() => setIsAddTeamOpen(true)}>
              <Users size={18} />
              <span>Add Team</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        <button
          style={{ ...styles.tab, ...(activeTab === "members" ? styles.activeTab : {}) }}
          onClick={() => setActiveTab("members")}
        >
          <Users size={18} />
          <span>Members</span>
          <span style={{ 
            backgroundColor: isDark ? "#1e1e21" : "#f1f5f9", 
            padding: "2px 8px", 
            borderRadius: "6px", 
            fontSize: "12px",
            fontWeight: "700"
          }}>
            {members.length}
          </span>
          {activeTab === "members" && <div style={styles.tabIndicator} />}
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === "teams" ? styles.activeTab : {}) }}
          onClick={() => setActiveTab("teams")}
        >
          <ClipboardList size={18} />
          <span>Teams</span>
          <span style={{ 
            backgroundColor: isDark ? "#1e1e21" : "#f1f5f9", 
            padding: "2px 8px", 
            borderRadius: "6px", 
            fontSize: "12px",
            fontWeight: "700"
          }}>
            {teams.length}
          </span>
          {activeTab === "teams" && <div style={styles.tabIndicator} />}
        </button>
      </div>

      {/* Content */}
      <div style={styles.content}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionTitle}>
            {activeTab === "members" ? "Team Members" : "Sales Teams"}
          </div>
          <div style={styles.controls}>
            <div style={styles.searchContainer}>
              <Search size={18} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
              <span style={styles.searchHint}>⌘K</span>
            </div>
            <div style={{ position: "relative" }}>
              <button 
                style={styles.filterButton}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <SlidersHorizontal size={18} />
                <span>Filters</span>
                <ChevronDown size={14} />
              </button>
              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    style={styles.filterDropdown}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '800', color: isDark ? '#f8fafc' : '#0f172a' }}>Filters</span>
                      <button 
                        style={{ fontSize: '12px', fontWeight: '700', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                        onClick={() => { setStatusFilter("all"); setTeamFilter("all"); setCompanyFilter("all"); setLeaderFilter("all"); }}
                      >
                        Reset All
                      </button>
                    </div>
                    <div style={styles.filterSection}>
                      <div style={styles.filterLabel}>Status</div>
                      {["all", "active", "inactive"].map(status => (
                        <div 
                          key={status}
                          style={{...styles.filterOption, backgroundColor: statusFilter === status ? (isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff') : 'transparent'}} 
                          onClick={() => setStatusFilter(status)}
                        >
                          <span style={{ textTransform: 'capitalize' }}>{status === 'all' ? 'All Status' : status}</span>
                          {statusFilter === status && <Check size={14} style={{ color: '#3b82f6' }} />}
                        </div>
                      ))}
                    </div>
                    <div style={styles.filterDivider} />
                    <button 
                      style={{ width: '100%', padding: '12px', borderRadius: '14px', border: 'none', backgroundColor: isDark ? '#f8fafc' : '#1e1e21', color: isDark ? '#0f172a' : '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
                      onClick={() => setIsFilterOpen(false)}
                    >
                      Apply Filters
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button 
              style={styles.gridButton}
              onClick={() => setViewMode(viewMode === "grid" ? "table" : "grid")}
            >
              {viewMode === "grid" ? <List size={20} /> : <LayoutGrid size={20} />}
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 0' }}
            >
              <div style={{ width: '40px', height: '40px', border: `3px solid ${isDark ? '#1e1e21' : '#f1f5f9'}`, borderTopColor: isDark ? '#f8fafc' : '#1e1e21', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </motion.div>
          ) : activeTab === "members" ? (
            <motion.div
              key="members-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {viewMode === "grid" ? (
                <motion.div 
                  style={styles.cardsGrid}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredMembers.map((member) => {
                    const status = getStatusBadge(member)
                    const statusStyle = status.type === "active" ? styles.statusActive : status.type === "remote" ? styles.statusRemote : status.type === "parttime" ? styles.statusParttime : styles.statusInactive
                    return (
                      <motion.div
                        key={member.id}
                        variants={itemVariants}
                        style={styles.memberCard}
                        onClick={() => setSelectedItem(member)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = isDark ? "0 20px 40px -10px rgba(0,0,0,0.6)" : "0 20px 40px -10px rgba(0,0,0,0.1)"
                          e.currentTarget.style.transform = "translateY(-6px)"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.02)"
                          e.currentTarget.style.transform = "translateY(0)"
                        }}
                      >
                        <div style={styles.cardTop}>
                          <div style={styles.avatar}>
                            <img src={getUserAvatarUrl(member)} alt={member.display_name} style={styles.avatarImage} />
                          </div>
                          <div style={{ ...styles.statusBadge, ...statusStyle }}>{status.text}</div>
                        </div>
                        <div style={styles.memberName}>{member.display_name}</div>
                        <div style={styles.memberRole}>{getRoleName(member)}</div>
                        <div style={styles.infoGrid}>
                          <div style={styles.infoItem}>
                            <span style={styles.infoLabel}>Department</span>
                            <span style={styles.infoValue}>{getDepartmentName(member)}</span>
                          </div>
                          <div style={styles.infoItem}>
                            <span style={styles.infoLabel}>Joining</span>
                            <span style={styles.infoValue}>{new Date(member.create_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                          </div>
                        </div>
                        <div style={{ ...styles.contactSection, borderTop: `1px solid ${isDark ? "#1e1e21" : "#f8fafc"}` }}>
                          <div style={styles.contactInfo}>
                            <span style={styles.contactText}>{member.email || "No email"}</span>
                            <span style={{ ...styles.contactText, fontSize: '12px', opacity: 0.7 }}>{member.phone || "No phone"}</span>
                          </div>
                          <button style={styles.arrowButton}>
                            <ArrowRight size={20} />
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              ) : (
                <motion.div style={styles.tableContainer} variants={containerVariants} initial="hidden" animate="visible">
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Member</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Role</th>
                        <th style={styles.th}>Department</th>
                        <th style={styles.th}>Contact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMembers.map((member) => {
                        const status = getStatusBadge(member)
                        const statusStyle = status.type === "active" ? styles.statusActive : status.type === "remote" ? styles.statusRemote : status.type === "parttime" ? styles.statusParttime : styles.statusInactive
                        return (
                          <tr key={member.id} onClick={() => setSelectedItem(member)} style={{ cursor: 'pointer' }}>
                            <td style={styles.td}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ ...styles.avatar, width: '32px', height: '32px', borderRadius: '10px' }}>
                                  <img src={getUserAvatarUrl(member)} alt="" style={styles.avatarImage} />
                                </div>
                                <span style={{ fontWeight: '600' }}>{member.display_name}</span>
                              </div>
                            </td>
                            <td style={styles.td}><span style={{ ...styles.statusBadge, ...statusStyle, padding: '2px 10px' }}>{status.text}</span></td>
                            <td style={styles.td}>{getRoleName(member)}</td>
                            <td style={styles.td}>{getDepartmentName(member)}</td>
                            <td style={styles.td}>
                              <div style={{ fontSize: '12px' }}>
                                <div style={{ fontWeight: '600' }}>{member.email}</div>
                                <div style={{ opacity: 0.6 }}>{member.phone}</div>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="teams-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {viewMode === "grid" ? (
                <motion.div 
                  style={styles.cardsGrid}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredTeams.map((team) => (
                    <motion.div
                      key={team.id}
                      variants={itemVariants}
                      style={styles.memberCard}
                      onClick={() => setSelectedItem(team)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = isDark ? "0 20px 40px -10px rgba(0,0,0,0.6)" : "0 20px 40px -10px rgba(0,0,0,0.1)"
                        e.currentTarget.style.transform = "translateY(-6px)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.02)"
                        e.currentTarget.style.transform = "translateY(0)"
                      }}
                    >
                      <div style={styles.cardTop}>
                        <div style={{ ...styles.teamIcon, backgroundColor: getTeamColor(team.id) }}>
                          <div style={styles.teamIconPattern} />
                          <div style={styles.teamIconGradient} />
                          {getTeamIcon(team.name)}
                        </div>
                        <div style={{ 
                          ...styles.statusBadge, 
                          backgroundColor: team.active ? (isDark ? 'rgba(34, 197, 94, 0.1)' : "#f0fdf4") : (isDark ? 'rgba(239, 68, 68, 0.1)' : "#fef2f2"),
                          color: team.active ? (isDark ? '#4ade80' : "#166534") : (isDark ? '#f87171' : "#dc2626")
                        }}>
                          {team.active ? "Active" : "Inactive"}
                        </div>
                      </div>
                      <div style={{ ...styles.memberName, marginTop: '8px' }}>{team.name}</div>
                      <div style={{ ...styles.memberRole, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <UserCircle size={14} style={{ color: '#3b82f6' }} />
                        {team.user_id?.[1] || "No team leader assigned"}
                      </div>
                      <div style={styles.infoGrid}>
                        <div style={styles.infoItem}>
                          <span style={styles.infoLabel}>Invoiced Target</span>
                          <span style={styles.infoValue}>${(team.invoiced_target || 0).toLocaleString()}</span>
                        </div>
                        <div style={styles.infoItem}>
                          <span style={styles.infoLabel}>Assignments</span>
                          <span style={styles.infoValue}>{team.lead_all_assigned_month_count || 0} this month</span>
                        </div>
                      </div>
                      <div style={{ ...styles.contactSection, borderTop: `1px solid ${isDark ? "#1e1e21" : "#f8fafc"}` }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {getTeamMembers(team.id).slice(0, 4).map((m, idx) => (
                            <div key={m.id} style={{ 
                              width: '32px', height: '32px', borderRadius: '10px', 
                              overflow: 'hidden', border: `2px solid ${isDark ? '#161618' : 'white'}`, 
                              marginLeft: idx === 0 ? 0 : -12,
                              backgroundColor: isDark ? '#1e1e21' : '#f8fafc',
                              zIndex: 4 - idx
                            }}>
                              <img src={getUserAvatarUrl(m)} alt={m.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          ))}
                          {getTeamMembers(team.id).length > 4 && (
                            <span style={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b', marginLeft: '12px', fontWeight: '700' }}>
                              +{getTeamMembers(team.id).length - 4}
                            </span>
                          )}
                          {getTeamMembers(team.id).length === 0 && (
                            <span style={{ fontSize: '12px', color: isDark ? '#475569' : '#94a3b8', fontWeight: '600' }}>No members</span>
                          )}
                        </div>
                        <button style={styles.arrowButton}>
                          <ArrowRight size={20} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div style={styles.tableContainer} variants={containerVariants} initial="hidden" animate="visible">
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Team</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Lead</th>
                        <th style={styles.th}>Members</th>
                        <th style={styles.th}>Capacity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTeams.map((team) => (
                        <tr key={team.id} onClick={() => setSelectedItem(team)} style={{ cursor: 'pointer' }}>
                          <td style={styles.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ ...styles.teamIcon, width: '36px', height: '36px', borderRadius: '10px', backgroundColor: getTeamColor(team.id) }}>
                                <div style={{ ...styles.teamIconPattern, opacity: 0.1 }} />
                                <div style={{ ...styles.teamIconGradient, opacity: 0.5 }} />
                                {getTeamIcon(team.name, 18)}
                              </div>
                              <span style={{ fontWeight: '600' }}>{team.name}</span>
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span style={{ 
                              ...styles.statusBadge, 
                              backgroundColor: team.active ? (isDark ? 'rgba(34, 197, 94, 0.1)' : "#f0fdf4") : (isDark ? 'rgba(239, 68, 68, 0.1)' : "#fef2f2"),
                              color: team.active ? (isDark ? '#4ade80' : "#166534") : (isDark ? '#f87171' : "#dc2626"),
                              padding: '2px 10px'
                            }}>
                              {team.active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td style={styles.td}>{team.user_id?.[1] || "No team leader assigned"}</td>
                          <td style={styles.td}>{getTeamMembers(team.id).length} members</td>
                          <td style={styles.td}>
                            <div style={{ width: '80px', height: '8px', backgroundColor: isDark ? '#1e293b' : '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${Math.min((getTeamMembers(team.id).length / (team.assignment_max || 10)) * 100, 100)}%`, backgroundColor: getTeamColor(team.id) }} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Member Drawer */}
      <AnimatePresence>
        {isAddMemberOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              style={{ ...styles.overlay, opacity: 1, pointerEvents: 'auto' }} 
              onClick={() => setIsAddMemberOpen(false)} 
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                ...styles.drawer,
                zIndex: 1002,
                transform: 'none', // Reset transform for framer-motion
              }}
            >
              <div style={{ 
                padding: '32px 24px', 
                borderBottom: `1px solid ${isDark ? "#1e1e21" : "#f1f5f9"}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', color: isDark ? '#f8fafc' : '#0f172a' }}>Add Team Member</h2>
                  <p style={{ fontSize: '12px', color: isDark ? '#475569' : '#94a3b8', fontWeight: '600', marginTop: '4px' }}>NEW ASSIGNMENT</p>
                </div>
                <button 
                  onClick={() => setIsAddMemberOpen(false)}
                  style={{ width: '40px', height: '40px', borderRadius: '14px', backgroundColor: isDark ? '#1e1e21' : '#f8fafc', border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, cursor: 'pointer', color: isDark ? '#f8fafc' : '#0f172a' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <UserDropdown
                  label="User *"
                  users={unassignedUsers.map(u => ({
                    id: u.id,
                    name: u.display_name,
                    email: u.email || "",
                    avatar: getUserAvatarUrl(u)
                  }))}
                  value={newMemberData.user_id}
                  onChange={(val) => setNewMemberData({ ...newMemberData, user_id: Number(val) })}
                  onSearch={loadUnassignedUsers}
                  isLoading={searchLoading}
                  placeholder="Search and select a user"
                  className="max-w-none"
                />
                
                <SelectWithIcon
                  label="Team *"
                  icon={Users}
                  options={teams.map(t => ({ value: t.id, label: t.name }))}
                  value={newMemberData.crm_team_id.toString()}
                  onChange={(val) => setNewMemberData({ ...newMemberData, crm_team_id: Number(val) })}
                  placeholder="Select a team"
                  className="max-w-none"
                />

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Average Leads Capacity (30 days)</label>
                  <input 
                    type="number" 
                    value={newMemberData.assignment_max} 
                    onChange={(e) => setNewMemberData({...newMemberData, assignment_max: Number(e.target.value)})}
                    style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, backgroundColor: isDark ? '#1e1e21' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', fontSize: '14px', fontWeight: '500' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: 'auto', padding: '32px 24px', borderTop: `1px solid ${isDark ? "#1e1e21" : "#f1f5f9"}`, display: 'flex', gap: '12px' }}>
                <button onClick={() => setIsAddMemberOpen(false)} style={{ ...styles.secondaryButton, flex: 1, justifyContent: 'center', height: '52px', borderRadius: '14px' }}>Cancel</button>
                <button onClick={handleAddMember} disabled={isSaving} style={{ ...styles.primaryButton, flex: 1, justifyContent: 'center', height: '52px', borderRadius: '14px', opacity: isSaving ? 0.6 : 1 }}>
                  {isSaving ? 'Creating...' : 'Create Member'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Team Drawer */}
      <AnimatePresence>
        {isAddTeamOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              style={{ ...styles.overlay, opacity: 1, pointerEvents: 'auto' }} 
              onClick={() => setIsAddTeamOpen(false)} 
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                ...styles.drawer,
                zIndex: 1002,
                transform: 'none', // Reset transform for framer-motion
              }}
            >
              <div style={{ 
                padding: '32px 24px', 
                borderBottom: `1px solid ${isDark ? "#1e1e21" : "#f1f5f9"}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', color: isDark ? '#f8fafc' : '#0f172a' }}>Add Sales Team</h2>
                  <p style={{ fontSize: '12px', color: isDark ? '#475569' : '#94a3b8', fontWeight: '600', marginTop: '4px' }}>NEW DEPARTMENT</p>
                </div>
                <button 
                  onClick={() => setIsAddTeamOpen(false)}
                  style={{ width: '40px', height: '40px', borderRadius: '14px', backgroundColor: isDark ? '#1e1e21' : '#f8fafc', border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, cursor: 'pointer', color: isDark ? '#f8fafc' : '#0f172a' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Team Name *</label>
                  <input 
                    type="text" 
                    value={newTeamData.name} 
                    onChange={(e) => setNewTeamData({...newTeamData, name: e.target.value})}
                    placeholder="e.g. North America Sales"
                    style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, backgroundColor: isDark ? '#1e1e21' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', fontSize: '14px', fontWeight: '500' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Team Leader</label>
                  <select 
                    value={newTeamData.user_id} 
                    onChange={(e) => setNewTeamData({...newTeamData, user_id: Number(e.target.value)})}
                    style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, backgroundColor: isDark ? '#1e1e21' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', fontSize: '14px', fontWeight: '500' }}
                  >
                    <option value={0}>Select a leader (optional)</option>
                    {users.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Company</label>
                  <select 
                    value={newTeamData.company_id} 
                    onChange={(e) => setNewTeamData({...newTeamData, company_id: Number(e.target.value)})}
                    style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, backgroundColor: isDark ? '#1e1e21' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', fontSize: '14px', fontWeight: '500' }}
                  >
                    <option value={0}>Select a company (optional)</option>
                    {companies.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: 'auto', padding: '32px 24px', borderTop: `1px solid ${isDark ? "#1e1e21" : "#f1f5f9"}`, display: 'flex', gap: '12px' }}>
                <button onClick={() => setIsAddTeamOpen(false)} style={{ ...styles.secondaryButton, flex: 1, justifyContent: 'center', height: '52px', borderRadius: '14px' }}>Cancel</button>
                <button onClick={handleAddTeam} disabled={isSaving} style={{ ...styles.primaryButton, flex: 1, justifyContent: 'center', height: '52px', borderRadius: '14px', opacity: isSaving ? 0.6 : 1 }}>
                  {isSaving ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Drawer Overlay */}
      <div 
        style={{ ...styles.overlay, ...(selectedItem ? styles.overlayOpen : {}) }} 
        onClick={() => setSelectedItem(null)}
      />

      {/* Drawer */}
      <div style={{ ...styles.drawer, ...(selectedItem ? styles.drawerOpen : {}) }}>
        {selectedItem && (
          <>
            <div style={{ 
              padding: '32px 24px', 
              background: isDark 
                ? 'linear-gradient(180deg, rgba(30, 30, 33, 0.5) 0%, transparent 100%)' 
                : 'linear-gradient(180deg, rgba(248, 250, 252, 0.8) 0%, transparent 100%)',
              borderBottom: `1px solid ${isDark ? "#1e1e21" : "#f1f5f9"}`, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.02em' }}>
                  {selectedItem && 'crm_team_id' in selectedItem ? 'Member Details' : 'Team Details'}
                </h3>
                <p style={{ fontSize: '12px', color: isDark ? '#475569' : '#94a3b8', fontWeight: '600', marginTop: '4px' }}>
                  {selectedItem && 'crm_team_id' in selectedItem ? 'INDIVIDUAL PROFILE' : 'COLLECTIVE UNIT'}
                </p>
              </div>
              <button 
                onClick={() => setSelectedItem(null)} 
                style={{ 
                  width: '40px', height: '40px', borderRadius: '14px', 
                  backgroundColor: isDark ? '#1e1e21' : '#f8fafc',
                  border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: isDark ? '#f8fafc' : '#0f172a' 
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '32px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {!isEditing && (
                <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 20px' }}>
                  {'crm_team_id' in selectedItem ? (
                    <div style={{ ...styles.avatar, width: '120px', height: '120px', borderRadius: '32px', border: `4px solid ${isDark ? '#111113' : '#fff'}` }}>
                      <img src={getUserAvatarUrl(selectedItem)} alt="" style={styles.avatarImage} />
                    </div>
                  ) : (
                    <div style={{ 
                      ...styles.teamIcon, width: '120px', height: '120px', borderRadius: '32px', 
                      backgroundColor: getTeamColor(selectedItem.id), border: `4px solid ${isDark ? '#111113' : '#fff'}`
                    }}>
                      <div style={styles.teamIconPattern} />
                      <div style={styles.teamIconGradient} />
                      {getTeamIcon(selectedItem.name, 48)}
                    </div>
                  )}
                </div>
              )}

              <div style={{ textAlign: isEditing ? 'left' : 'center' }}>
                {'crm_team_id' in selectedItem ? (
                  <>
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Member Name</label>
                          <input 
                            disabled 
                            value={selectedItem.display_name} 
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, backgroundColor: isDark ? '#1e1e21' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', fontSize: '14px', opacity: 0.7 }}
                          />
                        </div>
                        <SelectWithIcon
                          label="Team"
                          icon={Users}
                          options={teams.map(t => ({ value: t.id, label: t.name }))}
                          value={selectedItem.crm_team_id?.[0].toString() || ""}
                          onChange={(val) => setSelectedItem({ ...selectedItem, crm_team_id: [Number(val), teams.find(t => t.id === Number(val))?.name || ""] })}
                          placeholder="Select a team"
                          className="max-w-none"
                        />
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Monthly Capacity</label>
                          <input 
                            type="number" 
                            value={selectedItem.assignment_max} 
                            onChange={(e) => setSelectedItem({ ...selectedItem, assignment_max: Number(e.target.value) })}
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, backgroundColor: isDark ? '#1e1e21' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', fontSize: '14px' }}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <input 
                            type="checkbox" 
                            id="member-active"
                            checked={selectedItem.active} 
                            onChange={(e) => setSelectedItem({ ...selectedItem, active: e.target.checked })}
                            style={{ width: '18px', height: '18px' }}
                          />
                          <label htmlFor="member-active" style={{ fontSize: '14px', fontWeight: '600', color: isDark ? '#f8fafc' : '#0f172a' }}>Active Member</label>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '6px', color: isDark ? '#f8fafc' : '#0f172a' }}>{selectedItem.display_name}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <Briefcase size={14} style={{ color: '#3b82f6' }} />
                          <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontWeight: '600', fontSize: '14px' }}>{getRoleName(selectedItem)}</span>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Team Name</label>
                          <input 
                            value={selectedItem.name} 
                            onChange={(e) => setSelectedItem({ ...selectedItem, name: e.target.value })}
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, backgroundColor: isDark ? '#1e1e21' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', fontSize: '14px' }}
                          />
                        </div>
                        <UserDropdown
                          label="Team Leader"
                          users={users.map(([id, name]) => ({ id, name }))}
                          value={selectedItem.user_id?.[0] || ""}
                          onChange={(val) => {
                            const user = users.find(u => u[0] === Number(val))
                            setSelectedItem({ ...selectedItem, user_id: user ? [user[0], user[1]] : null })
                          }}
                          placeholder="Select leader"
                          className="max-w-none"
                        />
                        <SelectWithIcon
                          label="Company"
                          icon={Building2}
                          options={companies.map(([id, name]) => ({ value: id, label: name }))}
                          value={selectedItem.company_id?.[0].toString() || ""}
                          onChange={(val) => {
                            const comp = companies.find(c => c[0] === Number(val))
                            setSelectedItem({ ...selectedItem, company_id: comp ? [comp[0], comp[1]] : null })
                          }}
                          placeholder="Select company"
                          className="max-w-none"
                        />
                      </div>
                    ) : (
                      <>
                        <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '6px', color: isDark ? '#f8fafc' : '#0f172a' }}>{selectedItem.name}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Building2 size={14} style={{ color: '#3b82f6' }} />
                            <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase' }}>
                              {selectedItem.company_id?.[1] || "Global Sales Department"}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <UserCircle size={14} style={{ color: '#10b981' }} />
                            <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontWeight: '600', fontSize: '14px' }}>
                              {selectedItem.user_id?.[1] || "No team leader assigned"}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              {!isEditing && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ padding: '20px', backgroundColor: isDark ? '#161618' : '#f8fafc', borderRadius: '24px', textAlign: 'center', border: `1px solid ${isDark ? "#1e1e21" : "#f1f5f9"}` }}>
                    <div style={{ fontSize: '11px', color: isDark ? '#475569' : '#94a3b8', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase' }}>Status</div>
                    {'crm_team_id' in selectedItem ? (
                      <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: '700', backgroundColor: selectedItem.active ? (isDark ? 'rgba(34, 197, 94, 0.1)' : '#f0fdf4') : (isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2'), color: selectedItem.active ? (isDark ? '#4ade80' : '#16a34a') : (isDark ? '#f87171' : '#dc2626') }}>
                        {selectedItem.active ? 'Active' : 'Inactive'}
                      </span>
                    ) : (
                      <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: '700', backgroundColor: selectedItem.active ? (isDark ? 'rgba(34, 197, 94, 0.1)' : '#f0fdf4') : (isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2'), color: selectedItem.active ? (isDark ? '#4ade80' : '#16a34a') : (isDark ? '#f87171' : '#dc2626') }}>
                        {selectedItem.active ? 'Active Team' : 'Inactive Team'}
                      </span>
                    )}
                  </div>
                  <div style={{ padding: '20px', backgroundColor: isDark ? '#161618' : '#f8fafc', borderRadius: '24px', textAlign: 'center', border: `1px solid ${isDark ? "#1e1e21" : "#f1f5f9"}` }}>
                    <div style={{ fontSize: '11px', color: isDark ? '#475569' : '#94a3b8', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase' }}>
                      {'crm_team_id' in selectedItem ? 'Monthly Leads' : 'Members'}
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: isDark ? '#f8fafc' : '#0f172a' }}>
                      {'crm_team_id' in selectedItem ? selectedItem.lead_month_count : getTeamMembers(selectedItem.id).length}
                    </div>
                  </div>
                </div>
              )}

              {/* Team members list for teams */}
              {!('crm_team_id' in selectedItem) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <AvatarList
                    title="Team members"
                    items={getTeamMembers(selectedItem.id).map(m => ({
                      image: getUserAvatarUrl(m),
                      fallback: m.display_name[0],
                      name: m.display_name,
                      designation: getRoleName(m),
                      value: `${m.lead_month_count} leads`
                    }))}
                    onAdd={() => setShowAddMemberInTeam(!showAddMemberInTeam)}
                    maxInitialItems={5}
                  />
                  
                  <AnimatePresence>
                    {showAddMemberInTeam && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ padding: '16px', backgroundColor: isDark ? '#161618' : '#f8fafc', borderRadius: '16px', border: `1px solid ${isDark ? '#1e1e21' : '#e2e8f0'}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <UserDropdown
                            users={unassignedUsers.map(u => ({
                              id: u.id,
                              name: u.display_name,
                              email: u.email || "",
                              avatar: getUserAvatarUrl(u)
                            }))}
                            value={newTeamMemberId}
                            onChange={(val) => setNewTeamMemberId(val)}
                            onSearch={loadUnassignedUsers}
                            isLoading={searchLoading}
                            placeholder="Select user to add"
                            className="max-w-none"
                          />
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              onClick={() => setShowAddMemberInTeam(false)} 
                              style={{ ...styles.secondaryButton, flex: 1, padding: '8px', fontSize: '12px' }}
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => handleAddMemberToTeam(Number(newTeamMemberId), selectedItem.id)} 
                              disabled={!newTeamMemberId || isSaving}
                              style={{ ...styles.primaryButton, flex: 1, padding: '8px', fontSize: '12px', opacity: (!newTeamMemberId || isSaving) ? 0.5 : 1 }}
                            >
                              {isSaving ? 'Adding...' : 'Add to Team'}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {!isEditing && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', color: isDark ? '#f8fafc' : '#0f172a' }}>Contact</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', backgroundColor: isDark ? '#1e1e21' : '#f1f5f9', borderRadius: '24px', overflow: 'hidden' }}>
                    <div style={{ padding: '18px 24px', backgroundColor: isDark ? '#111113' : '#fff', display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Mail size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: isDark ? '#475569' : '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Email</div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                          {'crm_team_id' in selectedItem ? (selectedItem.email || 'No email') : (selectedItem.alias_email || 'No team alias')}
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: '18px 24px', backgroundColor: isDark ? '#111113' : '#fff', display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : '#f0fdf4', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Phone size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: isDark ? '#475569' : '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Phone</div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                          {'crm_team_id' in selectedItem ? (selectedItem.phone || 'No phone') : 'Team Line'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ marginTop: 'auto', paddingTop: '20px', display: 'flex', gap: '12px' }}>
                {isEditing ? (
                  <>
                    <button 
                      onClick={() => setIsEditing(false)}
                      style={{ ...styles.secondaryButton, flex: 1, justifyContent: 'center', height: '56px', borderRadius: '18px' }}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={'crm_team_id' in selectedItem ? handleUpdateMember : handleUpdateTeam}
                      disabled={isSaving}
                      style={{ ...styles.primaryButton, flex: 1, justifyContent: 'center', height: '56px', borderRadius: '18px', opacity: isSaving ? 0.6 : 1 }}
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => setIsEditing(true)}
                      style={{ ...styles.primaryButton, flex: 1, justifyContent: 'center', height: '56px', borderRadius: '18px' }}
                    >
                      {selectedItem && 'crm_team_id' in selectedItem ? 'Edit Profile' : 'Manage Team'}
                    </button>
                    <div style={{ position: 'relative' }}>
                      <button 
                        onClick={() => alert('Options menu (Delete, Archive, etc.) will be implemented soon')}
                        style={{ ...styles.secondaryButton, width: '56px', height: '56px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '18px' }}
                      >
                        <MoreHorizontal size={20} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
