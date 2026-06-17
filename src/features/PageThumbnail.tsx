import { useEffect, useRef, useState } from 'react'
import type { PDFDocumentProxy } from '@/lib/pdfjs'

interface Props {
  doc: PDFDocumentProxy
  pageNumber: number
  selected: boolean
  onSelect: (pageNumber: number) => void
}

const THUMB_WIDTH = 150

export function PageThumbnail({ doc, pageNumber, selected, onSelect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    let renderTask: { cancel: () => void } | null = null

    ;(async () => {
      const page = await doc.getPage(pageNumber)
      if (cancelled) return

      const base = page.getViewport({ scale: 1, rotation: page.rotate })
      const scale = THUMB_WIDTH / base.width
      const viewport = page.getViewport({ scale, rotation: page.rotate })

      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = Math.floor(viewport.width)
      canvas.height = Math.floor(viewport.height)

      renderTask = page.render({ canvasContext: ctx, viewport })
      try {
        await (renderTask as unknown as { promise: Promise<void> }).promise
        if (!cancelled) setReady(true)
      } catch {
        /* render cancelled */
      }
    })()

    return () => {
      cancelled = true
      renderTask?.cancel()
    }
  }, [doc, pageNumber])

  return (
    <button
      type="button"
      className={`thumb ${selected ? 'thumb--selected' : ''}`}
      onClick={() => onSelect(pageNumber)}
      title={`第 ${pageNumber} 页`}
    >
      <canvas ref={canvasRef} className="thumb__canvas" />
      {!ready && <div className="thumb__placeholder" />}
      <span className="thumb__label">{pageNumber}</span>
    </button>
  )
}
