import { CloudOff, RotateCw } from 'lucide-react'
import Button from '../ui/Button'
import Card from '../ui/Card'

export default function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card role="alert" className="flex flex-col items-center gap-3 py-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-rosa-claro text-bordo">
        <CloudOff size={26} strokeWidth={1.75} aria-hidden />
      </span>
      <p className="max-w-sm text-sm font-medium">{message}</p>
      <Button variant="outline" onClick={onRetry}>
        <RotateCw size={16} strokeWidth={1.75} aria-hidden />
        Tentar de novo
      </Button>
    </Card>
  )
}
