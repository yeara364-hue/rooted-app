import { useEffect, useRef, useState, useCallback } from 'react'
import { X, CheckCircle2, Clock } from 'lucide-react'
import {
  startSession,
  endSession,
  markCompleted,
  getSessionDuration,
  CompletionMethod,
  ContentType
} from '../lib/tracking'

export default function MediaPlayerModal({ isOpen, onClose, media, onCompleted }) {
  const overlayRef = useRef(null)
  const playerRef = useRef(null)
  const sessionIntervalRef = useRef(null)
  const youtubePlayerRef = useRef(null)

  const [sessionTime, setSessionTime] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [completionMethod, setCompletionMethod] = useState(null)
  const [youtubeProgress, setYoutubeProgress] = useState(0)

  const itemId = media?.videoId || media?.playlistId || media?.trackId || 'unknown'
  const contentType = media?.platform === 'youtube' ? ContentType.YOUTUBE : ContentType.SPOTIFY

  // Start session when modal opens
  useEffect(() => {
    if (isOpen && media) {
      startSession(itemId, contentType, media.title)
      setSessionTime(0)
      setIsCompleted(false)
      setCompletionMethod(null)
      setYoutubeProgress(0)

      // Track session time
      sessionIntervalRef.current = setInterval(() => {
        const duration = getSessionDuration(itemId)
        setSessionTime(duration)

        // Spotify time-based completion
        if (media.platform === 'spotify' && !isCompleted) {
          if (duration >= 180) {
            // 3 minutes = verified
            handleCompletion(CompletionMethod.VERIFIED, duration)
          } else if (duration >= 90) {
            // 90 seconds = estimated
            handleCompletion(CompletionMethod.ESTIMATED, duration)
          }
        }
      }, 1000)
    }

    return () => {
      if (sessionIntervalRef.current) {
        clearInterval(sessionIntervalRef.current)
      }
    }
  }, [isOpen, media, itemId])

  // Load YouTube IFrame API
  useEffect(() => {
    if (isOpen && media?.platform === 'youtube' && media.videoId) {
      // Load YouTube API if not already loaded
      if (!window.YT) {
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        const firstScriptTag = document.getElementsByTagName('script')[0]
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
      }

      // Initialize player when API is ready
      const initPlayer = () => {
        if (playerRef.current && window.YT && window.YT.Player) {
          youtubePlayerRef.current = new window.YT.Player(playerRef.current, {
            videoId: media.videoId,
            playerVars: {
              autoplay: 1,
              enablejsapi: 1,
              origin: window.location.origin
            },
            events: {
              onStateChange: handleYouTubeStateChange
            }
          })
        }
      }

      if (window.YT && window.YT.Player) {
        // Small delay to ensure DOM is ready
        setTimeout(initPlayer, 100)
      } else {
        window.onYouTubeIframeAPIReady = initPlayer
      }
    }

    return () => {
      if (youtubePlayerRef.current?.destroy) {
        youtubePlayerRef.current.destroy()
        youtubePlayerRef.current = null
      }
    }
  }, [isOpen, media])

  // Track YouTube progress
  useEffect(() => {
    if (!isOpen || media?.platform !== 'youtube' || !youtubePlayerRef.current) return

    const progressInterval = setInterval(() => {
      try {
        const player = youtubePlayerRef.current
        if (player?.getCurrentTime && player?.getDuration) {
          const current = player.getCurrentTime()
          const duration = player.getDuration()
          if (duration > 0) {
            const progress = (current / duration) * 100
            setYoutubeProgress(progress)

            // Mark completed at 80%
            if (progress >= 80 && !isCompleted) {
              handleCompletion(CompletionMethod.VERIFIED, Math.round(current))
            }
          }
        }
      } catch (e) {
        // Player might not be ready
      }
    }, 2000)

    return () => clearInterval(progressInterval)
  }, [isOpen, media, isCompleted])

  const handleYouTubeStateChange = (event) => {
    // YT.PlayerState.ENDED = 0
    if (event.data === 0 && !isCompleted) {
      handleCompletion(CompletionMethod.VERIFIED, sessionTime)
    }
  }

  const handleCompletion = useCallback((method, duration) => {
    if (isCompleted) return

    setIsCompleted(true)
    setCompletionMethod(method)
    markCompleted(itemId, contentType, method, media?.title || 'Media', duration)

    if (onCompleted) {
      onCompleted({ itemId, type: contentType, method })
    }
  }, [isCompleted, itemId, contentType, media, onCompleted])

  const handleManualComplete = () => {
    handleCompletion(CompletionMethod.VERIFIED, sessionTime)
  }

  const handleClose = () => {
    // End session if not completed
    if (!isCompleted) {
      endSession(itemId)
    }
    if (sessionIntervalRef.current) {
      clearInterval(sessionIntervalRef.current)
    }
    onClose()
  }

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle click outside
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      handleClose()
    }
  }

  if (!isOpen || !media) return null

  // Build embed URL for Spotify (YouTube uses API)
  const getSpotifyEmbedUrl = () => {
    if (media.playlistId) {
      return `https://open.spotify.com/embed/playlist/${media.playlistId}?utm_source=generator&theme=0`
    }
    if (media.trackId) {
      return `https://open.spotify.com/embed/track/${media.trackId}?utm_source=generator&theme=0`
    }
    return null
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="relative w-full max-w-3xl bg-earth rounded-2xl overflow-hidden shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Title & Progress Bar */}
        {media.title && (
          <div className="bg-earth-dark p-4">
            <div className="flex items-start justify-between pr-12">
              <div>
                <h3 className="text-cream font-medium">{media.title}</h3>
                {media.description && (
                  <p className="text-cream/70 text-sm mt-1">{media.description}</p>
                )}
              </div>
              {/* Session timer */}
              <div className="flex items-center gap-2 text-cream/60 text-sm">
                <Clock className="w-4 h-4" />
                <span>{formatTime(sessionTime)}</span>
              </div>
            </div>

            {/* Progress indicator */}
            {media.platform === 'youtube' && youtubeProgress > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-cream/60 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(youtubeProgress)}%</span>
                </div>
                <div className="h-1 bg-black/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sage transition-all duration-500"
                    style={{ width: `${youtubeProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Spotify time-based progress */}
            {media.platform === 'spotify' && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-cream/60 mb-1">
                  <span>Listen time</span>
                  <span>{sessionTime >= 180 ? 'Completed!' : sessionTime >= 90 ? 'Almost there...' : `${180 - sessionTime}s to complete`}</span>
                </div>
                <div className="h-1 bg-black/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${sessionTime >= 180 ? 'bg-sage' : 'bg-sage/60'}`}
                    style={{ width: `${Math.min((sessionTime / 180) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Embed container */}
        <div className="relative bg-black">
          {media.platform === 'youtube' ? (
            <div className="aspect-video">
              {/* YouTube player container */}
              <div ref={playerRef} className="w-full h-full" />
            </div>
          ) : media.platform === 'spotify' ? (
            <div className="h-[352px]">
              <iframe
                src={getSpotifyEmbedUrl()}
                title={media.title || 'Spotify content'}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="w-full h-full"
              />
            </div>
          ) : (
            <div className="aspect-video flex items-center justify-center text-cream/50">
              <p>Unable to load media</p>
            </div>
          )}
        </div>

        {/* Bottom action bar */}
        <div className="bg-earth-dark p-4 flex items-center justify-between">
          {isCompleted ? (
            <div className="flex items-center gap-2 text-sage">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">
                {completionMethod === CompletionMethod.VERIFIED ? 'Completed!' : 'Marked as done'}
              </span>
            </div>
          ) : (
            <p className="text-cream/50 text-sm">
              {media.platform === 'youtube'
                ? 'Watch 80% to mark as complete'
                : 'Listen for 3 min or tap Done'}
            </p>
          )}

          {!isCompleted && (
            <button
              onClick={handleManualComplete}
              className="px-4 py-2 bg-sage hover:bg-sage-dark text-cream text-sm font-medium rounded-lg transition-colors"
            >
              Mark as Done
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
