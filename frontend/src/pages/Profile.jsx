import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { updateProfile, updatePassword } from '../api/auth'

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const [form, setForm] = useState({ full_name: user?.full_name || '', phone: user?.phone || '' })
  const [pwd, setPwd] = useState({ current_password: '', new_password: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')
  const [pwdMsg, setPwdMsg] = useState('')
  const [pwdError, setPwdError] = useState('')

  async function handleProfileSubmit(e) {
    e.preventDefault()
    setSavingProfile(true)
    setProfileMsg('')
    try {
      await updateProfile(form)
      await refreshUser()
      setProfileMsg('Profil mis à jour.')
    } finally {
      setSavingProfile(false)
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setSavingPwd(true)
    setPwdMsg('')
    setPwdError('')
    try {
      await updatePassword(pwd)
      setPwd({ current_password: '', new_password: '' })
      setPwdMsg('Mot de passe modifié.')
    } catch (err) {
      setPwdError(err.response?.data?.detail || 'Erreur lors du changement de mot de passe.')
    } finally {
      setSavingPwd(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-ink">Mon profil</h1>
      <p className="mt-1 text-sm text-slate-500">Gérez vos informations personnelles et votre mot de passe.</p>

      <form onSubmit={handleProfileSubmit} className="card mt-6 space-y-4 p-6">
        <h2 className="text-base font-semibold text-ink">Informations</h2>
        {profileMsg && <p className="rounded-sm bg-teal-50 px-3 py-2 text-sm text-teal-700">{profileMsg}</p>}
        <div>
          <label className="label">Email</label>
          <input disabled value={user?.email || ''} className="input bg-canvas text-slate-500" />
        </div>
        <div>
          <label className="label">Nom complet</label>
          <input required minLength={2} className="input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
        </div>
        <div>
          <label className="label">Téléphone</label>
          <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <button type="submit" disabled={savingProfile} className="btn-primary">
          {savingProfile ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="card mt-6 space-y-4 p-6">
        <h2 className="text-base font-semibold text-ink">Mot de passe</h2>
        {pwdMsg && <p className="rounded-sm bg-teal-50 px-3 py-2 text-sm text-teal-700">{pwdMsg}</p>}
        {pwdError && <p className="rounded-sm bg-red-50 px-3 py-2 text-sm text-red-600">{pwdError}</p>}
        <div>
          <label className="label">Mot de passe actuel</label>
          <input required type="password" className="input" value={pwd.current_password} onChange={(e) => setPwd({ ...pwd, current_password: e.target.value })} />
        </div>
        <div>
          <label className="label">Nouveau mot de passe</label>
          <input required minLength={6} type="password" className="input" value={pwd.new_password} onChange={(e) => setPwd({ ...pwd, new_password: e.target.value })} />
        </div>
        <button type="submit" disabled={savingPwd} className="btn-outline">
          {savingPwd ? 'Modification…' : 'Changer le mot de passe'}
        </button>
      </form>
    </div>
  )
}
