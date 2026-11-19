/** Converte o que ela digitou em número. Aceita "45", "45,5", "1.234,56" e "1234.56". */
export function parseMoney(v: string): number {
  const s = v.trim()
  const normalized = s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s
  return Number(normalized)
}
