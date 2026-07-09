import { PDFDocument } from 'pdf-lib'

export interface PdfRect {
  /** Lower-left X in unrotated PDF user-space points. */
  x: number
  /** Lower-left Y in unrotated PDF user-space points. */
  y: number
  width: number
  height: number
}

/**
 * Build a single-page PDF containing only the cropped region of one page from
 * the source document. Coordinates are in unrotated PDF user space (points),
 * matching what `PageViewport.convertToPdfPoint` returns.
 */
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

  // Setting both boxes makes the page geometry equal the cropped region while
  // keeping any existing page rotation metadata intact.
  page.setMediaBox(x, y, width, height)
  page.setCropBox(x, y, width, height)

  return outDoc.save()
}

/**
 * Build a single-page PDF containing the full, unmodified page from the source
 * document.
 */
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
  // Give the browser a tick to start the download before revoking.
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

/**
 * Save bytes using the native "Save As" dialog (File System Access API) when
 * available, so the user can choose the location and file name. Falls back to a
 * regular browser download otherwise.
 *
 * The picker is opened first (while the click's user activation is still
 * valid), and `produce` is only invoked once a destination is chosen.
 *
 * @returns `true` if the file was written/downloaded, `false` if the user
 * cancelled the save dialog.
 */
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
      // The user dismissed the dialog.
      if (err instanceof DOMException && err.name === 'AbortError') return false
      throw err
    }
    const bytes = await produce()
    const writable = await handle.createWritable()
    await writable.write(new Uint8Array(bytes))
    await writable.close()
    return true
  }

  // Fallback for browsers without the File System Access API.
  const bytes = await produce()
  downloadBytes(bytes, suggestedName, mimeType)
  return true
}
