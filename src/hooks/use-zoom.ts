import { useCallback, useState } from 'react'

export const ZOOM_MIN = 0.25
export const ZOOM_MAX = 8
export const ZOOM_STEP = 1.25

/** Manage page zoom with clamped step in/out and a reset to 100%. */
export function useZoom(initial = 1) {
  const [zoom, setZoom] = useState(initial)

  const zoomIn = useCallback(
    () => setZoom((z) => Math.min(ZOOM_MAX, z * ZOOM_STEP)),
    []
  )
  const zoomOut = useCallback(
    () => setZoom((z) => Math.max(ZOOM_MIN, z / ZOOM_STEP)),
    []
  )
  const resetZoom = useCallback(() => setZoom(1), [])

  return { zoom, zoomIn, zoomOut, resetZoom }
}
