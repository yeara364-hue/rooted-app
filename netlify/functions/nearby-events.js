/**
 * Nearby wellness events — Netlify Function.
 * Route: /.netlify/functions/nearby-events
 *
 * NOTE: The Eventbrite /v3/events/search/ endpoint was permanently shut down
 * in late 2023. This function now uses the Ticketmaster Discovery API v2,
 * which is free (5,000 req/day) and supports lat/lng + keyword search.
 *
 * Required env var:
 *   TICKETMASTER_API_KEY — get a free key at developer.ticketmaster.com
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

// ── Keyword mapping per mood ──────────────────────────────────────────────────

const MOOD_KEYWORDS = {
  stressed:  'yoga meditation breathwork sound bath wellness',
  sad:       'meditation mindfulness sound bath community',
  tired:     'gentle yoga restorative stretching',
  angry:     'yoga breathwork power vinyasa',
  happy:     'dance yoga community wellness',
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Content-Type': 'application/json',
}

// ── Handler ───────────────────────────────────────────────────────────────────

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' }
  }

  const { mood, lat, lng, keywords } = event.queryStringParameters || {}

  if (!lat || !lng) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'lat and lng are required' }),
    }
  }

  const apiKey = process.env.TICKETMASTER_API_KEY
  if (!apiKey) {
    console.warn('nearby-events: TICKETMASTER_API_KEY not set — returning empty events')
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ events: [], fallback: true, error: 'TICKETMASTER_API_KEY not configured' }),
    }
  }

  const cacheKey = `events:${mood}:${parseFloat(lat).toFixed(2)}:${parseFloat(lng).toFixed(2)}`
  const cached = getCached(cacheKey)
  if (cached) {
    console.log('nearby-events: cache HIT for', cacheKey)
    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'X-Cache': 'HIT' },
      body: JSON.stringify(cached),
    }
  }

  // Build keyword string: prefer caller-supplied keywords, fall back to mood mapping
  const rawKeywords = keywords
    ? decodeURIComponent(keywords)
    : (MOOD_KEYWORDS[mood] || 'yoga meditation wellness')

  // Ticketmaster keyword param is a single string — join with space for OR-style matching
  const keyword = rawKeywords
    .replace(/\bOR\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const now = new Date().toISOString().slice(0, 19) + 'Z'

  const params = new URLSearchParams({
    apikey: apiKey,
    keyword,
    latlong: `${parseFloat(lat).toFixed(6)},${parseFloat(lng).toFixed(6)}`,
    radius: '20',
    unit: 'km',
    size: '10',
    sort: 'date,asc',
    startDateTime: now,
  })

  const url = `https://app.ticketmaster.com/discovery/v2/events.json?${params}`
  console.log('nearby-events: fetching Ticketmaster —', url.replace(apiKey, '***'))

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)
  const startTime = Date.now()

  let response
  try {
    response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
  } catch (fetchErr) {
    clearTimeout(timeoutId)
    console.error('nearby-events: fetch failed after', Date.now() - startTime, 'ms —', fetchErr.message)
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ events: [], fallback: true, error: 'Events request timed out' }),
    }
  }

  clearTimeout(timeoutId)
  console.log('nearby-events: response status', response.status, 'in', Date.now() - startTime, 'ms')

  const text = await response.text()
  console.log('nearby-events: raw response (first 500):', text.slice(0, 500))

  let data
  try {
    data = JSON.parse(text)
  } catch (e) {
    console.error('nearby-events: non-JSON response')
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ events: [], fallback: true, error: 'Upstream did not return JSON', raw: text.slice(0, 300) }),
    }
  }

  if (!response.ok) {
    console.error('nearby-events: Ticketmaster error', response.status, data)
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ events: [], fallback: true, error: `Ticketmaster error ${response.status}`, details: data }),
    }
  }

  const rawEvents = data?._embedded?.events || []
  console.log('nearby-events: raw events from Ticketmaster:', rawEvents.length)

  const events = rawEvents.slice(0, 5).map(e => {
    const venue = e._embedded?.venues?.[0] || {}
    const venueLat = parseFloat(venue.location?.latitude)
    const venueLng = parseFloat(venue.location?.longitude)

    const address = [
      venue.address?.line1,
      venue.city?.name,
      venue.country?.name,
    ].filter(Boolean).join(', ')

    return {
      title: e.name || 'Event',
      description: e.description || e.info || null,
      startTime: e.dates?.start?.localDate && e.dates?.start?.localTime
        ? `${e.dates.start.localDate}T${e.dates.start.localTime}`
        : e.dates?.start?.localDate || null,
      endTime: e.dates?.end?.localDate
        ? `${e.dates.end.localDate}T${e.dates.end?.localTime || '00:00:00'}`
        : null,
      venueName: venue.name || null,
      address: address || null,
      lat: Number.isFinite(venueLat) ? venueLat : null,
      lng: Number.isFinite(venueLng) ? venueLng : null,
      url: e.url || null,
      source: 'ticketmaster',
      // legacy fields kept so MoodPage still renders without changes
      datetime: e.dates?.start?.localDate
        ? new Date(`${e.dates.start.localDate}T${e.dates.start.localTime || '00:00:00'}`).toLocaleString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric',
            hour: 'numeric', minute: '2-digit',
          })
        : null,
      location: venue.name || venue.city?.name || null,
    }
  })

  console.log('nearby-events: normalized events returned:', events.length)

  const result = { events }
  setCached(cacheKey, result)

  return {
    statusCode: 200,
    headers: { ...CORS_HEADERS, 'X-Cache': 'MISS' },
    body: JSON.stringify(result),
  }
}
