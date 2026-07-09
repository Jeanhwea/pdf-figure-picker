import type { ReactNode } from 'react'
import logoSrc from '@/assets/logo.svg'

interface Props {
  children?: ReactNode
}

export function AppHeader({ children }: Props) {
  return (
    <header className="flex items-center gap-4 border-b bg-card px-4 py-2.5">
      <img src={logoSrc} className="h-6 w-6" alt="Logo" />
      <h1 className="m-0 text-base font-semibold">PDF工具</h1>
      <span className="text-xs tabular-nums text-muted-foreground">
        v{__APP_VERSION__}
      </span>
      {children}
    </header>
  )
}
