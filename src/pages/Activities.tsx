"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Building2, 
  Search, 
  Filter, 
  Video, 
  Phone, 
  Mail, 
  MapPin, 
  MoreHorizontal,
  Plus,
  LayoutGrid,
  List as ListIcon,
  Check,
  X,
  Target,
  Briefcase,
  ExternalLink,
  MessageSquare,
  ChevronDown,
  Bell,
  Utensils,
  Monitor,
  ShoppingBag,
  BarChart3
} from "lucide-react"
import { useTheme } from "../../context/theme"
import { useAuth } from "../../context/auth"
import { apiService } from "../services/api"
import { useSidebar } from "../../context/sidebar"

// ============================================
// TYPES
// ============================================

interface CalendarEvent {
  id: number
  name: string
  start: string
  stop: string
  allday: boolean
  opportunity_id: [number, string] | false
  user_id: [number, string] | false
  partner_ids: number[]
  description: string | false
  location: string | false
  videocall_location: string | false
  activity_ids: number[]
}

interface MailActivity {
  id: number
  activity_type_id: [number, string]
  summary: string | false
  note: string | false
  date_deadline: string
  res_model: string
  res_id: number
  res_name: string | false
  user_id: [number, string]
  calendar_event_id: [number, string] | false
  active: boolean
}

interface MailActivityType {
  id: number
  name: string
  summary: string | false
  icon: string | false
  decoration_type: 'warning' | 'danger' | false
  category: 'default' | 'upload_file' | 'phonecall' | 'meeting' | false
}

interface Lead {
  id: number
  name: string
  partner_id: [number, string] | false
  user_id: [number, string] | false
  team_id: [number, string] | false
  email_from: string | false
  phone: string | false
  type: 'lead' | 'opportunity'
}

interface Partner {
  id: number
  name: string
  display_name: string
  email: string | false
  phone: string | false
  image_128: string | false
}

interface TeamMember {
  id: number
  user_id: [number, string]
  image_128: string | false
  display_name: string
}

const HOUR_HEIGHT = 100;
const START_HOUR = 0;
const END_HOUR = 23;

// ============================================
// COMPONENTS
// ============================================

const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  const [show, setShow] = useState(false)
  return (
    <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded pointer-events-none whitespace-nowrap z-50 shadow-xl font-bold"
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const Avatar: React.FC<{ src?: string | false; name: string; size?: number }> = ({ src, name, size = 32 }) => {
  const { mode } = useTheme()
  const isDark = mode === "dark"
  
  return (
    <div 
      className={`rounded-full overflow-hidden border-2 ${isDark ? 'border-zinc-800' : 'border-white'} flex items-center justify-center shrink-0 bg-blue-100 dark:bg-blue-900/30`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src.startsWith('http') ? src : `data:image/png;base64,${src}`} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
          {name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??'}
        </span>
      )}
    </div>
  )
}

// ============================================
// MAIN PAGE
// ============================================

