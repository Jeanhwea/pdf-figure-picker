import { AppHeader } from '@/components/app-header'
import { ModeToggle } from '@/components/mode-toggle'
import { Dropzone } from '@/features/landing/dropzone'

interface Props {
  loading: boolean
  error: string | null
  onFile: (file: File) => void
}

export function LandingScreen({ loading, error, onFile }: Props) {
  return (
    <div className="flex h-full flex-col">
      <AppHeader>
        <div className="flex-1" />
        <ModeToggle />
      </AppHeader>
      <main className="grid flex-1 place-items-center p-10">
        <Dropzone loading={loading} error={error} onFile={onFile} />
      </main>
    </div>
  )
}
