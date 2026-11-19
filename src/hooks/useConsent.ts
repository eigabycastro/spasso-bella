import { useSyncExternalStore } from 'react'
import { consentSnapshot, subscribeConsent, type Consent } from '../utils/consent'

/** Preferência de privacidade atual (null = ainda não escolheu). */
export function useConsent(): Consent | null {
  return useSyncExternalStore(subscribeConsent, consentSnapshot, () => null)
}
