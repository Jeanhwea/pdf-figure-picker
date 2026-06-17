import { useRef, useState } from 'react'
import { FileText } from 'lucide-react'

import { cn } from '@/lib/utils'

interface Props {
  loading: boolean
  error: string | null
  onFile: (file: File) => void
}

export function Dropzone({ loading, error, onFile }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const pick = (files: FileList | null) => {
    const file = files?.[0]
    if (file && file.type === 'application/pdf') {
      onFile(file)
    }
  }

  return (
    <div
      className={cn(
        'w-[min(560px,90vw)] cursor-pointer rounded-xl border-2 border-dashed bg-card px-8 py-14 text-center transition-colors hover:border-primary hover:bg-accent',
        dragOver && 'border-primary bg-accent'
      )}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        pick(e.dataTransfer.files)
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        hidden
        onChange={(e) => pick(e.target.files)}
      />
      <FileText className="mx-auto size-12 text-muted-foreground" />
      <p className="mt-4 mb-1.5 text-lg font-medium">
        {loading ? '正在打开 PDF…' : '点击或拖拽 PDF 文件到此处'}
      </p>
      <p className="m-0 text-sm text-muted-foreground">
        支持多页 PDF，选择任意一页进行裁剪
      </p>
      {error && <p className="mt-3.5 text-sm text-destructive">{error}</p>}
    </div>
  )
}
