/** Monta um link wa.me. O telefone pode vir com máscara; assume Brasil (55) se faltar o DDI. */
export function whatsappLink(phone: string, message?: string): string {
  let digits = phone.replace(/\D/g, '')
  if (digits.length <= 11) digits = `55${digits}`
  const text = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${digits}${text}`
}
