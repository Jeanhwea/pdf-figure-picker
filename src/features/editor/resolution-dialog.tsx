import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { PDFDocumentProxy } from '@/lib/pdfjs'

interface Props {
  open: boolean
  exporting: boolean
  doc: PDFDocumentProxy
  pageNumber: number
  onConfirm: (dpi: number) => void
  onClose: () => void
}

const PRESETS = [150, 300, 600, 960]
const PDF_POINTS_PER_INCH = 72
/** Rough PNG bytes-per-pixel for rendered figures; used only for a preview estimate. */
const EST_BYTES_PER_PIXEL = 1.2

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

/** Modal for choosing the PNG export resolution (DPI) before rendering. */
export function ResolutionDialog({
  open,
  exporting,
  doc,
  pageNumber,
  onConfirm,
  onClose,
}: Props) {
  const [dpi, setDpi] = useState(960)
  const [pageSize, setPageSize] = useState<{
    width: number
    height: number
  } | null>(null)

  useEffect(() => {
    if (open) setDpi(960)
  }, [open])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    ;(async () => {
      const page = await doc.getPage(pageNumber)
      const viewport = page.getViewport({ scale: 1, rotation: page.rotate })
      if (!cancelled)
        setPageSize({ width: viewport.width, height: viewport.height })
    })()
    return () => {
      cancelled = true
    }
  }, [open, doc, pageNumber])

  if (!open) return null

  const valid = Number.isFinite(dpi) && dpi >= 72 && dpi <= 2400

  const scale = valid ? dpi / PDF_POINTS_PER_INCH : 0
  const pxW = pageSize ? Math.floor(pageSize.width * scale) : 0
  const pxH = pageSize ? Math.floor(pageSize.height * scale) : 0
  const megaPixels = (pxW * pxH) / 1_000_000
  const estBytes = pxW * pxH * EST_BYTES_PER_PIXEL

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-80 rounded-lg border bg-card p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="m-0 text-base font-semibold">导出为 PNG</h2>
        <p className="mt-1 mb-4 text-sm text-muted-foreground">
          设置导出分辨率，DPI 越高图片越清晰、体积越大
        </p>

        <label className="flex items-center gap-2 text-sm">
          <span className="shrink-0">分辨率</span>
          <input
            type="number"
            min={72}
            max={2400}
            value={dpi}
            autoFocus
            onChange={(e) => setDpi(Number(e.target.value))}
            className="w-full rounded-md border bg-background px-2 py-1 text-sm tabular-nums outline-none focus:ring-2 focus:ring-ring"
          />
          <span className="shrink-0 text-muted-foreground">DPI</span>
        </label>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <Button
              key={p}
              variant={dpi === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDpi(p)}
            >
              {p}
            </Button>
          ))}
        </div>

        <div className="mt-4 space-y-1 rounded-md bg-muted/50 px-3 py-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">输出分辨率</span>
            <span className="tabular-nums">
              {valid && pageSize ? (
                `${pxW} × ${pxH} px`
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">预计大小</span>
            <span className="tabular-nums">
              {valid && pageSize ? (
                `约 ${formatBytes(estBytes)}（${megaPixels.toFixed(1)} 百万像素）`
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </span>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={exporting}>
            取消
          </Button>
          <Button onClick={() => onConfirm(dpi)} disabled={exporting || !valid}>
            {exporting && <Loader2 className="animate-spin" />}
            导出
          </Button>
        </div>
      </div>
    </div>
  )
}
