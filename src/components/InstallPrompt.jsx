import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

/**
 * InstallPrompt - Shows when app is installable but not yet installed
 *
 * Uses the beforeinstallprompt event to detect installability
 * and trigger the native install prompt.
 */

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if already dismissed this session
    const wasDismissed = sessionStorage.getItem('install-prompt-dismissed')
    if (wasDismissed) {
      setDismissed(true)
    }

    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstall = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Show our custom prompt after a short delay
      setTimeout(() => {
        if (!sessionStorage.getItem('install-prompt-dismissed')) {
          setShowPrompt(true)
        }
      }, 3000) // Wait 3 seconds before showing
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setShowPrompt(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    // Show the native install prompt
    deferredPrompt.prompt()

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setShowPrompt(false)
    }

    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    sessionStorage.setItem('install-prompt-dismissed', 'true')
  }

  if (!showPrompt || dismissed) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-lg border border-sand p-4 max-w-sm mx-auto">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-12 h-12 bg-sage rounded-xl flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6 text-cream" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-earth font-semibold">Install Numa</h3>
            <p className="text-earth-light text-sm mt-1">
              Add to your home screen for the best experience
            </p>

            {/* Actions */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleInstall}
                className="flex-1 bg-terracotta text-cream py-2 px-4 rounded-xl font-medium text-sm hover:bg-terracotta-dark transition-colors"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-2 text-earth-light hover:text-earth transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
