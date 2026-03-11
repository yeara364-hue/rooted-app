/**
 * Eventbrite nearby events handler.
 *
 * Vercel / Netlify serverless function — equivalent to Next.js app/api/nearby/events/route.ts.
 * Deploy target: Vercel (file lives at /api/nearby/events.js → route is /api/nearby/events).
 *
 * Required env var:
 *   EVENTBRITE_PRIVATE_TOKEN — your Eventbrite private token
 *
 * Query params:
 *   mood     — e.g. "stressed"
 *   lat      — latitude
 *   lng      — longitude
 *   keywords — URL-encoded search string, e.g. "yoga OR meditation"
 */

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

// ── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  // CORS for local dev
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { mood, lat, lng, keywords } = req.query

  if (!lat || !lng) {
    return res.status(400).json({ error: 'lat and lng are required' })
  }

  const token = process.env.EVENTBRITE_PRIVATE_TOKEN
  if (!token) {
    return res.status(500).json({ error: 'EVENTBRITE_PRIVATE_TOKEN not configured' })
  }

  const cacheKey = `events:${mood}:${parseFloat(lat).toFixed(2)}:${parseFloat(lng).toFixed(2)}`
  const cached = getCached(cacheKey)
  if (cached) {
    res.setHeader('X-Cache', 'HIT')
    return res.status(200).json(cached)
  }

  try {
    const params = new URLSearchParams({
      q: keywords || mood,
      'location.latitude': lat,
      'location.longitude': lng,
      'location.within': '20km',
      sort_by: 'date',
      expand: 'venue',
      page_size: '10',
    })

    const response = await fetch(
      `https://www.eventbriteapi.com/v3/events/search/?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    )

    if (!response.ok) {
      const text = await response.text()
      console.error('Eventbrite error:', response.status, text)
      return res.status(502).json({ error: 'Eventbrite error', status: response.status, details: text })
    }

    const data = await response.json()

    const events = (data.events || [])
      .filter(e => e.status === 'live' || e.status === 'started')
      .slice(0, 4)
      .map(e => ({
        title: e.name?.text || 'Event',
        datetime: e.start?.local
          ? new Date(e.start.local).toLocaleString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric',
              hour: 'numeric', minute: '2-digit',
            })
          : null,
        location: e.venue?.name || e.venue?.address?.city || null,
        url: e.url,
        distance: null, // Eventbrite free tier doesn't return distance
      }))

    const result = { events }
    setCached(cacheKey, result)
    res.setHeader('X-Cache', 'MISS')
    return res.status(200).json(result)

  } catch (err) {
    console.error('events handler error:', err)
    return res.status(500).json({ error: 'Internal error', events: [] })
  }
}
