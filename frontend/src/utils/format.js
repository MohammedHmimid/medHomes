const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:8000'

export function getImageUrl(url) {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${UPLOADS_URL}${url}`
}

export function formatPrice(price, currency = 'MAD') {
  return `${new Intl.NumberFormat('fr-FR').format(price)} ${currency}`
}

export const PROPERTY_TYPE_LABELS = {
  apartment: 'Appartement',
  house: 'Maison',
  villa: 'Villa',
  office: 'Bureau',
  land: 'Terrain',
}

export const TRANSACTION_TYPE_LABELS = {
  sale: 'Vente',
  rent: 'Location',
}

export const STATUS_LABELS = {
  available: 'Disponible',
  pending: 'En cours',
  sold: 'Vendu',
  rented: 'Loue',
}

export const STATUS_STYLES = {
  available: 'bg-teal-50 text-teal-600',
  pending: 'bg-sand-100 text-sand-600',
  sold: 'bg-slate-400/15 text-slate-600',
  rented: 'bg-slate-400/15 text-slate-600',
}

export const REQUEST_TYPE_LABELS = {
  property_inquiry: 'Interet pour un bien',
  visit_request: 'Demande de visite',
  estimation: 'Estimation de bien',
  general_assistance: 'Assistance generale',
}

export const REQUEST_STATUS_LABELS = {
  new: 'Nouvelle',
  in_progress: 'En cours',
  closed: 'Cloturee',
}
