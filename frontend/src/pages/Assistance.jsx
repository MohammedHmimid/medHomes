import { useState } from 'react'
import { CheckCircle2, MessageCircleHeart, Calculator, CalendarClock, HelpCircle } from 'lucide-react'
import { createContactRequest } from '../api/contacts'
import { useAuth } from '../context/AuthContext.jsx'

const REQUEST_OPTIONS = [
  { value: 'general_assistance', label: 'Conseil général', icon: MessageCircleHeart },
  { value: 'estimation', label: 'Estimation de bien', icon: Calculator },
  { value: 'visit_request', label: 'Organiser une visite', icon: CalendarClock },
  { value: 'property_inquiry', label: 'Autre question', icon: HelpCircle },
]

export default function Assistance() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    name: user?.full_name || '', email: user?.email || '', phone: user?.phone || '',
    request_type: 'general_assistance', message: '',
  })
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await createContactRequest(form)
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Impossible d\'envoyer votre demande.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-display text-3xl font-semibold text-ink">Service d'assistance immobilière</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-500">
          Une question, un projet d'achat, de location ou besoin d'estimer un bien ? Décrivez votre besoin,
          notre équipe vous recontacte rapidement.
        </p>
      </div>

      {sent ? (
        <div className="card mt-10 flex flex-col items-center gap-3 p-10 text-center">
          <CheckCircle2 size={30} className="text-teal-600" />
          <p className="text-base font-semibold text-ink">Votre demande a bien été envoyée</p>
          <p className="text-sm text-slate-500">Notre équipe vous recontactera dans les meilleurs délais.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card mt-10 space-y-5 p-6 sm:p-8">
          {error && <p className="rounded-sm bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <div>
            <label className="label">Type de demande</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {REQUEST_OPTIONS.map((opt) => {
                const Icon = opt.icon
                const active = form.request_type === opt.value
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setForm({ ...form, request_type: opt.value })}
                    className={`flex flex-col items-center gap-2 rounded-sm border p-3 text-center text-xs font-medium transition-colors ${
                      active ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-line text-slate-500 hover:border-ink/30'
                    }`}
                  >
                    <Icon size={18} />
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Nom complet</label>
              <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Email</label>
              <input required type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Téléphone (optionnel)</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="label">Votre message</label>
            <textarea required rows={5} className="input" placeholder="Décrivez votre projet ou votre question…"
              value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>

          <button type="submit" disabled={loading} className="btn-accent w-full sm:w-auto">
            {loading ? 'Envoi…' : 'Envoyer ma demande'}
          </button>
        </form>
      )}
    </div>
  )
}
