import { useCallback, useState } from 'react'
import { pdfjsLib, type PDFDocumentProxy } from '@/lib/pdfjs'

export interface LoadedPdf {
  doc: PDFDocumentProxy
  numPages: number
  fileName: string
  sourceBytes: Uint8Array
}

export function usePdfDocument() {
  const [pdf, setPdf] = useState<LoadedPdf | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (file: File) => {
    setLoading(true)
    setError(null)
    try {
      const buffer = await file.arrayBuffer()
      const sourceBytes = new Uint8Array(buffer)

      const doc = await pdfjsLib.getDocument({ data: sourceBytes.slice() })
        .promise

      setPdf({
        doc,
        numPages: doc.numPages,
        fileName: file.name,
        sourceBytes,
      })
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : '无法打开该 PDF 文件')
      setPdf(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setPdf((prev) => {
      prev?.doc.destroy()
      return null
    })
    setError(null)
  }, [])

  return { pdf, loading, error, load, reset }
}
