import { useCallback, useMemo, useState } from 'react'
import { usePdfDocument } from '@/hooks/usePdfDocument'
import { cropPdfPage, extractPdfPage, downloadBytes, type PdfRect } from '@/lib/cropPdf'
import { Dropzone } from '@/features/Dropzone'
import { PageThumbnail } from '@/features/PageThumbnail'
import { CropStage } from '@/features/CropStage'
import './App.css'

const ZOOM_MIN = 0.25
const ZOOM_MAX = 8
const ZOOM_STEP = 1.25

export function App() {
  const { pdf, loading, error, load, reset } = usePdfDocument()
  const [selectedPage, setSelectedPage] = useState(1)
  const [crop, setCrop] = useState<PdfRect | null>(null)
  const [zoom, setZoom] = useState(1)
  const [exporting, setExporting] = useState(false)
  const [exportingPage, setExportingPage] = useState(false)

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

  const handleClose = useCallback(() => {
    reset()
    setSelectedPage(1)
    setCrop(null)
    setZoom(1)
  }, [reset])

  const handleDownload = useCallback(async () => {
    if (!pdf || !crop) return
    setExporting(true)
    try {
      const bytes = await cropPdfPage(pdf.sourceBytes, selectedPage - 1, crop)
      const base = pdf.fileName.replace(/\.pdf$/i, '')
      downloadBytes(bytes, `${base}-p${selectedPage}-cropped.pdf`)
    } catch (err) {
      console.error(err)
      alert('裁剪导出失败：' + (err instanceof Error ? err.message : '未知错误'))
    } finally {
      setExporting(false)
    }
  }, [pdf, crop, selectedPage])

  const handleDownloadPage = useCallback(async () => {
    if (!pdf) return
    setExportingPage(true)
    try {
      const bytes = await extractPdfPage(pdf.sourceBytes, selectedPage - 1)
      const base = pdf.fileName.replace(/\.pdf$/i, '')
      downloadBytes(bytes, `${base}-p${selectedPage}.pdf`)
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
      <div className="app app--empty">
        <header className="app__header">
          <h1 className="app__title">PDF Figure Picker</h1>
        </header>
        <main className="app__landing">
          <Dropzone loading={loading} error={error} onFile={handleFile} />
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">PDF Figure Picker</h1>
        <span className="app__file" title={pdf.fileName}>
          {pdf.fileName} · 共 {pdf.numPages} 页
        </span>
        <div className="app__spacer" />
        <div className="zoomgroup">
          <button className="zoombtn" onClick={zoomOut} title="缩小">
            −
          </button>
          <button
            className="zoombtn zoombtn--label"
            onClick={() => setZoom(1)}
            title="恢复 100%"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button className="zoombtn" onClick={zoomIn} title="放大">
            ＋
          </button>
        </div>
        <button
          className="btn"
          disabled={exportingPage}
          onClick={handleDownloadPage}
        >
          {exportingPage ? '下载中…' : '下载本页'}
        </button>
        <button
          className="btn btn--primary"
          disabled={!crop || exporting}
          onClick={handleDownload}
        >
          {exporting ? '导出中…' : '下载裁剪后的 PDF'}
        </button>
        <button className="btn" onClick={handleClose}>
          重新打开
        </button>
      </header>

      <div className="app__body">
        <aside className="app__sidebar">
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

        <main className="app__main">
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
