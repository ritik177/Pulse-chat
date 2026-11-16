import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Message, QueuedMessage } from '@/features/chat/types'
import {
  deleteMessage,
  editMessage,
  loadConversationMessages,
  loadOlderMessages,
  receiveMessage,
  sendMessageOptimistic,
  toggleReaction,
  updateMessageStatus,
} from '@/features/chat/slice/chatThunks'
import { CURRENT_USER_ID } from '@/shared/utils/constants'

interface MessagesState {
  byConversation: Record<string, Message[]>
  hasMore: Record<string, boolean>
  loadingOlder: Record<string, boolean>
  statusByConversation: Record<string, 'idle' | 'loading' | 'succeeded' | 'failed'>
  error: string | null
  offlineQueue: QueuedMessage[]
}

const initialState: MessagesState = {
  byConversation: {},
  hasMore: {},
  loadingOlder: {},
  statusByConversation: {},
  error: null,
  offlineQueue: [],
}

function upsertMessage(list: Message[], message: Message): Message[] {
  const byClient = message.clientId
    ? list.findIndex((m) => m.clientId === message.clientId)
    : -1
  const byId = list.findIndex((m) => m.id === message.id)
  const idx = byClient >= 0 ? byClient : byId
  if (idx >= 0) {
    const next = [...list]
    next[idx] = { ...next[idx], ...message }
    return next
  }
  return [...list, message].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    hydrateMessages(_state, action: PayloadAction<MessagesState>) {
      return { ...action.payload }
    },
    enqueueOffline(state, action: PayloadAction<QueuedMessage>) {
      state.offlineQueue.push(action.payload)
    },
    dequeueOffline(state, action: PayloadAction<string>) {
      state.offlineQueue = state.offlineQueue.filter(
        (q) => q.payload.clientId !== action.payload,
      )
    },
    setOfflineQueue(state, action: PayloadAction<QueuedMessage[]>) {
      state.offlineQueue = action.payload
    },
    replaceConversationMessages(
      state,
      action: PayloadAction<{ conversationId: string; messages: Message[]; hasMore: boolean }>,
    ) {
      const { conversationId, messages, hasMore } = action.payload
      state.byConversation[conversationId] = messages
      state.hasMore[conversationId] = hasMore
      state.statusByConversation[conversationId] = 'succeeded'
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadConversationMessages.pending, (state, action) => {
        state.statusByConversation[action.meta.arg] = 'loading'
        state.error = null
      })
      .addCase(loadConversationMessages.fulfilled, (state, action) => {
        const conversationId = action.meta.arg
        state.byConversation[conversationId] = action.payload.messages
        state.hasMore[conversationId] = action.payload.hasMore
        state.statusByConversation[conversationId] = 'succeeded'
      })
      .addCase(loadConversationMessages.rejected, (state, action) => {
        state.statusByConversation[action.meta.arg] = 'failed'
        state.error = action.error.message ?? 'Failed to load messages'
      })
      .addCase(sendMessageOptimistic.pending, (state, action) => {
        const { conversationId, content, replyToId, attachments, clientId } =
          action.meta.arg
        const optimistic: Message = {
          id: `temp-${clientId}`,
          conversationId,
          senderId: CURRENT_USER_ID,
          content,
          createdAt: new Date().toISOString(),
          status: 'sending',
          replyToId,
          reactions: [],
          attachments: attachments ?? [],
          clientId,
        }
        state.byConversation[conversationId] = upsertMessage(
          state.byConversation[conversationId] ?? [],
          optimistic,
        )
      })
      .addCase(sendMessageOptimistic.fulfilled, (state, action) => {
        const { message, fromQueue } = action.payload
        state.byConversation[message.conversationId] = upsertMessage(
          state.byConversation[message.conversationId] ?? [],
          message,
        )
        if (fromQueue) {
          state.offlineQueue = state.offlineQueue.filter(
            (q) => q.payload.clientId !== message.clientId,
          )
        }
      })
      .addCase(sendMessageOptimistic.rejected, (state, action) => {
        const payload = action.meta.arg
        const { conversationId, clientId } = payload
        const list = state.byConversation[conversationId]
        if (list) {
          state.byConversation[conversationId] = list.map((m) =>
            m.clientId === clientId ? { ...m, status: 'failed' as const } : m,
          )
        }
        const alreadyQueued = state.offlineQueue.some(
          (q) => q.payload.clientId === clientId,
        )
        if (!alreadyQueued) {
          state.offlineQueue.push({
            payload,
            enqueuedAt: new Date().toISOString(),
            attempts: action.payload === 'offline' ? 0 : 1,
          })
        }
      })
      .addCase(receiveMessage.fulfilled, (state, action) => {
        const message = action.payload
        state.byConversation[message.conversationId] = upsertMessage(
          state.byConversation[message.conversationId] ?? [],
          message,
        )
      })
      .addCase(updateMessageStatus.fulfilled, (state, action) => {
        const { conversationId, messageId, status } = action.payload
        const list = state.byConversation[conversationId]
        if (!list) return
        state.byConversation[conversationId] = list.map((m) =>
          m.id === messageId || m.clientId === messageId ? { ...m, status } : m,
        )
      })
      .addCase(editMessage.fulfilled, (state, action) => {
        const message = action.payload
        state.byConversation[message.conversationId] = upsertMessage(
          state.byConversation[message.conversationId] ?? [],
          message,
        )
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        const message = action.payload
        state.byConversation[message.conversationId] = upsertMessage(
          state.byConversation[message.conversationId] ?? [],
          message,
        )
      })
      .addCase(toggleReaction.fulfilled, (state, action) => {
        const message = action.payload
        state.byConversation[message.conversationId] = upsertMessage(
          state.byConversation[message.conversationId] ?? [],
          message,
        )
      })
      .addCase(loadOlderMessages.pending, (state, action) => {
        state.loadingOlder[action.meta.arg.conversationId] = true
      })
      .addCase(loadOlderMessages.fulfilled, (state, action) => {
        const { conversationId, messages, hasMore } = action.payload
        const existing = state.byConversation[conversationId] ?? []
        const merged = [...messages, ...existing]
        const seen = new Set<string>()
        state.byConversation[conversationId] = merged.filter((m) => {
          if (seen.has(m.id)) return false
          seen.add(m.id)
          return true
        })
        state.hasMore[conversationId] = hasMore
        state.loadingOlder[conversationId] = false
      })
      .addCase(loadOlderMessages.rejected, (state, action) => {
        state.loadingOlder[action.meta.arg.conversationId] = false
        state.error = action.error.message ?? 'Failed to load older messages'
      })
  },
})

export const {
  hydrateMessages,
  enqueueOffline,
  dequeueOffline,
  setOfflineQueue,
  replaceConversationMessages,
} = messagesSlice.actions

export default messagesSlice.reducer
