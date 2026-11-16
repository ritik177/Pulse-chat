import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Paperclip, SendHorizontal, X } from 'lucide-react'
import { v4 as uuid } from 'uuid'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  editMessage,
  sendMessageOptimistic,
} from '@/features/chat/slice/chatThunks'
import {
  setEditingMessage,
  setReplyTo,
} from '@/features/chat/slice/uiSlice'
import type { Attachment } from '@/features/chat/types'
import { MAX_ATTACHMENT_PREVIEW_BYTES } from '@/shared/utils/constants'

interface FormValues {
  content: string
}

export function MessageInput({ conversationId }: { conversationId: string }) {
  const dispatch = useAppDispatch()
  const replyToId = useAppSelector((s) => s.ui.replyToId)
  const editingMessageId = useAppSelector((s) => s.ui.editingMessageId)
  const messages = useAppSelector(
    (s) => s.messages.byConversation[conversationId] ?? [],
  )
  const users = useAppSelector((s) => s.users.byId)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  const replyTo = replyToId ? messages.find((m) => m.id === replyToId) : undefined
  const editing = editingMessageId
    ? messages.find((m) => m.id === editingMessageId)
    : undefined

  const { register, handleSubmit, reset, setValue, setFocus, watch } =
    useForm<FormValues>({
      defaultValues: { content: '' },
    })

  const content = watch('content')

  useEffect(() => {
    if (editing) {
      setValue('content', editing.content)
      setFocus('content')
    }
  }, [editing, setFocus, setValue])

  const onFiles = (files: FileList | null) => {
    if (!files) return
    const next: Attachment[] = []
    Array.from(files).forEach((file) => {
      if (file.size > MAX_ATTACHMENT_PREVIEW_BYTES) return
      next.push({
        id: uuid(),
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        previewUrl: URL.createObjectURL(file),
      })
    })
    setAttachments((prev) => [...prev, ...next])
  }

  const clearComposerMeta = () => {
    dispatch(setReplyTo(null))
    dispatch(setEditingMessage(null))
    setAttachments((prev) => {
      prev.forEach((a) => URL.revokeObjectURL(a.previewUrl))
      return []
    })
  }

  const onSubmit = handleSubmit((values) => {
    const text = values.content.trim()
    if (!text && attachments.length === 0) return

    if (editing) {
      void dispatch(editMessage({ messageId: editing.id, content: text }))
      reset({ content: '' })
      clearComposerMeta()
      return
    }

    void dispatch(
      sendMessageOptimistic({
        conversationId,
        content: text,
        replyToId: replyToId ?? undefined,
        attachments,
        clientId: uuid(),
      }),
    )
    reset({ content: '' })
    dispatch(setReplyTo(null))
    setAttachments([])
  })

  return (
    <form
      onSubmit={onSubmit}
      className="border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3"
    >
      {(replyTo || editing) && (
        <div className="mb-2 flex items-start justify-between gap-2 rounded-lg bg-[var(--surface-muted)] px-3 py-2 text-sm">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[var(--accent)]">
              {editing ? 'Editing message' : `Replying to ${users[replyTo!.senderId]?.name ?? 'user'}`}
            </p>
            <p className="truncate text-[var(--text-muted)]">
              {(editing ?? replyTo)?.content}
            </p>
          </div>
          <button
            type="button"
            onClick={clearComposerMeta}
            className="rounded-md p-1 text-[var(--text-muted)] hover:bg-[var(--surface)]"
            aria-label="Cancel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
          {attachments.map((file) => (
            <div
              key={file.id}
              className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[var(--border)]"
            >
              {file.mimeType.startsWith('image/') ? (
                <img
                  src={file.previewUrl}
                  alt={file.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-[var(--surface-muted)] p-1 text-[10px]">
                  {file.name}
                </div>
              )}
              <button
                type="button"
                className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"
                onClick={() => {
                  URL.revokeObjectURL(file.previewUrl)
                  setAttachments((prev) => prev.filter((a) => a.id !== file.id))
                }}
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-2.5 text-[var(--text-muted)] transition hover:text-[var(--text)]"
          aria-label="Attach file"
        >
          <Paperclip className="h-4 w-4" />
        </button>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept="image/*,.pdf,.txt,.json"
          multiple
          onChange={(e) => {
            onFiles(e.target.files)
            e.target.value = ''
          }}
        />

        <textarea
          {...register('content')}
          rows={1}
          placeholder="Type a message"
          aria-label="Message"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              void onSubmit()
            }
            if (e.key === 'Escape') clearComposerMeta()
          }}
          className="max-h-32 min-h-[42px] flex-1 resize-none rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 text-sm text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
        />

        <button
          type="submit"
          disabled={!content.trim() && attachments.length === 0}
          className="rounded-xl bg-[var(--accent)] p-2.5 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Send message"
        >
          <SendHorizontal className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-1.5 hidden text-[11px] text-[var(--text-muted)] lg:block">
        Enter to send · Shift+Enter for new line · Esc to cancel
      </p>
    </form>
  )
}
