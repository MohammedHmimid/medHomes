import { Link } from 'react-router-dom'
import { Heart, BedDouble, Bath, Ruler, MapPin } from 'lucide-react'
import {
  getImageUrl, formatPrice, PROPERTY_TYPE_LABELS, TRANSACTION_TYPE_LABELS,
} from '../utils/format'

export default function PropertyCard({ property, isFavorite, onToggleFavorite, showFavorite = true }) {
  const primaryImage = property.images?.find((img) => img.is_primary) || property.images?.[0]

  return (
    <div className="card group overflow-hidden transition-shadow hover:shadow-panel">
      <div className="relative aspect-[4/3] overflow-hidden bg-line">
        <Link to={`/biens/${property.id}`}>
          {primaryImage ? (
            <img
              src={getImageUrl(primaryImage.url)}
              alt={property.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-400">
              Aucune photo
            </div>
          )}
        </Link>
        <span className="badge absolute left-3 top-3 bg-white/95 text-ink shadow-sm">
          {TRANSACTION_TYPE_LABELS[property.transaction_type]}
        </span>
        {property.is_featured && (
          <span className="badge absolute right-3 top-3 bg-sand-500 text-white shadow-sm">
            En vedette
          </span>
        )}
        {showFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault()
              onToggleFavorite?.(property)
            }}
            className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-ink shadow-sm transition-colors hover:text-teal-500"
            aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Heart size={17} className={isFavorite ? 'fill-teal-500 text-teal-500' : ''} />
          </button>
        )}
      </div>

      <Link to={`/biens/${property.id}`} className="block p-4">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-display text-xl font-semibold text-ink">
            {formatPrice(property.price, property.currency)}
            {property.transaction_type === 'rent' && <span className="text-sm font-normal text-slate-500"> /mois</span>}
          </p>
        </div>
        <h3 className="mt-1 truncate text-sm font-semibold text-ink">{property.title}</h3>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
          <MapPin size={13} /> {property.city} · {PROPERTY_TYPE_LABELS[property.property_type]}
        </p>

        <div className="mt-3 flex items-center gap-4 border-t border-line pt-3 text-xs text-slate-500">
          {property.bedrooms != null && (
            <span className="flex items-center gap-1"><BedDouble size={14} /> {property.bedrooms}</span>
          )}
          {property.bathrooms != null && (
            <span className="flex items-center gap-1"><Bath size={14} /> {property.bathrooms}</span>
          )}
          <span className="flex items-center gap-1"><Ruler size={14} /> {property.surface_area} m²</span>
        </div>
      </Link>
    </div>
  )
}
