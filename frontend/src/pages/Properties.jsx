import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, SearchX } from 'lucide-react'
import { fetchProperties } from '../api/properties'
import { fetchFavorites, addFavorite, removeFavorite } from '../api/favorites'
import { useAuth } from '../context/AuthContext.jsx'
import PropertyCard from '../components/PropertyCard.jsx'
import PropertyFilters from '../components/PropertyFilters.jsx'
import Loader from '../components/Loader.jsx'

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { isAuthenticated } = useAuth()

  const [result, setResult] = useState({ items: [], total: 0, page: 1, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [favoriteIds, setFavoriteIds] = useState(new Set())

  const initialFilters = useMemo(() => ({
    search: searchParams.get('search') || '',
    property_type: searchParams.get('property_type') || '',
    transaction_type: searchParams.get('transaction_type') || '',
    city: searchParams.get('city') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    sort: searchParams.get('sort') || 'recent',
  }), [searchParams])

  const page = Number(searchParams.get('page') || 1)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const params = {}
      Object.entries(initialFilters).forEach(([k, v]) => { if (v) params[k] = v })
      params.page = page
      params.limit = 12
      try {
        const data = await fetchProperties(params)
        setResult(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [initialFilters, page])

  useEffect(() => {
    if (!isAuthenticated) { setFavoriteIds(new Set()); return }
    fetchFavorites().then((favs) => setFavoriteIds(new Set(favs.map((f) => f.property.id)))).catch(() => {})
  }, [isAuthenticated])

  function applyFilters(filters) {
    const params = {}
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v })
    setSearchParams(params)
  }

  function goToPage(newPage) {
    const params = Object.fromEntries(searchParams.entries())
    params.page = newPage
    setSearchParams(params)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function toggleFavorite(property) {
    if (!isAuthenticated) return
    const isFav = favoriteIds.has(property.id)
    const next = new Set(favoriteIds)
    if (isFav) {
      next.delete(property.id)
      setFavoriteIds(next)
      await removeFavorite(property.id).catch(() => setFavoriteIds(favoriteIds))
    } else {
      next.add(property.id)
      setFavoriteIds(next)
      await addFavorite(property.id).catch(() => setFavoriteIds(favoriteIds))
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-ink sm:text-3xl">Tous les biens</h1>
      <p className="mt-1 text-sm text-slate-500">
        {loading ? 'Recherche en cours…' : `${result.total} bien${result.total > 1 ? 's' : ''} correspondant${result.total > 1 ? 's' : ''} à votre recherche`}
      </p>

      <div className="mt-6">
        <PropertyFilters initialFilters={initialFilters} onChange={applyFilters} />
      </div>

      <div className="mt-8">
        {loading ? (
          <Loader />
        ) : result.items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-line py-20 text-center">
            <SearchX size={28} className="text-slate-400" />
            <p className="text-sm text-slate-500">Aucun bien ne correspond à ces critères. Essayez d'élargir votre recherche.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {result.items.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isFavorite={favoriteIds.has(property.id)}
                  onToggleFavorite={toggleFavorite}
                  showFavorite={isAuthenticated}
                />
              ))}
            </div>

            {result.pages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3">
                <button onClick={() => goToPage(page - 1)} disabled={page <= 1} className="btn-outline disabled:opacity-40">
                  <ChevronLeft size={16} /> Précédent
                </button>
                <span className="text-sm text-slate-500">Page {result.page} sur {result.pages}</span>
                <button onClick={() => goToPage(page + 1)} disabled={page >= result.pages} className="btn-outline disabled:opacity-40">
                  Suivant <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
