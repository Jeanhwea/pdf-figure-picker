import { useCallback, useRef } from 'react'

/**
 * Encapsulate a hidden file input for opening PDFs. Spread `inputProps` onto a
 * hidden `<input>` and call `open()` (e.g. from a button) to show the picker.
 */
export function useOpenPdf(onFile: (file: File) => void) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const open = useCallback(() => inputRef.current?.click(), [])

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file && file.type === 'application/pdf') {
        onFile(file)
      }
      // Reset so picking the same file again still fires onChange.
      e.target.value = ''
    },
    [onFile]
  )

  const inputProps = {
    ref: inputRef,
    type: 'file' as const,
    accept: 'application/pdf',
    hidden: true,
    onChange,
  }

  return { open, inputProps }
}
