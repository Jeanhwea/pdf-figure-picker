import type { PDFDocumentProxy } from '@/lib/pdfjs'
import { PageThumbnail } from '@/features/editor/page-thumbnail'

interface Props {
  doc: PDFDocumentProxy
  numPages: number
  selectedPage: number
  onSelectPage: (pageNumber: number) => void
}

/** Scrollable list of page thumbnails for navigating the document. */
export function ThumbnailSidebar({
  doc,
  numPages,
  selectedPage,
  onSelectPage,
}: Props) {
  return (
    <aside className="flex w-[190px] shrink-0 flex-col gap-3 overflow-y-auto border-r bg-sidebar p-3">
      {Array.from({ length: numPages }, (_, i) => i + 1).map((n) => (
        <PageThumbnail
          key={n}
          doc={doc}
          pageNumber={n}
          selected={n === selectedPage}
          onSelect={onSelectPage}
        />
      ))}
    </aside>
  )
}
