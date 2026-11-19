const qty = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 })

/** 3 → "3 un" · 250 ml → "250 ml" · 1,5 → "1,5 un" */
export function formatQuantity(value: number, unit = 'un'): string {
  return `${qty.format(value)} ${unit}`
}
