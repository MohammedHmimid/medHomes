import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/tableau-de-bord', { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Impossible de créer le compte.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="card p-8">
        <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-ink text-white">
          <UserPlus size={19} />
        </span>
        <h1 className="mt-5 text-2xl font-semibold text-ink">Créer un compte</h1>
        <p className="mt-1 text-sm text-slate-500">Publiez vos biens, sauvegardez vos favoris et suivez vos demandes.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && <p className="rounded-sm bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <div>
            <label className="label" htmlFor="full_name">Nom complet</label>
            <input id="full_name" type="text" required minLength={2} className="input" value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Votre nom" />
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" required className="input" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="vous@exemple.com" />
          </div>
          <div>
            <label className="label" htmlFor="phone">Téléphone (optionnel)</label>
            <input id="phone" type="tel" className="input" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+212 6 00 00 00 00" />
          </div>
          <div>
            <label className="label" htmlFor="password">Mot de passe</label>
            <input id="password" type="password" required minLength={6} className="input" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="6 caractères minimum" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Création…' : 'Créer mon compte'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Déjà inscrit ? <Link to="/connexion" className="font-semibold text-teal-600">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
