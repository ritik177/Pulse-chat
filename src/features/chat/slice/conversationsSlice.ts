import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Conversation } from '@/features/chat/types'
import {
  addMember,
  loadBootstrap,
  markRead,
  receiveMessage,
  removeMember,
  sendMessageOptimistic,
  setConversationTyping,
} from '@/features/chat/slice/chatThunks'

interface ConversationsState {
  items: Conversation[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: ConversationsState = {
  items: [],
  status: 'idle',
  error: null,
}

const conversationsSlice = createSlice({
  name: 'conversations',
  initialState,
  reducers: {
    hydrateConversations(_state, action: PayloadAction<ConversationsState>) {
      return { ...action.payload }
    },
    upsertConversation(state, action: PayloadAction<Conversation>) {
      const idx = state.items.findIndex((c) => c.id === action.payload.id)
      if (idx >= 0) state.items[idx] = action.payload
      else state.items.push(action.payload)
    },
    incrementUnread(
      state,
      action: PayloadAction<{ conversationId: string; lastMessageId: string; updatedAt: string }>,
    ) {
      const conv = state.items.find((c) => c.id === action.payload.conversationId)
      if (!conv) return
      conv.unreadCount += 1
      conv.lastMessageId = action.payload.lastMessageId
      conv.updatedAt = action.payload.updatedAt
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadBootstrap.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loadBootstrap.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.conversations
      })
      .addCase(loadBootstrap.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to load conversations'
      })
      .addCase(sendMessageOptimistic.fulfilled, (state, action) => {
        const { message } = action.payload
        const conv = state.items.find((c) => c.id === message.conversationId)
        if (conv) {
          conv.lastMessageId = message.id
          conv.updatedAt = message.createdAt
        }
      })
      .addCase(receiveMessage.fulfilled, (state, action) => {
        const message = action.payload
        const conv = state.items.find((c) => c.id === message.conversationId)
        if (!conv) return
        conv.lastMessageId = message.id
        conv.updatedAt = message.createdAt
        // Unread bump is handled in thunk based on active conversation
      })
      .addCase(markRead.fulfilled, (state, action) => {
        const conv = state.items.find((c) => c.id === action.payload)
        if (conv) conv.unreadCount = 0
      })
      .addCase(setConversationTyping.fulfilled, (state, action) => {
        const { conversationId, userId, typing } = action.payload
        const conv = state.items.find((c) => c.id === conversationId)
        if (!conv) return
        const set = new Set(conv.typingUserIds)
        if (typing) set.add(userId)
        else set.delete(userId)
        conv.typingUserIds = [...set]
      })
      .addCase(addMember.fulfilled, (state, action) => {
        const idx = state.items.findIndex((c) => c.id === action.payload.id)
        if (idx >= 0) state.items[idx] = action.payload
      })
      .addCase(removeMember.fulfilled, (state, action) => {
        const idx = state.items.findIndex((c) => c.id === action.payload.id)
        if (idx >= 0) state.items[idx] = action.payload
      })
  },
})

export const { hydrateConversations, upsertConversation, incrementUnread } =
  conversationsSlice.actions
export default conversationsSlice.reducer
