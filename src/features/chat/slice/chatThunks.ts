import { createAsyncThunk } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'
import type {
  Message,
  MessageStatus,
  SendMessagePayload,
  User,
} from '@/features/chat/types'
import {
  addGroupMember,
  deleteMessage as apiDeleteMessage,
  editMessage as apiEditMessage,
  fetchConversations,
  fetchMessages,
  fetchUsers,
  getMockOnline,
  markConversationRead,
  removeGroupMember,
  sendMessage as apiSendMessage,
  setMockOnline,
  toggleReaction as apiToggleReaction,
} from '@/services/mockApi'
import { CURRENT_USER_ID } from '@/shared/utils/constants'

export const loadBootstrap = createAsyncThunk(
  'chat/loadBootstrap',
  async () => {
    const [users, conversations] = await Promise.all([
      fetchUsers(),
      fetchConversations(),
    ])
    return { users, conversations }
  },
)

export const loadConversationMessages = createAsyncThunk(
  'chat/loadConversationMessages',
  async (conversationId: string) => {
    return fetchMessages(conversationId)
  },
)

export const loadOlderMessages = createAsyncThunk(
  'chat/loadOlderMessages',
  async (
    { conversationId }: { conversationId: string },
    { getState },
  ) => {
    const state = getState() as RootState
    const list = state.messages.byConversation[conversationId] ?? []
    const oldest = list[0]
    return {
      conversationId,
      ...(await fetchMessages(conversationId, { before: oldest?.id })),
    }
  },
)

export const sendMessageOptimistic = createAsyncThunk(
  'chat/sendMessageOptimistic',
  async (payload: SendMessagePayload, { dispatch, rejectWithValue }) => {
    if (!getMockOnline()) {
      return rejectWithValue('offline')
    }

    try {
      const message = await apiSendMessage(payload)

      window.setTimeout(() => {
        void dispatch(
          updateMessageStatus({
            conversationId: message.conversationId,
            messageId: message.id,
            status: 'delivered',
          }),
        )
      }, 600)
      window.setTimeout(() => {
        void dispatch(
          updateMessageStatus({
            conversationId: message.conversationId,
            messageId: message.id,
            status: 'read',
          }),
        )
      }, 1400)

      return { message, fromQueue: false }
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Send failed',
      )
    }
  },
)

export const flushOfflineQueue = createAsyncThunk(
  'chat/flushOfflineQueue',
  async (_, { getState, dispatch }) => {
    if (!getMockOnline()) return { flushed: 0 }
    const queue = (getState() as RootState).messages.offlineQueue
    let flushed = 0
    for (const item of queue) {
      try {
        const message = await apiSendMessage(item.payload)
        dispatch({
          type: sendMessageOptimistic.fulfilled.type,
          payload: { message, fromQueue: true },
          meta: { arg: item.payload },
        })
        flushed += 1
      } catch {
        break
      }
    }
    return { flushed }
  },
)

export const receiveMessage = createAsyncThunk(
  'chat/receiveMessage',
  async (message: Message, { getState, dispatch }) => {
    const state = getState() as RootState
    if (state.ui.activeConversationId !== message.conversationId) {
      dispatch({
        type: 'conversations/incrementUnread',
        payload: {
          conversationId: message.conversationId,
          lastMessageId: message.id,
          updatedAt: message.createdAt,
        },
      })
    } else {
      markConversationRead(message.conversationId)
    }
    return message
  },
)

export const markRead = createAsyncThunk(
  'chat/markRead',
  async (conversationId: string) => {
    markConversationRead(conversationId)
    return conversationId
  },
)

export const editMessage = createAsyncThunk(
  'chat/editMessage',
  async ({ messageId, content }: { messageId: string; content: string }) =>
    apiEditMessage(messageId, content),
)

export const deleteMessage = createAsyncThunk(
  'chat/deleteMessage',
  async (messageId: string) => apiDeleteMessage(messageId),
)

export const toggleReaction = createAsyncThunk(
  'chat/toggleReaction',
  async ({ messageId, emoji }: { messageId: string; emoji: string }) =>
    apiToggleReaction(messageId, emoji, CURRENT_USER_ID),
)

export const addMember = createAsyncThunk(
  'chat/addMember',
  async ({ conversationId, userId }: { conversationId: string; userId: string }) =>
    addGroupMember(conversationId, userId),
)

export const removeMember = createAsyncThunk(
  'chat/removeMember',
  async ({ conversationId, userId }: { conversationId: string; userId: string }) =>
    removeGroupMember(conversationId, userId),
)

export const setConversationTyping = createAsyncThunk(
  'chat/setConversationTyping',
  async (payload: { conversationId: string; userId: string; typing: boolean }) =>
    payload,
)

export const updateUserStatus = createAsyncThunk(
  'chat/updateUserStatus',
  async (user: User) => user,
)

export const updateMessageStatus = createAsyncThunk(
  'chat/updateMessageStatus',
  async (payload: {
    conversationId: string
    messageId: string
    status: MessageStatus
  }) => payload,
)

export const setNetworkOnline = createAsyncThunk(
  'chat/setNetworkOnline',
  async (online: boolean) => {
    setMockOnline(online)
    return online
  },
)
