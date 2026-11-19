import { useState } from 'react'
import { dayKey } from '../utils/formatDate'

/** Dia de hoje ('YYYY-MM-DD') no fuso do studio, calculado uma vez por montagem da tela. */
export function useToday(): string {
  const [today] = useState(() => dayKey(new Date()))
  return today
}
