import { formatDateLabel } from '@/shared/utils/format'

export function DateSeparator({ iso }: { iso: string }) {
  return (
    <div className="my-3 flex items-center justify-center">
      <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-[11px] font-medium text-[var(--text-muted)] shadow-sm">
        {formatDateLabel(iso)}
      </span>
    </div>
  )
}
