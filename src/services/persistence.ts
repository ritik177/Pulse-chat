import type { Conversation, ConversationFilter, Message, QueuedMessage, ThemeMode } from '@/features/chat/types'
import { STORAGE_KEYS } from '@/shared/utils/constants'

export interface PersistedChatState {
  conversations: {
    items: Conversation[]
    status: 'idle' | 'loading' | 'succeeded' | 'failed'
    error: string | null
  }
  messages: {
    byConversation: Record<string, Message[]>
    hasMore: Record<string, boolean>
    loadingOlder: Record<string, boolean>
    statusByConversation: Record<
      string,
      'idle' | 'loading' | 'succeeded' | 'failed'
    >
    error: string | null
    offlineQueue: QueuedMessage[]
  }
  ui: {
    activeConversationId: string | null
    filter: ConversationFilter
    theme: ThemeMode
  }
}

export function loadPersistedState(): PersistedChatState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.chatState)
    if (!raw) return null
    return JSON.parse(raw) as PersistedChatState
  } catch {
    return null
  }
}

export function persistState(state: {
  conversations: PersistedChatState['conversations']
  messages: PersistedChatState['messages']
  ui: { activeConversationId: string | null; filter: ConversationFilter; theme: ThemeMode }
}): void {
  try {
    const payload: PersistedChatState = {
      conversations: state.conversations,
      messages: {
        ...state.messages,
        byConversation: Object.fromEntries(
          Object.entries(state.messages.byConversation).map(([id, list]) => [
            id,
            list.slice(-500),
          ]),
        ),
      },
      ui: {
        activeConversationId: state.ui.activeConversationId,
        filter: state.ui.filter,
        theme: state.ui.theme,
      },
    }
    localStorage.setItem(STORAGE_KEYS.chatState, JSON.stringify(payload))
  } catch {
    // Quota / private mode — fail silently
  }
}

export function loadOfflineQueue(): QueuedMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.offlineQueue)
    if (!raw) return []
    return JSON.parse(raw) as QueuedMessage[]
  } catch {
    return []
  }
}

export function saveOfflineQueue(queue: QueuedMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.offlineQueue, JSON.stringify(queue))
  } catch {
    // ignore
  }
}

export function clearPersistedState(): void {
  localStorage.removeItem(STORAGE_KEYS.chatState)
  localStorage.removeItem(STORAGE_KEYS.offlineQueue)
}
