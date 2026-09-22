import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { HeartOff } from 'lucide-react'
import { fetchFavorites, removeFavorite } from '../api/favorites'
import PropertyCard from '../components/PropertyCard.jsx'
import Loader from '../components/Loader.jsx'

export default function Favorites() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFavorites().then(setFavorites).finally(() => setLoading(false))
  }, [])

  async function handleRemove(property) {
    setFavorites((prev) => prev.filter((f) => f.property.id !== property.id))
    await removeFavorite(property.id).catch(() => {})
  }

  if (loading) return <Loader />

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-ink">Mes favoris</h1>
      <p className="mt-1 text-sm text-slate-500">Les biens que vous avez sauvegardés.</p>

      {favorites.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-md border border-dashed border-line py-20 text-center">
          <HeartOff size={26} className="text-slate-400" />
          <p className="text-sm text-slate-500">Vous n'avez pas encore de favoris.</p>
          <Link to="/biens" className="btn-accent mt-2">Explorer les biens</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav) => (
            <PropertyCard key={fav.id} property={fav.property} isFavorite onToggleFavorite={handleRemove} />
          ))}
        </div>
      )}
    </div>
  )
}
