import type { HTMLAttributes } from 'react'

export default function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  // Padding padrão só quando a tela não define outro (ex.: p-0 em listas)
  const padding = /(^|\s)p-\d/.test(className) ? '' : 'p-5'
  return <div className={`min-w-0 rounded-2xl border border-rose/30 bg-branco ${padding} ${className}`} {...props} />
}
