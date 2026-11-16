import type { Conversation, Message, User } from '@/features/chat/types'
import { CURRENT_USER_ID } from '@/shared/utils/constants'

const avatar = (seed: string) =>
  `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}`

export const users: User[] = [
  {
    id: CURRENT_USER_ID,
    name: 'You',
    avatarUrl: avatar('me'),
    status: 'online',
  },
  {
    id: 'user-aria',
    name: 'Aria Chen',
    avatarUrl: avatar('aria'),
    status: 'online',
  },
  {
    id: 'user-jordan',
    name: 'Jordan Lee',
    avatarUrl: avatar('jordan'),
    status: 'away',
    lastSeenAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    id: 'user-sam',
    name: 'Sam Okonkwo',
    avatarUrl: avatar('sam'),
    status: 'online',
  },
  {
    id: 'user-maya',
    name: 'Maya Patel',
    avatarUrl: avatar('maya'),
    status: 'offline',
    lastSeenAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'user-noah',
    name: 'Noah Berg',
    avatarUrl: avatar('noah'),
    status: 'online',
  },
  {
    id: 'user-priya',
    name: 'Priya Shah',
    avatarUrl: avatar('priya'),
    status: 'away',
    lastSeenAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
  },
  {
    id: 'user-leo',
    name: 'Leo Martins',
    avatarUrl: avatar('leo'),
    status: 'offline',
    lastSeenAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
]

const now = Date.now()
const mins = (m: number) => new Date(now - m * 60_000).toISOString()
const hours = (h: number) => new Date(now - h * 3_600_000).toISOString()
const days = (d: number) => new Date(now - d * 86_400_000).toISOString()

export const conversations: Conversation[] = [
  {
    id: 'conv-aria',
    type: 'direct',
    name: 'Aria Chen',
    avatarUrl: avatar('aria'),
    participantIds: [CURRENT_USER_ID, 'user-aria'],
    lastMessageId: 'msg-aria-3',
    unreadCount: 2,
    updatedAt: mins(2),
    typingUserIds: [],
    isPinned: true,
  },
  {
    id: 'conv-design',
    type: 'group',
    name: 'Design Systems',
    avatarUrl: avatar('design-systems'),
    participantIds: [CURRENT_USER_ID, 'user-aria', 'user-maya', 'user-noah', 'user-priya'],
    lastMessageId: 'msg-design-4',
    unreadCount: 5,
    updatedAt: mins(12),
    typingUserIds: [],
  },
  {
    id: 'conv-jordan',
    type: 'direct',
    name: 'Jordan Lee',
    avatarUrl: avatar('jordan'),
    participantIds: [CURRENT_USER_ID, 'user-jordan'],
    lastMessageId: 'msg-jordan-2',
    unreadCount: 0,
    updatedAt: hours(1),
    typingUserIds: [],
  },
  {
    id: 'conv-eng',
    type: 'group',
    name: 'Engineering',
    avatarUrl: avatar('engineering'),
    participantIds: [CURRENT_USER_ID, 'user-sam', 'user-jordan', 'user-leo', 'user-noah'],
    lastMessageId: 'msg-eng-3',
    unreadCount: 0,
    updatedAt: hours(3),
    typingUserIds: [],
  },
  {
    id: 'conv-sam',
    type: 'direct',
    name: 'Sam Okonkwo',
    avatarUrl: avatar('sam'),
    participantIds: [CURRENT_USER_ID, 'user-sam'],
    lastMessageId: 'msg-sam-1',
    unreadCount: 1,
    updatedAt: days(1),
    typingUserIds: [],
  },
  {
    id: 'conv-product',
    type: 'group',
    name: 'Product Sync',
    avatarUrl: avatar('product'),
    participantIds: [CURRENT_USER_ID, 'user-maya', 'user-priya', 'user-aria'],
    lastMessageId: 'msg-product-2',
    unreadCount: 0,
    updatedAt: days(2),
    typingUserIds: [],
  },
]

function msg(
  partial: Omit<Message, 'reactions' | 'attachments' | 'status'> &
    Partial<Pick<Message, 'reactions' | 'attachments' | 'status' | 'replyToId' | 'updatedAt'>>,
): Message {
  return {
    reactions: [],
    attachments: [],
    status: 'read',
    ...partial,
  }
}

/** Seed messages — older pages are generated on demand for infinite scroll demos */
export const seedMessages: Message[] = [
  msg({
    id: 'msg-aria-1',
    conversationId: 'conv-aria',
    senderId: 'user-aria',
    content: 'Hey! Did you get a chance to review the new chat mocks?',
    createdAt: hours(5),
  }),
  msg({
    id: 'msg-aria-2',
    conversationId: 'conv-aria',
    senderId: CURRENT_USER_ID,
    content: 'Yes — love the sidebar filters. Unread + Groups is exactly what we need.',
    createdAt: hours(4),
    status: 'read',
  }),
  msg({
    id: 'msg-aria-3',
    conversationId: 'conv-aria',
    senderId: 'user-aria',
    content: 'Perfect. Can we also add reply threading and emoji reactions for the take-home?',
    createdAt: mins(2),
    replyToId: 'msg-aria-2',
  }),

  msg({
    id: 'msg-design-1',
    conversationId: 'conv-design',
    senderId: 'user-maya',
    content: 'Token naming proposal is in Figma — please leave comments by EOD.',
    createdAt: days(1),
  }),
  msg({
    id: 'msg-design-2',
    conversationId: 'conv-design',
    senderId: 'user-noah',
    content: 'Spacing scale looks good. Should we keep 4px base or move to 8?',
    createdAt: hours(6),
  }),
  msg({
    id: 'msg-design-3',
    conversationId: 'conv-design',
    senderId: CURRENT_USER_ID,
    content: 'Keep 4px for denser chat UI; bump section padding with 8.',
    createdAt: hours(5),
    reactions: [{ emoji: '👍', userIds: ['user-noah', 'user-aria'] }],
  }),
  msg({
    id: 'msg-design-4',
    conversationId: 'conv-design',
    senderId: 'user-priya',
    content: 'Dark theme contrast on message bubbles needs one more pass.',
    createdAt: mins(12),
  }),

  msg({
    id: 'msg-jordan-1',
    conversationId: 'conv-jordan',
    senderId: CURRENT_USER_ID,
    content: 'Standup notes are in the doc. Ping me if blockers.',
    createdAt: hours(2),
    status: 'delivered',
  }),
  msg({
    id: 'msg-jordan-2',
    conversationId: 'conv-jordan',
    senderId: 'user-jordan',
    content: 'Thanks — unblock me on the Virtuoso list and I am good.',
    createdAt: hours(1),
  }),

  msg({
    id: 'msg-eng-1',
    conversationId: 'conv-eng',
    senderId: 'user-sam',
    content: 'Redux Toolkit slices look clean. Persistence middleware next?',
    createdAt: hours(8),
  }),
  msg({
    id: 'msg-eng-2',
    conversationId: 'conv-eng',
    senderId: 'user-leo',
    content: 'Yes — LocalStorage for state + offline queue for sends.',
    createdAt: hours(7),
  }),
  msg({
    id: 'msg-eng-3',
    conversationId: 'conv-eng',
    senderId: CURRENT_USER_ID,
    content: 'Ship it. I will wire optimistic updates this afternoon.',
    createdAt: hours(3),
    status: 'read',
    reactions: [{ emoji: '🔥', userIds: ['user-sam'] }],
  }),

  msg({
    id: 'msg-sam-1',
    conversationId: 'conv-sam',
    senderId: 'user-sam',
    content: 'Coffee later? Want to pair on the message search UX.',
    createdAt: days(1),
  }),

  msg({
    id: 'msg-product-1',
    conversationId: 'conv-product',
    senderId: 'user-maya',
    content: 'Roadmap review moved to Thursday 2pm.',
    createdAt: days(3),
  }),
  msg({
    id: 'msg-product-2',
    conversationId: 'conv-product',
    senderId: 'user-priya',
    content: 'Noted — I will bring attachment preview demo.',
    createdAt: days(2),
  }),
]

/** Generate a large history for virtualization / infinite scroll demos */
export function generateHistoryMessages(
  conversationId: string,
  count: number,
  endBefore: string,
): Message[] {
  const end = new Date(endBefore).getTime()
  const participantPool =
    conversations.find((c) => c.id === conversationId)?.participantIds.filter(
      (id) => id !== CURRENT_USER_ID,
    ) ?? ['user-aria']

  const samples = [
    'Can you take a look at this?',
    'Sounds good to me.',
    'Let me circle back after lunch.',
    'Shipping a small fix now.',
    'Agreed — let’s keep the API surface thin.',
    'I’ll update the README with trade-offs.',
    'Virtualized lists make this feel snappy.',
    'Optimistic UI is working well here.',
    'Should we debounce search at 300ms?',
    'Dark mode tokens look balanced.',
  ]

  const messages: Message[] = []
  for (let i = 0; i < count; i++) {
    const createdAt = new Date(end - (count - i) * 90_000).toISOString()
    const fromMe = i % 5 === 0
    messages.push(
      msg({
        id: `hist-${conversationId}-${endBefore}-${i}`,
        conversationId,
        senderId: fromMe
          ? CURRENT_USER_ID
          : participantPool[i % participantPool.length]!,
        content: samples[i % samples.length]!,
        createdAt,
        status: fromMe ? 'read' : 'delivered',
      }),
    )
  }
  return messages
}

export const usersById = Object.fromEntries(users.map((u) => [u.id, u])) as Record<
  string,
  User
>
