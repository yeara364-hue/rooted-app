import { useNavigate } from 'react-router-dom'
import { Leaf } from 'lucide-react'

export default function Welcome() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
      {/* Logo */}
      <div className="mb-8">
        <div className="w-20 h-20 bg-sage rounded-full flex items-center justify-center mb-4 mx-auto">
          <Leaf className="w-10 h-10 text-cream" />
        </div>
        <h1 className="text-4xl font-semibold text-earth tracking-tight">
          Rooted
        </h1>
        <p className="text-earth-light mt-2 text-lg">
          Your daily wellbeing companion
        </p>
      </div>

      {/* Welcome message */}
      <div className="max-w-md mb-12">
        <p className="text-earth-light leading-relaxed">
          Take a moment each day to check in with yourself.
          Get personalized guidance for meditation, movement,
          and music that fits how you're feeling.
        </p>
      </div>

      {/* CTA Button */}
      <button
        onClick={() => navigate('/onboarding')}
        className="bg-terracotta hover:bg-terracotta-dark text-cream px-8 py-4 rounded-full text-lg font-medium transition-colors shadow-lg hover:shadow-xl"
      >
        Begin Your Journey
      </button>

      {/* Already have account */}
      <p className="mt-6 text-earth-light text-sm">
        Already have an account?{' '}
        <button
          onClick={() => navigate('/login')}
          className="text-sage-dark hover:text-sage underline"
        >
          Sign in
        </button>
      </p>
    </div>
  )
}
