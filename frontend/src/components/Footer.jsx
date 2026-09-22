import { Link } from 'react-router-dom'
import { Building2 } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-ink text-white">
                <Building2 size={16} />
              </span>
              <span className="font-display text-lg font-semibold text-ink">medHomes</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500">
              La plateforme qui simplifie la recherche, la gestion et l'accompagnement de vos projets immobiliers au Maroc.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-ink">Explorer</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li><Link to="/biens" className="hover:text-ink">Tous les biens</Link></li>
              <li><Link to="/biens?transaction_type=sale" className="hover:text-ink">Acheter</Link></li>
              <li><Link to="/biens?transaction_type=rent" className="hover:text-ink">Louer</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-ink">Compte</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li><Link to="/tableau-de-bord" className="hover:text-ink">Mon espace</Link></li>
              <li><Link to="/favoris" className="hover:text-ink">Favoris</Link></li>
              <li><Link to="/assistance" className="hover:text-ink">Demander une assistance</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-ink">Contact</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li>Casablanca, Maroc</li>
              <li>mohammedhmimid05@gmail.com</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} medHomes. Tous droits reserves.</p>
          <p>Projet pedagogique — donnees de demonstration.</p>
        </div>
      </div>
    </footer>
  )
}
