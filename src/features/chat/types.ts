export type UserStatus = 'online' | 'away' | 'offline'

export type ConversationFilter = 'all' | 'unread' | 'groups'

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed'

export type ConversationType = 'direct' | 'group'

export interface User {
  id: string
  name: string
  avatarUrl: string
  status: UserStatus
  phone?: string
  about?: string
  lastSeenAt?: string
}

export interface Reaction {
  emoji: string
  userIds: string[]
}

export interface Attachment {
  id: string
  name: string
  mimeType: string
  size: number
  /** Object URL or data URL for local preview */
  previewUrl: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  createdAt: string
  updatedAt?: string
  status: MessageStatus
  replyToId?: string
  reactions: Reaction[]
  attachments: Attachment[]
  isDeleted?: boolean
  clientId?: string
}

export interface Conversation {
  id: string
  type: ConversationType
  name: string
  avatarUrl?: string
  participantIds: string[]
  lastMessageId?: string
  unreadCount: number
  updatedAt: string
  typingUserIds: string[]
  isPinned?: boolean
}

export interface SendMessagePayload {
  conversationId: string
  content: string
  replyToId?: string
  attachments?: Attachment[]
  clientId: string
}

export interface QueuedMessage {
  payload: SendMessagePayload
  enqueuedAt: string
  attempts: number
}

export interface GroupMemberAction {
  conversationId: string
  userId: string
}

export type ThemeMode = 'light' | 'dark'
