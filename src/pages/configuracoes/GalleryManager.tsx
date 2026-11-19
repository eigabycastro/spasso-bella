import { Eye, EyeOff, ImagePlus, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { useResource } from '../../hooks/useResource'
import { deleteGalleryImage, listGallery, setGalleryVisibility, uploadGalleryImage, type GalleryImage } from '../../services/gallery'

/** Fotos do site. Formulário simples (arquivo) — sem React Hook Form por ser só um upload. */
export default function GalleryManager() {
  const gallery = useResource('gallery-admin', () => listGallery(false))
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [authorized, setAuthorized] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inputKey, setInputKey] = useState(0)
  const [removing, setRemoving] = useState<GalleryImage | null>(null)

  async function upload(e: FormEvent) {
    e.preventDefault()
    if (!file) return setError('Escolha uma foto.')
    if (!authorized) return setError('Confirme que tem a autorização da cliente.')
    setBusy(true)
    setError(null)
    const result = await uploadGalleryImage(file, caption)
    setBusy(false)
    if (result.error !== null) return setError(result.error)
    setFile(null)
    setCaption('')
    setAuthorized(false)
    setInputKey((k) => k + 1)
    gallery.reload()
  }

  async function toggle(img: GalleryImage) {
    const result = await setGalleryVisibility(img.id, !img.is_public)
    if (result.error !== null) return setError(result.error)
    gallery.reload()
  }

  const images = gallery.data ?? []

  return (
    <Card className="flex flex-col gap-4 lg:col-span-2">
      <div>
        <h2 className="font-semibold">Galeria do site</h2>
        <p className="mt-1 text-xs text-bordo">
          Publique apenas fotos com autorização da cliente (LGPD). Se ela pedir para tirar, remova a foto aqui.
        </p>
      </div>

      <form onSubmit={upload} className="grid gap-3 rounded-xl border border-dashed border-rose p-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Foto
          <input
            key={inputKey}
            type="file"
            accept="image/*"
            onChange={(e) => {
              setError(null)
              setFile(e.target.files?.[0] ?? null)
            }}
            className="text-sm file:mr-3 file:h-11 file:rounded-xl file:border file:border-rose file:bg-branco file:px-4 file:text-sm file:font-medium file:text-vinho"
          />
        </label>
        <Input label="Legenda (opcional)" placeholder="Ex.: Brow lamination" maxLength={80} value={caption} onChange={(e) => setCaption(e.target.value)} />
        <label className="flex min-h-11 items-center gap-3 text-sm sm:col-span-2">
          <input type="checkbox" className="size-5 accent-vinho" checked={authorized} onChange={(e) => setAuthorized(e.target.checked)} />
          Tenho autorização da cliente para publicar esta foto
        </label>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <Button type="submit" variant="outline" disabled={busy || !file || !authorized}>
            <ImagePlus size={18} strokeWidth={1.75} aria-hidden />
            {busy ? 'Enviando…' : 'Enviar foto'}
          </Button>
          {error && (
            <p role="alert" className="text-sm font-medium text-vinho">
              {error}
            </p>
          )}
        </div>
      </form>

      {gallery.status === 'loading' && <p className="text-sm text-bordo">Carregando fotos…</p>}
      {gallery.status === 'error' && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span>{gallery.error}</span>
          <Button variant="outline" onClick={gallery.reload}>
            Tentar de novo
          </Button>
        </div>
      )}
      {gallery.status === 'ready' &&
        (images.length === 0 ? (
          <p className="text-sm text-bordo">Nenhuma foto ainda. Enquanto não houver, o site mostra “Fotos em breve”.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((img) => (
              <li key={img.id} className="overflow-hidden rounded-xl border border-rose/30">
                <img src={img.url} alt={img.caption} loading="lazy" className={`aspect-square w-full object-cover ${img.is_public ? '' : 'opacity-40'}`} />
                <div className="flex items-center justify-between gap-1 px-1">
                  <span className="truncate px-1 text-xs text-bordo">{img.caption || (img.is_public ? 'No site' : 'Escondida')}</span>
                  <span className="flex shrink-0">
                    <button
                      type="button"
                      onClick={() => toggle(img)}
                      className="flex size-11 items-center justify-center text-bordo hover:text-vinho"
                      aria-label={img.is_public ? 'Esconder do site' : 'Mostrar no site'}
                    >
                      {img.is_public ? <Eye size={16} strokeWidth={1.75} /> : <EyeOff size={16} strokeWidth={1.75} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRemoving(img)}
                      className="flex size-11 items-center justify-center text-bordo hover:text-vinho"
                      aria-label="Remover foto"
                    >
                      <Trash2 size={16} strokeWidth={1.75} />
                    </button>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ))}

      {removing && (
        <RemoveModal
          image={removing}
          onClose={() => setRemoving(null)}
          onRemoved={() => {
            setRemoving(null)
            gallery.reload()
          }}
        />
      )}
    </Card>
  )
}

function RemoveModal({ image, onClose, onRemoved }: { image: GalleryImage; onClose: () => void; onRemoved: () => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function confirm() {
    setBusy(true)
    const result = await deleteGalleryImage(image)
    setBusy(false)
    if (result.error !== null) return setError(result.error)
    onRemoved()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Remover foto?"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Manter
          </Button>
          <Button onClick={confirm} disabled={busy}>
            {busy ? 'Removendo…' : 'Remover'}
          </Button>
        </>
      }
    >
      <img src={image.url} alt="" className="mx-auto max-h-60 rounded-xl" />
      <p className="mt-3 text-sm">A foto sai do site e o arquivo é apagado. Para só tirar do site, use o botão do olho.</p>
      {error && (
        <p role="alert" className="mt-3 rounded-xl border border-bordo bg-branco px-3 py-2 text-sm font-medium text-vinho">
          {error}
        </p>
      )}
    </Modal>
  )
}
