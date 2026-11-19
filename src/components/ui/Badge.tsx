import type { ReactNode } from 'react'

type Tone = 'rose' | 'outline'

const tones: Record<Tone, string> = {
  rose: 'bg-rose/25 text-vinho',
  outline: 'border border-rose text-bordo',
}

export default function Badge({ children, tone = 'rose' }: { children: ReactNode; tone?: Tone }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}
