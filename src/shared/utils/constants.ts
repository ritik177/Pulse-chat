export const CURRENT_USER_ID = 'user-me'

export const STORAGE_KEYS = {
  chatState: 'pulse-chat-state-v1',
  theme: 'pulse-chat-theme',
  offlineQueue: 'pulse-chat-offline-queue',
} as const

export const MESSAGE_PAGE_SIZE = 50

export const TYPING_TIMEOUT_MS = 2500

export const SEARCH_DEBOUNCE_MS = 300

export const OFFLINE_FLUSH_INTERVAL_MS = 2000

export const REALTIME_TICK_MS = 8000

export const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥'] as const

export const MAX_ATTACHMENT_PREVIEW_BYTES = 5 * 1024 * 1024
