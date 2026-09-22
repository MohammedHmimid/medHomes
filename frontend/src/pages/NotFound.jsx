import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[65vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <Compass size={32} className="text-slate-400" />
      <h1 className="font-display text-3xl font-semibold text-ink">Page introuvable</h1>
      <p className="max-w-sm text-sm text-slate-500">Cette page n'existe pas ou a été déplacée.</p>
      <Link to="/" className="btn-primary">Retour à l'accueil</Link>
    </div>
  )
}
