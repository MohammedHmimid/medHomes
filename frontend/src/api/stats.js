import api from './axios'

export async function fetchOverview() {
  const { data } = await api.get('/stats/overview')
  return data
}

export async function fetchByType() {
  const { data } = await api.get('/stats/properties-by-type')
  return data
}

export async function fetchByCity() {
  const { data } = await api.get('/stats/properties-by-city')
  return data
}

export async function fetchByStatus() {
  const { data } = await api.get('/stats/properties-by-status')
  return data
}

export async function fetchRecentContacts() {
  const { data } = await api.get('/stats/recent-contacts')
  return data
}
