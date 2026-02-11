import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Settings, Bell } from 'lucide-react'

/**
 * BottomNav - Mobile-first bottom navigation
 *
 * Shows on protected routes (after onboarding)
 * Thumb-friendly with large touch targets
 */

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const tabs = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/home',
      activePaths: ['/home', '/checkin', '/recommendations']
    },
    {
      id: 'notifications',
      label: 'Reminders',
      icon: Bell,
      path: '/settings/notifications'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/settings'
    }
  ]

  const isActive = (tab) => {
    if (tab.activePaths) {
      return tab.activePaths.some(p => location.pathname.startsWith(p))
    }
    return location.pathname === tab.path
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-cream border-t border-sand/50 safe-bottom z-40">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = isActive(tab)

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-colors ${
                active
                  ? 'text-terracotta'
                  : 'text-earth-light hover:text-earth'
              }`}
            >
              <Icon className={`w-6 h-6 ${active ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-xs mt-1 ${active ? 'font-medium' : ''}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
