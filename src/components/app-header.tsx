import type { ReactNode } from 'react'

interface Props {
  /** Content rendered after the title/version, e.g. file info and toolbar. */
  children?: ReactNode
}

/** Top application bar with the product title and version. */
export function AppHeader({ children }: Props) {
  return (
    <header className="flex items-center gap-4 border-b bg-card px-4 py-2.5">
      <h1 className="m-0 text-base font-semibold">PDF Figure Picker</h1>
      <span className="text-xs tabular-nums text-muted-foreground">
        v{__APP_VERSION__}
      </span>
      {children}
    </header>
  )
}
