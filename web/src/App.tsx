import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './hooks/useAuth'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PublicRoute } from './components/PublicRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import EventRankings from './pages/EventRankings'
import CriteriaRankings from './pages/CriteriaRankings'
import JudgeScoring from './pages/JudgeScoring'
import FunRunTimer from './components/FunRunTimer'

function AppContent() {
  const location = useLocation()
  const { isAuthenticated, user, logout } = useAuth()
  const hideHeader = location.pathname.startsWith('/fun-run')
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {!hideHeader && (
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
      )}

      <main className="max-w-3xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          {/* Public fun run timer route (no auth) */}
          <Route path="/fun-run" element={<FunRunTimer />} />
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
          <Route
            path="/events/:id/rankings"
            element={
              <ProtectedRoute>
                <EventRankings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:id/rankings/criteria"
            element={
              <ProtectedRoute>
                <CriteriaRankings />
              </ProtectedRoute>
            }
          />
          {/* Public judge scoring link */}
          <Route path="/judge/:code" element={<JudgeScoring />} />
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