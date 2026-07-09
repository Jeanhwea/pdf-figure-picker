import type { PDFDocumentProxy } from '@/lib/pdfjs'

const PDF_POINTS_PER_INCH = 72

export async function renderPageToPng(
  doc: PDFDocumentProxy,
  pageNumber: number,
  dpi: number
): Promise<Uint8Array> {
  const page = await doc.getPage(pageNumber)
  const scale = dpi / PDF_POINTS_PER_INCH
  const viewport = page.getViewport({ scale, rotation: page.rotate })

  const canvas = document.createElement('canvas')
  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法创建画布上下文')

  await page.render({ canvasContext: ctx, viewport }).promise

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png')
  )
  if (!blob) throw new Error('分辨率过高，无法生成 PNG，请调低 DPI')

  return new Uint8Array(await blob.arrayBuffer())
}
