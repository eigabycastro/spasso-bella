/**
 * Lê uma cor da identidade definida em globals.css (@theme).
 * Necessário em gráficos SVG: atributos como fill/stroke não aceitam var(--...).
 */
export function cssToken(name: 'vinho' | 'bordo' | 'rose' | 'rosa-claro' | 'branco'): string {
  return getComputedStyle(document.documentElement).getPropertyValue(`--color-${name}`).trim()
}
