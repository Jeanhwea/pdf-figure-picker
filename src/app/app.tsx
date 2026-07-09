import { useCallback, useState } from 'react'

import { usePdfDocument } from '@/hooks/use-pdf-document'
import { usePdfExport } from '@/hooks/use-pdf-export'
import { useZoom } from '@/hooks/use-zoom'
import type { PdfRect } from '@/lib/crop-pdf'
import { LandingScreen } from '@/features/landing/landing-screen'
import { PdfEditor } from '@/features/editor/pdf-editor'

export function App() {
  const { pdf, loading, error, load } = usePdfDocument()
  const [selectedPage, setSelectedPage] = useState(1)
  const [crop, setCrop] = useState<PdfRect | null>(null)
  const [fitRequest, setFitRequest] = useState(0)
  const { zoom, zoomIn, zoomOut, resetZoom, zoomTo } = useZoom()
  const {
    exportingCrop,
    exportingPage,
    exportingPng,
    downloadCrop,
    downloadPage,
    downloadPng,
  } = usePdfExport(pdf, selectedPage)

  const openFile = useCallback(
    (file: File) => {
      setSelectedPage(1)
      setCrop(null)
      resetZoom()
      load(file)
    },
    [load, resetZoom]
  )

  const selectPage = useCallback(
    (pageNumber: number) => {
      setSelectedPage(pageNumber)
      setCrop(null)
      resetZoom()
    },
    [resetZoom]
  )

  if (!pdf) {
    return <LandingScreen loading={loading} error={error} onFile={openFile} />
  }

  return (
    <PdfEditor
      pdf={pdf}
      selectedPage={selectedPage}
      crop={crop}
      zoom={zoom}
      fitRequest={fitRequest}
      exportingCrop={exportingCrop}
      exportingPage={exportingPage}
      exportingPng={exportingPng}
      onSelectPage={selectPage}
      onCropChange={setCrop}
      onZoomIn={zoomIn}
      onZoomOut={zoomOut}
      onResetZoom={resetZoom}
      onZoomTo={zoomTo}
      onFitScreen={() => setFitRequest((n) => n + 1)}
      onDownloadCrop={() => crop && downloadCrop(crop)}
      onDownloadPage={downloadPage}
      onDownloadPng={(dpi) => downloadPng(dpi, crop)}
      onFile={openFile}
    />
  )
}
