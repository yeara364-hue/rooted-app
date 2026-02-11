import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { ArrowRight, ArrowLeft, Check } from 'lucide-react'

const GOALS = [
  { id: 'stress', label: 'Reduce stress', icon: '🧘' },
  { id: 'sleep', label: 'Sleep better', icon: '😴' },
  { id: 'focus', label: 'Improve focus', icon: '🎯' },
  { id: 'energy', label: 'Boost energy', icon: '⚡' },
  { id: 'calm', label: 'Feel more calm', icon: '🌿' },
  { id: 'movement', label: 'Move more', icon: '🏃' },
]

const EXPERIENCE_LEVELS = [
  { id: 'new', label: "I'm new to this", description: 'Just starting my wellbeing journey' },
  { id: 'some', label: 'Some experience', description: 'I\'ve tried meditation or yoga before' },
  { id: 'regular', label: 'Regular practice', description: 'I have an existing routine' },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { completeOnboarding } = useUser()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [goals, setGoals] = useState([])
  const [experience, setExperience] = useState('')

  const totalSteps = 3

  const toggleGoal = (goalId) => {
    setGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(g => g !== goalId)
        : [...prev, goalId]
    )
  }

  const canProceed = () => {
    if (step === 1) return name.trim().length >= 2
    if (step === 2) return goals.length > 0
    if (step === 3) return experience !== ''
    return false
  }

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      // Complete onboarding
      completeOnboarding({ name, goals, experience })
      navigate('/home')
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Progress bar */}
      <div className="p-4">
        <div className="flex gap-2 max-w-md mx-auto">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-sage' : 'bg-sand'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* Step 1: Name */}
          {step === 1 && (
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-earth mb-2">
                Welcome to Rooted
              </h2>
              <p className="text-earth-light mb-8">
                Let's start with your name
              </p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your first name"
                className="w-full px-6 py-4 rounded-2xl bg-cream-dark border-2 border-sand focus:border-sage outline-none text-earth text-lg text-center"
                autoFocus
              />
            </div>
          )}

          {/* Step 2: Goals */}
          {step === 2 && (
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-earth mb-2">
                Hi {name}! What brings you here?
              </h2>
              <p className="text-earth-light mb-8">
                Select all that apply
              </p>
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`p-4 rounded-2xl border-2 transition-all text-left ${
                      goals.includes(goal.id)
                        ? 'border-sage bg-sage-light/20'
                        : 'border-sand bg-cream-dark hover:border-sage-light'
                    }`}
                  >
                    <span className="text-2xl mb-2 block">{goal.icon}</span>
                    <span className="text-earth text-sm font-medium">{goal.label}</span>
                    {goals.includes(goal.id) && (
                      <Check className="w-4 h-4 text-sage-dark float-right" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Experience */}
          {step === 3 && (
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-earth mb-2">
                What's your experience level?
              </h2>
              <p className="text-earth-light mb-8">
                This helps us personalize your recommendations
              </p>
              <div className="space-y-3">
                {EXPERIENCE_LEVELS.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setExperience(level.id)}
                    className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                      experience === level.id
                        ? 'border-sage bg-sage-light/20'
                        : 'border-sand bg-cream-dark hover:border-sage-light'
                    }`}
                  >
                    <span className="text-earth font-medium block">{level.label}</span>
                    <span className="text-earth-light text-sm">{level.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="p-6">
        <div className="flex gap-4 max-w-md mx-auto">
          <button
            onClick={handleBack}
            className="px-6 py-3 rounded-full border-2 border-sand text-earth-light hover:border-sage-light transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`flex-1 py-3 rounded-full font-medium transition-all flex items-center justify-center gap-2 ${
              canProceed()
                ? 'bg-terracotta text-cream hover:bg-terracotta-dark'
                : 'bg-sand text-earth-light cursor-not-allowed'
            }`}
          >
            {step === totalSteps ? 'Get Started' : 'Continue'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
