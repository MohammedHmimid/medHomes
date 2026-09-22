import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search, Compass, MessageCircleHeart, ClipboardList, ArrowRight,
  MapPin, Building2, Users,
} from 'lucide-react'
import { fetchProperties } from '../api/properties'
import PropertyCard from '../components/PropertyCard.jsx'
import Loader from '../components/Loader.jsx'

export default function Home() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [featured, setFeatured] = useState([])
  const [total, setTotal] = useState(null)
  const [citiesCount, setCitiesCount] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [featuredRes, allRes, cityRes] = await Promise.all([
          fetchProperties({ is_featured: true, limit: 3 }),
          fetchProperties({ limit: 1 }),
          fetchProperties({ limit: 100 }),
        ])
        setFeatured(featuredRes.items.length ? featuredRes.items : (await fetchProperties({ limit: 3 })).items)
        setTotal(allRes.total)
        setCitiesCount(new Set(cityRes.items.map((p) => p.city)).size)
      } catch {
        setFeatured([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function handleSearch(e) {
    e.preventDefault()
    navigate(`/biens${query ? `?search=${encodeURIComponent(query)}` : ''}`)
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 bg-blueprint bg-repeat opacity-[0.06]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8 lg:py-28">
          <div>
            <h1 className="max-w-xl font-display text-4xl font-semibold leading-[1.12] sm:text-5xl">
              Chaque bien a un plan. Trouvez le vôtre, accompagné du premier au dernier mètre carré.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/70">
              medHomes réunit la recherche de biens, la gestion de vos annonces et un service
              d'assistance immobilière dans un seul espace, pensé pour les acheteurs, locataires,
              agents et propriétaires au Maroc.
            </p>

            <form onSubmit={handleSearch} className="mt-8 flex max-w-lg flex-col gap-2 rounded-md bg-white p-1.5 shadow-panel sm:flex-row">
              <div className="relative flex-1">
                <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ville, quartier, type de bien…"
                  className="w-full rounded-sm bg-transparent py-3 pl-10 pr-3 text-sm text-ink placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <button type="submit" className="btn-accent shrink-0">
                Rechercher <ArrowRight size={16} />
              </button>
            </form>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/60">
              <Link to="/biens?transaction_type=sale" className="hover:text-white">Acheter un bien</Link>
              <Link to="/biens?transaction_type=rent" className="hover:text-white">Louer un bien</Link>
              <Link to="/assistance" className="hover:text-white">Demander une estimation</Link>
            </div>
          </div>

          <div className="relative rounded-lg border border-white/15 bg-white/[0.04] p-6 backdrop-blur-sm">
            <span className="absolute left-3 top-3 h-3 w-3 border-l-2 border-t-2 border-teal-400/70" />
            <span className="absolute bottom-3 right-3 h-3 w-3 border-b-2 border-r-2 border-teal-400/70" />
            <p className="text-xs uppercase tracking-wide text-white/40">Sur medHomes, en ce moment</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-sm border border-white/10 p-4">
                <Building2 size={18} className="text-teal-400" />
                <p className="mt-3 font-display text-3xl font-semibold">{total ?? '—'}</p>
                <p className="mt-1 text-sm text-white/60">Biens publiés</p>
              </div>
              <div className="rounded-sm border border-white/10 p-4">
                <MapPin size={18} className="text-teal-400" />
                <p className="mt-3 font-display text-3xl font-semibold">{citiesCount ?? '—'}</p>
                <p className="mt-1 text-sm text-white/60">Villes couvertes</p>
              </div>
              <div className="col-span-2 rounded-sm border border-white/10 p-4">
                <Users size={18} className="text-teal-400" />
                <p className="mt-1 text-sm text-white/70">
                  Chaque demande de contact est transmise directement au propriétaire ou à l'agent du bien, avec suivi de statut.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pourquoi ImmoAssist */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <FeatureBlock
            icon={Compass}
            title="Recherche précise"
            text="Filtrez par ville, budget, surface, nombre de chambres et type de transaction pour ne voir que les biens qui vous concernent."
          />
          <FeatureBlock
            icon={ClipboardList}
            title="Gestion simplifiée"
            text="Publiez, modifiez et suivez vos annonces avec photos, statut et statistiques de consultation, sans changer d'outil."
          />
          <FeatureBlock
            icon={MessageCircleHeart}
            title="Assistance dédiée"
            text="Besoin d'un conseil, d'une estimation ou d'une visite ? Envoyez une demande, notre équipe et les propriétaires vous répondent."
          />
        </div>
      </section>

      {/* Biens en vedette */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-ink sm:text-3xl">Sélection du moment</h2>
              <p className="mt-1 text-sm text-slate-500">Des biens mis en avant par notre équipe.</p>
            </div>
            <Link to="/biens" className="hidden text-sm font-semibold text-teal-600 hover:text-teal-700 sm:flex sm:items-center sm:gap-1">
              Voir tous les biens <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <Loader />
          ) : featured.length === 0 ? (
            <p className="mt-8 rounded-md border border-dashed border-line p-8 text-center text-sm text-slate-500">
              Aucun bien publié pour le moment. Revenez bientôt, ou <Link to="/inscription" className="text-teal-600 underline">publiez le premier</Link>.
            </p>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((property) => (
                <PropertyCard key={property.id} property={property} showFavorite={false} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Comment ca marche - vraie sequence, numerotation justifiee */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-ink sm:text-3xl">Comment ça marche</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {[
            { n: '1', title: 'Décrivez votre projet', text: 'Achat, location, estimation ou simple conseil : indiquez ce que vous recherchez.' },
            { n: '2', title: 'Explorez ou publiez', text: 'Parcourez les biens filtrés selon vos critères, ou publiez votre propre annonce en quelques minutes.' },
            { n: '3', title: 'Échangez avec l\'assistance', text: 'Propriétaires, agents et équipe medHomes vous répondent directement depuis la plateforme.' },
          ].map((step) => (
            <div key={step.n} className="relative rounded-md border border-line bg-white p-6">
              <span className="font-display text-4xl font-semibold text-teal-500/30">{step.n}</span>
              <h3 className="mt-3 text-base font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-line bg-teal-50">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold text-ink">Un bien à vendre ou à louer ?</h2>
            <p className="mt-2 max-w-md text-sm text-slate-600">
              Créez votre compte et publiez votre première annonce avec photos en quelques minutes.
            </p>
          </div>
          <Link to="/inscription" className="btn-primary">
            Publier une annonce <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}

function FeatureBlock({ icon: Icon, title, text }) {
  return (
    <div>
      <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-teal-50 text-teal-600">
        <Icon size={20} />
      </span>
      <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{text}</p>
    </div>
  )
}
