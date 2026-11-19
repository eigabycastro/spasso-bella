import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import Card from '../ui/Card'

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center gap-3 py-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-rosa-claro text-bordo">
        <Icon size={26} strokeWidth={1.75} aria-hidden />
      </span>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="max-w-sm text-sm text-bordo">{description}</p>
      {action}
    </Card>
  )
}
