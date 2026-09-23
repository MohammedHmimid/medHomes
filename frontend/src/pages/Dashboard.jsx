import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Building2, Eye, MessageSquare, Pencil, Trash2 } from 'lucide-react'
import { fetchMyProperties, deleteProperty } from '../api/properties'
import { fetchContactRequests, updateContactRequest } from '../api/contacts'
import { useAuth } from '../context/AuthContext.jsx'
import StatCard from '../components/StatCard.jsx'
import Loader from '../components/Loader.jsx'
import {
  getImageUrl, formatPrice, PROPERTY_TYPE_LABELS, STATUS_LABELS, STATUS_STYLES,
  REQUEST_TYPE_LABELS, REQUEST_STATUS_LABELS,
} from '../utils/format'

export default function Dashboard() {
  const { user } = useAuth()
  const [properties, setProperties] = useState([])
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('biens')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [props, reqs] = await Promise.all([
        fetchMyProperties(),
        fetchContactRequests().catch(() => []),
      ])
      setProperties(props)
      setContacts(reqs)
      setLoading(false)
    }
    load()
  }, [])

  async function handleDelete(id) {
    if (!window.confirm('Supprimer ce bien ?')) return
    await deleteProperty(id)
    setProperties((prev) => prev.filter((p) => p.id !== id))
  }

  async function handleStatusChange(contactId, status) {
    const updated = await updateContactRequest(contactId, status)
    setContacts((prev) => prev.map((c) => (c.id === contactId ? updated : c)))
  }

  const totalViews = properties.reduce((sum, p) => sum + p.views_count, 0)
  const newRequests = contacts.filter((c) => c.status === 'new').length

  if (loading) return <Loader />

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Bonjour {user?.full_name?.split(' ')[0]}</h1>
          <p className="mt-1 text-sm text-slate-500">Gérez vos annonces et suivez vos demandes de contact.</p>
        </div>
        <Link to="/biens/nouveau" className="btn-primary"><Plus size={16} /> Publier un bien</Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Building2} label="Biens publiés" value={properties.length} accent="ink" />
        <StatCard icon={Eye} label="Vues cumulées" value={totalViews} accent="teal" />
        <StatCard icon={MessageSquare} label="Nouvelles demandes" value={newRequests} accent="sand" />
      </div>

      <div className="mt-8 flex gap-1 border-b border-line">
        {[{ id: 'biens', label: 'Mes biens' }, { id: 'demandes', label: 'Demandes de contact' }].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`border-b-2 px-4 py-2.5 text-sm font-medium ${tab === t.id ? 'border-teal-500 text-ink' : 'border-transparent text-slate-500 hover:text-ink'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'biens' ? (
        properties.length === 0 ? (
          <p className="mt-8 rounded-md border border-dashed border-line p-10 text-center text-sm text-slate-500">
            Vous n'avez publié aucun bien pour le moment.
          </p>
        ) : (
          <div className="mt-6 overflow-hidden rounded-md border border-line bg-white">
            {properties.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-4 border-b border-line p-4 last:border-b-0">
                <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xs bg-line">
                  {p.images?.[0] && <img src={getImageUrl(p.images[0].url)} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-[180px] flex-1">
                  <Link to={`/biens/${p.id}`} className="text-sm font-semibold text-ink hover:text-teal-600">{p.title}</Link>
                  <p className="text-xs text-slate-500">{PROPERTY_TYPE_LABELS[p.property_type]} · {p.city}</p>
                </div>
                <p className="w-32 text-sm font-semibold text-ink">{formatPrice(p.price, p.currency)}</p>
                <span className={`badge ${STATUS_STYLES[p.status]}`}>{STATUS_LABELS[p.status]}</span>
                <p className="flex items-center gap-1 text-xs text-slate-500"><Eye size={13} /> {p.views_count}</p>
                <div className="ml-auto flex gap-2">
                  <Link to={`/biens/${p.id}/modifier`} className="rounded-sm p-2 text-slate-500 hover:bg-black/5 hover:text-ink" aria-label="Modifier"><Pencil size={15} /></Link>
                  <button onClick={() => handleDelete(p.id)} className="rounded-sm p-2 text-slate-500 hover:bg-red-50 hover:text-red-600" aria-label="Supprimer"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        contacts.length === 0 ? (
          <p className="mt-8 rounded-md border border-dashed border-line p-10 text-center text-sm text-slate-500">
            Aucune demande de contact pour le moment.
          </p>
        ) : (
          <div className="mt-6 space-y-3">
            {contacts.map((c) => (
              <div key={c.id} className="card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-ink">{c.name} <span className="font-normal text-slate-400">- {c.email}</span><br /> TEL :  <span className="font-normal text-slate-400"> {c.phone}</span>  </p>
                    <p className="text-xs text-slate-500">{REQUEST_TYPE_LABELS[c.request_type]} · {new Date(c.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <select
                    value={c.status}
                    onChange={(e) => handleStatusChange(c.id, e.target.value)}
                    className="input w-auto py-1.5 text-xs"
                  >
                    {Object.entries(REQUEST_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <p className="mt-2 text-sm text-slate-600">{c.message}</p>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
