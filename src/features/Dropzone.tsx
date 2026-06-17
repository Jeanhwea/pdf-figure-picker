import { useRef, useState } from 'react'

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
      className={`dropzone ${dragOver ? 'dropzone--over' : ''}`}
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
      <div className="dropzone__icon">📄</div>
      <p className="dropzone__title">
        {loading ? '正在打开 PDF…' : '点击或拖拽 PDF 文件到此处'}
      </p>
      <p className="dropzone__sub">支持多页 PDF，选择任意一页进行裁剪</p>
      {error && <p className="dropzone__error">{error}</p>}
    </div>
  )
}
