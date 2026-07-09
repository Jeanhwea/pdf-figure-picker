import type { PDFDocumentProxy } from '@/lib/pdfjs'
import type { PdfRect } from '@/lib/crop-pdf'

const PDF_POINTS_PER_INCH = 72

export async function renderPageToPng(
  doc: PDFDocumentProxy,
  pageNumber: number,
  dpi: number,
  crop?: PdfRect | null
): Promise<Uint8Array> {
  const page = await doc.getPage(pageNumber)
  const scale = dpi / PDF_POINTS_PER_INCH
  const viewport = page.getViewport({ scale, rotation: page.rotate })

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法创建画布上下文')

  let renderParams: Parameters<typeof page.render>[0]

  if (crop) {
    const [vx0, vy0] = viewport.convertToViewportPoint(crop.x, crop.y)
    const [vx1, vy1] = viewport.convertToViewportPoint(
      crop.x + crop.width,
      crop.y + crop.height
    )
    const left = Math.min(vx0, vx1)
    const top = Math.min(vy0, vy1)
    canvas.width = Math.max(1, Math.floor(Math.abs(vx1 - vx0)))
    canvas.height = Math.max(1, Math.floor(Math.abs(vy1 - vy0)))
    renderParams = {
      canvasContext: ctx,
      viewport,
      transform: [1, 0, 0, 1, -left, -top],
    }
  } else {
    canvas.width = Math.floor(viewport.width)
    canvas.height = Math.floor(viewport.height)
    renderParams = { canvasContext: ctx, viewport }
  }

  await page.render(renderParams).promise

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png')
  )
  if (!blob) throw new Error('分辨率过高，无法生成 PNG，请调低 DPI')

  return new Uint8Array(await blob.arrayBuffer())
}
