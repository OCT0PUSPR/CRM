import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Filter condition types
export interface FilterCondition {
  id: string;
  field: string;
  operator: string;
  value: unknown;
  logic?: 'AND' | 'OR';
}

export interface FilterState {
  conditions: FilterCondition[];
  activeFilters: Record<string, unknown>;
}

// Kanban view types
export type KanbanViewType = 'stage' | 'user' | 'team';

// Notification types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  link?: string;
}

// CRM Store interface
interface CRMStore {
  // UI State
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Kanban view preferences
  kanbanView: KanbanViewType;
  setKanbanView: (view: KanbanViewType) => void;

  // Selected records for bulk operations
  selectedRecords: Record<string, number[]>;
  selectRecords: (page: string, ids: number[]) => void;
  clearSelection: (page: string) => void;
  toggleRecordSelection: (page: string, id: number) => void;

  // Active filters per page
  pageFilters: Record<string, FilterState>;
  setPageFilter: (page: string, filter: FilterState) => void;
  clearPageFilters: (page: string) => void;

  // Search queries per page
  searchQueries: Record<string, string>;
  setSearchQuery: (page: string, query: string) => void;

  // Sort preferences per page
  sortPreferences: Record<string, { field: string; direction: 'asc' | 'desc' }>;
  setSortPreference: (page: string, field: string, direction: 'asc' | 'desc') => void;

  // View mode per page (list, kanban, grid)
  viewModes: Record<string, 'list' | 'kanban' | 'grid'>;
  setViewMode: (page: string, mode: 'list' | 'kanban' | 'grid') => void;

  // Pagination state
  pagination: Record<string, { page: number; pageSize: number }>;
  setPagination: (pageName: string, page: number, pageSize?: number) => void;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  removeNotification: (id: string) => void;
  unreadCount: () => number;

  // Modal states
  modals: Record<string, boolean>;
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  toggleModal: (modalId: string) => void;

  // Stale data indicator
  staleDataTimestamp: Record<string, number>;
  markDataStale: (key: string) => void;
  isDataStale: (key: string, maxAge: number) => boolean;
}

export const useCRMStore = create<CRMStore>()(
  persist(
    (set, get) => ({
      // UI State
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // Kanban view
      kanbanView: 'stage',
      setKanbanView: (view) => set({ kanbanView: view }),

      // Selected records
      selectedRecords: {},
      selectRecords: (page, ids) =>
        set((state) => ({
          selectedRecords: { ...state.selectedRecords, [page]: ids },
        })),
      clearSelection: (page) =>
        set((state) => ({
          selectedRecords: { ...state.selectedRecords, [page]: [] },
        })),
      toggleRecordSelection: (page, id) =>
        set((state) => {
          const current = state.selectedRecords[page] || [];
          const newSelection = current.includes(id)
            ? current.filter((i) => i !== id)
            : [...current, id];
          return {
            selectedRecords: { ...state.selectedRecords, [page]: newSelection },
          };
        }),

      // Page filters
      pageFilters: {},
      setPageFilter: (page, filter) =>
        set((state) => ({
          pageFilters: { ...state.pageFilters, [page]: filter },
        })),
      clearPageFilters: (page) =>
        set((state) => ({
          pageFilters: {
            ...state.pageFilters,
            [page]: { conditions: [], activeFilters: {} },
          },
        })),

      // Search queries
      searchQueries: {},
      setSearchQuery: (page, query) =>
        set((state) => ({
          searchQueries: { ...state.searchQueries, [page]: query },
        })),

      // Sort preferences
      sortPreferences: {},
      setSortPreference: (page, field, direction) =>
        set((state) => ({
          sortPreferences: { ...state.sortPreferences, [page]: { field, direction } },
        })),

      // View modes
      viewModes: {},
      setViewMode: (page, mode) =>
        set((state) => ({
          viewModes: { ...state.viewModes, [page]: mode },
        })),

      // Pagination
      pagination: {},
      setPagination: (pageName, page, pageSize) =>
        set((state) => ({
          pagination: {
            ...state.pagination,
            [pageName]: {
              page,
              pageSize: pageSize ?? state.pagination[pageName]?.pageSize ?? 25,
            },
          },
        })),

      // Notifications
      notifications: [],
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              timestamp: new Date().toISOString(),
              read: false,
            },
            ...state.notifications,
          ].slice(0, 100), // Keep max 100 notifications
        })),
      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      unreadCount: () => get().notifications.filter((n) => !n.read).length,

      // Modals
      modals: {},
      openModal: (modalId) =>
        set((state) => ({
          modals: { ...state.modals, [modalId]: true },
        })),
      closeModal: (modalId) =>
        set((state) => ({
          modals: { ...state.modals, [modalId]: false },
        })),
      toggleModal: (modalId) =>
        set((state) => ({
          modals: { ...state.modals, [modalId]: !state.modals[modalId] },
        })),

      // Stale data
      staleDataTimestamp: {},
      markDataStale: (key) =>
        set((state) => ({
          staleDataTimestamp: { ...state.staleDataTimestamp, [key]: Date.now() },
        })),
      isDataStale: (key, maxAge) => {
        const timestamp = get().staleDataTimestamp[key];
        if (!timestamp) return false;
        return Date.now() - timestamp > maxAge;
      },
    }),
    {
      name: 'crm-store',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        kanbanView: state.kanbanView,
        viewModes: state.viewModes,
        sortPreferences: state.sortPreferences,
      }),
    }
  )
);

// Selector hooks for common operations
export const useSelectedRecords = (page: string) =>
  useCRMStore((state) => state.selectedRecords[page] || []);

export const usePageFilter = (page: string) =>
  useCRMStore((state) => state.pageFilters[page] || { conditions: [], activeFilters: {} });

export const useSearchQuery = (page: string) =>
  useCRMStore((state) => state.searchQueries[page] || '');

export const useViewMode = (page: string, defaultMode: 'list' | 'kanban' | 'grid' = 'list') =>
  useCRMStore((state) => state.viewModes[page] || defaultMode);

export const usePagination = (page: string) =>
  useCRMStore((state) => state.pagination[page] || { page: 1, pageSize: 25 });

export const useNotifications = () => useCRMStore((state) => state.notifications);

export const useUnreadNotificationCount = () =>
  useCRMStore((state) => state.notifications.filter((n) => !n.read).length);

export default useCRMStore;
