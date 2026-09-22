import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { PROPERTY_TYPE_LABELS, TRANSACTION_TYPE_LABELS } from '../utils/format'

const EMPTY_FILTERS = {
  search: '', property_type: '', transaction_type: '', city: '',
  min_price: '', max_price: '', bedrooms: '', sort: 'recent',
}

export default function PropertyFilters({ initialFilters = {}, onChange }) {
  const [filters, setFilters] = useState({ ...EMPTY_FILTERS, ...initialFilters })
  const [advancedOpen, setAdvancedOpen] = useState(false)

  useEffect(() => {
    setFilters((prev) => ({ ...prev, ...initialFilters }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialFilters)])

  function update(field, value) {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  function submit(e) {
    e?.preventDefault()
    onChange(filters)
  }

  function reset() {
    setFilters(EMPTY_FILTERS)
    onChange(EMPTY_FILTERS)
  }

  return (
    <form onSubmit={submit} className="card p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Ville, quartier, mot-cle…"
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
            className="input pl-10"
          />
        </div>
        <select value={filters.transaction_type} onChange={(e) => update('transaction_type', e.target.value)} className="input sm:w-40">
          <option value="">Vente / Location</option>
          {Object.entries(TRANSACTION_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filters.property_type} onChange={(e) => update('property_type', e.target.value)} className="input sm:w-44">
          <option value="">Tous types de biens</option>
          {Object.entries(PROPERTY_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button type="submit" className="btn-accent shrink-0">Rechercher</button>
        <button
          type="button"
          onClick={() => setAdvancedOpen((v) => !v)}
          className="btn-outline shrink-0"
          aria-expanded={advancedOpen}
        >
          <SlidersHorizontal size={16} /> Filtres
        </button>
      </div>

      {advancedOpen && (
        <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="label">Ville</label>
            <input type="text" value={filters.city} onChange={(e) => update('city', e.target.value)} className="input" placeholder="Casablanca…" />
          </div>
          <div>
            <label className="label">Prix min (MAD)</label>
            <input type="number" min="0" value={filters.min_price} onChange={(e) => update('min_price', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Prix max (MAD)</label>
            <input type="number" min="0" value={filters.max_price} onChange={(e) => update('max_price', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Chambres min.</label>
            <input type="number" min="0" value={filters.bedrooms} onChange={(e) => update('bedrooms', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Trier par</label>
            <select value={filters.sort} onChange={(e) => update('sort', e.target.value)} className="input">
              <option value="recent">Plus recent</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix decroissant</option>
              <option value="surface_asc">Surface croissante</option>
              <option value="surface_desc">Surface decroissante</option>
            </select>
          </div>
          <div className="flex items-end lg:col-span-5">
            <button type="button" onClick={reset} className="btn-ghost text-slate-500">
              <X size={15} /> Reinitialiser les filtres
            </button>
          </div>
        </div>
      )}
    </form>
  )
}
