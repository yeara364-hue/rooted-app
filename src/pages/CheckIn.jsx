import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { ArrowRight, Sun, Moon, Sunrise } from 'lucide-react'

const MOODS = [
  { id: 'great', label: 'Great', emoji: '😊', color: 'bg-sage' },
  { id: 'good', label: 'Good', emoji: '🙂', color: 'bg-sage-light' },
  { id: 'okay', label: 'Okay', emoji: '😐', color: 'bg-sand' },
  { id: 'low', label: 'Low', emoji: '😔', color: 'bg-terracotta-light' },
  { id: 'stressed', label: 'Stressed', emoji: '😰', color: 'bg-terracotta' },
]

const ENERGY_LEVELS = [
  { id: 'high', label: 'Energized', icon: Sun, description: 'Ready to take on the day' },
  { id: 'medium', label: 'Balanced', icon: Sunrise, description: 'Feeling steady' },
  { id: 'low', label: 'Tired', icon: Moon, description: 'Could use a boost' },
]

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function CheckIn() {
  const navigate = useNavigate()
  const { user, checkIn, todayCheckIn } = useUser()
  const [step, setStep] = useState(1)
  const [mood, setMood] = useState('')
  const [energy, setEnergy] = useState('')
const [loading, setLoading] = useState(false)
const [status, setStatus] = useState("")

async function trackEvent(event_name, moodValue, energyValue) {
  try {
    setLoading(true)
    setStatus("Saving...")

    const res = await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_name,
        mood: moodValue,
        meta: { energy: energyValue, source: "checkin" }
      })
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`)

    setStatus("Saved ✅")
    return true
  } catch (err) {
    console.error(err)
    setStatus("Error ❌")
    return false
  } finally {
    setLoading(false)
  }
}


  // If already checked in today, go to recommendations
  if (todayCheckIn) {
    navigate('/recommendations')
    return null
  }

  const handleSubmit = async () => {
  try {
    await trackEvent("check_in", mood, energy)
  } catch (e) {
    console.error("trackEvent failed:", e)
  }

  checkIn(mood, energy)
  navigate('/recommendations')
}



  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <div className="p-6 text-center">
        <p className="text-earth-light text-sm">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="text-2xl font-semibold text-earth mt-1">
          {getGreeting()}, {user?.name}
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* Step 1: Mood */}
          {step === 1 && (
            <div className="text-center">
              <h2 className="text-xl text-earth mb-2">
                How are you feeling right now?
              </h2>
              <p className="text-earth-light mb-8 text-sm">
                There's no right or wrong answer
              </p>
              <div className="flex justify-center gap-3 flex-wrap">
                {MOODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMood(m.id)}
                    className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all min-w-[80px] ${
                      mood === m.id
                        ? 'border-sage bg-sage-light/20 scale-105'
                        : 'border-sand bg-cream-dark hover:border-sage-light'
                    }`}
                  >
                    <span className="text-3xl mb-2">{m.emoji}</span>
                    <span className="text-earth text-sm">{m.label}</span>
                  </button>
                ))}
              </div>

              {mood && (
                <button
                  onClick={() => setStep(2)}
                  className="mt-8 bg-terracotta text-cream px-8 py-3 rounded-full font-medium hover:bg-terracotta-dark transition-colors inline-flex items-center gap-2"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Step 2: Energy */}
          {step === 2 && (
            <div className="text-center">
              <h2 className="text-xl text-earth mb-2">
                What's your energy like?
              </h2>
              <p className="text-earth-light mb-8 text-sm">
                This helps us suggest the right activities
              </p>
              <div className="space-y-3">
                {ENERGY_LEVELS.map((level) => {
                  const Icon = level.icon
                  return (
                    <button
                      key={level.id}
                      onClick={() => setEnergy(level.id)}
                      className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                        energy === level.id
                          ? 'border-sage bg-sage-light/20'
                          : 'border-sand bg-cream-dark hover:border-sage-light'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        energy === level.id ? 'bg-sage' : 'bg-sand'
                      }`}>
                        <Icon className={`w-6 h-6 ${energy === level.id ? 'text-cream' : 'text-earth-light'}`} />
                      </div>
                      <div className="text-left">
                        <span className="text-earth font-medium block">{level.label}</span>
                        <span className="text-earth-light text-sm">{level.description}</span>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="flex gap-3 mt-8 justify-center">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-full border-2 border-sand text-earth-light hover:border-sage-light transition-colors"
                >
                  Back
                </button>
                {energy && (
                  <button
                    onClick={handleSubmit}
                    className="bg-terracotta text-cream px-8 py-3 rounded-full font-medium hover:bg-terracotta-dark transition-colors inline-flex items-center gap-2"
                  >
                    Get My Recommendations
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