export default function ActivitiesPage() {
  const { colors, mode } = useTheme()
  const { sessionId } = useAuth()
  const { isCollapsed } = useSidebar()
  const isDark = mode === "dark"
  
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [activities, setActivities] = useState<Record<number, MailActivity>>({})
  const [activityTypes, setActivityTypes] = useState<Record<number, MailActivityType>>({})
  const [leads, setLeads] = useState<Record<number, Lead>>({})
  const [partners, setPartners] = useState<Record<number, Partner>>({})
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  
  useEffect(() => {
    fetchData()
  }, [sessionId])

  const fetchData = async () => {
    if (!sessionId) {
      console.warn('[Activities] No session ID available');
      return;
    }
    
    setLoading(true);
    console.log('[Activities] Starting robust fetch sequence...');
    
    try {
      // 1. Parallel fetch of raw Activities and Events
      console.log('[Activities] Step 1: Fetching raw records (mail.activity, calendar.event)...');
      const [activitiesRes, eventsRes] = await Promise.all([
        apiService.searchRead<MailActivity>('mail.activity', {
          limit: 300,
          fields: ['id', 'activity_type_id', 'summary', 'note', 'date_deadline', 'res_model', 'res_id', 'res_name', 'user_id', 'calendar_event_id']
        }),
        apiService.searchRead<CalendarEvent>('calendar.event', {
          domain: [['active', '=', true]],
          limit: 300,
          fields: ['id', 'name', 'start', 'stop', 'allday', 'opportunity_id', 'user_id', 'partner_ids', 'description', 'location', 'videocall_location', 'activity_ids']
        })
      ]);

      const fetchedActivities = (activitiesRes.success && Array.isArray(activitiesRes.records)) ? activitiesRes.records : [];
      const fetchedEvents = (eventsRes.success && Array.isArray(eventsRes.records)) ? eventsRes.records : [];

      console.log('[Activities] Step 1 Results:', { activities: fetchedActivities.length, events: fetchedEvents.length });

      // Store basic records in state
      const activityMap: Record<number, MailActivity> = {};
      fetchedActivities.forEach(a => { if (a && a.id) activityMap[a.id] = a; });
      setActivities(activityMap);
      setEvents(fetchedEvents);

      // 2. Fetch Leads
      const leadIdsSet = new Set<number>();
      fetchedEvents.forEach(e => {
        if (e.opportunity_id && Array.isArray(e.opportunity_id)) {
          leadIdsSet.add(e.opportunity_id[0]);
        }
      });
      fetchedActivities.forEach(a => {
        if (a.res_model === 'crm.lead' && typeof a.res_id === 'number') {
          leadIdsSet.add(a.res_id);
        }
      });
      const allLeadIds = Array.from(leadIdsSet);
      
      let finalFetchedLeads: Lead[] = [];
      if (allLeadIds.length > 0) {
        console.log('[Activities] Step 2: Fetching related leads:', allLeadIds);
        const leadsRes = await apiService.searchRead<Lead>('crm.lead', {
          domain: [['id', 'in', allLeadIds]],
          fields: ['id', 'name', 'partner_id', 'user_id', 'team_id', 'email_from', 'phone', 'type']
        });
        
        if (leadsRes.success && Array.isArray(leadsRes.records)) {
          finalFetchedLeads = leadsRes.records;
          const leadMap: Record<number, Lead> = {};
          finalFetchedLeads.forEach(l => { if (l && l.id) leadMap[l.id] = l; });
          setLeads(leadMap);
        }
      }

      // 3. Fetch Partners
      const partnerIdsSet = new Set<number>();
      finalFetchedLeads.forEach(l => { 
        if (l.partner_id && Array.isArray(l.partner_id)) {
          partnerIdsSet.add(l.partner_id[0]); 
        }
      });
      fetchedEvents.forEach(e => { 
        if (Array.isArray(e.partner_ids)) {
          e.partner_ids.forEach(pid => partnerIdsSet.add(pid)); 
        }
      });
      const allPartnerIds = Array.from(partnerIdsSet);
      
      if (allPartnerIds.length > 0) {
        console.log('[Activities] Step 3: Fetching related partners:', allPartnerIds);
        const partnersRes = await apiService.searchRead<Partner>('res.partner', {
          domain: [['id', 'in', allPartnerIds]],
          fields: ['id', 'name', 'display_name', 'email', 'phone', 'image_128']
        });
        if (partnersRes.success && Array.isArray(partnersRes.records)) {
          const partnerMap: Record<number, Partner> = {};
          partnersRes.records.forEach(p => { if (p && p.id) partnerMap[p.id] = p; });
          setPartners(partnerMap);
        }
      }

      // 4. Fetch Activity Types (essential for icons/colors)
      const typeIdsSet = new Set<number>();
      fetchedActivities.forEach(a => {
        if (a.activity_type_id && Array.isArray(a.activity_type_id)) {
          typeIdsSet.add(a.activity_type_id[0]);
        }
      });
      const allTypeIds = Array.from(typeIdsSet);
      
      if (allTypeIds.length > 0) {
        console.log('[Activities] Step 4: Fetching activity types:', allTypeIds);
        const typesRes = await apiService.searchRead<MailActivityType>('mail.activity.type', {
          domain: [['id', 'in', allTypeIds]],
          fields: ['id', 'name', 'summary', 'icon', 'decoration_type', 'category']
        });
        if (typesRes.success && Array.isArray(typesRes.records)) {
          const typeMap: Record<number, MailActivityType> = {};
          typesRes.records.forEach(t => { if (t && t.id) typeMap[t.id] = t; });
          setActivityTypes(typeMap);
        }
      }
      console.log('[Activities] Fetch sequence completed successfully.');
    } catch (error) {
      console.error("[Activities] Critical error in fetch sequence:", error);
    } finally {
      setLoading(false);
    }
  }

  const displayItems = useMemo(() => {
    const items: any[] = [];

    // Helper: Odoo UTC datetime string -> local Date
    const parseOdooDateTime = (str: string) => {
      if (!str) return null;
      // Convert "2026-01-01 10:00:00" to ISO UTC "2026-01-01T10:00:00Z"
      const d = new Date(str.replace(' ', 'T') + 'Z');
      return isNaN(d.getTime()) ? null : d;
    };

    // Helper: Odoo Date string -> local Date (midnight)
    const parseOdooDate = (str: string) => {
      if (!str) return null;
      // "2026-01-01" -> split and use components for local midnight
      const parts = str.split('-');
      if (parts.length !== 3) return null;
      const [y, m, d] = parts.map(Number);
      return new Date(y, m - 1, d);
    };

    // 1. Process Calendar Events (Meetings)
    events.forEach(event => {
      const start = parseOdooDateTime(event.start);
      const end = parseOdooDateTime(event.stop);
      if (!start) {
        console.warn('[Activities] Skipping event due to invalid start date:', event.start);
        return;
      }

      // Try to find activity type info if linked
      const linkedActivityId = (Array.isArray(event.activity_ids) && event.activity_ids.length > 0) ? event.activity_ids[0] : null;
      const linkedActivity = linkedActivityId ? activities[linkedActivityId] : null;
      const activityType = (linkedActivity && Array.isArray(linkedActivity.activity_type_id)) ? activityTypes[linkedActivity.activity_type_id[0]] : null;

      items.push({
        id: `event-${event.id}`,
        type: 'event',
        name: event.name || 'Untitled Meeting',
        date: start,
        end: end || new Date(start.getTime() + 60 * 60 * 1000), // Default 1h
        allday: event.allday,
        leadId: (event.opportunity_id && Array.isArray(event.opportunity_id)) ? event.opportunity_id[0] : null,
        partnerIds: event.partner_ids || [],
        location: event.location,
        videocall: event.videocall_location,
        activityType
      });
    });

    // 2. Process standalone Activities (Tasks, calls, etc.)
    Object.values(activities).forEach(activity => {
      // Avoid duplication if the activity is already linked to a calendar event we processed
      const isLinkedToFetchedEvent = events.some(e => e.id === (activity.calendar_event_id && Array.isArray(activity.calendar_event_id) ? activity.calendar_event_id[0] : -1));
      
      if (!isLinkedToFetchedEvent && activity.date_deadline) {
        const date = parseOdooDate(activity.date_deadline);
        if (!date) {
          console.warn('[Activities] Skipping activity due to invalid deadline:', activity.date_deadline);
          return;
        }
        const activityType = (activity.activity_type_id && Array.isArray(activity.activity_type_id)) ? activityTypes[activity.activity_type_id[0]] : null;

        items.push({
          id: `activity-${activity.id}`,
          type: 'activity',
          name: activity.summary || activityType?.name || 'Untitled Activity',
          date,
          end: new Date(date.getTime() + 24 * 60 * 60 * 1000),
          allday: true,
          leadId: activity.res_model === 'crm.lead' ? activity.res_id : null,
          partnerIds: [],
          activityType
        });
      }
    });

    console.log('[Activities] Total unified items mapped for calendar:', items.length);
    if (items.length > 0) {
      console.log('[Activities] Sample mapped item:', items[0]);
    }
    return items;
  }, [events, activities, activityTypes]);

  const getItemsForDay = (date: Date) => {
    return displayItems.filter(item => {
      // Precise day matching using local components
      const isSameDay = 
        item.date.getFullYear() === date.getFullYear() &&
        item.date.getMonth() === date.getMonth() &&
        item.date.getDate() === date.getDate();
      
      if (!isSameDay) return false;

      // Filter by search query
      const matchesSearch = !searchQuery || 
        (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.leadId && leads[item.leadId]?.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (!matchesSearch) return false;

      // Filter by type
      if (typeFilter !== 'all') {
        const cat = item.activityType?.category;
        const name = (item.name || '').toLowerCase();
        if (typeFilter === 'meetings') return (item.type === 'event' && !item.videocall) || cat === 'meeting';
        if (typeFilter === 'calls') return name.includes('call') || cat === 'phonecall';
        if (typeFilter === 'demos') return name.includes('demo');
        if (typeFilter === 'video') return !!item.videocall;
      }
      
      return true;
    });
  }

  const getItemIcon = (item: any) => {
    if (item.videocall) return <Video size={14} />
    const name = (item.name || '').toLowerCase();
    
    if (name.includes('lunch') || name.includes('break') || name.includes('dinner')) return <Utensils size={14} />
    if (name.includes('webinar') || name.includes('demo')) return <Monitor size={14} />
    if (name.includes('shopping') || name.includes('buy')) return <ShoppingBag size={14} />
    if (name.includes('analytics') || name.includes('report') || name.includes('chart')) return <BarChart3 size={14} />
    if (name.includes('meeting') || name.includes('sync')) return <Users size={14} />
    
    if (item.activityType?.icon) {
      const icon = item.activityType.icon.toLowerCase();
      if (icon.includes('phone') || icon.includes('call')) return <Phone size={14} />
      if (icon.includes('camera') || icon.includes('video')) return <Video size={14} />
      if (icon.includes('mail')) return <Mail size={14} />
    }
    return item.type === 'event' ? <Briefcase size={14} /> : <Check size={14} />;
  }

  const getItemColor = (item: any) => {
    if (item.videocall) return isDark ? 'bg-indigo-900/20 text-indigo-400 border-indigo-500/20' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
    const deco = item.activityType?.decoration_type;
    if (deco === 'warning') return isDark ? 'bg-amber-900/20 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-100'
    if (deco === 'danger') return isDark ? 'bg-rose-900/20 text-rose-400 border-rose-500/20' : 'bg-rose-50 text-rose-600 border-rose-100'
    return isDark ? 'bg-blue-900/20 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-100'
  }

  const navigateCalendar = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (viewMode === 'week') newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
    else newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1))
    setCurrentDate(newDate)
  }

  const weekDays = useMemo(() => {
    const days = []
    const startOfWeek = new Date(currentDate)
    const day = currentDate.getDay()
    const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1)
    startOfWeek.setDate(diff)
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek)
      d.setDate(startOfWeek.getDate() + i)
      days.push(d)
    }
    return days
  }, [currentDate])

  const monthData = useMemo(() => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const startDay = startOfMonth.getDay()
    const diff = startDay === 0 ? -6 : 1 - startDay
    const calendarStart = new Date(startOfMonth)
    calendarStart.setDate(startOfMonth.getDate() + diff)
    const days = []
    for (let i = 0; i < 42; i++) {
      const d = new Date(calendarStart)
      d.setDate(calendarStart.getDate() + i)
      days.push(d)
    }
    return days
  }, [currentDate])

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: colors.background }}>
      {/* Sidebar - Updated to match image */}
      <div className={`w-80 border-r flex flex-col shrink-0 ${isDark ? 'border-zinc-800 bg-zinc-950' : 'border-gray-200 bg-white'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold tracking-tight">Today</h2>
            <button className="text-zinc-400 hover:text-zinc-600 transition-colors">
              <ListIcon size={18} />
            </button>
          </div>

          <div className="flex gap-4 border-b border-zinc-100 dark:border-zinc-800 mb-6">
            <button className="pb-2 text-xs font-bold border-b-2 border-zinc-800 dark:border-zinc-100">To-do List</button>
            <button className="pb-2 text-xs font-bold text-zinc-400">Events</button>
          </div>
          
          <div className="space-y-6 overflow-y-auto custom-scrollbar flex-1">
            {/* Sections from image */}
            {[
              { label: 'This week', items: ['Weekly Sprint Planning', 'Daily Stand-up', 'UX Design Review', 'Backend Sync Call'] },
              { label: 'This month', items: ['Feature Freeze: Task Board', 'Internal Demo Day', 'API Strategy Workshop', 'LinkedIn Live-Productivity', 'Client Feedback Call', 'Figma-to-Code Hand-off'] },
              { label: 'Unschedule', items: ['Webinar: Scaling Agile with Microteams', 'Client Feedback Call - Beta Group A', 'LinkedIn Live - Building Productivity', 'OKR Alignment Meeting'] }
            ].map(section => (
              <div key={section.label} className="space-y-3">
                <button className="flex items-center justify-between w-full text-left group">
                  <div className="flex items-center gap-2">
                    <ChevronDown size={14} className="text-zinc-400" />
                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{section.label}</span>
                  </div>
                  <Plus size={14} className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <div className="pl-6 space-y-3">
                  {section.items.map(item => (
                    <div key={item} className="flex items-center gap-3 group cursor-pointer">
                      <div className={`w-4 h-4 rounded border transition-colors ${item === 'Daily Stand-up' ? 'bg-zinc-800 border-zinc-800 flex items-center justify-center' : 'border-zinc-300 dark:border-zinc-700'}`}>
                        {item === 'Daily Stand-up' && <Check size={10} className="text-white" />}
                      </div>
                      <span className={`text-xs font-medium transition-colors ${item === 'Daily Stand-up' ? 'text-zinc-400 line-through' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'}`}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Updated to match image */}
        <div className={`h-24 flex items-end justify-between px-8 pb-4 shrink-0 bg-white dark:bg-zinc-950`}>
          <div>
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Calendar</div>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Calendar</h1>
          </div>

          <div className="flex items-center gap-3">
            <button className={`p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 relative hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors`}>
              <div className="w-2 h-2 rounded-full bg-orange-500 absolute -top-1 -right-1 border-2 border-white dark:border-zinc-950" />
              <Tooltip text="Notifications">
                <Bell size={20} className="text-zinc-600 dark:text-zinc-400" />
              </Tooltip>
            </button>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className={`px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors`}
            >
              Today
            </button>
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1 border border-zinc-200 dark:border-zinc-800">
              <button 
                onClick={() => navigateCalendar('prev')}
                className={`p-1.5 rounded-md hover:bg-white dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-400`}
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={() => navigateCalendar('next')}
                className={`p-1.5 rounded-md hover:bg-white dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-400`}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            {viewMode === 'week' ? (
              <motion.div 
                key="week"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col h-full bg-white dark:bg-zinc-950"
              >
                {/* Weekly Header */}
                <div className="grid grid-cols-[80px_1fr] border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-30">
                  <div className="flex items-center justify-center border-r border-zinc-200 dark:border-zinc-800">
                    <div className="px-3 py-1.5 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[9px] font-black text-zinc-400 uppercase tracking-widest">UCT +2</div>
                  </div>
                  <div className="grid grid-cols-7">
                    {weekDays.map((day, idx) => {
                      const isToday = day.toDateString() === new Date().toDateString();
                      return (
                        <div key={idx} className={`py-4 text-center border-r last:border-r-0 border-zinc-200 dark:border-zinc-800 ${isToday ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                          <div className={`text-2xl font-black ${isToday ? 'text-blue-600' : 'text-zinc-800 dark:text-zinc-100'}`}>
                            {day.getDate()}
                          </div>
                          <div className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ${isToday ? 'text-blue-500' : 'text-zinc-400'}`}>
                            {day.toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* All Day Row */}
                <div className="grid grid-cols-[80px_1fr] border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 min-h-[60px] shrink-0">
                  <div className="flex items-center justify-center border-r border-zinc-200 dark:border-zinc-800">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">All day</div>
                  </div>
                  <div className="grid grid-cols-7 relative">
                    {weekDays.map((day, idx) => {
                      const allDayItems = getItemsForDay(day).filter(item => item.allday);
                      return (
                        <div key={idx} className="border-r last:border-r-0 border-zinc-200 dark:border-zinc-800 p-2 space-y-1">
                          {allDayItems.map(item => (
                            <div 
                              key={item.id}
                              className={`px-2 py-1 rounded text-[10px] font-bold truncate border ${getItemColor(item)}`}
                            >
                              {item.name}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Scrollable Hourly Grid */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                  <div className="flex min-h-full">
                    {/* Time Labels Column */}
                    <div className="w-[80px] shrink-0 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 z-10">
                      {Array.from({ length: 24 }).map((_, hour) => (
                        <div 
                          key={hour} 
                          className="relative border-b border-zinc-100 dark:border-zinc-900/50 text-right pr-3"
                          style={{ height: HOUR_HEIGHT }}
                        >
                          <span className="absolute -top-2.5 right-3 text-[10px] font-black text-zinc-400 uppercase tracking-tighter bg-white dark:bg-zinc-950 px-1">
                            {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Day Columns */}
                    <div className="flex-1 grid grid-cols-7 relative bg-white dark:bg-zinc-950">
                      {/* Vertical Lines */}
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div 
                          key={i} 
                          className="absolute h-full border-r border-zinc-200 dark:border-zinc-800"
                          style={{ left: `${(i + 1) * (100 / 7)}%` }}
                        />
                      ))}

                      {/* Horizontal Lines */}
                      {Array.from({ length: 24 }).map((_, hour) => (
                        <div 
                          key={hour} 
                          className="absolute w-full border-b border-zinc-100 dark:border-zinc-900/50"
                          style={{ top: hour * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                        />
                      ))}

                      {/* Content Columns */}
                      {weekDays.map((day, dayIdx) => {
                        const timedItems = getItemsForDay(day).filter(item => !item.allday);
                        return (
                          <div key={dayIdx} className="relative h-full">
                            {timedItems.map(item => {
                              const start = item.date;
                              const end = item.end || new Date(start.getTime() + 60 * 60 * 1000);
                              
                              const startHour = start.getHours();
                              const startMinutes = start.getMinutes();
                              const durationMs = end.getTime() - start.getTime();
                              const durationHours = durationMs / (1000 * 60 * 60);
                              
                              const top = (startHour + startMinutes / 60) * HOUR_HEIGHT;
                              const height = Math.max(durationHours * HOUR_HEIGHT, 40); // Min height 40px

                              const lead = item.leadId ? leads[item.leadId] : null;
                              
                              return (
                                <motion.div
                                  key={item.id}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className={`absolute left-1 right-1 p-4 rounded-2xl shadow-sm flex flex-col gap-3 z-20 group cursor-pointer transition-all hover:shadow-xl hover:z-30 overflow-hidden bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800`}
                                  style={{ top, height }}
                                >
                                  <div className="flex items-start justify-between gap-1">
                                    <div className="p-2 rounded-lg bg-white dark:bg-zinc-800 shadow-sm border border-zinc-100 dark:border-zinc-700">
                                      {getItemIcon(item)}
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-1">
                                    <div className="text-[13px] font-bold leading-tight text-zinc-900 dark:text-zinc-100 line-clamp-3">
                                      {item.name}
                                    </div>
                                    <div className="text-[10px] font-medium text-zinc-400">
                                      {start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                    </div>
                                  </div>

                                  <div className="mt-auto flex items-center justify-between">
                                    {/* User Avatars if attendees */}
                                    {item.partnerIds?.length > 0 ? (
                                      <div className="flex -space-x-1.5 overflow-hidden">
                                        {item.partnerIds.slice(0, 3).map((pid: number) => {
                                          const partner = partners[pid];
                                          return (
                                            <div key={pid} className="border-2 border-zinc-50 dark:border-zinc-900 rounded-full">
                                              <Avatar src={partner?.image_128} name={partner?.display_name || '?'} size={24} />
                                            </div>
                                          );
                                        })}
                                        {item.partnerIds.length > 3 && (
                                          <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[7px] font-black text-zinc-500 border-2 border-zinc-50 dark:border-zinc-900">
                                            +{item.partnerIds.length - 3}
                                          </div>
                                        )}
                                      </div>
                                    ) : <div />}

                                    {item.videocall && (
                                      <button className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-[9px] font-black uppercase tracking-wider shadow-lg shadow-blue-500/25">
                                        Join Meeting
                                      </button>
                                    )}
                                  </div>

                                  {/* Bottom Accent Bar from image */}
                                  <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${item.videocall ? 'bg-blue-500' : 'bg-orange-500'}`} />
                                </motion.div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="month"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className={`flex-1 flex flex-col bg-white dark:bg-zinc-950`}
              >
                <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className={`py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/30`}>
                      {day}
                    </div>
                  ))}
                </div>
                <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto custom-scrollbar">
                  {monthData.map((day, i) => {
                    const dayItems = getItemsForDay(day)
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                    const isToday = day.toDateString() === new Date().toDateString()
                    
                    return (
                      <div key={i} className={`min-h-[140px] p-3 border-r border-b border-zinc-100 dark:border-zinc-900/50 relative transition-all ${!isCurrentMonth ? 'opacity-30 bg-zinc-50/20 dark:bg-zinc-900/10' : ''} ${isDark ? 'hover:bg-zinc-900/30' : 'hover:bg-zinc-50/50'} group`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-xs font-black transition-all ${isToday ? 'bg-blue-500 text-white w-6 h-6 flex items-center justify-center rounded-lg shadow-lg shadow-blue-500/30' : isDark ? 'text-zinc-500 group-hover:text-zinc-300' : 'text-zinc-400 group-hover:text-zinc-600'}`}>
                            {day.getDate()}
                          </span>
                          {dayItems.length > 0 && (
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm" />
                          )}
                        </div>
                        
                        <div className="space-y-1 overflow-hidden">
                          {dayItems.slice(0, 3).map(item => (
                            <div 
                              key={item.id} 
                              className={`px-2 py-1.5 rounded-lg text-[9px] font-bold truncate flex items-center gap-2 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors ${getItemColor(item).replace('bg-', 'bg-opacity-40 border-')}`}
                            >
                              <div className="shrink-0 scale-75 opacity-70">{getItemIcon(item)}</div>
                              <span className="truncate uppercase tracking-wider text-zinc-700 dark:text-zinc-300">{item.name}</span>
                            </div>
                          ))}
                          {dayItems.length > 3 && (
                            <div className={`text-[9px] font-black uppercase tracking-widest text-center py-1 rounded-lg ${isDark ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-100 text-zinc-400'}`}>
                              +{dayItems.length - 3} More
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
