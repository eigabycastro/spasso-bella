// Serviços do studio (tabela public.services). O arquivo se chama "catalog" para não confundir
// com a pasta src/services, que é a camada de acesso ao banco.
import type { Database } from '../types/database'
import type { Service, ServiceCategory, ServiceInput } from '../types/models'
import { serviceCategories } from '../utils/labels'
import { friendlyError, type Result } from './errors'
import { supabase } from './supabase'

type Row = Database['public']['Tables']['services']['Row']

const toService = (r: Row): Service => ({
  id: r.id,
  name: r.name,
  category: serviceCategories.includes(r.category as ServiceCategory) ? (r.category as ServiceCategory) : 'Outros',
  description: r.description ?? '',
  price: Number(r.price),
  duration_min: r.duration_min,
  is_active: r.is_active,
  is_public: r.is_public,
})

const toRow = (s: ServiceInput) => ({
  name: s.name.trim(),
  category: s.category,
  description: s.description.trim() || null,
  price: s.price,
  duration_min: s.duration_min,
  is_active: s.is_active,
  is_public: s.is_public,
})

export async function listServices(): Promise<Result<Service[]>> {
  const { data, error } = await supabase.from('services').select('*').order('sort_order').order('name')
  if (error) return { data: null, error: friendlyError(error, 'Não foi possível carregar os serviços.') }
  return { data: data.map(toService), error: null }
}

/** Para o site: só ativos e marcados como públicos (o RLS também garante isso para visitantes). */
export async function listPublicServices(): Promise<Result<Service[]>> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .eq('is_public', true)
    .order('sort_order')
    .order('name')
  if (error) return { data: null, error: friendlyError(error, 'Não foi possível carregar os procedimentos.') }
  return { data: data.map(toService), error: null }
}

export async function createService(input: ServiceInput): Promise<Result<Service>> {
  const { data, error } = await supabase.from('services').insert(toRow(input)).select().single()
  if (error) return { data: null, error: friendlyError(error, 'Não foi possível salvar o serviço.') }
  return { data: toService(data), error: null }
}

/** Mudar o preço aqui não altera atendimentos já marcados (o preço é copiado em appointment_items). */
export async function updateService(id: string, input: ServiceInput): Promise<Result<Service>> {
  const { data, error } = await supabase.from('services').update(toRow(input)).eq('id', id).select().single()
  if (error) return { data: null, error: friendlyError(error, 'Não foi possível salvar as alterações.') }
  return { data: toService(data), error: null }
}
