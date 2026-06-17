import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  title: string
  defaultName: string
  busy?: boolean
  onConfirm: (name: string) => void
  onCancel: () => void
}

export function FilenameDialog({
  open,
  title,
  defaultName,
  busy = false,
  onConfirm,
  onCancel,
}: Props) {
  const [name, setName] = useState(defaultName)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Reset the field whenever the dialog opens, then focus and select the name
  // (without the extension) so it's easy to overwrite.
  useEffect(() => {
    if (!open) return
    setName(defaultName)
    const id = requestAnimationFrame(() => {
      const el = inputRef.current
      if (!el) return
      el.focus()
      el.select()
    })
    return () => cancelAnimationFrame(id)
  }, [open, defaultName])

  if (!open) return null

  const submit = () => {
    const trimmed = name.trim()
    if (!trimmed || busy) return
    onConfirm(trimmed)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onPointerDown={() => !busy && onCancel()}
    >
      <div
        className="w-[min(440px,92vw)] rounded-lg border bg-card p-5 shadow-xl"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <h2 className="m-0 mb-1 text-base font-semibold">{title}</h2>
        <p className="m-0 mb-4 text-sm text-muted-foreground">
          确认文件名后下载
        </p>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                submit()
              } else if (e.key === 'Escape') {
                e.preventDefault()
                if (!busy) onCancel()
              }
            }}
            className="h-9 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            placeholder="请输入文件名"
          />
          <span className="shrink-0 text-sm text-muted-foreground">.pdf</span>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={busy}>
            取消
          </Button>
          <Button onClick={submit} disabled={busy || !name.trim()}>
            {busy ? '下载中…' : '下载'}
          </Button>
        </div>
      </div>
    </div>
  )
}
