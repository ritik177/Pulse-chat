import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ConversationFilter, ThemeMode } from '@/features/chat/types'
import { STORAGE_KEYS } from '@/shared/utils/constants'

interface UiState {
  activeConversationId: string | null
  filter: ConversationFilter
  searchQuery: string
  messageSearchQuery: string
  theme: ThemeMode
  replyToId: string | null
  editingMessageId: string | null
  showGroupPanel: boolean
  showMobileChat: boolean
  isOnline: boolean
}

function detectTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.theme) as ThemeMode | null
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // ignore
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const initialState: UiState = {
  activeConversationId: null,
  filter: 'all',
  searchQuery: '',
  messageSearchQuery: '',
  theme: typeof window !== 'undefined' ? detectTheme() : 'light',
  replyToId: null,
  editingMessageId: null,
  showGroupPanel: false,
  showMobileChat: false,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    hydrateUi(state, action: PayloadAction<Partial<UiState>>) {
      Object.assign(state, action.payload)
    },
    setActiveConversation(state, action: PayloadAction<string | null>) {
      state.activeConversationId = action.payload
      state.replyToId = null
      state.editingMessageId = null
      state.messageSearchQuery = ''
      state.showMobileChat = action.payload !== null
      if (action.payload) state.showGroupPanel = false
    },
    setFilter(state, action: PayloadAction<ConversationFilter>) {
      state.filter = action.payload
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload
    },
    setMessageSearchQuery(state, action: PayloadAction<string>) {
      state.messageSearchQuery = action.payload
    },
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.theme = action.payload
      try {
        localStorage.setItem(STORAGE_KEYS.theme, action.payload)
      } catch {
        // ignore
      }
    },
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(STORAGE_KEYS.theme, state.theme)
      } catch {
        // ignore
      }
    },
    setReplyTo(state, action: PayloadAction<string | null>) {
      state.replyToId = action.payload
      state.editingMessageId = null
    },
    setEditingMessage(state, action: PayloadAction<string | null>) {
      state.editingMessageId = action.payload
      state.replyToId = null
    },
    toggleGroupPanel(state) {
      state.showGroupPanel = !state.showGroupPanel
    },
    setShowGroupPanel(state, action: PayloadAction<boolean>) {
      state.showGroupPanel = action.payload
    },
    setShowMobileChat(state, action: PayloadAction<boolean>) {
      state.showMobileChat = action.payload
      if (!action.payload) state.activeConversationId = null
    },
    setIsOnline(state, action: PayloadAction<boolean>) {
      state.isOnline = action.payload
    },
  },
})

export const {
  hydrateUi,
  setActiveConversation,
  setFilter,
  setSearchQuery,
  setMessageSearchQuery,
  setTheme,
  toggleTheme,
  setReplyTo,
  setEditingMessage,
  toggleGroupPanel,
  setShowGroupPanel,
  setShowMobileChat,
  setIsOnline,
} = uiSlice.actions

export default uiSlice.reducer
