import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { UserProvider, useUser } from './context/UserContext'
import { trackEvent } from './lib/trackEvent'
import Welcome from './pages/Welcome'
import Onboarding from './pages/Onboarding'
import Login from './pages/Login'
import Home from './pages/Home'
import CheckIn from './pages/CheckIn'
import Recommendations from './pages/Recommendations'
import Settings from './pages/Settings'
import NotificationSettings from './pages/NotificationSettings'
import BottomNav from './components/BottomNav'
import InstallPrompt from './components/InstallPrompt'

// Protected route wrapper - redirects to welcome if not onboarded
function ProtectedRoute({ children }) {
  const { isOnboarded } = useUser()

  if (!isOnboarded) {
    return <Navigate to="/" replace />
  }

  return children
}

// Public route wrapper - redirects to home if already onboarded
function PublicRoute({ children }) {
  const { isOnboarded } = useUser()

  if (isOnboarded) {
    return <Navigate to="/home" replace />
  }

  return children
}

// Layout wrapper that shows bottom nav on protected routes
function AppLayout({ children }) {
  const location = useLocation()
  const { isOnboarded } = useUser()

  // Routes where we don't show bottom nav
  const hideNavRoutes = ['/', '/onboarding', '/login']
  const showNav = isOnboarded && !hideNavRoutes.includes(location.pathname)

  return (
    <div className="flex flex-col min-h-screen">
      <main className={`flex-1 ${showNav ? 'pb-20' : ''}`}>
        {children}
      </main>
      {showNav && <BottomNav />}
      <InstallPrompt />
    </div>
  )
}

function AppRoutes() {
  return (
    <AppLayout>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={
          <PublicRoute>
            <Welcome />
          </PublicRoute>
        } />
        <Route path="/onboarding" element={
          <PublicRoute>
            <Onboarding />
          </PublicRoute>
        } />
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />

        {/* Protected routes */}
        <Route path="/home" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/checkin" element={
          <ProtectedRoute>
            <CheckIn />
          </ProtectedRoute>
        } />
        <Route path="/recommendations" element={
          <ProtectedRoute>
            <Recommendations />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/settings/notifications" element={
          <ProtectedRoute>
            <NotificationSettings />
          </ProtectedRoute>
        } />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  )
}

function App() {
  useEffect(() => {
    console.log('app_loaded fired')
    trackEvent({ event_name: 'app_loaded', mood: 'awake', meta: { test: true } })
  }, [])

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
      {import.meta.env.DEV && (
        <button
          onClick={() => trackEvent({ event_name: 'manual_test', mood: 'awake', meta: { clicked: true } })}
          style={{ position: 'fixed', bottom: 80, right: 16, zIndex: 9999, padding: '8px 16px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
        >
          Send test event
        </button>
      )}
    </BrowserRouter>
  )
}

export default App
