import { useEffect, useState } from 'react'
import { Building2, Users, MessageSquare, Eye, ShieldCheck } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { fetchOverview, fetchByType, fetchByCity, fetchRecentContacts } from '../api/stats'
import StatCard from '../components/StatCard.jsx'
import Loader from '../components/Loader.jsx'
import { PROPERTY_TYPE_LABELS, REQUEST_STATUS_LABELS } from '../utils/format'

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null)
  const [byType, setByType] = useState([])
  const [byCity, setByCity] = useState([])
  const [recentContacts, setRecentContacts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [ov, type, city, contacts] = await Promise.all([
        fetchOverview(), fetchByType(), fetchByCity(), fetchRecentContacts(),
      ])
      setOverview(ov)
      setByType(type.map((t) => ({ name: PROPERTY_TYPE_LABELS[t.type] || t.type, total: t.count })))
      setByCity(city.map((c) => ({ name: c.city, total: c.count })))
      setRecentContacts(contacts)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <Loader />

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2">
        <ShieldCheck size={22} className="text-teal-600" />
        <h1 className="text-2xl font-semibold text-ink">Tableau de bord administrateur</h1>
      </div>
      <p className="mt-1 text-sm text-slate-500">Vue d'ensemble de l'activité de la plateforme.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={Building2} label="Biens publiés" value={overview.total_properties} accent="ink" />
        <StatCard icon={Building2} label="Biens disponibles" value={overview.total_available_properties} accent="teal" />
        <StatCard icon={Users} label="Utilisateurs" value={overview.total_users} accent="ink" />
        <StatCard icon={MessageSquare} label="Demandes (dont nouvelles)" value={`${overview.total_contact_requests} (${overview.new_contact_requests})`} accent="sand" />
        <StatCard icon={Eye} label="Vues cumulées" value={overview.total_views} accent="teal" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-base font-semibold text-ink">Répartition par type de bien</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E7E0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#697084' }} axisLine={{ stroke: '#E4E7E0' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#697084' }} axisLine={{ stroke: '#E4E7E0' }} />
                <Tooltip cursor={{ fill: '#F6F7F3' }} />
                <Bar dataKey="total" fill="#1F6F5C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-base font-semibold text-ink">Top villes</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCity} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E7E0" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#697084' }} axisLine={{ stroke: '#E4E7E0' }} />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12, fill: '#697084' }} axisLine={{ stroke: '#E4E7E0' }} />
                <Tooltip cursor={{ fill: '#F6F7F3' }} />
                <Bar dataKey="total" fill="#B8863B" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card mt-8 p-6">
        <h2 className="text-base font-semibold text-ink">Demandes de contact récentes</h2>
        {recentContacts.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Aucune demande pour le moment.</p>
        ) : (
          <div className="mt-4 divide-y divide-line">
            {recentContacts.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{c.name}</p>
                  <p className="truncate text-xs text-slate-500 max-w-md">{c.message}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{new Date(c.created_at).toLocaleDateString('fr-FR')}</span>
                  <span className="badge bg-teal-50 text-teal-600">{REQUEST_STATUS_LABELS[c.status]}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
