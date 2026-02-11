import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Leaf } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Note: This is a placeholder. Real authentication will be added with Supabase.
  const handleSubmit = (e) => {
    e.preventDefault()
    // For MVP, just redirect to onboarding
    // Real auth will be implemented with Supabase
    alert('Sign in coming soon! For now, please create a new account.')
    navigate('/onboarding')
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Back button */}
      <div className="p-4">
        <button
          onClick={() => navigate('/')}
          className="text-earth-light hover:text-earth inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-sage rounded-full flex items-center justify-center mb-4 mx-auto">
              <Leaf className="w-8 h-8 text-cream" />
            </div>
            <h1 className="text-2xl font-semibold text-earth">Welcome back</h1>
            <p className="text-earth-light mt-1">Sign in to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-earth-light mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-cream-dark border-2 border-sand focus:border-sage outline-none text-earth"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-earth-light mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full px-4 py-3 rounded-xl bg-cream-dark border-2 border-sand focus:border-sage outline-none text-earth"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-terracotta text-cream py-3 rounded-xl font-medium hover:bg-terracotta-dark transition-colors mt-6"
            >
              Sign In
            </button>
          </form>

          <p className="text-center mt-6 text-earth-light text-sm">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/onboarding')}
              className="text-sage-dark hover:text-sage underline"
            >
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
