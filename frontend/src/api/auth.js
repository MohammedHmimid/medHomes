import api from './axios'

export async function login(email, password) {
  const form = new URLSearchParams()
  form.append('username', email)
  form.append('password', password)
  const { data } = await api.post('/auth/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return data
}

export async function register(payload) {
  const { data } = await api.post('/auth/register', payload)
  return data
}

export async function getCurrentUser() {
  const { data } = await api.get('/auth/me')
  return data
}

export async function updateProfile(payload) {
  const { data } = await api.put('/users/me', payload)
  return data
}

export async function updatePassword(payload) {
  await api.put('/users/me/password', payload)
}
