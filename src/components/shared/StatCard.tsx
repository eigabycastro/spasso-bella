import type { LucideIcon } from 'lucide-react'
import Card from '../ui/Card'
import ExampleBadge from './ExampleBadge'

type StatCardProps = {
  label: string
  value: string
  hint?: string
  icon: LucideIcon
  example?: boolean
}

export default function StatCard({ label, value, hint, icon: Icon, example }: StatCardProps) {
  return (
    <Card className="flex flex-col gap-2 p-4 sm:gap-3 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1.5">
        <span className="flex items-center gap-2 text-sm text-bordo">
          <Icon size={18} strokeWidth={1.75} className="shrink-0" aria-hidden />
          {label}
        </span>
        {example && <ExampleBadge />}
      </div>
      <p className="text-xl font-semibold tabular-nums break-words text-vinho sm:text-2xl">{value}</p>
      {hint && <p className="text-xs text-bordo">{hint}</p>}
    </Card>
  )
}
