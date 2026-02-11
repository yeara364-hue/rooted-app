import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { Bell, User, Trash2, ChevronRight } from 'lucide-react'
import { clearMemory } from '../lib/memory'

export default function Settings() {
  const navigate = useNavigate()
  const { user, logout } = useUser()

  const handleClearData = () => {
    if (confirm('This will delete all your data and reset the app. Are you sure?')) {
      clearMemory()
      logout()
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-cream pb-20">
      {/* Header */}
      <div className="p-4 pt-6">
        <h1 className="text-xl font-semibold text-earth">Settings</h1>
      </div>

      {/* Profile section */}
      <div className="px-4 mb-6">
        <div className="bg-cream-dark rounded-2xl p-4 border border-sand">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-sage rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-cream" />
            </div>
            <div>
              <p className="text-earth font-medium">{user?.name || 'User'}</p>
              <p className="text-earth-light text-sm">Your wellbeing journey</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings list */}
      <div className="px-4 space-y-3">
        <h2 className="text-sm font-medium text-earth-light uppercase tracking-wide px-1">
          Preferences
        </h2>

        {/* Notifications */}
        <button
          onClick={() => navigate('/settings/notifications')}
          className="w-full bg-cream-dark rounded-2xl p-4 border border-sand flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sage-light/30 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-sage-dark" />
            </div>
            <div className="text-left">
              <p className="text-earth font-medium">Reminders</p>
              <p className="text-earth-light text-sm">Daily meditation & yoga</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-earth-light" />
        </button>
      </div>

      {/* Danger zone */}
      <div className="px-4 mt-8 space-y-3">
        <h2 className="text-sm font-medium text-earth-light uppercase tracking-wide px-1">
          Data
        </h2>

        <button
          onClick={handleClearData}
          className="w-full bg-cream-dark rounded-2xl p-4 border border-sand flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-terracotta-light/30 rounded-xl flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-terracotta" />
          </div>
          <div className="text-left">
            <p className="text-terracotta font-medium">Clear all data</p>
            <p className="text-earth-light text-sm">Reset app and delete history</p>
          </div>
        </button>
      </div>

      {/* App info */}
      <div className="px-4 mt-8 text-center">
        <p className="text-earth-light text-sm">Rooted v1.0</p>
        <p className="text-earth-light/60 text-xs mt-1">Made with care</p>
      </div>
    </div>
  )
}
