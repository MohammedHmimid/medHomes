import api from './axios'

export async function fetchProperties(params = {}) {
  const { data } = await api.get('/properties', { params })
  return data
}

export async function fetchProperty(id) {
  const { data } = await api.get(`/properties/${id}`)
  return data
}

export async function fetchMyProperties() {
  const { data } = await api.get('/properties/mine')
  return data
}

export async function createProperty(payload) {
  const { data } = await api.post('/properties', payload)
  return data
}

export async function updateProperty(id, payload) {
  const { data } = await api.put(`/properties/${id}`, payload)
  return data
}

export async function deleteProperty(id) {
  await api.delete(`/properties/${id}`)
}

export async function uploadPropertyImage(propertyId, file, isPrimary = false) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post(
    `/properties/${propertyId}/images?is_primary=${isPrimary}`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return data
}

export async function deletePropertyImage(propertyId, imageId) {
  await api.delete(`/properties/${propertyId}/images/${imageId}`)
}
