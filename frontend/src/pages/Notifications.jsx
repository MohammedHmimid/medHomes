import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react'
import {
  fetchNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification,
} from '../api/notifications'
import Loader from '../components/Loader.jsx'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications().then(setNotifications).finally(() => setLoading(false))
  }, [])

  async function handleMarkRead(id) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    await markNotificationRead(id).catch(() => {})
  }

  async function handleMarkAll() {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    await markAllNotificationsRead().catch(() => {})
  }

  async function handleDelete(id) {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    await deleteNotification(id).catch(() => {})
  }

  if (loading) return <Loader />
  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">{unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAll} className="btn-outline"><CheckCheck size={16} /> Tout marquer comme lu</button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-md border border-dashed border-line py-20 text-center">
          <Bell size={26} className="text-slate-400" />
          <p className="text-sm text-slate-500">Aucune notification pour le moment.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {notifications.map((n) => (
            <div key={n.id} className={`card flex items-start gap-3 p-4 ${!n.is_read ? 'border-teal-200 bg-teal-50/40' : ''}`}>
              <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${!n.is_read ? 'bg-teal-500' : 'bg-transparent'}`} />
              <div className="flex-1">
                {n.link ? (
                  <Link to={n.link} onClick={() => handleMarkRead(n.id)} className="text-sm font-semibold text-ink hover:text-teal-600">{n.title}</Link>
                ) : (
                  <p className="text-sm font-semibold text-ink">{n.title}</p>
                )}
                <p className="mt-1 text-sm text-slate-500">{n.message}</p>
                <p className="mt-1 text-xs text-slate-400">{new Date(n.created_at).toLocaleString('fr-FR')}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                {!n.is_read && (
                  <button onClick={() => handleMarkRead(n.id)} className="rounded-sm p-2 text-slate-400 hover:bg-black/5 hover:text-teal-600" aria-label="Marquer comme lu"><Check size={15} /></button>
                )}
                <button onClick={() => handleDelete(n.id)} className="rounded-sm p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Supprimer"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
