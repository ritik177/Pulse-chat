import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'
import type { Conversation } from '@/features/chat/types'

const selectConversations = (state: RootState) => state.conversations.items
const selectFilter = (state: RootState) => state.ui.filter
const selectSearchQuery = (state: RootState) => state.ui.searchQuery
const selectMessagesByConversation = (state: RootState) =>
  state.messages.byConversation

export const selectFilteredConversations = createSelector(
  [selectConversations, selectFilter, selectSearchQuery, selectMessagesByConversation],
  (conversations, filter, searchQuery, messagesByConversation) => {
    const q = searchQuery.trim().toLowerCase()

    let list: Conversation[] = [...conversations]

    if (filter === 'unread') {
      list = list.filter((c) => c.unreadCount > 0)
    } else if (filter === 'groups') {
      list = list.filter((c) => c.type === 'group')
    }

    if (q) {
      list = list.filter((c) => {
        if (c.name.toLowerCase().includes(q)) return true
        const last = messagesByConversation[c.id]?.find((m) => m.id === c.lastMessageId)
        return last?.content.toLowerCase().includes(q) ?? false
      })
    }

    return list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return b.updatedAt.localeCompare(a.updatedAt)
    })
  },
)

export const selectActiveConversation = createSelector(
  [
    selectConversations,
    (state: RootState) => state.ui.activeConversationId,
  ],
  (conversations, activeId) =>
    conversations.find((c) => c.id === activeId) ?? null,
)

export const selectActiveMessages = createSelector(
  [
    selectMessagesByConversation,
    (state: RootState) => state.ui.activeConversationId,
    (state: RootState) => state.ui.messageSearchQuery,
  ],
  (byConversation, activeId, messageSearch) => {
    if (!activeId) return []
    const list = byConversation[activeId] ?? []
    const q = messageSearch.trim().toLowerCase()
    if (!q) return list
    return list.filter((m) => !m.isDeleted && m.content.toLowerCase().includes(q))
  },
)

export const selectLastMessage = (conversationId: string) =>
  createSelector(
    [
      (state: RootState) => state.messages.byConversation[conversationId],
      (state: RootState) =>
        state.conversations.items.find((c) => c.id === conversationId)?.lastMessageId,
    ],
    (messages, lastId) => {
      if (!messages?.length) return null
      if (lastId) return messages.find((m) => m.id === lastId) ?? messages.at(-1) ?? null
      return messages.at(-1) ?? null
    },
  )
