import React from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './hooks/useAuth'
import Home from './pages/Home'
import Login from './pages/Login'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <div className="p-4">Loading...</div>
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

function AppContent() {
  const { isAuthenticated, user, logout } = useAuth()
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="font-semibold text-lg">Scoring App</Link>
          <nav className="space-x-3 text-sm">
            {isAuthenticated ? (
              <>
                <span className="text-gray-600">{user?.name}</span>
                <Link to="/events" className="text-gray-600">Events</Link>
                <button onClick={logout} className="text-indigo-600">Logout</button>
              </>
            ) : (
              <Link to="/login" className="text-indigo-600">Login</Link>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:id"
            element={
              <ProtectedRoute>
                <EventDetail />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}