import { configureStore, type Middleware } from '@reduxjs/toolkit'
import conversationsReducer from '@/features/chat/slice/conversationsSlice'
import messagesReducer from '@/features/chat/slice/messagesSlice'
import usersReducer from '@/features/chat/slice/usersSlice'
import uiReducer from '@/features/chat/slice/uiSlice'
import {
  loadOfflineQueue,
  loadPersistedState,
  persistState,
  saveOfflineQueue,
} from '@/services/persistence'

const persisted = loadPersistedState()
const offlineQueue = loadOfflineQueue()

export const store = configureStore({
  reducer: {
    conversations: conversationsReducer,
    messages: messagesReducer,
    users: usersReducer,
    ui: uiReducer,
  },
  preloadedState: {
    ...(persisted
      ? {
          conversations: persisted.conversations,
          messages: {
            ...persisted.messages,
            offlineQueue:
              persisted.messages.offlineQueue.length > 0
                ? persisted.messages.offlineQueue
                : offlineQueue,
          },
          ui: {
            ...uiReducer(undefined, { type: '@@init' }),
            activeConversationId: persisted.ui.activeConversationId,
            filter: persisted.ui.filter,
            theme: persisted.ui.theme,
          },
        }
      : {
          messages: {
            ...messagesReducer(undefined, { type: '@@init' }),
            offlineQueue,
          },
        }),
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(((storeApi) => (next) => (action) => {
      const result = next(action)
      const state = storeApi.getState()
      persistState(state)
      saveOfflineQueue(state.messages.offlineQueue)
      return result
    }) as Middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
