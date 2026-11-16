import { describe, expect, it } from 'vitest'
import messagesReducer, {
  enqueueOffline,
} from '@/features/chat/slice/messagesSlice'
import { sendMessageOptimistic } from '@/features/chat/slice/chatThunks'

describe('messagesSlice', () => {
  it('creates an optimistic message on pending send', () => {
    const state = messagesReducer(
      undefined,
      sendMessageOptimistic.pending('req-1', {
        conversationId: 'conv-aria',
        content: 'Hello',
        clientId: 'client-1',
      }),
    )

    const list = state.byConversation['conv-aria'] ?? []
    expect(list).toHaveLength(1)
    expect(list[0]?.content).toBe('Hello')
    expect(list[0]?.status).toBe('sending')
    expect(list[0]?.clientId).toBe('client-1')
  })

  it('queues failed/offline sends', () => {
    let state = messagesReducer(
      undefined,
      sendMessageOptimistic.pending('req-1', {
        conversationId: 'conv-aria',
        content: 'Queued',
        clientId: 'client-2',
      }),
    )

    state = messagesReducer(
      state,
      sendMessageOptimistic.rejected(
        new Error('offline'),
        'req-1',
        {
          conversationId: 'conv-aria',
          content: 'Queued',
          clientId: 'client-2',
        },
        'offline',
      ),
    )

    expect(state.offlineQueue).toHaveLength(1)
    expect(state.offlineQueue[0]?.payload.clientId).toBe('client-2')
    expect(state.byConversation['conv-aria']?.[0]?.status).toBe('failed')
  })

  it('supports manual offline enqueue', () => {
    const state = messagesReducer(
      undefined,
      enqueueOffline({
        payload: {
          conversationId: 'conv-aria',
          content: 'Later',
          clientId: 'client-3',
        },
        enqueuedAt: new Date().toISOString(),
        attempts: 0,
      }),
    )
    expect(state.offlineQueue).toHaveLength(1)
  })
})
