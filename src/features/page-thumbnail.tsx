import { useEffect, useRef, useState } from 'react'
import type { PDFDocumentProxy } from '@/lib/pdfjs'

import { cn } from '@/lib/utils'

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
      className={cn(
        'relative block w-full rounded-lg border-2 border-transparent bg-secondary p-1.5 transition-colors hover:border-border',
        selected && 'border-primary hover:border-primary'
      )}
      onClick={() => onSelect(pageNumber)}
      title={`第 ${pageNumber} 页`}
    >
      <canvas
        ref={canvasRef}
        className="block h-auto w-full rounded-sm bg-white"
      />
      {!ready && (
        <div className="absolute inset-1.5 rounded-sm bg-muted-foreground/20" />
      )}
      <span className="absolute right-2.5 bottom-2.5 rounded-full bg-black/60 px-1.5 py-px text-[11px] text-white">
        {pageNumber}
      </span>
    </button>
  )
}
