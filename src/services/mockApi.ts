import { v4 as uuid } from 'uuid'
import type {
  Conversation,
  Message,
  SendMessagePayload,
  User,
} from '@/features/chat/types'
import {
  conversations as seedConversations,
  generateHistoryMessages,
  seedMessages,
  users,
} from '@/services/mockData'
import { CURRENT_USER_ID, MESSAGE_PAGE_SIZE } from '@/shared/utils/constants'

const delay = (ms = 250 + Math.random() * 350) =>
  new Promise((resolve) => setTimeout(resolve, ms))

let conversationStore = structuredClone(seedConversations)
let messageStore = structuredClone(seedMessages)
let userStore = structuredClone(users)
let isOnline = true

export function setMockOnline(online: boolean) {
  isOnline = online
}

export function getMockOnline() {
  return isOnline
}

export async function fetchUsers(): Promise<User[]> {
  await delay()
  return structuredClone(userStore)
}

export async function fetchConversations(): Promise<Conversation[]> {
  await delay()
  if (!isOnline) throw new Error('Network unavailable')
  return structuredClone(conversationStore)
}

export async function fetchMessages(
  conversationId: string,
  options?: { before?: string; limit?: number },
): Promise<{ messages: Message[]; hasMore: boolean }> {
  await delay(200)
  if (!isOnline) throw new Error('Network unavailable')

  const limit = options?.limit ?? MESSAGE_PAGE_SIZE
  let all = messageStore
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  // Ensure deep history exists for virtualization demos
  if (all.length < 120) {
    const oldest = all[0]?.createdAt ?? new Date().toISOString()
    const generated = generateHistoryMessages(conversationId, 200, oldest)
    messageStore = [...generated, ...messageStore]
    all = messageStore
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }

  const before = options?.before
  const endIndex = before
    ? all.findIndex((m) => m.id === before)
    : all.length

  const sliceEnd = endIndex < 0 ? all.length : endIndex
  const sliceStart = Math.max(0, sliceEnd - limit)
  const page = all.slice(sliceStart, sliceEnd)

  return {
    messages: structuredClone(page),
    hasMore: sliceStart > 0,
  }
}

export async function sendMessage(payload: SendMessagePayload): Promise<Message> {
  await delay(400)
  if (!isOnline) throw new Error('Network unavailable')

  const now = new Date().toISOString()
  const message: Message = {
    id: uuid(),
    conversationId: payload.conversationId,
    senderId: CURRENT_USER_ID,
    content: payload.content.trim(),
    createdAt: now,
    status: 'sent',
    replyToId: payload.replyToId,
    reactions: [],
    attachments: payload.attachments ?? [],
    clientId: payload.clientId,
  }

  messageStore.push(message)
  conversationStore = conversationStore.map((c) =>
    c.id === payload.conversationId
      ? {
          ...c,
          lastMessageId: message.id,
          updatedAt: now,
          typingUserIds: c.typingUserIds.filter((id) => id !== CURRENT_USER_ID),
        }
      : c,
  )

  return structuredClone(message)
}

export async function editMessage(
  messageId: string,
  content: string,
): Promise<Message> {
  await delay(200)
  const target = messageStore.find((m) => m.id === messageId)
  if (!target) throw new Error('Message not found')
  target.content = content.trim()
  target.updatedAt = new Date().toISOString()
  return structuredClone(target)
}

export async function deleteMessage(messageId: string): Promise<Message> {
  await delay(200)
  const target = messageStore.find((m) => m.id === messageId)
  if (!target) throw new Error('Message not found')
  target.isDeleted = true
  target.content = ''
  target.updatedAt = new Date().toISOString()
  return structuredClone(target)
}

export async function toggleReaction(
  messageId: string,
  emoji: string,
  userId: string,
): Promise<Message> {
  await delay(150)
  const target = messageStore.find((m) => m.id === messageId)
  if (!target) throw new Error('Message not found')

  const existing = target.reactions.find((r) => r.emoji === emoji)
  if (!existing) {
    target.reactions.push({ emoji, userIds: [userId] })
  } else if (existing.userIds.includes(userId)) {
    existing.userIds = existing.userIds.filter((id) => id !== userId)
    target.reactions = target.reactions.filter((r) => r.userIds.length > 0)
  } else {
    existing.userIds.push(userId)
  }

  return structuredClone(target)
}

export async function addGroupMember(
  conversationId: string,
  userId: string,
): Promise<Conversation> {
  await delay(250)
  const conv = conversationStore.find((c) => c.id === conversationId)
  if (!conv || conv.type !== 'group') throw new Error('Group not found')
  if (!conv.participantIds.includes(userId)) {
    conv.participantIds = [...conv.participantIds, userId]
  }
  return structuredClone(conv)
}

export async function removeGroupMember(
  conversationId: string,
  userId: string,
): Promise<Conversation> {
  await delay(250)
  const conv = conversationStore.find((c) => c.id === conversationId)
  if (!conv || conv.type !== 'group') throw new Error('Group not found')
  if (userId === CURRENT_USER_ID) throw new Error('Cannot remove yourself')
  conv.participantIds = conv.participantIds.filter((id) => id !== userId)
  return structuredClone(conv)
}

export function getUserStore() {
  return userStore
}

export function updateUserStatuses(patch: Partial<Record<string, User['status']>>) {
  userStore = userStore.map((u) =>
    patch[u.id] ? { ...u, status: patch[u.id]! } : u,
  )
}

export function appendIncomingMessage(message: Message) {
  messageStore.push(message)
  conversationStore = conversationStore.map((c) =>
    c.id === message.conversationId
      ? {
          ...c,
          lastMessageId: message.id,
          updatedAt: message.createdAt,
          unreadCount: c.unreadCount + 1,
        }
      : c,
  )
}

export function setTyping(conversationId: string, userId: string, typing: boolean) {
  conversationStore = conversationStore.map((c) => {
    if (c.id !== conversationId) return c
    const set = new Set(c.typingUserIds)
    if (typing) set.add(userId)
    else set.delete(userId)
    return { ...c, typingUserIds: [...set] }
  })
}

export function markConversationRead(conversationId: string) {
  conversationStore = conversationStore.map((c) =>
    c.id === conversationId ? { ...c, unreadCount: 0 } : c,
  )
}

export function resetMockStores() {
  conversationStore = structuredClone(seedConversations)
  messageStore = structuredClone(seedMessages)
  userStore = structuredClone(users)
  isOnline = true
}
