import { useState, useEffect, useRef, useCallback } from 'react'
import { Mic, MicOff, X, Loader2 } from 'lucide-react'

/**
 * VoiceInput - Browser-based speech recognition with mobile support
 *
 * Uses the Web Speech API (SpeechRecognition) when available.
 * Falls back to MediaRecorder for audio capture on mobile browsers
 * that don't support Web Speech API (like iOS Safari in some cases).
 *
 * States:
 * - idle: ready to start
 * - listening: actively recording
 * - processing: transcribing (brief)
 * - error: something went wrong
 */

export default function VoiceInput({
  onTranscript,
  onListeningChange,
  onClose,
  isOpen
}) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState(null)
  const [isSupported, setIsSupported] = useState(true)
  const [textInput, setTextInput] = useState('')
  const [useFallback, setUseFallback] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const recognitionRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const streamRef = useRef(null)

  // Check for Web Speech API support
  const checkSpeechSupport = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    return !!SpeechRecognition
  }, [])

  // Initialize Web Speech API
  useEffect(() => {
    if (!checkSpeechSupport()) {
      // No Web Speech API - we'll rely on text input
      // MediaRecorder could be used for audio capture but would need
      // a backend service for transcription
      setIsSupported(false)
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    // Mobile-friendly settings
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
      setIsProcessing(false)
      onListeningChange?.(true)
    }

    recognition.onresult = (event) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interimTranscript += result[0].transcript
        }
      }

      setTranscript(finalTranscript || interimTranscript)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error, event)

      // Handle different error types
      switch (event.error) {
        case 'not-allowed':
        case 'permission-denied':
          setError('Microphone access denied. Please allow microphone access in your browser settings.')
          break
        case 'no-speech':
          setError('No speech detected. Tap the mic and try again.')
          break
        case 'audio-capture':
          setError('No microphone found. Please check your device.')
          break
        case 'network':
          setError('Network error. Please check your connection.')
          break
        case 'aborted':
          // User cancelled or component cleanup - not an error
          // Only log for debugging, don't show error to user
          console.log('Speech recognition aborted (normal if you closed the modal)')
          break
        default:
          setError('Voice input failed. Try typing instead.')
      }

      // Only update state if it's a real error (not aborted during cleanup)
      if (event.error !== 'aborted') {
        setIsListening(false)
        setIsProcessing(false)
        onListeningChange?.(false)
      }
    }

    recognition.onend = () => {
      setIsListening(false)
      onListeningChange?.(false)
    }

    recognition.onspeechend = () => {
      // Auto-stop after speech ends (helps on mobile)
      recognition.stop()
    }

    recognitionRef.current = recognition

    return () => {
      // Cleanup: Only abort if we're actually listening to avoid race conditions
      if (recognitionRef.current) {
        try {
          // Use stop instead of abort to avoid triggering error handlers
          recognitionRef.current.stop()
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    }
  }, [onListeningChange, checkSpeechSupport])

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setTranscript('')
      setError(null)
      setTextInput('')
      setIsProcessing(false)
    } else {
      // Clean up when modal closes - use ref to avoid dependency issues
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          // Ignore stop errors during cleanup
        }
      }
    }
  }, [isOpen])

  // Request microphone permission explicitly on mobile
  const requestMicPermission = async () => {
    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Microphone access not supported in this browser.')
        return false
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Stop all tracks immediately - we just needed permission
      stream.getTracks().forEach(track => {
        track.stop()
      })

      // Ensure stream is fully released
      await new Promise(resolve => setTimeout(resolve, 50))

      return true
    } catch (err) {
      console.error('Mic permission error:', err)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone access denied. Please allow microphone access in your browser settings.')
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please check your device.')
      } else {
        setError('Could not access microphone. Please check your device settings.')
      }
      return false
    }
  }

  const startListening = async () => {
    if (!recognitionRef.current || isListening) return

    setTranscript('')
    setError(null)

    // On mobile, explicitly request permission first
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    if (isMobile) {
      const hasPermission = await requestMicPermission()
      if (!hasPermission) return

      // Small delay to ensure microphone is properly released after permission check
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    try {
      // Double-check we still have a valid recognition instance
      if (!recognitionRef.current) {
        setError('Voice input not available. Please refresh and try again.')
        return
      }

      recognitionRef.current.start()
    } catch (err) {
      console.error('Failed to start recognition:', err)
      // If already started, stop and restart
      if (err.message?.includes('already started')) {
        recognitionRef.current.stop()
        setTimeout(() => {
          try {
            recognitionRef.current.start()
          } catch (e) {
            setError('Voice input failed. Try typing instead.')
          }
        }, 100)
      } else {
        setError('Voice input failed. Try typing instead.')
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        // Ignore stop errors
      }
    }
  }

  const handleSubmit = () => {
    const finalText = transcript || textInput
    if (finalText.trim()) {
      onTranscript(finalText.trim())
      setTranscript('')
      setTextInput('')
    }
  }

  const handleTextSubmit = (e) => {
    e.preventDefault()
    handleSubmit()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-earth/50 backdrop-blur-sm z-50 flex items-end justify-center p-4">
      <div className="bg-cream rounded-3xl w-full max-w-sm p-6 shadow-xl animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-earth font-semibold">Voice Check-in</h3>
          <button
            onClick={onClose}
            className="text-earth-light hover:text-earth p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voice or text input */}
        {isSupported ? (
          <div className="text-center">
            {/* Microphone button */}
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full mx-auto mb-4 transition-all ${
                isProcessing
                  ? 'bg-sand cursor-wait'
                  : isListening
                    ? 'bg-terracotta scale-110'
                    : 'bg-sage hover:bg-sage-dark active:scale-95'
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 text-earth-light animate-spin" />
              ) : isListening ? (
                <MicOff className="w-5 h-5 text-cream" />
              ) : (
                <Mic className="w-5 h-5 text-cream" />
              )}
              <span className="text-cream font-medium text-sm">
                {isListening ? 'Numa is listening...' : 'Talk with Numa'}
              </span>
            </button>

            {/* Listening indicator animation */}
            {isListening && (
              <div className="flex justify-center gap-1 mb-2">
                <span className="w-2 h-2 bg-terracotta rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-terracotta rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-terracotta rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}

            <p className="text-earth-light text-sm mb-4">
              {isProcessing
                ? 'Processing...'
                : isListening
                  ? 'Listening... tap to stop'
                  : 'Tap to speak'}
            </p>

            {/* Transcript display */}
            {transcript && (
              <div className="bg-cream-dark rounded-2xl p-4 mb-4 text-left">
                <p className="text-earth text-sm italic">"{transcript}"</p>
              </div>
            )}

            {/* Error display */}
            {error && (
              <div className="bg-terracotta/10 rounded-xl p-3 mb-4">
                <p className="text-terracotta text-sm">{error}</p>
              </div>
            )}

            {/* Submit button (if there's a transcript) */}
            {transcript && !isListening && (
              <button
                onClick={handleSubmit}
                className="w-full bg-terracotta text-cream py-3 rounded-xl font-medium hover:bg-terracotta-dark active:scale-98 transition-all"
              >
                Send
              </button>
            )}

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-sand" />
              <span className="text-earth-light text-xs">or type</span>
              <div className="flex-1 h-px bg-sand" />
            </div>
          </div>
        ) : (
          <div className="text-center mb-4">
            <div className="bg-sand/50 rounded-xl p-4 mb-4">
              <p className="text-earth-light text-sm">
                Voice input isn't available in this browser.
              </p>
              <p className="text-earth-light text-xs mt-1">
                Try using Chrome or Safari for voice features.
              </p>
            </div>
          </div>
        )}

        {/* Text input fallback */}
        <form onSubmit={handleTextSubmit}>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full px-4 py-3 rounded-xl bg-cream-dark border-2 border-sand focus:border-sage outline-none text-earth resize-none"
            rows={3}
          />
          <button
            type="submit"
            disabled={!textInput.trim()}
            className={`w-full mt-3 py-3 rounded-xl font-medium transition-colors ${
              textInput.trim()
                ? 'bg-terracotta text-cream hover:bg-terracotta-dark'
                : 'bg-sand text-earth-light cursor-not-allowed'
            }`}
          >
            Send
          </button>
        </form>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(100%);
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
