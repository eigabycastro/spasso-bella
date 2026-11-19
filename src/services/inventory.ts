import type { PostgrestError } from '@supabase/supabase-js'
import type { Database } from '../types/database'
import type { MovementType } from '../types/models'
import { friendlyError, type Result } from './errors'
import { supabase } from './supabase'

type ProductRow = Database['public']['Tables']['products']['Row']

export type InventoryProduct = {
  id: string
  name: string
  unit: string
  quantity: number
  minimum_stock: number
  cost: number | null
  is_active: boolean
}

export type ProductInput = Pick<InventoryProduct, 'name' | 'unit' | 'minimum_stock' | 'cost' | 'is_active'>

export type InventoryMovement = {
  id: string
  product_id: string
  product_name: string
  unit: string
  movement_type: MovementType
  /** entrada/saída: quantidade (> 0); ajuste: diferença com sinal */
  quantity: number
  reason: string
  created_at: string
}

const toProduct = (r: ProductRow): InventoryProduct => ({
  id: r.id,
  name: r.name,
  unit: r.unit,
  quantity: Number(r.quantity),
  minimum_stock: Number(r.minimum_stock),
  cost: r.cost === null ? null : Number(r.cost),
  is_active: r.is_active,
})

/** Alerta de reposição: só para produtos ativos com mínimo definido. */
export const isLowStock = (p: InventoryProduct) => p.is_active && p.minimum_stock > 0 && p.quantity <= p.minimum_stock

export async function listProducts(): Promise<Result<InventoryProduct[]>> {
  const { data, error } = await supabase.from('products').select('*').order('name')
  if (error) return { data: null, error: friendlyError(error, 'Não foi possível carregar os produtos.') }
  return { data: data.map(toProduct), error: null }
}

const toRow = (p: ProductInput) => ({
  name: p.name.trim(),
  unit: p.unit.trim() || 'un',
  minimum_stock: p.minimum_stock,
  cost: p.cost,
  is_active: p.is_active,
})

/** Cria o produto (com quantidade 0) e, se informado, registra o estoque inicial como entrada. */
export async function createProduct(input: ProductInput, initialQuantity: number): Promise<Result<InventoryProduct>> {
  const { data, error } = await supabase.from('products').insert(toRow(input)).select().single()
  if (error) return { data: null, error: friendlyError(error, 'Não foi possível salvar o produto.') }
  if (initialQuantity > 0) {
    const mov = await addMovement({ product_id: data.id, movement_type: 'entrada', quantity: initialQuantity, reason: 'Estoque inicial' })
    if (mov.error !== null)
      return { data: null, error: `O produto foi salvo, mas o estoque inicial não: ${mov.error} Registre uma entrada nele.` }
    return { data: { ...toProduct(data), quantity: initialQuantity }, error: null }
  }
  return { data: toProduct(data), error: null }
}

/** Edita dados do produto. A quantidade não muda aqui (regra 8). */
export async function updateProduct(id: string, input: ProductInput): Promise<Result<InventoryProduct>> {
  const { data, error } = await supabase.from('products').update(toRow(input)).eq('id', id).select().single()
  if (error) return { data: null, error: friendlyError(error, 'Não foi possível salvar as alterações.') }
  return { data: toProduct(data), error: null }
}

function movementError(error: PostgrestError): string {
  // products.quantity >= 0: o gatilho falha se a saída/ajuste deixaria o estoque negativo
  if (error.code === '23514') return 'Não há estoque suficiente para essa saída.'
  return friendlyError(error, 'Não foi possível registrar a movimentação.')
}

export type MovementInput = { product_id: string; movement_type: MovementType; quantity: number; reason: string }

/** Única forma de mudar a quantidade: o gatilho apply_stock_movement atualiza products.quantity. */
export async function addMovement(input: MovementInput): Promise<Result<true>> {
  const { error } = await supabase.from('stock_movements').insert({
    product_id: input.product_id,
    movement_type: input.movement_type,
    quantity: Math.round(input.quantity * 100) / 100,
    reason: input.reason.trim() || null,
  })
  if (error) return { data: null, error: movementError(error) }
  return { data: true, error: null }
}

/** Últimas movimentações (todas ou de um produto). */
export async function listMovements(productId?: string, limit = 30): Promise<Result<InventoryMovement[]>> {
  let query = supabase
    .from('stock_movements')
    .select('id, product_id, movement_type, quantity, reason, created_at, products(name, unit)')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (productId) query = query.eq('product_id', productId)
  const { data, error } = await query
  if (error) return { data: null, error: friendlyError(error, 'Não foi possível carregar as movimentações.') }
  const rows = data as unknown as (Omit<InventoryMovement, 'product_name' | 'unit' | 'reason'> & {
    reason: string | null
    products: { name: string; unit: string } | null
  })[]
  return {
    data: rows.map((r) => ({
      id: r.id,
      product_id: r.product_id,
      product_name: r.products?.name ?? '—',
      unit: r.products?.unit ?? 'un',
      movement_type: r.movement_type,
      quantity: Number(r.quantity),
      reason: r.reason ?? '',
      created_at: r.created_at,
    })),
    error: null,
  }
}
