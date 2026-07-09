import { AppHeader } from '@/components/app-header'
import type { LoadedPdf } from '@/hooks/use-pdf-document'
import type { PdfRect } from '@/lib/crop-pdf'
import { CropStage } from '@/features/editor/crop-stage'
import { EditorToolbar } from '@/features/editor/editor-toolbar'
import { ThumbnailSidebar } from '@/features/editor/thumbnail-sidebar'

interface Props {
  pdf: LoadedPdf
  selectedPage: number
  crop: PdfRect | null
  zoom: number
  exportingCrop: boolean
  exportingPage: boolean
  exportingPng: boolean
  onSelectPage: (pageNumber: number) => void
  onCropChange: (rect: PdfRect | null) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
  onDownloadCrop: () => void
  onDownloadPage: () => void
  onDownloadPng: (dpi: number) => void
  onFile: (file: File) => void
}

/** Main editing screen: header toolbar, thumbnail sidebar and crop stage. */
export function PdfEditor({
  pdf,
  selectedPage,
  crop,
  zoom,
  exportingCrop,
  exportingPage,
  exportingPng,
  onSelectPage,
  onCropChange,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onDownloadCrop,
  onDownloadPage,
  onDownloadPng,
  onFile,
}: Props) {
  return (
    <div className="flex h-full flex-col">
      <AppHeader>
        <span
          className="max-w-90 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-muted-foreground"
          title={pdf.fileName}
        >
          {pdf.fileName} · 共 {pdf.numPages} 页
        </span>
        <div className="flex-1" />
        <EditorToolbar
          zoom={zoom}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          onResetZoom={onResetZoom}
          hasCrop={!!crop}
          exportingCrop={exportingCrop}
          exportingPage={exportingPage}
          exportingPng={exportingPng}
          onDownloadCrop={onDownloadCrop}
          onDownloadPage={onDownloadPage}
          onDownloadPng={onDownloadPng}
          onFile={onFile}
        />
      </AppHeader>

      <div className="flex min-h-0 flex-1">
        <ThumbnailSidebar
          doc={pdf.doc}
          numPages={pdf.numPages}
          selectedPage={selectedPage}
          onSelectPage={onSelectPage}
        />

        <main className="flex min-w-0 flex-1">
          <CropStage
            key={selectedPage}
            doc={pdf.doc}
            pageNumber={selectedPage}
            crop={crop}
            zoom={zoom}
            onCropChange={onCropChange}
            onZoomIn={onZoomIn}
            onZoomOut={onZoomOut}
          />
        </main>
      </div>
    </div>
  )
}
