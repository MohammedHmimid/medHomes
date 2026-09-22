import api from './axios'

export async function createContactRequest(payload) {
  const { data } = await api.post('/contacts', payload)
  return data
}

export async function fetchContactRequests() {
  const { data } = await api.get('/contacts')
  return data
}

export async function updateContactRequest(id, status) {
  const { data } = await api.put(`/contacts/${id}`, { status })
  return data
}

export async function deleteContactRequest(id) {
  await api.delete(`/contacts/${id}`)
}
