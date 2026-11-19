import { friendlyError, type Result } from './errors'
import { supabase } from './supabase'

const BUCKET = 'galeria'

export type GalleryImage = {
  id: string
  storage_path: string
  url: string
  caption: string
  is_public: boolean
  sort_order: number
}

const publicUrl = (path: string) => supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl

/** Fotos da galeria. `onlyPublic` para o site (o RLS também filtra para visitantes). */
export async function listGallery(onlyPublic: boolean): Promise<Result<GalleryImage[]>> {
  let query = supabase.from('gallery_images').select('*').order('sort_order').order('created_at', { ascending: false })
  if (onlyPublic) query = query.eq('is_public', true)
  const { data, error } = await query
  if (error) return { data: null, error: friendlyError(error, 'Não foi possível carregar a galeria.') }
  return {
    data: data.map((r) => ({
      id: r.id,
      storage_path: r.storage_path,
      url: publicUrl(r.storage_path),
      caption: r.caption ?? '',
      is_public: r.is_public,
      sort_order: r.sort_order,
    })),
    error: null,
  }
}

/**
 * Reduz a foto no próprio aparelho antes de enviar (máx. 1600 px, JPEG):
 * foto de celular de 4 MB vira ~300 KB, o site carrega rápido e o plano grátis rende mais.
 */
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Falha ao preparar a imagem'))), 'image/jpeg', 0.85),
  )
}

export async function uploadGalleryImage(file: File, caption: string): Promise<Result<true>> {
  let blob: Blob
  try {
    blob = await shrink(file)
  } catch {
    return { data: null, error: 'Não foi possível ler essa imagem. Tente uma foto em JPG ou PNG.' }
  }
  const path = `${crypto.randomUUID()}.jpg`
  const upload = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' })
  if (upload.error) return { data: null, error: friendlyError(upload.error, 'Não foi possível enviar a foto.') }

  const { error } = await supabase.from('gallery_images').insert({ storage_path: path, caption: caption.trim() || null })
  if (error) {
    await supabase.storage.from(BUCKET).remove([path]) // não deixa arquivo órfão
    return { data: null, error: friendlyError(error, 'Não foi possível salvar a foto.') }
  }
  return { data: true, error: null }
}

export async function setGalleryVisibility(id: string, isPublic: boolean): Promise<Result<true>> {
  const { error } = await supabase.from('gallery_images').update({ is_public: isPublic }).eq('id', id)
  if (error) return { data: null, error: friendlyError(error, 'Não foi possível alterar a foto.') }
  return { data: true, error: null }
}

/** Apaga o registro e o arquivo (por exemplo, se a cliente retirar a autorização). */
export async function deleteGalleryImage(image: GalleryImage): Promise<Result<true>> {
  const { error } = await supabase.from('gallery_images').delete().eq('id', image.id)
  if (error) return { data: null, error: friendlyError(error, 'Não foi possível remover a foto.') }
  const removed = await supabase.storage.from(BUCKET).remove([image.storage_path])
  if (removed.error)
    return { data: null, error: 'A foto saiu do site, mas o arquivo não foi apagado. Confira se a migration 000004 foi aplicada.' }
  return { data: true, error: null }
}
