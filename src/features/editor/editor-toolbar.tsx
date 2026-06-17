import { Crop, FileDown, FolderOpen, Loader2, Minus, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import { useOpenPdf } from '@/hooks/use-open-pdf'

interface Props {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
  hasCrop: boolean
  exportingCrop: boolean
  exportingPage: boolean
  onDownloadCrop: () => void
  onDownloadPage: () => void
  onFile: (file: File) => void
}

/** Right-hand controls in the editor header: zoom, exports, open and theme. */
export function EditorToolbar({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  hasCrop,
  exportingCrop,
  exportingPage,
  onDownloadCrop,
  onDownloadPage,
  onFile,
}: Props) {
  const { open, inputProps } = useOpenPdf(onFile)

  return (
    <>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" onClick={onZoomOut} title="缩小">
          <Minus />
        </Button>
        <Button
          variant="outline"
          className="min-w-14 tabular-nums"
          onClick={onResetZoom}
          title="恢复 100%"
        >
          {Math.round(zoom * 100)}%
        </Button>
        <Button variant="outline" size="icon" onClick={onZoomIn} title="放大">
          <Plus />
        </Button>
      </div>
      <Button
        variant="outline"
        size="icon"
        disabled={exportingPage}
        onClick={onDownloadPage}
        title="下载本页"
      >
        {exportingPage ? <Loader2 className="animate-spin" /> : <FileDown />}
        <span className="sr-only">下载本页</span>
      </Button>
      <Button
        size="icon"
        disabled={!hasCrop || exportingCrop}
        onClick={onDownloadCrop}
        title="下载裁剪后的 PDF"
      >
        {exportingCrop ? <Loader2 className="animate-spin" /> : <Crop />}
        <span className="sr-only">下载裁剪后的 PDF</span>
      </Button>
      <Button
        variant="secondary"
        size="icon"
        onClick={open}
        title="打开其他 PDF"
      >
        <FolderOpen />
        <span className="sr-only">打开其他 PDF</span>
      </Button>
      <input {...inputProps} />
      <ModeToggle />
    </>
  )
}
