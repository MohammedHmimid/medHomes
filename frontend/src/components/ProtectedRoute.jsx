import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Loader from './Loader.jsx'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Loader />

  if (!isAuthenticated) {
    return <Navigate to="/connexion" state={{ from: location }} replace />
  }
  if (adminOnly && !isAdmin) {
    return <Navigate to="/tableau-de-bord" replace />
  }
  return children
}
