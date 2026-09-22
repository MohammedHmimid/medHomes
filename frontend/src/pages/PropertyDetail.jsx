import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  BedDouble, Bath, Ruler, MapPin, Heart, Pencil, Trash2, Building2,
  Phone, Mail, Send, CheckCircle2,
} from 'lucide-react'
import { fetchProperty, deleteProperty } from '../api/properties'
import { addFavorite, removeFavorite, fetchFavorites } from '../api/favorites'
import { createContactRequest } from '../api/contacts'
import { useAuth } from '../context/AuthContext.jsx'
import Loader from '../components/Loader.jsx'
import {
  getImageUrl, formatPrice, PROPERTY_TYPE_LABELS, TRANSACTION_TYPE_LABELS,
  STATUS_LABELS, STATUS_STYLES,
} from '../utils/format'

export default function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated, isAdmin } = useAuth()

  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [contactSent, setContactSent] = useState(false)
  const [contactError, setContactError] = useState('')

  useEffect(() => {
    setLoading(true)
    fetchProperty(id).then(setProperty).finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (user) setContactForm((f) => ({ ...f, name: user.full_name, email: user.email, phone: user.phone || '' }))
  }, [user])

  useEffect(() => {
    if (!isAuthenticated) return
    fetchFavorites().then((favs) => setIsFavorite(favs.some((f) => f.property.id === Number(id)))).catch(() => {})
  }, [isAuthenticated, id])

  async function toggleFavorite() {
    if (!isAuthenticated) { navigate('/connexion'); return }
    if (isFavorite) {
      setIsFavorite(false)
      await removeFavorite(id).catch(() => setIsFavorite(true))
    } else {
      setIsFavorite(true)
      await addFavorite(id).catch(() => setIsFavorite(false))
    }
  }

  async function handleDelete() {
    if (!window.confirm('Supprimer definitivement ce bien ?')) return
    await deleteProperty(id)
    navigate('/tableau-de-bord')
  }

  async function handleContactSubmit(e) {
    e.preventDefault()
    setContactError('')
    try {
      await createContactRequest({ ...contactForm, property_id: Number(id), request_type: 'property_inquiry' })
      setContactSent(true)
    } catch (err) {
      setContactError(err.response?.data?.detail || 'Impossible d\'envoyer la demande.')
    }
  }

  if (loading) return <Loader />
  if (!property) return <p className="py-20 text-center text-slate-500">Bien introuvable.</p>

  const isOwner = user?.id === property.owner_id
  const canManage = isOwner || isAdmin
  const images = property.images?.length ? property.images : [{ url: null, id: 'placeholder' }]

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-4 text-sm text-slate-500">
        <Link to="/biens" className="hover:text-ink">Tous les biens</Link> / <span className="text-ink">{property.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <div className="aspect-[16/10] overflow-hidden rounded-md bg-line">
            {images[activeImage]?.url ? (
              <img src={getImageUrl(images[activeImage].url)} alt={property.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400">Aucune photo disponible</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-20 shrink-0 overflow-hidden rounded-xs border-2 ${i === activeImage ? 'border-teal-500' : 'border-transparent'}`}
                >
                  <img src={getImageUrl(img.url)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge bg-teal-50 text-teal-600">{TRANSACTION_TYPE_LABELS[property.transaction_type]}</span>
                <span className={`badge ${STATUS_STYLES[property.status]}`}>{STATUS_LABELS[property.status]}</span>
              </div>
              <h1 className="mt-3 font-display text-3xl font-semibold text-ink">{property.title}</h1>
              <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                <MapPin size={15} /> {property.address}, {property.city}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggleFavorite} className="btn-outline" aria-label="Favoris">
                <Heart size={16} className={isFavorite ? 'fill-teal-500 text-teal-500' : ''} /> Favoris
              </button>
              {canManage && (
                <>
                  <Link to={`/biens/${property.id}/modifier`} className="btn-outline"><Pencil size={16} /> Modifier</Link>
                  <button onClick={handleDelete} className="btn-outline text-red-600 hover:border-red-300"><Trash2 size={16} /> Supprimer</button>
                </>
              )}
            </div>
          </div>

          <p className="mt-3 font-display text-3xl font-semibold text-ink">
            {formatPrice(property.price, property.currency)}
            {property.transaction_type === 'rent' && <span className="text-base font-normal text-slate-500"> /mois</span>}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 rounded-md border border-line bg-white p-5 sm:grid-cols-4">
            <Stat icon={Building2} label={PROPERTY_TYPE_LABELS[property.property_type]} />
            <Stat icon={Ruler} label={`${property.surface_area} m²`} />
            {property.bedrooms != null && <Stat icon={BedDouble} label={`${property.bedrooms} chambres`} />}
            {property.bathrooms != null && <Stat icon={Bath} label={`${property.bathrooms} sdb`} />}
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-ink">Description</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">{property.description}</p>
          </div>
        </div>

        <aside>
          <div className="card sticky top-24 p-6">
            <h2 className="text-base font-semibold text-ink">Interessé par ce bien ?</h2>
            <p className="mt-1 text-sm text-slate-500">Envoyez un message, la demande sera transmise directement.</p>

            {contactSent ? (
              <div className="mt-5 flex flex-col items-center gap-2 rounded-md bg-teal-50 p-6 text-center">
                <CheckCircle2 size={26} className="text-teal-600" />
                <p className="text-sm font-medium text-teal-700">Votre demande a bien été envoyée.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="mt-5 space-y-3">
                {contactError && <p className="rounded-sm bg-red-50 px-3 py-2 text-sm text-red-600">{contactError}</p>}
                <input required placeholder="Nom complet" value={contactForm.name} className="input"
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} />
                <input required type="email" placeholder="Email" value={contactForm.email} className="input"
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} />
                <input placeholder="Téléphone (optionnel)" value={contactForm.phone} className="input"
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} />
                <textarea required rows={4} placeholder="Votre message" value={contactForm.message} className="input"
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} />
                <button type="submit" className="btn-accent w-full">
                  <Send size={16} /> Envoyer la demande
                </button>
              </form>
            )}

            <div className="mt-6 space-y-2 border-t border-line pt-5 text-sm text-slate-500">
              <p className="font-medium text-ink">Publié par {property.owner?.full_name || 'un agent medHomes'}</p>
              {property.owner?.phone && <p className="flex items-center gap-2"><Phone size={14} /> {property.owner.phone}</p>}
              {property.owner?.email && <p className="flex items-center gap-2"><Mail size={14} /> {property.owner.email}</p>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Stat({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 text-sm text-ink">
      <Icon size={17} className="text-teal-600" /> {label}
    </div>
  )
}
