import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/features/chat/hooks/useTheme'

export function ThemeToggle() {
  const { isDark, toggle } = useTheme()

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-2 text-[var(--text-muted)] transition hover:text-[var(--text)]"
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}
