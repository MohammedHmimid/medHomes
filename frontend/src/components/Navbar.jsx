import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Building2, Heart, LayoutDashboard, Bell, LogOut, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const navLinks = [
  { to: '/biens', label: 'Tous les biens' },
  { to: '/biens?transaction_type=sale', label: 'Acheter' },
  { to: '/biens?transaction_type=rent', label: 'Louer' },
  { to: '/assistance', label: 'Assistance' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
    setOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-ink text-white">
            <Building2 size={18} strokeWidth={2.2} />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-ink">medHomes</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-teal-600' : 'text-slate-600 hover:text-ink'
                }`
              }
              end
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <>
              <Link to="/notifications" className="rounded-sm p-2 text-slate-600 hover:bg-black/5 hover:text-ink" aria-label="Notifications">
                <Bell size={19} />
              </Link>
              <Link to="/favoris" className="rounded-sm p-2 text-slate-600 hover:bg-black/5 hover:text-ink" aria-label="Favoris">
                <Heart size={19} />
              </Link>
              {isAdmin && (
                <Link to="/admin" className="rounded-sm p-2 text-slate-600 hover:bg-black/5 hover:text-ink" aria-label="Administration">
                  <ShieldCheck size={19} />
                </Link>
              )}
              <Link to="/tableau-de-bord" className="flex items-center gap-2 rounded-sm border border-line bg-white px-3.5 py-2 text-sm font-medium text-ink hover:border-ink">
                <LayoutDashboard size={16} />
                {user?.full_name?.split(' ')[0] || 'Espace'}
              </Link>
              <button onClick={handleLogout} className="rounded-sm p-2 text-slate-500 hover:bg-black/5 hover:text-ink" aria-label="Deconnexion">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link to="/connexion" className="btn-ghost">Connexion</Link>
              <Link to="/inscription" className="btn-accent">Publier un bien</Link>
            </>
          )}
        </div>

        <button className="p-2 lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Ouvrir le menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-canvas px-4 pb-5 pt-2 lg:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link key={link.label} to={link.to} onClick={() => setOpen(false)} className="rounded-sm px-3 py-2.5 text-sm font-medium text-ink hover:bg-black/5">
                {link.label}
              </Link>
            ))}
            <div className="my-2 border-t border-line" />
            {isAuthenticated ? (
              <>
                <Link to="/tableau-de-bord" onClick={() => setOpen(false)} className="rounded-sm px-3 py-2.5 text-sm font-medium hover:bg-black/5">Mon espace</Link>
                <Link to="/favoris" onClick={() => setOpen(false)} className="rounded-sm px-3 py-2.5 text-sm font-medium hover:bg-black/5">Favoris</Link>
                <Link to="/notifications" onClick={() => setOpen(false)} className="rounded-sm px-3 py-2.5 text-sm font-medium hover:bg-black/5">Notifications</Link>
                {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} className="rounded-sm px-3 py-2.5 text-sm font-medium hover:bg-black/5">Administration</Link>}
                <button onClick={handleLogout} className="mt-1 rounded-sm bg-ink px-3 py-2.5 text-left text-sm font-medium text-white">Se deconnecter</button>
              </>
            ) : (
              <>
                <Link to="/connexion" onClick={() => setOpen(false)} className="rounded-sm px-3 py-2.5 text-sm font-medium hover:bg-black/5">Connexion</Link>
                <Link to="/inscription" onClick={() => setOpen(false)} className="mt-1 rounded-sm bg-teal-500 px-3 py-2.5 text-center text-sm font-semibold text-white">Creer un compte</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
