import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Play, RefreshCw, MapPin, Calendar,
  ExternalLink, Wind, Loader2, AlertCircle, Music
} from 'lucide-react'
import MediaPlayerModal from '../components/MediaPlayerModal'

// ─── Mood configuration ──────────────────────────────────────────────────────

const moodConfig = {
  stressed: {
    label: 'Stressed',
    emoji: '😰',
    subtitle: "Let's take a breath and find some calm together.",
    quickRelief: {
      title: 'Box Breathing',
      duration: '4 min',
      instruction: 'Inhale 4s → Hold 4s → Exhale 4s → Hold 4s. Repeat until you feel the shift.',
      pattern: { inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
    },
    media: [
      { id: 's-yt1', type: 'youtube', videoId: 'O-6f5wQXSu8', title: 'Anxiety Relief Meditation', subtitle: '10 min guided breathing' },
      { id: 's-yt2', type: 'youtube', videoId: 'hJbRpHZr_d0', title: 'Gentle Stress Relief Yoga', subtitle: '20 min release tension' },
      { id: 's-sp1', type: 'spotify', playlistId: '37i9dQZF1DWXe9gFZP0gtP', title: 'Stress Relief Playlist', subtitle: 'Calming ambient sounds' },
    ],
    nearbyKeywords: 'yoga OR meditation OR breathwork OR sound bath',
  },
  sad: {
    label: 'Sad',
    emoji: '😢',
    subtitle: "It's okay to feel this way. Let's find some gentle comfort.",
    quickRelief: {
      title: 'Soothing Breath',
      duration: '3 min',
      instruction: 'Inhale 4s → Hold 2s → Exhale 6s. A longer exhale activates your rest response.',
      pattern: { inhale: 4, hold1: 2, exhale: 6, hold2: 0 },
    },
    media: [
      { id: 'sd-yt1', type: 'youtube', videoId: 'IeblJdB2-Vo', title: 'Self-Compassion Meditation', subtitle: '15 min kindness for difficult times' },
      { id: 'sd-yt2', type: 'youtube', videoId: 'inpok4MKVLM', title: 'Mood-Lifting Walk', subtitle: '10 min gentle movement meditation' },
      { id: 'sd-sp1', type: 'spotify', playlistId: '37i9dQZF1DX3YSRoSdA634', title: 'Comfort & Healing', subtitle: 'Gentle, uplifting tracks' },
    ],
    nearbyKeywords: 'acoustic OR community OR art therapy OR mindfulness',
  },
  tired: {
    label: 'Tired',
    emoji: '😴',
    subtitle: "Your body is asking for rest. Let's restore your energy gently.",
    quickRelief: {
      title: '4-7-8 Sleep Breath',
      duration: '3 min',
      instruction: 'Inhale 4s → Hold 7s → Exhale 8s. The 8-second exhale triggers deep relaxation.',
      pattern: { inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
    },
    media: [
      { id: 't-yt1', type: 'youtube', videoId: 'T0nuKuHmMmc', title: 'Body Scan for Rest', subtitle: '15 min release and restore' },
      { id: 't-yt2', type: 'youtube', videoId: 'BiWDsfZ3zbo', title: 'Bedtime Yoga', subtitle: '12 min gentle wind-down' },
      { id: 't-sp1', type: 'spotify', playlistId: '37i9dQZF1DWZd79rJ6a7lp', title: 'Sleep & Relax', subtitle: '3+ hours soothing soundscapes' },
    ],
    nearbyKeywords: 'gentle yoga OR stretching OR restorative',
  },
  angry: {
    label: 'Angry',
    emoji: '😠',
    subtitle: "Those feelings are valid. Let's channel them in a healthy way.",
    quickRelief: {
      title: 'Cooling Breath',
      duration: '3 min',
      instruction: 'Inhale 4s → Exhale slowly for 8s. Extended exhales lower your heart rate.',
      pattern: { inhale: 4, hold1: 0, exhale: 8, hold2: 2 },
    },
    media: [
      { id: 'a-yt1', type: 'youtube', videoId: 'q0dM0wGZPfg', title: 'Letting Go Meditation', subtitle: '12 min release frustration' },
      { id: 'a-yt2', type: 'youtube', videoId: 'Nw2oBIrxy_Q', title: 'Yoga for Frustration', subtitle: '18 min move through it' },
      { id: 'a-sp1', type: 'spotify', playlistId: '37i9dQZF1DX3Ogo9pFvBkY', title: 'Release & Unwind', subtitle: 'Process emotions through music' },
    ],
    nearbyKeywords: 'boxing OR run club OR power yoga OR breathwork',
  },
  happy: {
    label: 'Happy',
    emoji: '😊',
    subtitle: "Love that energy! Let's amplify and share this good feeling.",
    quickRelief: {
      title: 'Energizing Breath',
      duration: '2 min',
      instruction: 'Inhale 4s → Hold 4s → Exhale 4s. Use this pattern to anchor and amplify your joy.',
      pattern: { inhale: 4, hold1: 4, exhale: 4, hold2: 0 },
    },
    media: [
      { id: 'h-yt1', type: 'youtube', videoId: 'Lxprri_H9Is', title: 'Gratitude Meditation', subtitle: '10 min amplify your joy' },
      { id: 'h-yt2', type: 'youtube', videoId: 'sTANio_2E0Q', title: 'Joyful Morning Flow', subtitle: '20 min celebrate your body' },
      { id: 'h-sp1', type: 'spotify', playlistId: '37i9dQZF1DXdPec7aLTmlC', title: 'Happy Hits', subtitle: '2+ hours feel-good favorites' },
    ],
    nearbyKeywords: 'dance OR live music OR outdoor OR community',
  },
}

const DEFAULT_MOOD = 'stressed'

// ─── Media rotation (variety logic) ─────────────────────────────────────────
// Stable per mood+type per day; rotates on Refresh; avoids repeating the last shown item.

function getRotatedMedia(mood, forceRefresh = false) {
  const config = moodConfig[mood] || moodConfig[DEFAULT_MOOD]
  const ytItems = config.media.filter(m => m.type === 'youtube')
  const spItems = config.media.filter(m => m.type === 'spotify')

  function pick(items, mediaType) {
    if (items.length === 0) return null
    const key = `rooted-media-${mood}-${mediaType}`
    const stored = JSON.parse(localStorage.getItem(key) || '{}')
    const today = new Date().toDateString()

    // Return cached choice for today unless force-refreshing
    if (!forceRefresh && stored.date === today && stored.id) {
      const cached = items.find(m => m.id === stored.id)
      if (cached) return cached
    }

    // Rotate: prefer items not shown last time
    const candidates = items.filter(m => m.id !== stored.id)
    const pool = candidates.length > 0 ? candidates : items
    const dayIndex = Math.floor(Date.now() / 86400000)
    const item = pool[dayIndex % pool.length]

    localStorage.setItem(key, JSON.stringify({ date: today, id: item.id }))
    return item
  }

  return { youtube: pick(ytItems, 'youtube'), spotify: pick(spItems, 'spotify') }
}

// ─── Breathing timer ──────────────────────────────────────────────────────────

function BreathingTimer({ pattern, durationSec = 180 }) {
  const [isActive, setIsActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(durationSec)
  const [phase, setPhase] = useState('ready')
  const [done, setDone] = useState(false)
  const intervalRef = useRef(null)
  const elapsedRef = useRef(0)

  useEffect(() => {
    if (!isActive) return
    intervalRef.current = setInterval(() => {
      elapsedRef.current += 1
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current)
          setIsActive(false)
          setPhase('done')
          setDone(true)
          return 0
        }
        return t - 1
      })

      const { inhale, hold1, exhale, hold2 } = pattern
      const total = inhale + hold1 + exhale + hold2
      const pos = elapsedRef.current % total
      if (pos < inhale) setPhase('inhale')
      else if (hold1 > 0 && pos < inhale + hold1) setPhase('hold')
      else if (pos < inhale + hold1 + exhale) setPhase('exhale')
      else if (hold2 > 0) setPhase('hold2')
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [isActive, pattern])

  const start = () => {
    elapsedRef.current = 0
    setTimeLeft(durationSec)
    setPhase('inhale')
    setDone(false)
    setIsActive(true)
  }

  const stop = () => {
    clearInterval(intervalRef.current)
    setIsActive(false)
    setPhase('ready')
    setTimeLeft(durationSec)
    elapsedRef.current = 0
  }

  const phaseLabel = {
    ready: 'Tap Start to begin',
    inhale: 'Breathe in...',
    hold: 'Hold...',
    hold2: 'Hold...',
    exhale: 'Breathe out...',
    done: 'Well done!',
  }

  const circleScale =
    phase === 'inhale' ? 'scale-125' :
    phase === 'exhale' ? 'scale-75' : 'scale-100'

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`w-24 h-24 rounded-full border-4 border-sage flex items-center justify-center transition-transform duration-1000 ${circleScale}`}>
        <Wind className={`w-8 h-8 text-sage ${isActive ? 'animate-pulse' : ''}`} />
      </div>
      <p className="text-sage font-medium text-sm">{phaseLabel[phase]}</p>
      {isActive && (
        <p className="text-earth-light text-xs tabular-nums">
          {mins}:{secs.toString().padStart(2, '0')} remaining
        </p>
      )}
      <button
        type="button"
        onClick={isActive ? stop : start}
        className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
          isActive
            ? 'bg-earth/20 text-earth hover:bg-earth/30'
            : done
            ? 'bg-sage/20 text-sage hover:bg-sage/30'
            : 'bg-sage text-cream hover:bg-sage-dark'
        }`}
      >
        {isActive ? 'Stop' : done ? 'Again' : 'Start'}
      </button>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MoodPage() {
  const { mood } = useParams()
  const navigate = useNavigate()

  const isValidMood = !!moodConfig[mood]
  const config = moodConfig[mood] || moodConfig[DEFAULT_MOOD]

  // Media
  const [media, setMedia] = useState(() => getRotatedMedia(mood))
  const [selectedMedia, setSelectedMedia] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Geolocation
  const [location, setLocation] = useState(null)
  const [locationDenied, setLocationDenied] = useState(false)

  // Nearby
  const [nearbyItems, setNearbyItems] = useState([])
  const [nearbyLoading, setNearbyLoading] = useState(false)
  const [nearbyError, setNearbyError] = useState(null)

  // Request geolocation on mount
  useEffect(() => {
    console.log('[MoodPage] mounted, mood =', mood)
    if (!navigator.geolocation) {
      console.log('[MoodPage] geolocation not supported')
      setLocationDenied(true)
      return
    }
    console.log('[MoodPage] requesting geolocation...')
    navigator.geolocation.getCurrentPosition(
      pos => {
        console.log('[MoodPage] geolocation success —', pos.coords.latitude, pos.coords.longitude)
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      },
      err => {
        console.log('[MoodPage] geolocation denied/error —', err.code, err.message)
        // In dev mode fall back to Tel Aviv so fetch still fires and you can see the requests
        if (import.meta.env.DEV) {
          console.log('[MoodPage] DEV: auto-falling back to Tel Aviv coordinates')
          setLocation({ lat: 32.0853, lng: 34.7818 })
        } else {
          setLocationDenied(true)
        }
      },
      { timeout: 5000 }
    )
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch nearby whenever location becomes available
  useEffect(() => {
    if (!location) return
    fetchNearby(location)
  }, [location, mood]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchNearby(loc) {
    console.log('[MoodPage] fetchNearby called — loc:', loc, '| mood:', mood)
    setNearbyLoading(true)
    setNearbyError(null)
    const kw = encodeURIComponent(config.nearbyKeywords)

    try {
      console.log('[MoodPage] fetching /.netlify/functions/nearby-events and nearby-places...')
      const [evRes, plRes] = await Promise.allSettled([
        fetch(`/.netlify/functions/nearby-events?mood=${mood}&lat=${loc.lat}&lng=${loc.lng}&keywords=${kw}`),
        fetch(`/.netlify/functions/nearby-places?mood=${mood}&lat=${loc.lat}&lng=${loc.lng}&keywords=${kw}&radius=800`),
      ])

      console.log('[MoodPage] fetch settled — events:', evRes.status, '| places:', plRes.status)

      const items = []

      if (evRes.status === 'fulfilled' && evRes.value.ok) {
        const data = await evRes.value.json()
        console.log('[MoodPage] events response:', data)
        items.push(...(data.events || []).slice(0, 2).map(e => ({ ...e, _kind: 'event' })))
      } else {
        console.log('[MoodPage] events fetch failed —', evRes.status === 'rejected' ? evRes.reason : evRes.value?.status)
      }
      if (plRes.status === 'fulfilled' && plRes.value.ok) {
        const rawPlacesText = await plRes.value.clone().text().catch(() => '')
        console.log('[MoodPage] places raw response (first 500):', rawPlacesText.slice(0, 500))
        const data = await plRes.value.json()
        console.log('[MoodPage] places response:', data)
        items.push(...(data.places || []).slice(0, 2).map(p => ({ ...p, _kind: 'place' })))
      } else {
        console.log('[MoodPage] places fetch failed —', plRes.status === 'rejected' ? plRes.reason : plRes.value?.status)
      }

      console.log('[MoodPage] total nearby items:', items.length)

      if (items.length === 0) {
        setNearbyItems([])
        setNearbyError('No nearby results found for this mood.')
      } else {
        // Show raw items immediately, then replace with AI-ranked results
        setNearbyItems(items)
        try {
          const rankRes = await fetch('/.netlify/functions/rank-nearby', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items, mood }),
          })
          if (rankRes.ok) {
            const { ranked } = await rankRes.json()
            console.log('[MoodPage] ranked items:', ranked)
            if (Array.isArray(ranked) && ranked.length > 0) setNearbyItems(ranked)
          }
        } catch (rankErr) {
          console.warn('[MoodPage] rank-nearby failed silently:', rankErr.message)
        }
      }
    } catch (err) {
      console.error('[MoodPage] fetchNearby error:', err)
      setNearbyError('Could not load nearby results.')
    } finally {
      setNearbyLoading(false)
    }
  }

  function useTelAviv() {
    setLocationDenied(false)
    setLocation({ lat: 32.0853, lng: 34.7818 })
  }

  function handleRefreshMedia() {
    setMedia(getRotatedMedia(mood, true))
  }

  function openMedia(item) {
    setSelectedMedia({
      title: item.title,
      description: item.subtitle,
      platform: item.type === 'youtube' ? 'youtube' : 'spotify',
      videoId: item.videoId || null,
      playlistId: item.playlistId || null,
    })
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-lg mx-auto px-6 py-6 space-y-8">

        {/* ── Header ────────────────────────────────────────────── */}
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="w-10 h-10 rounded-full bg-cream-dark border border-sand flex items-center justify-center flex-shrink-0 mt-0.5"
          >
            <ArrowLeft className="w-5 h-5 text-earth" />
          </button>
          <div>
            <h1 className="text-earth font-semibold text-xl">
              Feeling {config.label} {config.emoji}
            </h1>
            <p className="text-earth-light text-sm mt-0.5 leading-relaxed">
              {config.subtitle}
            </p>
            {!isValidMood && (
              <p className="text-xs text-earth-light/60 mt-1">
                Unknown mood — showing default content.
              </p>
            )}
          </div>
        </div>

        {/* ── Section 1: Quick relief ────────────────────────────── */}
        <section>
          <h2 className="text-sm font-medium text-earth-light mb-3">Quick relief now</h2>
          <div className="bg-white/50 rounded-2xl p-6 border border-sage/20 text-center">
            <p className="text-earth font-semibold">{config.quickRelief.title}</p>
            <p className="text-earth-light text-xs mt-0.5 mb-3">{config.quickRelief.duration}</p>
            <p className="text-earth-light text-sm mb-6 leading-relaxed max-w-xs mx-auto">
              {config.quickRelief.instruction}
            </p>
            <BreathingTimer pattern={config.quickRelief.pattern} />
          </div>
        </section>

        {/* ── Section 2: Recommended for you ────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-earth-light">Recommended for you</h2>
            <button
              type="button"
              onClick={handleRefreshMedia}
              className="flex items-center gap-1 text-xs text-sage hover:text-sage-dark transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Swap
            </button>
          </div>
          <div className="space-y-3">
            {media.youtube && (
              <button
                type="button"
                onClick={() => openMedia(media.youtube)}
                className="w-full flex items-center gap-3 p-4 bg-red-50 hover:bg-red-100 rounded-2xl border border-red-100 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                  <Play className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-earth text-sm font-medium truncate">{media.youtube.title}</p>
                  <p className="text-earth-light/70 text-xs truncate">{media.youtube.subtitle}</p>
                </div>
                <span className="flex-shrink-0 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                  YouTube
                </span>
              </button>
            )}
            {media.spotify && (
              <button
                type="button"
                onClick={() => openMedia(media.spotify)}
                className="w-full flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-2xl border border-green-100 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-earth text-sm font-medium truncate">{media.spotify.title}</p>
                  <p className="text-earth-light/70 text-xs truncate">{media.spotify.subtitle}</p>
                </div>
                <span className="flex-shrink-0 text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                  Spotify
                </span>
              </button>
            )}
          </div>
        </section>

        {/* ── Section 3: Nearby, right now ─────────────────────── */}
        <section className="pb-8">
          <h2 className="text-sm font-medium text-earth-light mb-3">Nearby, right now</h2>

          {/* Location denied */}
          {locationDenied && (
            <div className="bg-sand/30 rounded-2xl p-5 border border-sand text-center">
              <AlertCircle className="w-5 h-5 text-earth-light mx-auto mb-2" />
              <p className="text-earth-light text-sm mb-3">Location access denied.</p>
              <button
                type="button"
                onClick={useTelAviv}
                className="text-sage text-sm font-medium hover:underline"
              >
                Use Tel Aviv (default)
              </button>
            </div>
          )}

          {/* Waiting for permission */}
          {!locationDenied && !location && (
            <div className="flex items-center gap-2 text-earth-light text-sm p-4 bg-sand/20 rounded-2xl">
              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
              Getting your location…
            </div>
          )}

          {/* Loading nearby */}
          {location && nearbyLoading && (
            <div className="flex items-center gap-2 text-earth-light text-sm p-4 bg-sand/20 rounded-2xl">
              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
              Finding nearby places and events…
            </div>
          )}

          {/* Error */}
          {nearbyError && !nearbyLoading && (
            <div className="bg-sand/30 rounded-2xl p-4 text-center border border-sand">
              <p className="text-earth-light text-sm">{nearbyError}</p>
            </div>
          )}

          {/* Results */}
          {nearbyItems.length > 0 && (
            <div className="space-y-3">
              {nearbyItems.map((item, i) => (
                <a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-4 bg-white/50 hover:bg-white/70 rounded-2xl border border-sand transition-colors group"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    item._kind === 'event' ? 'bg-terracotta/20' : 'bg-sage/20'
                  }`}>
                    {item._kind === 'event'
                      ? <Calendar className="w-5 h-5 text-terracotta" />
                      : <MapPin className="w-5 h-5 text-sage" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-earth text-sm font-medium line-clamp-1">{item.title}</p>
                    {item.reason && (
                      <p className="text-sage-dark text-xs mt-0.5 italic line-clamp-2">{item.reason}</p>
                    )}
                    <p className="text-earth-light text-xs mt-0.5">
                      {item._kind === 'event' ? 'Event' : 'Place'}
                      {item.distance ? ` · ${item.distance}` : ''}
                    </p>
                    {item.datetime && (
                      <p className="text-earth-light text-xs">{item.datetime}</p>
                    )}
                    {item.location && (
                      <p className="text-earth-light text-xs truncate">{item.location}</p>
                    )}
                  </div>
                  <ExternalLink className="w-4 h-4 text-earth-light/40 group-hover:text-sage flex-shrink-0 mt-0.5 transition-colors" />
                </a>
              ))}
            </div>
          )}
        </section>

      </div>

      <MediaPlayerModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedMedia(null) }}
        media={selectedMedia}
      />
    </div>
  )
}
