import { PDFDocument } from 'pdf-lib'

export interface PdfRect {
  x: number
  y: number
  width: number
  height: number
}

export async function cropPdfPage(
  sourceBytes: ArrayBuffer | Uint8Array,
  pageIndex: number,
  rect: PdfRect
): Promise<Uint8Array> {
  const sourceDoc = await PDFDocument.load(sourceBytes)
  const outDoc = await PDFDocument.create()

  const [page] = await outDoc.copyPages(sourceDoc, [pageIndex])
  outDoc.addPage(page)

  const x = Math.round(rect.x * 100) / 100
  const y = Math.round(rect.y * 100) / 100
  const width = Math.round(rect.width * 100) / 100
  const height = Math.round(rect.height * 100) / 100

  page.setMediaBox(x, y, width, height)
  page.setCropBox(x, y, width, height)

  return outDoc.save()
}

export async function extractPdfPage(
  sourceBytes: ArrayBuffer | Uint8Array,
  pageIndex: number
): Promise<Uint8Array> {
  const sourceDoc = await PDFDocument.load(sourceBytes)
  const outDoc = await PDFDocument.create()

  const [page] = await outDoc.copyPages(sourceDoc, [pageIndex])
  outDoc.addPage(page)

  return outDoc.save()
}

export function downloadBytes(
  bytes: Uint8Array,
  fileName: string,
  mimeType = 'application/pdf'
) {
  const copy = new Uint8Array(bytes)
  const blob = new Blob([copy], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

interface SaveFileHandle {
  createWritable(): Promise<{
    write(data: BufferSource): Promise<void>
    close(): Promise<void>
  }>
}

declare global {
  interface Window {
    showSaveFilePicker?(options?: {
      suggestedName?: string
      types?: { description?: string; accept: Record<string, string[]> }[]
    }): Promise<SaveFileHandle>
  }
}

const FILE_TYPES: Record<
  string,
  { description: string; extensions: string[] }
> = {
  'application/pdf': { description: 'PDF 文件', extensions: ['.pdf'] },
  'image/png': { description: 'PNG 图片', extensions: ['.png'] },
}

export async function saveWithPicker(
  suggestedName: string,
  produce: () => Promise<Uint8Array>,
  mimeType = 'application/pdf'
): Promise<boolean> {
  const picker = window.showSaveFilePicker
  const fileType = FILE_TYPES[mimeType] ?? {
    description: '文件',
    extensions: [],
  }
  if (picker) {
    let handle: SaveFileHandle
    try {
      handle = await picker({
        suggestedName,
        types: [
          {
            description: fileType.description,
            accept: { [mimeType]: fileType.extensions },
          },
        ],
      })
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return false
      throw err
    }
    const bytes = await produce()
    const writable = await handle.createWritable()
    await writable.write(new Uint8Array(bytes))
    await writable.close()
    return true
  }

  const bytes = await produce()
  downloadBytes(bytes, suggestedName, mimeType)
  return true
}
