import { v4 as uuid } from 'uuid'
import type { AppDispatch, RootState } from '@/app/store'
import {
  receiveMessage,
  setConversationTyping,
  updateUserStatus,
} from '@/features/chat/slice/chatThunks'
import {
  appendIncomingMessage,
  getMockOnline,
  getUserStore,
  setTyping,
  updateUserStatuses,
} from '@/services/mockApi'
import { CURRENT_USER_ID, REALTIME_TICK_MS } from '@/shared/utils/constants'
import type { Message } from '@/features/chat/types'

const inboundSnippets = [
  'Quick question when you have a sec.',
  'Looks good on my end 👍',
  'Pushed a small tweak — refresh when free.',
  'Can we sync on this tomorrow?',
  'Typing this from the mock WebSocket layer ✨',
]

/**
 * Simulates a WebSocket feed: typing events, inbound messages, presence flips.
 * Separated from UI; dispatches through Redux thunks only.
 */
export function startRealtimeSimulator(
  getState: () => RootState,
  dispatch: AppDispatch,
): () => void {
  let cancelled = false

  const tick = async () => {
    if (cancelled || !getMockOnline()) return

    const state = getState()
    const conversations = state.conversations.items
    if (!conversations.length) return

    const conv = conversations[Math.floor(Math.random() * conversations.length)]!
    const others = conv.participantIds.filter((id) => id !== CURRENT_USER_ID)
    if (!others.length) return
    const userId = others[Math.floor(Math.random() * others.length)]!

    const roll = Math.random()

    if (roll < 0.35) {
      setTyping(conv.id, userId, true)
      dispatch(setConversationTyping({ conversationId: conv.id, userId, typing: true }))
      window.setTimeout(() => {
        if (cancelled) return
        setTyping(conv.id, userId, false)
        dispatch(setConversationTyping({ conversationId: conv.id, userId, typing: false }))
      }, 1800 + Math.random() * 1600)
      return
    }

    if (roll < 0.75) {
      const message: Message = {
        id: uuid(),
        conversationId: conv.id,
        senderId: userId,
        content: inboundSnippets[Math.floor(Math.random() * inboundSnippets.length)]!,
        createdAt: new Date().toISOString(),
        status: 'delivered',
        reactions: [],
        attachments: [],
      }
      appendIncomingMessage(message)
      setTyping(conv.id, userId, false)
      dispatch(setConversationTyping({ conversationId: conv.id, userId, typing: false }))
      dispatch(receiveMessage(message))
      return
    }

    const statuses = ['online', 'away', 'offline'] as const
    const next = statuses[Math.floor(Math.random() * statuses.length)]!
    updateUserStatuses({ [userId]: next })
    const user = getUserStore().find((u) => u.id === userId)
    if (user) dispatch(updateUserStatus(user))
  }

  const id = window.setInterval(() => {
    void tick()
  }, REALTIME_TICK_MS)

  return () => {
    cancelled = true
    window.clearInterval(id)
  }
}
