import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { toggleTheme } from '@/features/chat/slice/uiSlice'

export function useTheme() {
  const theme = useAppSelector((s) => s.ui.theme)
  const dispatch = useAppDispatch()

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.dataset.theme = theme
  }, [theme])

  return {
    theme,
    toggle: () => dispatch(toggleTheme()),
    isDark: theme === 'dark',
  }
}
