import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate(location.state?.from?.pathname || '/tableau-de-bord', { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Email ou mot de passe incorrect.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="card p-8">
        <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-ink text-white">
          <LogIn size={19} />
        </span>
        <h1 className="mt-5 text-2xl font-semibold text-ink">Bon retour</h1>
        <p className="mt-1 text-sm text-slate-500">Connectez-vous pour gérer vos biens et vos favoris.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && <p className="rounded-sm bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" required className="input" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="vous@exemple.com" />
          </div>
          <div>
            <label className="label" htmlFor="password">Mot de passe</label>
            <input id="password" type="password" required className="input" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Pas encore de compte ? <Link to="/inscription" className="font-semibold text-teal-600">Créer un compte</Link>
        </p>
        <p className="mt-3 rounded-sm bg-canvas p-3 text-center text-xs text-slate-500">
          Compte de démonstration : admin@medHomes.ma / Admin123!
        </p>
      </div>
    </div>
  )
}
