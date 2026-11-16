import { AlertTriangle } from 'lucide-react'
import { EmptyState } from '@/shared/components/EmptyState'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  message = 'Something went wrong.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center">
      <EmptyState
        icon={<AlertTriangle className="h-10 w-10" />}
        title="Unable to load"
        description={message}
      />
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          Try again
        </button>
      )}
    </div>
  )
}
