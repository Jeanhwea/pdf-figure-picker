import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PageViewport, PDFDocumentProxy } from '@/lib/pdfjs'
import type { PdfRect } from '@/lib/crop-pdf'

interface Props {
  doc: PDFDocumentProxy
  pageNumber: number
  crop: PdfRect | null
  zoom: number
  onCropChange: (rect: PdfRect | null) => void
  onZoomIn: () => void
  onZoomOut: () => void
}

interface Box {
  x: number
  y: number
  w: number
  h: number
}

export function CropStage({
  doc,
  pageNumber,
  crop,
  zoom,
  onCropChange,
  onZoomIn,
  onZoomOut,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const viewportRef = useRef<PageViewport | null>(null)
  const dprRef = useRef<number>(1)

  const [containerWidth, setContainerWidth] = useState(0)
  const [renderTick, setRenderTick] = useState(0)

  // Transient box (CSS px) shown while the user is dragging a new selection.
  const [dragBox, setDragBox] = useState<Box | null>(null)
  const dragStart = useRef<{ x: number; y: number } | null>(null)

  // Track available width so the page can fit on first render.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0
      if (w > 0) setContainerWidth(w)
    })
    ro.observe(el)
    setContainerWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  // Render the selected page at the current zoom level.
  useEffect(() => {
    if (containerWidth <= 0) return
    let cancelled = false
    let renderTask: { cancel: () => void } | null = null

    ;(async () => {
      const page = await doc.getPage(pageNumber)
      if (cancelled) return

      const base = page.getViewport({ scale: 1, rotation: page.rotate })
      // Available width minus stage padding, used as the "fit" baseline.
      const fitScale = Math.max((containerWidth - 48) / base.width, 0.05)
      const dpr = window.devicePixelRatio || 1
      dprRef.current = dpr

      const viewport = page.getViewport({
        scale: fitScale * zoom * dpr,
        rotation: page.rotate,
      })
      viewportRef.current = viewport

      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = Math.floor(viewport.width)
      canvas.height = Math.floor(viewport.height)
      canvas.style.width = `${base.width * fitScale * zoom}px`
      canvas.style.height = `${base.height * fitScale * zoom}px`

      renderTask = page.render({ canvasContext: ctx, viewport })
      try {
        await (renderTask as unknown as { promise: Promise<void> }).promise
        if (!cancelled) setRenderTick((t) => t + 1)
      } catch {
        /* render cancelled */
      }
    })()

    return () => {
      cancelled = true
      renderTask?.cancel()
    }
  }, [doc, pageNumber, containerWidth, zoom])

  // Persisted selection rectangle, derived from the PDF-space crop so it stays
  // correct across zoom changes. eslint: renderTick keeps it in sync with the
  // latest viewport stored in the ref.
  const cropBox = useMemo<Box | null>(() => {
    const viewport = viewportRef.current
    if (!crop || !viewport) return null
    void renderTick
    const dpr = dprRef.current
    const [vx0, vy0] = viewport.convertToViewportPoint(crop.x, crop.y)
    const [vx1, vy1] = viewport.convertToViewportPoint(
      crop.x + crop.width,
      crop.y + crop.height
    )
    return {
      x: Math.min(vx0, vx1) / dpr,
      y: Math.min(vy0, vy1) / dpr,
      w: Math.abs(vx1 - vx0) / dpr,
      h: Math.abs(vy1 - vy0) / dpr,
    }
  }, [crop, renderTick])

  const toLocal = useCallback((e: React.PointerEvent) => {
    const canvas = canvasRef.current!
    const r = canvas.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - r.left, r.width))
    const y = Math.max(0, Math.min(e.clientY - r.top, r.height))
    return { x, y }
  }, [])

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    const p = toLocal(e)
    dragStart.current = p
    setDragBox({ x: p.x, y: p.y, w: 0, h: 0 })
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragStart.current) return
    const p = toLocal(e)
    const s = dragStart.current
    setDragBox({
      x: Math.min(s.x, p.x),
      y: Math.min(s.y, p.y),
      w: Math.abs(p.x - s.x),
      h: Math.abs(p.y - s.y),
    })
  }

  const onPointerUp = () => {
    if (!dragStart.current) return
    dragStart.current = null
    const b = dragBox
    setDragBox(null)

    const viewport = viewportRef.current
    if (!b || !viewport || b.w < 4 || b.h < 4) {
      onCropChange(null)
      return
    }
    const dpr = dprRef.current
    const [px0, py0] = viewport.convertToPdfPoint(b.x * dpr, b.y * dpr)
    const [px1, py1] = viewport.convertToPdfPoint(
      (b.x + b.w) * dpr,
      (b.y + b.h) * dpr
    )
    onCropChange({
      x: Math.min(px0, px1),
      y: Math.min(py0, py1),
      width: Math.abs(px1 - px0),
      height: Math.abs(py1 - py0),
    })
  }

  const zoomIn = () => onZoomIn()
  const zoomOut = () => onZoomOut()

  // Ctrl/Cmd + wheel to zoom.
  const onWheel = (e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return
    e.preventDefault()
    if (e.deltaY < 0) zoomIn()
    else zoomOut()
  }

  const activeBox = dragBox ?? cropBox

  return (
    <div className="flex min-w-0 flex-1 flex-col" ref={containerRef}>
      <div
        className="flex min-h-0 flex-1 items-start justify-center overflow-auto p-6"
        onWheel={onWheel}
      >
        <div className="relative m-auto inline-block shrink-0 leading-[0] shadow-2xl">
          <canvas
            ref={canvasRef}
            className="block cursor-crosshair touch-none bg-white"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          />
          {activeBox && activeBox.w > 0 && activeBox.h > 0 && (
            <div
              className="pointer-events-none absolute border-[1.5px] border-primary bg-primary/20"
              style={{
                left: activeBox.x,
                top: activeBox.y,
                width: activeBox.w,
                height: activeBox.h,
              }}
            />
          )}
        </div>
      </div>

      <p className="m-0 border-t bg-card px-4 py-2 text-center text-sm text-muted-foreground">
        在页面上拖动鼠标框选要裁剪的区域 · 按住 Ctrl 滚动滚轮可缩放
      </p>
    </div>
  )
}
