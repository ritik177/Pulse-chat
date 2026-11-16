import {
  format,
  formatDistanceToNowStrict,
  isToday,
  isYesterday,
  isSameDay,
  parseISO,
} from 'date-fns'

export function formatMessageTime(iso: string): string {
  const date = parseISO(iso)
  if (isToday(date)) return format(date, 'HH:mm')
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'dd/MM/yyyy')
}

export function formatFullTimestamp(iso: string): string {
  return format(parseISO(iso), 'dd MMM yyyy · HH:mm')
}

export function formatSidebarTime(iso: string): string {
  const date = parseISO(iso)
  if (isToday(date)) return format(date, 'HH:mm')
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'dd MMM')
}

export function formatRelative(iso: string): string {
  return formatDistanceToNowStrict(parseISO(iso), { addSuffix: true })
}

export function formatDateLabel(iso: string): string {
  const date = parseISO(iso)
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'EEEE, d MMMM yyyy')
}

export function sameDay(a: string, b: string): boolean {
  return isSameDay(parseISO(a), parseISO(b))
}
