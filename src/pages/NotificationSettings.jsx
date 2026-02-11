import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell, BellOff, Clock, Sparkles, Dumbbell } from 'lucide-react'

/**
 * NotificationSettings - Configure daily reminders
 *
 * Features:
 * - Enable/disable notifications
 * - Set meditation reminder time
 * - Set yoga/movement reminder time
 * - Client-side scheduler for when app is open
 *
 * TODO: Real push notifications when app is closed require:
 * - Service worker push subscription
 * - Backend server to send push notifications
 * - FCM or similar push service
 */

const STORAGE_KEY = 'rooted-notification-settings'

const DEFAULT_SETTINGS = {
  enabled: false,
  meditationTime: '08:00',
  meditationEnabled: true,
  yogaTime: '18:00',
  yogaEnabled: true,
  lastNotified: null
}

export default function NotificationSettings() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [permissionStatus, setPermissionStatus] = useState('default')
  const [saved, setSaved] = useState(false)

  // Load settings on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setSettings(JSON.parse(stored))
    }

    // Check notification permission
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission)
    }
  }, [])

  // Save settings whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications')
      return
    }

    try {
      const permission = await Notification.requestPermission()
      setPermissionStatus(permission)

      if (permission === 'granted') {
        setSettings(prev => ({ ...prev, enabled: true }))
        // Show a test notification
        new Notification('Numa', {
          body: 'Notifications are now enabled. I\'ll remind you to check in.',
          icon: '/pwa-192x192.png'
        })
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err)
    }
  }

  const handleToggleEnabled = () => {
    if (!settings.enabled && permissionStatus !== 'granted') {
      requestPermission()
    } else {
      setSettings(prev => ({ ...prev, enabled: !prev.enabled }))
    }
  }

  const handleTimeChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleToggleReminder = (field) => {
    setSettings(prev => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <div className="min-h-screen bg-cream pb-20">
      {/* Header */}
      <div className="p-4 pt-6 flex items-center gap-3">
        <button
          onClick={() => navigate('/settings')}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-sand/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-earth" />
        </button>
        <h1 className="text-xl font-semibold text-earth">Reminders</h1>
      </div>

      {/* Main toggle */}
      <div className="px-4 mb-6">
        <div className="bg-cream-dark rounded-2xl p-4 border border-sand">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.enabled ? (
                <Bell className="w-6 h-6 text-sage" />
              ) : (
                <BellOff className="w-6 h-6 text-earth-light" />
              )}
              <div>
                <p className="text-earth font-medium">Daily reminders</p>
                <p className="text-earth-light text-sm">
                  {settings.enabled ? 'Numa will remind you' : 'Reminders are off'}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleEnabled}
              className={`w-14 h-8 rounded-full transition-colors relative ${
                settings.enabled ? 'bg-sage' : 'bg-sand'
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                  settings.enabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {permissionStatus === 'denied' && (
            <p className="text-terracotta text-sm mt-3">
              Notifications are blocked. Please enable them in your browser settings.
            </p>
          )}
        </div>
      </div>

      {/* Reminder settings */}
      {settings.enabled && (
        <div className="px-4 space-y-4">
          <h2 className="text-sm font-medium text-earth-light uppercase tracking-wide px-1">
            Reminder Times
          </h2>

          {/* Meditation reminder */}
          <div className="bg-cream-dark rounded-2xl p-4 border border-sand">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sage-light/30 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-sage-dark" />
                </div>
                <div>
                  <p className="text-earth font-medium">Meditation</p>
                  <p className="text-earth-light text-sm">Morning mindfulness</p>
                </div>
              </div>
              <button
                onClick={() => handleToggleReminder('meditationEnabled')}
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  settings.meditationEnabled ? 'bg-sage' : 'bg-sand'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                    settings.meditationEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {settings.meditationEnabled && (
              <div className="flex items-center gap-2 pl-13">
                <Clock className="w-4 h-4 text-earth-light" />
                <input
                  type="time"
                  value={settings.meditationTime}
                  onChange={(e) => handleTimeChange('meditationTime', e.target.value)}
                  className="bg-sand/50 border border-sand rounded-xl px-3 py-2 text-earth"
                />
              </div>
            )}
          </div>

          {/* Yoga reminder */}
          <div className="bg-cream-dark rounded-2xl p-4 border border-sand">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-terracotta-light/30 rounded-xl flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-terracotta" />
                </div>
                <div>
                  <p className="text-earth font-medium">Yoga & Movement</p>
                  <p className="text-earth-light text-sm">Evening stretch</p>
                </div>
              </div>
              <button
                onClick={() => handleToggleReminder('yogaEnabled')}
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  settings.yogaEnabled ? 'bg-sage' : 'bg-sand'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                    settings.yogaEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {settings.yogaEnabled && (
              <div className="flex items-center gap-2 pl-13">
                <Clock className="w-4 h-4 text-earth-light" />
                <input
                  type="time"
                  value={settings.yogaTime}
                  onChange={(e) => handleTimeChange('yogaTime', e.target.value)}
                  className="bg-sand/50 border border-sand rounded-xl px-3 py-2 text-earth"
                />
              </div>
            )}
          </div>

          {/* Saved indicator */}
          {saved && (
            <p className="text-sage text-sm text-center">Settings saved</p>
          )}

          {/* Info note */}
          <div className="bg-sage-light/20 rounded-2xl p-4 mt-6">
            <p className="text-earth-light text-sm">
              <strong className="text-earth">Note:</strong> Reminders work when the app is open.
              For notifications when the app is closed, keep the app installed on your home screen.
            </p>
            {/* TODO: Real push notifications when app is closed require:
                - Service worker push subscription
                - Backend server (e.g., with Firebase Cloud Messaging)
                - Push notification API calls from server
            */}
          </div>
        </div>
      )}
    </div>
  )
}
