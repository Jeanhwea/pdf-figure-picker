import { useCallback, useRef } from 'react'

export function useOpenPdf(onFile: (file: File) => void) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const open = useCallback(() => inputRef.current?.click(), [])

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file && file.type === 'application/pdf') {
        onFile(file)
      }
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
