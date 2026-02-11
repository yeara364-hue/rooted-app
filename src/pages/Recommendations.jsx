import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { generateNumaResponse, generateNumaReply } from '../lib/ai'
import Numa from '../components/Numa'
import NumaSpeech from '../components/NumaSpeech'
import VoiceInput from '../components/VoiceInput'
import ActivityFeedback from '../components/ActivityFeedback'
import { recordActivityFeedback } from '../lib/memory'
import {
  Sparkles,
  Wind,
  Dumbbell,
  Music,
  RefreshCw,
  Mic,
  Flame
} from 'lucide-react'

const ACTIVITY_ICONS = {
  meditation: Sparkles,
  breathing: Wind,
  yoga: Dumbbell,
  movement: Dumbbell,
}

export default function Recommendations() {
  const navigate = useNavigate()
  const { user, todayCheckIn, recordUserMessage, getNumaInsights, getNumaMemoryContext } = useUser()
  const [numaResponse, setNumaResponse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [conversationStep, setConversationStep] = useState(0)
  const [numaState, setNumaState] = useState('thinking')
  const [showCards, setShowCards] = useState(false)

  // Voice/conversation state
  const [voiceModalOpen, setVoiceModalOpen] = useState(false)
  const [conversationHistory, setConversationHistory] = useState([])
  const [isInConversation, setIsInConversation] = useState(false)
  const [currentReply, setCurrentReply] = useState(null)

  // Memory insights
  const insights = getNumaInsights()

  useEffect(() => {
    if (!todayCheckIn) {
      navigate('/checkin')
      return
    }
    loadRecommendations()
  }, [todayCheckIn, navigate])

  const loadRecommendations = async () => {
    setLoading(true)
    setError(null)
    setConversationStep(0)
    setShowCards(false)
    setNumaState('thinking')
    setIsInConversation(false)
    setCurrentReply(null)
    setConversationHistory([])

    try {
      // Get memory insights for Numa
      const memoryInsights = getNumaInsights()

      const result = await generateNumaResponse({
        name: user.name,
        mood: todayCheckIn.mood,
        energy: todayCheckIn.energy,
        goals: user.goals,
        experience: user.experience,
        memoryInsights
      })
      setNumaResponse(result)
      setNumaState('responding')
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setNumaState('calm')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleMessageComplete = () => {
    setTimeout(() => {
      if (conversationStep < (numaResponse?.messages?.length || 0) - 1) {
        setConversationStep(prev => prev + 1)
      } else {
        setShowCards(true)
        setNumaState('calm')
      }
    }, 800)
  }

  // Handle voice/text input from user
  const handleUserMessage = async (message) => {
    setVoiceModalOpen(false)
    setIsInConversation(true)
    setNumaState('thinking')

    // Add user message to history
    setConversationHistory(prev => [...prev, { role: 'user', text: message }])

    try {
      // Get Numa's reply with memory context
      const memoryInsights = getNumaInsights()
      const reply = await generateNumaReply(message, {
        mood: todayCheckIn.mood,
        energy: todayCheckIn.energy,
        hasHistory: memoryInsights.hasHistory
      })

      setCurrentReply(reply)
      setNumaState('responding')

      // Record in memory
      recordUserMessage(message, reply.detectedEmotion)

      // Add Numa's reply to history
      setConversationHistory(prev => [...prev, { role: 'numa', text: reply.text }])

    } catch (err) {
      console.error('Error getting Numa reply:', err)
      setNumaState('calm')
    }
  }

  const handleReplyComplete = () => {
    setNumaState('calm')
  }

  const handleListeningChange = (listening) => {
    if (listening) {
      setNumaState('listening')
    } else if (!isInConversation) {
      setNumaState('calm')
    }
  }

  // Handle activity feedback
  const handleActivityFeedback = (type, title, helpful) => {
    recordActivityFeedback(type, title, helpful)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
        <Numa mood={todayCheckIn?.mood || 'okay'} state="thinking" size={100} />
        <p className="text-earth-light mt-6">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
        <Numa mood="okay" state="calm" size={80} />
        <p className="text-terracotta mt-6 mb-4">{error}</p>
        <button
          onClick={loadRecommendations}
          className="bg-terracotta text-cream px-6 py-3 rounded-full font-medium hover:bg-terracotta-dark transition-colors inline-flex items-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Try Again
        </button>
      </div>
    )
  }

  const currentMessage = numaResponse?.messages?.[conversationStep]

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <div className="p-4 flex justify-between items-center">
        <div>
          <p className="text-earth-light text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
          {/* Streak indicator */}
          {insights.streakDays >= 2 && (
            <div className="flex items-center gap-1 mt-1">
              <Flame className="w-3 h-3 text-terracotta" />
              <span className="text-xs text-terracotta font-medium">{insights.streakDays} day streak</span>
            </div>
          )}
        </div>
        <div />  {/* Spacer for flex alignment */}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center px-6 pt-4 overflow-y-auto">
        {/* Numa */}
        <div className="mb-6">
          <Numa
            mood={todayCheckIn?.mood || 'okay'}
            state={numaState}
            size={isInConversation ? 100 : 120}
          />
        </div>

        {/* Greeting */}
        <p className="text-earth-light text-sm mb-4">
          Hello, {user?.name}
        </p>

        {/* Show conversation history when in conversation mode */}
        {isInConversation && conversationHistory.length > 0 && (
          <div className="w-full max-w-sm space-y-4 mb-4">
            {conversationHistory.map((msg, index) => (
              <div
                key={index}
                className={`rounded-2xl p-4 ${
                  msg.role === 'user'
                    ? 'bg-sage-light/30 ml-8 text-right'
                    : 'bg-white/40 backdrop-blur-sm border border-white/30 mr-8'
                }`}
              >
                <p className={`text-sm ${msg.role === 'user' ? 'text-sage-dark' : 'text-earth'}`}>
                  {msg.role === 'user' && <span className="text-xs text-earth-light block mb-1">You said:</span>}
                  {msg.text}
                </p>
              </div>
            ))}

            {/* Current typing reply */}
            {currentReply && numaState === 'responding' && (
              <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white/30 mr-8">
                <NumaSpeech
                  text={currentReply.text}
                  speed={35}
                  onComplete={handleReplyComplete}
                  className="text-earth text-sm"
                />
              </div>
            )}
          </div>
        )}

        {/* Initial recommendation flow (when not in conversation) */}
        {!isInConversation && (
          <>
            {/* Numa's message */}
            <div className="w-full max-w-sm mb-6">
              <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-6 border border-white/30 shadow-sm">
                {currentMessage && (
                  <NumaSpeech
                    key={conversationStep}
                    text={currentMessage.text}
                    speed={35}
                    onComplete={handleMessageComplete}
                    className="text-earth text-center leading-relaxed"
                  />
                )}
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 mt-4">
                {numaResponse?.messages?.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index <= conversationStep ? 'bg-sage' : 'bg-sand'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Activity and Music cards */}
            {showCards && (
              <div className="w-full max-w-sm space-y-4 animate-fade-in">
                {numaResponse?.activity && (
                  <div className="bg-cream-dark rounded-2xl p-5 border border-sand">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-terracotta rounded-xl flex items-center justify-center flex-shrink-0">
                        {(() => {
                          const Icon = ACTIVITY_ICONS[numaResponse.activity.type] || Sparkles
                          return <Icon className="w-6 h-6 text-cream" />
                        })()}
                      </div>
                      <div className="flex-1">
                        <span className="text-xs text-terracotta font-medium uppercase tracking-wide">
                          {numaResponse.activity.type}
                        </span>
                        <h3 className="text-earth font-semibold mt-1">
                          {numaResponse.activity.title}
                        </h3>
                        <p className="text-earth-light text-sm mt-1">
                          {numaResponse.activity.description}
                        </p>
                        <p className="text-earth-light text-xs mt-2 opacity-70">
                          {numaResponse.activity.duration}
                        </p>
                      </div>
                    </div>

                    {/* Activity feedback */}
                    <ActivityFeedback
                      activityType={numaResponse.activity.type}
                      activityTitle={numaResponse.activity.title}
                      onFeedback={handleActivityFeedback}
                    />
                  </div>
                )}

                {numaResponse?.music && (
                  <div className="bg-cream-dark rounded-2xl p-5 border border-sand">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-sage rounded-xl flex items-center justify-center flex-shrink-0">
                        <Music className="w-6 h-6 text-cream" />
                      </div>
                      <div className="flex-1">
                        <span className="text-xs text-sage-dark font-medium uppercase tracking-wide">
                          Music
                        </span>
                        <h3 className="text-earth font-semibold mt-1">
                          {numaResponse.music.suggestion}
                        </h3>
                        <p className="text-earth-light text-sm mt-1">
                          {numaResponse.music.reason}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom actions */}
      <div className="p-6 space-y-3">
        {/* Talk to Numa button */}
        <button
          onClick={() => setVoiceModalOpen(true)}
          className="w-full bg-sage hover:bg-sage-dark text-cream py-4 rounded-2xl font-medium transition-colors flex items-center justify-center gap-3"
        >
          <Mic className="w-5 h-5" />
          Voice Check-in
        </button>

        {/* Reset / New recommendations */}
        {isInConversation ? (
          <button
            onClick={loadRecommendations}
            className="w-full text-earth-light hover:text-earth py-2 text-sm flex items-center justify-center gap-2"
          >
            Start fresh
          </button>
        ) : (
          <button
            onClick={loadRecommendations}
            className="w-full text-earth-light hover:text-earth py-2 text-sm flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            New recommendations
          </button>
        )}
      </div>

      {/* Voice Input Modal */}
      <VoiceInput
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onTranscript={handleUserMessage}
        onListeningChange={handleListeningChange}
      />

      {/* Animation styles */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
