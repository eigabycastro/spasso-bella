import type { Database, Json } from '../types/database'
import type { BusinessSettings, DailyBreak, DayHours } from '../types/models'
import { DEFAULT_TEMPLATES } from '../utils/whatsappMessages'
import { friendlyError, type Result } from './errors'
import { supabase } from './supabase'

type Row = Database['public']['Tables']['business_settings']['Row']

/**
 * Padrão enquanto business_settings.opening_hours estiver vazio ({}).
 * Informado em 18/11/2026: segunda a sábado, almoço 12h–13h.
 * Abertura e fechamento (09:00–18:00) são padrão a confirmar com a dona em Configurações.
 */
const open = (start = '09:00', end = '18:00'): DayHours => ({ open: true, start, end })
export const DEFAULT_WEEK: DayHours[] = [{ open: false, start: '09:00', end: '18:00' }, open(), open(), open(), open(), open(), open()]
export const DEFAULT_LUNCH: DailyBreak = { enabled: true, start: '12:00', end: '13:00' }

const isTime = (v: unknown): v is string => typeof v === 'string' && /^\d{2}:\d{2}$/.test(v)

/** opening_hours no banco: { week: DayHours[7], lunch: DailyBreak, interval_min: number } */
function parseSchedule(json: Json): Pick<BusinessSettings, 'opening_hours' | 'lunch' | 'interval_min'> {
  const obj = json && typeof json === 'object' && !Array.isArray(json) ? json : {}
  const week = Array.isArray(obj.week) && obj.week.length === 7 ? obj.week : null
  const lunch = obj.lunch && typeof obj.lunch === 'object' && !Array.isArray(obj.lunch) ? obj.lunch : null

  return {
    opening_hours: DEFAULT_WEEK.map((def, i) => {
      const d = week?.[i]
      if (!d || typeof d !== 'object' || Array.isArray(d)) return def
      return { open: d.open === true, start: isTime(d.start) ? d.start : def.start, end: isTime(d.end) ? d.end : def.end }
    }),
    lunch: lunch
      ? {
          enabled: lunch.enabled === true,
          start: isTime(lunch.start) ? lunch.start : DEFAULT_LUNCH.start,
          end: isTime(lunch.end) ? lunch.end : DEFAULT_LUNCH.end,
        }
      : DEFAULT_LUNCH,
    interval_min: typeof obj.interval_min === 'number' ? obj.interval_min : 0,
  }
}

/** Textos salvos + padrão para o que estiver vazio (ou se a migration 000006 ainda não rodou). */
function parseTemplates(json: Json | undefined): BusinessSettings['message_templates'] {
  const obj = json && typeof json === 'object' && !Array.isArray(json) ? json : {}
  const pick = (k: keyof typeof DEFAULT_TEMPLATES) => {
    const v = obj[k]
    return typeof v === 'string' && v.trim() ? v : DEFAULT_TEMPLATES[k]
  }
  return { confirmation: pick('confirmation'), reminder: pick('reminder'), birthday: pick('birthday') }
}

const toSettings = (r: Row): BusinessSettings => ({
  business_name: r.business_name,
  phone: r.phone ?? '',
  address: r.address ?? '',
  instagram: r.instagram ?? '',
  maps_url: r.maps_url ?? '',
  legal_name: r.legal_name ?? '',
  document_id: r.document_id ?? '',
  contact_email: r.contact_email ?? '',
  message_templates: parseTemplates(r.message_templates),
  ...parseSchedule(r.opening_hours),
})

/** WhatsApp para links wa.me: só números, com DDI 55. */
const toWhatsapp = (phone: string) => {
  const d = phone.replace(/\D/g, '')
  return d ? (d.length <= 11 ? `55${d}` : d) : null
}

export async function getSettings(): Promise<Result<BusinessSettings>> {
  const { data, error } = await supabase.from('business_settings').select('*').eq('id', 1).single()
  if (error) return { data: null, error: friendlyError(error, 'Não foi possível carregar as configurações.') }
  return { data: toSettings(data), error: null }
}

export async function updateSettings(s: BusinessSettings): Promise<Result<BusinessSettings>> {
  const { data, error } = await supabase
    .from('business_settings')
    .update({
      business_name: s.business_name.trim(),
      phone: s.phone.trim() || null,
      whatsapp: toWhatsapp(s.phone),
      address: s.address.trim() || null,
      instagram: s.instagram.trim().replace(/^@/, '') || null,
      maps_url: s.maps_url.trim() || null,
      legal_name: s.legal_name.trim() || null,
      document_id: s.document_id.trim() || null,
      contact_email: s.contact_email.trim().toLowerCase() || null,
      message_templates: s.message_templates,
      opening_hours: { week: s.opening_hours, lunch: s.lunch, interval_min: s.interval_min },
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1)
    .select()
    .single()
  if (error) return { data: null, error: friendlyError(error, 'Não foi possível salvar as configurações.') }
  return { data: toSettings(data), error: null }
}
