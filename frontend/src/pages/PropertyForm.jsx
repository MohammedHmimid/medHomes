import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Upload, X, Star, Save } from 'lucide-react'
import {
  fetchProperty, createProperty, updateProperty,
  uploadPropertyImage, deletePropertyImage,
} from '../api/properties'
import { useAuth } from '../context/AuthContext.jsx'
import Loader from '../components/Loader.jsx'
import { getImageUrl, PROPERTY_TYPE_LABELS, TRANSACTION_TYPE_LABELS, STATUS_LABELS } from '../utils/format'

const EMPTY = {
  title: '', description: '', property_type: 'apartment', transaction_type: 'sale',
  price: '', surface_area: '', rooms: '', bedrooms: '', bathrooms: '',
  city: '', address: '', status: 'available',
}

export default function PropertyForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  const [form, setForm] = useState(EMPTY)
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    fetchProperty(id).then((p) => {
      setForm({
        title: p.title, description: p.description, property_type: p.property_type,
        transaction_type: p.transaction_type, price: p.price, surface_area: p.surface_area,
        rooms: p.rooms ?? '', bedrooms: p.bedrooms ?? '', bathrooms: p.bathrooms ?? '',
        city: p.city, address: p.address, status: p.status,
      })
      setImages(p.images || [])
    }).finally(() => setLoading(false))
  }, [id, isEdit])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    const payload = {
      ...form,
      price: Number(form.price),
      surface_area: Number(form.surface_area),
      rooms: form.rooms === '' ? null : Number(form.rooms),
      bedrooms: form.bedrooms === '' ? null : Number(form.bedrooms),
      bathrooms: form.bathrooms === '' ? null : Number(form.bathrooms),
    }
    try {
      if (isEdit) {
        await updateProperty(id, payload)
        navigate(`/biens/${id}`)
      } else {
        const created = await createProperty(payload)
        navigate(`/biens/${created.id}/modifier`)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de l\'enregistrement.')
    } finally {
      setSaving(false)
    }
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0]
    if (!file || !id) return
    setUploading(true)
    try {
      const img = await uploadPropertyImage(id, file, images.length === 0)
      setImages((prev) => [...prev, img])
    } catch {
      setError('Impossible d\'envoyer cette image (jpg/png/webp, 5 Mo max).')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleImageDelete(imageId) {
    await deletePropertyImage(id, imageId)
    setImages((prev) => prev.filter((img) => img.id !== imageId))
  }

  if (loading) return <Loader />

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-ink">{isEdit ? 'Modifier le bien' : 'Publier un nouveau bien'}</h1>
      <p className="mt-1 text-sm text-slate-500">Renseignez les informations principales, puis ajoutez des photos.</p>

      <form onSubmit={handleSubmit} className="card mt-6 space-y-5 p-6">
        {error && <p className="rounded-sm bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <div>
          <label className="label">Titre de l'annonce</label>
          <input required minLength={5} className="input" value={form.title} onChange={(e) => update('title', e.target.value)} />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea required minLength={10} rows={5} className="input" value={form.description} onChange={(e) => update('description', e.target.value)} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Type de bien</label>
            <select className="input" value={form.property_type} onChange={(e) => update('property_type', e.target.value)}>
              {Object.entries(PROPERTY_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Transaction</label>
            <select className="input" value={form.transaction_type} onChange={(e) => update('transaction_type', e.target.value)}>
              {Object.entries(TRANSACTION_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Prix (MAD)</label>
            <input required type="number" min="0" className="input" value={form.price} onChange={(e) => update('price', e.target.value)} />
          </div>
          <div>
            <label className="label">Surface (m²)</label>
            <input required type="number" min="0" className="input" value={form.surface_area} onChange={(e) => update('surface_area', e.target.value)} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Pièces</label>
            <input type="number" min="0" className="input" value={form.rooms} onChange={(e) => update('rooms', e.target.value)} />
          </div>
          <div>
            <label className="label">Chambres</label>
            <input type="number" min="0" className="input" value={form.bedrooms} onChange={(e) => update('bedrooms', e.target.value)} />
          </div>
          <div>
            <label className="label">Salles de bain</label>
            <input type="number" min="0" className="input" value={form.bathrooms} onChange={(e) => update('bathrooms', e.target.value)} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Ville</label>
            <input required className="input" value={form.city} onChange={(e) => update('city', e.target.value)} />
          </div>
          <div>
            <label className="label">Adresse</label>
            <input required className="input" value={form.address} onChange={(e) => update('address', e.target.value)} />
          </div>
        </div>

        {isEdit && (
          <div>
            <label className="label">Statut</label>
            <select className="input max-w-xs" value={form.status} onChange={(e) => update('status', e.target.value)}>
              {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        )}

        <button type="submit" disabled={saving} className="btn-primary">
          <Save size={16} /> {saving ? 'Enregistrement…' : isEdit ? 'Enregistrer les modifications' : 'Créer le bien et ajouter des photos'}
        </button>
      </form>

      {isEdit && (
        <div className="card mt-6 p-6">
          <h2 className="text-base font-semibold text-ink">Photos</h2>
          <p className="mt-1 text-sm text-slate-500">Formats acceptés : JPG, PNG, WEBP — 5 Mo max par image.</p>

          <div className="mt-4 flex flex-wrap gap-3">
            {images.map((img) => (
              <div key={img.id} className="group relative h-28 w-32 overflow-hidden rounded-sm border border-line">
                <img src={getImageUrl(img.url)} alt="" className="h-full w-full object-cover" />
                {img.is_primary && (
                  <span className="absolute left-1 top-1 flex items-center gap-1 rounded-xs bg-sand-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    <Star size={10} /> Principale
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleImageDelete(img.id)}
                  className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-red-600 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Supprimer la photo"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            <label className="flex h-28 w-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-line text-slate-400 hover:border-teal-500 hover:text-teal-500">
              <Upload size={18} />
              <span className="text-xs">{uploading ? 'Envoi…' : 'Ajouter'}</span>
              <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>
          </div>
        </div>
      )}
    </div>
  )
}
