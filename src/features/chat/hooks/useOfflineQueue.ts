import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { flushOfflineQueue, setNetworkOnline } from '@/features/chat/slice/chatThunks'
import { setIsOnline } from '@/features/chat/slice/uiSlice'
import { setMockOnline } from '@/services/mockApi'
import { OFFLINE_FLUSH_INTERVAL_MS } from '@/shared/utils/constants'

export function useOfflineQueue() {
  const dispatch = useAppDispatch()
  const queueLength = useAppSelector((s) => s.messages.offlineQueue.length)
  const isOnline = useAppSelector((s) => s.ui.isOnline)

  useEffect(() => {
    const onOnline = () => {
      setMockOnline(true)
      dispatch(setIsOnline(true))
      void dispatch(setNetworkOnline(true))
      void dispatch(flushOfflineQueue())
    }
    const onOffline = () => {
      setMockOnline(false)
      dispatch(setIsOnline(false))
      void dispatch(setNetworkOnline(false))
    }

    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [dispatch])

  useEffect(() => {
    if (!isOnline || queueLength === 0) return
    const id = window.setInterval(() => {
      void dispatch(flushOfflineQueue())
    }, OFFLINE_FLUSH_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [dispatch, isOnline, queueLength])

  return { queueLength, isOnline }
}
