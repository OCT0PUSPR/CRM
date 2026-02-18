import { io, Socket } from 'socket.io-client';
import { queryClient, queryKeys } from '../lib/queryClient';
import { useCRMStore } from '../stores/crmStore';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3219';

let socket: Socket | null = null;
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

// Event types from server
interface RecordEvent {
  model: string;
  id: number;
  fields?: string[];
}

interface NotificationEvent {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
}

// Map Odoo models to query keys
const modelToQueryKey: Record<string, () => readonly string[]> = {
  'crm.lead': () => queryKeys.leads.all,
  'res.partner': () => queryKeys.contacts.all,
  'sale.order': () => queryKeys.quotations.all,
  'mail.activity': () => queryKeys.activities.all,
  'crm.stage': () => queryKeys.stages.all,
  'crm.tag': () => queryKeys.tags.all,
};

// Initialize socket connection
export function initializeSocket(sessionId: string, tenantId: string) {
  if (socket?.connected) {
    return socket;
  }

  socket = io(WS_URL, {
    auth: {
      sessionId,
      tenantId,
    },
    reconnection: true,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 30000,
    transports: ['websocket', 'polling'],
  });

  // Connection events
  socket.on('connect', () => {
    console.log('[WebSocket] Connected');
    isConnected = true;
    reconnectAttempts = 0;

    // Subscribe to relevant channels
    socket?.emit('subscribe', {
      channels: ['leads', 'opportunities', 'contacts', 'activities', 'quotations'],
    });
  });

  socket.on('disconnect', (reason) => {
    console.log('[WebSocket] Disconnected:', reason);
    isConnected = false;
  });

  socket.on('connect_error', (error) => {
    console.error('[WebSocket] Connection error:', error);
    reconnectAttempts++;

    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error('[WebSocket] Max reconnection attempts reached');
      useCRMStore.getState().addNotification({
        type: 'warning',
        title: 'Connection Lost',
        message: 'Real-time updates are temporarily unavailable. Data will refresh automatically.',
      });
    }
  });

  // Data events
  socket.on('record.created', (event: RecordEvent) => {
    console.log('[WebSocket] Record created:', event);
    handleRecordChange(event);
  });

  socket.on('record.updated', (event: RecordEvent) => {
    console.log('[WebSocket] Record updated:', event);
    handleRecordChange(event);
  });

  socket.on('record.deleted', (event: RecordEvent) => {
    console.log('[WebSocket] Record deleted:', event);
    handleRecordChange(event);
  });

  // Notification events
  socket.on('notification', (event: NotificationEvent) => {
    console.log('[WebSocket] Notification:', event);
    useCRMStore.getState().addNotification({
      type: event.type,
      title: event.title,
      message: event.message,
    });
  });

  return socket;
}

// Handle record changes - invalidate relevant queries
function handleRecordChange(event: RecordEvent) {
  const queryKeyFn = modelToQueryKey[event.model];

  if (queryKeyFn) {
    // Invalidate all queries for this model
    queryClient.invalidateQueries({ queryKey: queryKeyFn() });

    // Mark data as potentially stale
    useCRMStore.getState().markDataStale(event.model);
  }

  // Also invalidate dashboard stats as they depend on multiple models
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
}

// Disconnect socket
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    isConnected = false;
  }
}

// Check connection status
export function isSocketConnected() {
  return isConnected;
}

// Get socket instance
export function getSocket() {
  return socket;
}

// Emit events (for future use - e.g., collaborative editing)
export function emitEvent(event: string, data: unknown) {
  if (socket?.connected) {
    socket.emit(event, data);
  } else {
    console.warn('[WebSocket] Cannot emit event - not connected');
  }
}

// Subscribe to specific channels
export function subscribeToChannels(channels: string[]) {
  if (socket?.connected) {
    socket.emit('subscribe', { channels });
  }
}

// Unsubscribe from channels
export function unsubscribeFromChannels(channels: string[]) {
  if (socket?.connected) {
    socket.emit('unsubscribe', { channels });
  }
}

// React hook for socket connection status
export function useSocketStatus() {
  return isConnected;
}

export default {
  initializeSocket,
  disconnectSocket,
  isSocketConnected,
  getSocket,
  emitEvent,
  subscribeToChannels,
  unsubscribeFromChannels,
};
