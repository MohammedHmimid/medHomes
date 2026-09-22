import api from './axios'

export async function fetchNotifications() {
  const { data } = await api.get('/notifications')
  return data
}

export async function markNotificationRead(id) {
  const { data } = await api.put(`/notifications/${id}/read`)
  return data
}

export async function markAllNotificationsRead() {
  await api.put('/notifications/read-all')
}

export async function deleteNotification(id) {
  await api.delete(`/notifications/${id}`)
}
