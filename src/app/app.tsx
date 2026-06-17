import { useCallback, useMemo, useRef, useState } from 'react'
import { Crop, FileDown, FolderOpen, Loader2, Minus, Plus } from 'lucide-react'

import { usePdfDocument } from '@/hooks/use-pdf-document'
import {
  cropPdfPage,
  extractPdfPage,
  saveWithPicker,
  type PdfRect,
} from '@/lib/crop-pdf'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import { Dropzone } from '@/features/dropzone'
import { PageThumbnail } from '@/features/page-thumbnail'
import { CropStage } from '@/features/crop-stage'

const ZOOM_MIN = 0.25
const ZOOM_MAX = 8
const ZOOM_STEP = 1.25

export function App() {
  const { pdf, loading, error, load } = usePdfDocument()
  const [selectedPage, setSelectedPage] = useState(1)
  const [crop, setCrop] = useState<PdfRect | null>(null)
  const [zoom, setZoom] = useState(1)
  const [exporting, setExporting] = useState(false)
  const [exportingPage, setExportingPage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const zoomIn = useCallback(
    () => setZoom((z) => Math.min(ZOOM_MAX, z * ZOOM_STEP)),
    []
  )
  const zoomOut = useCallback(
    () => setZoom((z) => Math.max(ZOOM_MIN, z / ZOOM_STEP)),
    []
  )

  const handleFile = useCallback(
    (file: File) => {
      setSelectedPage(1)
      setCrop(null)
      setZoom(1)
      load(file)
    },
    [load]
  )

  const handleSelectPage = useCallback((pageNumber: number) => {
    setSelectedPage(pageNumber)
    setCrop(null)
    setZoom(1)
  }, [])

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file && file.type === 'application/pdf') {
        handleFile(file)
      }
      // Reset so picking the same file again still fires onChange.
      e.target.value = ''
    },
    [handleFile]
  )

  const handleDownload = useCallback(async () => {
    if (!pdf || !crop) return
    const base = pdf.fileName.replace(/\.pdf$/i, '')
    setExporting(true)
    try {
      await saveWithPicker(`${base}-p${selectedPage}-cropped.pdf`, () =>
        cropPdfPage(pdf.sourceBytes, selectedPage - 1, crop)
      )
    } catch (err) {
      console.error(err)
      alert('裁剪导出失败：' + (err instanceof Error ? err.message : '未知错误'))
    } finally {
      setExporting(false)
    }
  }, [pdf, crop, selectedPage])

  const handleDownloadPage = useCallback(async () => {
    if (!pdf) return
    const base = pdf.fileName.replace(/\.pdf$/i, '')
    setExportingPage(true)
    try {
      await saveWithPicker(`${base}-p${selectedPage}.pdf`, () =>
        extractPdfPage(pdf.sourceBytes, selectedPage - 1)
      )
    } catch (err) {
      console.error(err)
      alert('下载本页失败：' + (err instanceof Error ? err.message : '未知错误'))
    } finally {
      setExportingPage(false)
    }
  }, [pdf, selectedPage])

  const pageNumbers = useMemo(
    () => (pdf ? Array.from({ length: pdf.numPages }, (_, i) => i + 1) : []),
    [pdf]
  )

  if (!pdf) {
    return (
      <div className="flex h-full flex-col">
        <header className="flex items-center gap-4 border-b bg-card px-4 py-2.5">
          <h1 className="m-0 text-base font-semibold">PDF Figure Picker</h1>
          <span className="text-xs text-muted-foreground tabular-nums">
            v{__APP_VERSION__}
          </span>
          <div className="flex-1" />
          <ModeToggle />
        </header>
        <main className="grid flex-1 place-items-center p-10">
          <Dropzone loading={loading} error={error} onFile={handleFile} />
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-4 border-b bg-card px-4 py-2.5">
        <h1 className="m-0 text-base font-semibold">PDF Figure Picker</h1>
        <span className="text-xs text-muted-foreground tabular-nums">
          v{__APP_VERSION__}
        </span>
        <span
          className="max-w-90 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-muted-foreground"
          title={pdf.fileName}
        >
          {pdf.fileName} · 共 {pdf.numPages} 页
        </span>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={zoomOut} title="缩小">
            <Minus />
          </Button>
          <Button
            variant="outline"
            className="min-w-14 tabular-nums"
            onClick={() => setZoom(1)}
            title="恢复 100%"
          >
            {Math.round(zoom * 100)}%
          </Button>
          <Button variant="outline" size="icon" onClick={zoomIn} title="放大">
            <Plus />
          </Button>
        </div>
        <Button
          variant="outline"
          size="icon"
          disabled={exportingPage}
          onClick={handleDownloadPage}
          title="下载本页"
        >
          {exportingPage ? <Loader2 className="animate-spin" /> : <FileDown />}
          <span className="sr-only">下载本页</span>
        </Button>
        <Button
          size="icon"
          disabled={!crop || exporting}
          onClick={handleDownload}
          title="下载裁剪后的 PDF"
        >
          {exporting ? <Loader2 className="animate-spin" /> : <Crop />}
          <span className="sr-only">下载裁剪后的 PDF</span>
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={openFileDialog}
          title="打开其他 PDF"
        >
          <FolderOpen />
          <span className="sr-only">打开其他 PDF</span>
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          hidden
          onChange={handleInputChange}
        />
        <ModeToggle />
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[190px] shrink-0 flex-col gap-3 overflow-y-auto border-r bg-sidebar p-3">
          {pageNumbers.map((n) => (
            <PageThumbnail
              key={n}
              doc={pdf.doc}
              pageNumber={n}
              selected={n === selectedPage}
              onSelect={handleSelectPage}
            />
          ))}
        </aside>

        <main className="flex min-w-0 flex-1">
          <CropStage
            key={selectedPage}
            doc={pdf.doc}
            pageNumber={selectedPage}
            crop={crop}
            zoom={zoom}
            onCropChange={setCrop}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
          />
        </main>
      </div>
    </div>
  )
}
