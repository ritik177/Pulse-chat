import { cn } from '@/shared/utils/cn'
import type { UserStatus } from '@/features/chat/types'

interface AvatarProps {
  name: string
  src?: string
  size?: 'sm' | 'md' | 'lg'
  status?: UserStatus
  className?: string
}

const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
}

const statusColor: Record<UserStatus, string> = {
  online: 'bg-emerald-500',
  away: 'bg-amber-400',
  offline: 'bg-zinc-400',
}

export function Avatar({ name, src, size = 'md', status, className }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className={cn('relative shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn(
            'rounded-full object-cover bg-[var(--surface-muted)]',
            sizeMap[size],
          )}
        />
      ) : (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-[var(--accent-soft)] font-semibold text-[var(--accent)]',
            sizeMap[size],
          )}
        >
          {initials}
        </div>
      )}
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-[var(--surface)]',
            statusColor[status],
          )}
          aria-label={status}
        />
      )}
    </div>
  )
}
