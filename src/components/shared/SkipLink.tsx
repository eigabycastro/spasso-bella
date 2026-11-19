/** Primeiro item do Tab: pula o menu e vai direto ao conteúdo (WCAG 2.4.1). */
export default function SkipLink() {
  return (
    <a
      href="#conteudo"
      className="sr-only z-[60] rounded-full bg-vinho px-5 py-3 text-sm font-medium text-branco focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      Pular para o conteúdo
    </a>
  )
}
