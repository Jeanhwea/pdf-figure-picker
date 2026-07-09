import { useState } from 'react'
import {
  Crop,
  FileDown,
  FileImage,
  FolderOpen,
  Loader2,
  Maximize,
  Minus,
  Plus,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import { useOpenPdf } from '@/hooks/use-open-pdf'
import { ResolutionDialog } from '@/features/editor/resolution-dialog'
import type { PDFDocumentProxy } from '@/lib/pdfjs'

interface Props {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
  onFitScreen: () => void
  hasCrop: boolean
  exportingCrop: boolean
  exportingPage: boolean
  exportingPng: boolean
  doc: PDFDocumentProxy
  selectedPage: number
  onDownloadCrop: () => void
  onDownloadPage: () => void
  onDownloadPng: (dpi: number) => void
  onFile: (file: File) => void
}

export function EditorToolbar({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitScreen,
  hasCrop,
  exportingCrop,
  exportingPage,
  exportingPng,
  doc,
  selectedPage,
  onDownloadCrop,
  onDownloadPage,
  onDownloadPng,
  onFile,
}: Props) {
  const { open, inputProps } = useOpenPdf(onFile)
  const [pngDialogOpen, setPngDialogOpen] = useState(false)

  const handleConfirmPng = (dpi: number) => {
    setPngDialogOpen(false)
    onDownloadPng(dpi)
  }

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
        <Button
          variant="outline"
          size="icon"
          onClick={onFitScreen}
          title="适应屏幕"
        >
          <Maximize />
          <span className="sr-only">适应屏幕</span>
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
        variant="outline"
        size="icon"
        disabled={exportingPng}
        onClick={() => setPngDialogOpen(true)}
        title="转为 PNG"
      >
        {exportingPng ? <Loader2 className="animate-spin" /> : <FileImage />}
        <span className="sr-only">转为 PNG</span>
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
      <ResolutionDialog
        open={pngDialogOpen}
        exporting={exportingPng}
        doc={doc}
        pageNumber={selectedPage}
        onConfirm={handleConfirmPng}
        onClose={() => setPngDialogOpen(false)}
      />
    </>
  )
}
