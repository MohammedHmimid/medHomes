import api from './axios'

export async function fetchFavorites() {
  const { data } = await api.get('/favorites')
  return data
}

export async function addFavorite(propertyId) {
  const { data } = await api.post(`/favorites/${propertyId}`)
  return data
}

export async function removeFavorite(propertyId) {
  await api.delete(`/favorites/${propertyId}`)
}
