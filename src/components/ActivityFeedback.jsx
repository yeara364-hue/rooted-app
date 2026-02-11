import { useState } from 'react'
import { ThumbsUp, ThumbsDown, Check } from 'lucide-react'

/**
 * ActivityFeedback - Simple "Did this help?" component
 *
 * Appears after an activity card to collect feedback.
 * Numa uses this to learn what works for the user.
 */

export default function ActivityFeedback({ activityType, activityTitle, onFeedback }) {
  const [submitted, setSubmitted] = useState(false)
  const [response, setResponse] = useState(null)

  const handleFeedback = (helpful) => {
    setResponse(helpful)
    setSubmitted(true)
    onFeedback?.(activityType, activityTitle, helpful)
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center gap-2 py-3 text-sage-dark">
        <Check className="w-4 h-4" />
        <span className="text-sm">
          {response ? "I'll remember that." : "Noted. I'll suggest something different next time."}
        </span>
      </div>
    )
  }

  return (
    <div className="border-t border-sand/50 pt-4 mt-4">
      <p className="text-earth-light text-sm text-center mb-3">
        Did this feel helpful?
      </p>
      <div className="flex justify-center gap-3">
        <button
          onClick={() => handleFeedback(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sage-light/30 hover:bg-sage-light/50 text-sage-dark transition-colors"
        >
          <ThumbsUp className="w-4 h-4" />
          <span className="text-sm">Yes</span>
        </button>
        <button
          onClick={() => handleFeedback(false)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sand/50 hover:bg-sand text-earth-light transition-colors"
        >
          <ThumbsDown className="w-4 h-4" />
          <span className="text-sm">Not really</span>
        </button>
      </div>
    </div>
  )
}
