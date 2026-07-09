import { useCallback, useState } from 'react'

import type { LoadedPdf } from '@/hooks/use-pdf-document'
import {
  cropPdfPage,
  extractPdfPage,
  saveWithPicker,
  type PdfRect,
} from '@/lib/crop-pdf'
import { renderPageToPng } from '@/lib/render-png'

/**
 * Export helpers for the currently selected page. Each action opens the native
 * "Save As" dialog (or falls back to a download) and tracks its own busy state.
 */
export function usePdfExport(pdf: LoadedPdf | null, selectedPage: number) {
  const [exportingCrop, setExportingCrop] = useState(false)
  const [exportingPage, setExportingPage] = useState(false)
  const [exportingPng, setExportingPng] = useState(false)

  const baseName = pdf ? pdf.fileName.replace(/\.pdf$/i, '') : ''

  const downloadCrop = useCallback(
    async (crop: PdfRect) => {
      if (!pdf) return
      setExportingCrop(true)
      try {
        await saveWithPicker(`${baseName}-p${selectedPage}-cropped.pdf`, () =>
          cropPdfPage(pdf.sourceBytes, selectedPage - 1, crop)
        )
      } catch (err) {
        console.error(err)
        alert(
          '裁剪导出失败：' + (err instanceof Error ? err.message : '未知错误')
        )
      } finally {
        setExportingCrop(false)
      }
    },
    [pdf, baseName, selectedPage]
  )

  const downloadPage = useCallback(async () => {
    if (!pdf) return
    setExportingPage(true)
    try {
      await saveWithPicker(`${baseName}-p${selectedPage}.pdf`, () =>
        extractPdfPage(pdf.sourceBytes, selectedPage - 1)
      )
    } catch (err) {
      console.error(err)
      alert(
        '下载本页失败：' + (err instanceof Error ? err.message : '未知错误')
      )
    } finally {
      setExportingPage(false)
    }
  }, [pdf, baseName, selectedPage])

  const downloadPng = useCallback(
    async (dpi: number) => {
      if (!pdf) return
      setExportingPng(true)
      try {
        await saveWithPicker(
          `${baseName}-p${selectedPage}.png`,
          () => renderPageToPng(pdf.doc, selectedPage, dpi),
          'image/png'
        )
      } catch (err) {
        console.error(err)
        alert(
          '导出 PNG 失败：' + (err instanceof Error ? err.message : '未知错误')
        )
      } finally {
        setExportingPng(false)
      }
    },
    [pdf, baseName, selectedPage]
  )

  return {
    exportingCrop,
    exportingPage,
    exportingPng,
    downloadCrop,
    downloadPage,
    downloadPng,
  }
}
