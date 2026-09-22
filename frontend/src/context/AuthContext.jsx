import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import * as authApi from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('immoassist_token')
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const me = await authApi.getCurrentUser()
      setUser(me)
    } catch {
      localStorage.removeItem('immoassist_token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  async function login(email, password) {
    const { access_token } = await authApi.login(email, password)
    localStorage.setItem('immoassist_token', access_token)
    const me = await authApi.getCurrentUser()
    setUser(me)
    return me
  }

  async function register(payload) {
    await authApi.register(payload)
    return login(payload.email, payload.password)
  }

  function logout() {
    localStorage.removeItem('immoassist_token')
    setUser(null)
  }

  async function refreshUser() {
    const me = await authApi.getCurrentUser()
    setUser(me)
    return me
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isAgent: user?.role === 'agent' || user?.role === 'admin',
    login,
    register,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit etre utilise a l\'interieur de <AuthProvider>')
  return ctx
}
