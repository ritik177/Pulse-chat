import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { loadBootstrap } from '@/features/chat/slice/chatThunks'
import { Sidebar } from '@/features/chat/components/Sidebar/Sidebar'
import { ChatWindow } from '@/features/chat/components/ChatWindow/ChatWindow'
import { useTheme } from '@/features/chat/hooks/useTheme'
import { useOfflineQueue } from '@/features/chat/hooks/useOfflineQueue'
import { startRealtimeSimulator } from '@/services/realtimeSimulator'
import { store } from '@/app/store'

export function ChatLayout() {
  const dispatch = useAppDispatch()
  const status = useAppSelector((s) => s.conversations.status)
  useTheme()
  useOfflineQueue()

  useEffect(() => {
    if (status === 'idle') {
      void dispatch(loadBootstrap())
    }
  }, [dispatch, status])

  useEffect(() => {
    return startRealtimeSimulator(store.getState, store.dispatch)
  }, [])

  const retry = () => {
    void dispatch(loadBootstrap())
  }

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-[var(--canvas)]">
      <Sidebar onRetry={retry} />
      <ChatWindow />
    </div>
  )
}
