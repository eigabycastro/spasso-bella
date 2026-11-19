/**
 * Preferências de privacidade da visitante (LGPD art. 7º, I / art. 8º).
 * O site não usa cookies de rastreamento nem de publicidade.
 * O único conteúdo opcional é o mapa do Google, que envia dados de navegação ao Google.
 * A escolha fica só no navegador da visitante (armazenamento essencial).
 */
export type Consent = { maps: boolean; decidedAt: string }

const KEY = 'spasso-consent-v1'
const CHANGE = 'spasso-consent-change'
export const OPEN_CONSENT = 'spasso-consent-open'

export function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const v = JSON.parse(raw) as Consent
    return typeof v.maps === 'boolean' ? v : null
  } catch {
    return null
  }
}

export function saveConsent(maps: boolean) {
  const value: Consent = { maps, decidedAt: new Date().toISOString() }
  try {
    localStorage.setItem(KEY, JSON.stringify(value))
  } catch {
    // Modo anônimo / armazenamento bloqueado: a escolha vale só nesta visita
    memory = value
  }
  window.dispatchEvent(new Event(CHANGE))
}

let memory: Consent | null = null

export function subscribeConsent(cb: () => void) {
  window.addEventListener(CHANGE, cb)
  window.addEventListener('storage', cb)
  return () => {
    window.removeEventListener(CHANGE, cb)
    window.removeEventListener('storage', cb)
  }
}

/** Snapshot estável para useSyncExternalStore (compara pelo texto salvo). */
let lastRaw: string | null = null
let lastValue: Consent | null = null
export function consentSnapshot(): Consent | null {
  const v = readConsent() ?? memory
  const raw = v ? JSON.stringify(v) : null
  if (raw !== lastRaw) {
    lastRaw = raw
    lastValue = v
  }
  return lastValue
}

export function openConsentSettings() {
  window.dispatchEvent(new Event(OPEN_CONSENT))
}
