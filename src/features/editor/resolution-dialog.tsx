import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  exporting: boolean
  onConfirm: (dpi: number) => void
  onClose: () => void
}

const PRESETS = [150, 300, 600, 960]

/** Modal for choosing the PNG export resolution (DPI) before rendering. */
export function ResolutionDialog({
  open,
  exporting,
  onConfirm,
  onClose,
}: Props) {
  const [dpi, setDpi] = useState(960)

  useEffect(() => {
    if (open) setDpi(960)
  }, [open])

  if (!open) return null

  const valid = Number.isFinite(dpi) && dpi >= 72 && dpi <= 2400

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
