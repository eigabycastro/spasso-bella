/** Esqueleto de lista enquanto os dados chegam. */
export default function LoadingState({ rows = 5, label = 'Carregando…' }: { rows?: number; label?: string }) {
  return (
    <div role="status" aria-label={label} className="overflow-hidden rounded-2xl border border-rose/30 bg-branco">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 border-b border-rose/20 px-4 py-3 last:border-0">
          <span className="size-10 shrink-0 animate-pulse rounded-full bg-rosa-claro" />
          <span className="flex-1 space-y-2">
            <span className="block h-3 w-2/5 animate-pulse rounded bg-rosa-claro" />
            <span className="block h-2.5 w-1/4 animate-pulse rounded bg-rosa-claro" />
          </span>
        </div>
      ))}
      <span className="sr-only">{label}</span>
    </div>
  )
}
