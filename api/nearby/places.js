/**
 * Google Places nearby search handler.
 *
 * Vercel / Netlify serverless function — equivalent to Next.js app/api/nearby/places/route.ts.
 * Deploy target: Vercel (file lives at /api/nearby/places.js → route is /api/nearby/places).
 *
 * Required env var:
 *   GOOGLE_MAPS_API_KEY — your Google Maps / Places API key
 *
 * Query params:
 *   mood     — e.g. "stressed"
 *   lat      — latitude
 *   lng      — longitude
 *   keywords — URL-encoded search string, e.g. "yoga OR meditation"
 *
 * Uses the Places API (legacy) nearbysearch endpoint, which is broadly available.
 * Swap to the new Places API (places:searchNearby) if you prefer the v1 endpoint.
 */

// ── Mood → place type/keyword mapping ────────────────────────────────────────

const moodPlaceKeywords = {
  stressed: 'yoga studio OR meditation center OR spa',
  sad:      'park OR community center OR art gallery',
  tired:    'yoga studio OR spa OR wellness center',
  angry:    'gym OR boxing gym OR running track',
  happy:    'dance studio OR park OR music venue',
}

// ── In-memory cache (20-minute TTL) ──────────────────────────────────────────

const cache = new Map()
const CACHE_TTL_MS = 20 * 60 * 1000

function getCached(key) {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > CACHE_TTL_MS) { cache.delete(key); return null }
  return entry.data
}

function setCached(key, data) {
  cache.set(key, { data, ts: Date.now() })
}

// ── Haversine distance ────────────────────────────────────────────────────────

function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDistance(km) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
}

// ── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { mood, lat, lng } = req.query

  if (!lat || !lng) {
    return res.status(400).json({ error: 'lat and lng are required' })
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GOOGLE_MAPS_API_KEY not configured' })
  }

  const cacheKey = `places:${mood}:${parseFloat(lat).toFixed(2)}:${parseFloat(lng).toFixed(2)}`
  const cached = getCached(cacheKey)
  if (cached) {
    res.setHeader('X-Cache', 'HIT')
    return res.status(200).json(cached)
  }

  const keyword = moodPlaceKeywords[mood] || 'wellness'

  try {
    const params = new URLSearchParams({
      location: `${lat},${lng}`,
      radius: '5000', // 5 km
      keyword,
      type: 'establishment',
      key: apiKey,
    })

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`
    )

    if (!response.ok) {
      console.error('Google Places error:', response.status)
      return res.status(502).json({ error: 'Upstream error from Google Places', places: [] })
    }

    const data = await response.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places status:', data.status, data.error_message)
      return res.status(502).json({ error: data.error_message || data.status, places: [] })
    }

    const userLat = parseFloat(lat)
    const userLng = parseFloat(lng)

    const places = (data.results || [])
      .slice(0, 4)
      .map(p => {
        const placeLat = p.geometry?.location?.lat
        const placeLng = p.geometry?.location?.lng
        const km = placeLat && placeLng ? distanceKm(userLat, userLng, placeLat, placeLng) : null

        return {
          title: p.name,
          location: p.vicinity || null,
          distance: km !== null ? formatDistance(km) : null,
          url: `https://www.google.com/maps/place/?q=place_id:${p.place_id}`,
          datetime: null,
        }
      })

    const result = { places }
    setCached(cacheKey, result)
    res.setHeader('X-Cache', 'MISS')
    return res.status(200).json(result)

  } catch (err) {
    console.error('places handler error:', err)
    return res.status(500).json({ error: 'Internal error', places: [] })
  }
}
