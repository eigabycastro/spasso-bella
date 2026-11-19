export type ButtonVariant = 'primary' | 'outline' | 'ghost'

const variants: Record<ButtonVariant, string> = {
  // Um único botão primary por tela (ação principal)
  primary: 'bg-vinho text-branco hover:bg-bordo',
  outline: 'border border-rose text-vinho bg-branco hover:border-bordo hover:text-bordo',
  ghost: 'text-bordo hover:bg-rosa-claro',
}

/** Classes de botão, para usar também em <Link> com cara de botão. */
export function buttonClasses(variant: ButtonVariant = 'primary', extra = '') {
  return `inline-flex items-center justify-center gap-2 rounded-xl px-4 h-11 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${extra}`
}
