import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import Home from './pages/Home.jsx'
import Properties from './pages/Properties.jsx'
import PropertyDetail from './pages/PropertyDetail.jsx'
import PropertyForm from './pages/PropertyForm.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Favorites from './pages/Favorites.jsx'
import Profile from './pages/Profile.jsx'
import Notifications from './pages/Notifications.jsx'
import Assistance from './pages/Assistance.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/biens" element={<Properties />} />
          <Route path="/biens/nouveau" element={<ProtectedRoute><PropertyForm /></ProtectedRoute>} />
          <Route path="/biens/:id/modifier" element={<ProtectedRoute><PropertyForm /></ProtectedRoute>} />
          <Route path="/biens/:id" element={<PropertyDetail />} />
          <Route path="/connexion" element={<Login />} />
          <Route path="/inscription" element={<Register />} />
          <Route path="/assistance" element={<Assistance />} />
          <Route path="/tableau-de-bord" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/favoris" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
          <Route path="/profil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
