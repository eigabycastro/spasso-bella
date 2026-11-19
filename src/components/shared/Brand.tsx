type BrandProps = {
  /** "manager" mostra "MG Manager"; "site" mostra "MG · Beauty Studio" */
  variant?: 'manager' | 'site'
  size?: 'sm' | 'md'
}

export default function Brand({ variant = 'manager', size = 'md' }: BrandProps) {
  const icon = size === 'sm' ? 'size-9' : 'size-11'
  const name = size === 'sm' ? 'text-2xl' : 'text-3xl'
  return (
    <span className="flex items-center gap-2.5">
      <span className={`${icon} flex shrink-0 items-center justify-center rounded-full border border-rose bg-branco p-1`}>
        <img src="/logo/spasso-bella-icone-128.png" alt="" className="size-full object-contain" />
      </span>
      <span className="flex flex-col leading-none">
        <span className={`font-script ${name} whitespace-nowrap text-vinho`}>Spasso Bella</span>
        <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-bordo">
          {variant === 'manager' ? 'MG · Manager' : 'MG · Beauty Studio'}
        </span>
      </span>
    </span>
  )
}
