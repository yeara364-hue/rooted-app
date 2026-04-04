/**
 * fetch-content — Signal-driven external content retrieval
 *
 * POST body:
 *   signals: {
 *     mood:      string,                          // 'stressed' | 'sad' | 'tired' | 'angry' | 'happy' | 'neutral'
 *     timeOfDay: string,                          // 'morning' | 'afternoon' | 'evening' | 'night'
 *     intents:   string[],                        // ['calm', 'reset', ...]  ordered by priority
 *     energy:    string,                          // 'low' | 'medium' | 'high'
 *   }
 *
 * Returns:
 *   {
 *     items: ContentItem[],   // normalized, deduplicated
 *     sources: string[],      // which APIs responded ('youtube', 'spotify')
 *     fallback: boolean,      // true if all external sources failed
 *   }
 *
 * Sources:
 *   - YouTube Data API v3  (requires YOUTUBE_API_KEY)
 *   - Spotify Web API      (requires SPOTIFY_CLIENT_ID + SPOTIFY_CLIENT_SECRET)
 *
 * If a source is unconfigured or fails, it is silently skipped.
 * If ALL sources fail, returns { items: [], fallback: true } — the frontend
 * falls back to local curated content automatically.
 *
 * Timeout: 8s total (both sources run in parallel)
 */

// ── Inline normalizers (avoids ESM/CJS cross-import issue) ───────────────────
// contentSchema.js is an ES module used by the frontend.
// Netlify functions are CommonJS — we inline the two normalizers we need here.

function normalizeYouTubeItem(ytItem, sectionHint, signals) {
  const videoId = ytItem.id?.videoId || ytItem.id
  const snippet = ytItem.snippet || {}
  const thumb   = snippet.thumbnails
  return {
    id:            `yt:${videoId}`,
    source:        'youtube',
    type:          'media',
    contentFormat: 'video',
    platform:      'youtube',
    title:         (snippet.title || '').replace(/&amp;/g, '&').replace(/&#39;/g, "'"),
    subtitle:      null,
    description:   (snippet.description || '').slice(0, 200) || null,
    image:         thumb?.high?.url || thumb?.medium?.url || thumb?.default?.url || null,
    url:           `https://www.youtube.com/watch?v=${videoId}`,
    youtubeId:     videoId,
    duration:      null,
    tags:          [],
    signals: {
      moods:     [signals.mood],
      intents:   sectionHint ? [sectionHint] : (signals.intents || []),
      energy:    [signals.energy],
      timeOfDay: [signals.timeOfDay],
    },
    relevanceScore: null,
    microCopy:      null,
    _section:       sectionHint || null,
  }
}

function normalizeSpotifyItem(playlist, sectionHint, signals) {
  return {
    id:                `sp:${playlist.id}`,
    source:            'spotify',
    type:              'audio',
    contentFormat:     'playlist',
    platform:          'spotify',
    title:             playlist.name || '',
    subtitle:          null,
    description:       (playlist.description || '').replace(/<[^>]*>/g, '').slice(0, 200) || null,
    image:             playlist.images?.[0]?.url || null,
    url:               playlist.external_urls?.spotify || null,
    youtubeId:         null,
    spotifyPlaylistId: playlist.id,
    duration:          '∞',
    tags:              [],
    signals: {
      moods:     [signals.mood],
      intents:   sectionHint ? [sectionHint] : (signals.intents || []),
      energy:    [signals.energy],
      timeOfDay: [signals.timeOfDay],
    },
    relevanceScore: null,
    microCopy:      null,
    _section:       sectionHint || null,
  }
}

// ── Query tables ──────────────────────────────────────────────────────────────
//
// Queries are specific enough to return wellness content but broad enough
// to produce diverse results. They are keyed by section + time-of-day + mood
// and fallback gracefully to generic section queries.

const YT_QUERIES = {
  // Section: move
  move: {
    morning:   { low: 'gentle morning yoga 10 minutes', medium: 'morning yoga flow beginner',       high: 'energizing morning vinyasa yoga' },
    afternoon: { low: 'desk yoga stretch 5 minutes',    medium: 'lunchtime yoga flow',              high: 'afternoon yoga workout' },
    evening:   { low: 'restorative evening yoga',       medium: 'gentle evening yoga flow',         high: 'power yoga evening flow' },
    night:     { low: 'bedtime yoga stretching',        medium: 'yin yoga night',                   high: 'gentle yoga before sleep' },
  },
  // Section: calm
  calm: {
    morning:   { low: 'morning meditation 5 minutes calm',  medium: 'guided morning meditation 10 min',   high: 'focused morning breathing exercise' },
    afternoon: { low: 'stress relief breathing 5 minutes',  medium: 'guided meditation anxiety relief',   high: 'quick breathwork reset afternoon' },
    evening:   { low: 'evening wind down meditation',       medium: 'guided relaxation meditation 15 min',high: 'evening meditation yoga nidra' },
    night:     { low: 'sleep meditation guided 20 minutes', medium: 'yoga nidra sleep',                   high: 'deep sleep relaxation meditation' },
  },
  // Section: reflect
  reflect: {
    morning:   { low: 'morning mindfulness reflection',  medium: 'morning journaling guided meditation', high: 'morning intention setting meditation' },
    afternoon: { low: 'mindful pause 5 minutes',         medium: 'self compassion guided meditation',    high: 'afternoon self reflection practice' },
    evening:   { low: 'evening gratitude reflection',    medium: 'evening meditation self reflection',   high: 'journaling prompts guided evening' },
    night:     { low: 'night reflection gratitude',      medium: 'self compassion meditation night',     high: 'evening journaling practice guided' },
  },
  // Section: reset
  reset: {
    morning:   { low: 'morning breathing exercise 2 minutes',  medium: '4-7-8 breathing technique',      high: 'morning energising breathwork' },
    afternoon: { low: '2 minute breathing break work',         medium: 'box breathing technique',         high: '5 minute reset breathwork' },
    evening:   { low: 'evening calming breath',                medium: 'physiological sigh technique',    high: '5 minute evening breath reset' },
    night:     { low: 'sleep breathing technique',             medium: '4-7-8 sleep breathing',           high: 'calming breathwork before sleep' },
  },
}

// Mood-specific query override for first-priority section
// Used when mood signal is strong and should sharpen retrieval
const YT_MOOD_OVERRIDES = {
  stressed: { calm: { medium: 'guided meditation for stress and anxiety' } },
  sad:      { calm: { low:    'self compassion meditation for sadness' } },
  tired:    { reset: { low:   'energy breathing exercise tired fatigue' } },
  angry:    { move:  { high:  'yoga for anger release tension' } },
  happy:    { move:  { high:  'joyful morning yoga flow dance' } },
}

const SPOTIFY_QUERIES = {
  move:    ['yoga flow music', 'energising morning wellness', 'movement meditation music'],
  calm:    ['stress relief calm music', 'anxiety relief playlist', 'peaceful ambient meditation'],
  reflect: ['reflective ambient music', 'journaling music calm', 'introspective instrumental'],
  reset:   ['nature sounds focus', 'breathwork music ambient', 'mindfulness reset sounds'],
}

// How many results to request per section per source
const YT_RESULTS_PER_SECTION    = 4
const SPOTIFY_RESULTS_PER_QUERY = 3

// ── YouTube retrieval ─────────────────────────────────────────────────────────

function getYtQuery(section, signals) {
  const { mood, timeOfDay, energy } = signals
  const override = YT_MOOD_OVERRIDES[mood]?.[section]
  if (override) {
    const energyQuery = override[energy] || override.medium || override.low
    if (energyQuery) return energyQuery
  }
  return YT_QUERIES[section]?.[timeOfDay]?.[energy]
      || YT_QUERIES[section]?.[timeOfDay]?.medium
      || YT_QUERIES[section]?.afternoon?.medium
      || `${section} meditation wellness`
}

async function fetchYouTube(signals, apiKey) {
  const { energy } = signals
  const videoDuration = energy === 'low' ? 'short' : 'medium'

  // Fetch all 4 sections in parallel
  const sectionFetches = ['move', 'calm', 'reflect', 'reset'].map(async (section) => {
    const query = getYtQuery(section, signals)
    const params = new URLSearchParams({
      part:             'snippet',
      q:                query,
      type:             'video',
      maxResults:       YT_RESULTS_PER_SECTION,
      videoDuration,
      relevanceLanguage:'en',
      safeSearch:       'strict',
      key:              apiKey,
    })
    const url = `https://www.googleapis.com/youtube/v3/search?${params}`
    console.log(`fetch-content/yt [${section}]: "${query}"`)

    const resp = await fetch(url)
    if (!resp.ok) {
      console.warn(`fetch-content/yt [${section}]: HTTP ${resp.status}`)
      return []
    }
    const data = await resp.json()
    return (data.items || [])
      .filter(i => i.id?.videoId)
      .map(i => normalizeYouTubeItem(i, section, signals))
  })

  const results = await Promise.all(sectionFetches)
  return results.flat()
}

// ── Spotify retrieval ─────────────────────────────────────────────────────────

async function getSpotifyToken(clientId, clientSecret) {
  const resp = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  })
  if (!resp.ok) throw new Error(`Spotify token error ${resp.status}`)
  const data = await resp.json()
  return data.access_token
}

async function fetchSpotify(signals, clientId, clientSecret) {
  const token = await getSpotifyToken(clientId, clientSecret)

  // Only fetch for the top 2 intents to keep quota low
  const targetSections = signals.intents.slice(0, 2)

  const sectionFetches = targetSections.map(async (section) => {
    const queries = SPOTIFY_QUERIES[section] || SPOTIFY_QUERIES.calm
    // Pick one query (rotate by hour to vary results across the day)
    const query = queries[new Date().getHours() % queries.length]
    const params = new URLSearchParams({
      q:      query,
      type:   'playlist',
      limit:  SPOTIFY_RESULTS_PER_QUERY,
      market: 'US',
    })
    const url = `https://api.spotify.com/v1/search?${params}`
    console.log(`fetch-content/spotify [${section}]: "${query}"`)

    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!resp.ok) {
      console.warn(`fetch-content/spotify [${section}]: HTTP ${resp.status}`)
      return []
    }
    const data = await resp.json()
    return (data.playlists?.items || [])
      .filter(p => p?.id && p?.name)
      .map(p => normalizeSpotifyItem(p, section, signals))
  })

  const results = await Promise.all(sectionFetches)
  return results.flat()
}

// ── Deduplication ─────────────────────────────────────────────────────────────

function dedupe(items) {
  const seen = new Set()
  return items.filter(item => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

// ── Handler ───────────────────────────────────────────────────────────────────

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  let signals
  try {
    ;({ signals } = JSON.parse(event.body || '{}'))
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) }
  }

  if (!signals?.mood) {
    return { statusCode: 400, body: JSON.stringify({ error: 'signals.mood is required' }) }
  }

  const ytKey       = process.env.YOUTUBE_API_KEY
  const spClientId  = process.env.SPOTIFY_CLIENT_ID
  const spSecret    = process.env.SPOTIFY_CLIENT_SECRET

  console.log('fetch-content: mood=%s time=%s energy=%s intents=%s',
    signals.mood, signals.timeOfDay, signals.energy, (signals.intents || []).join(','))
  console.log('fetch-content: YouTube configured:', !!ytKey, '| Spotify configured:', !!(spClientId && spSecret))

  // ── Run both sources in parallel, with independent error handling ─────────
  const TIMEOUT_MS = 7500

  const withTimeout = (promise, label) =>
    Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`${label} timed out`)), TIMEOUT_MS)
      ),
    ])

  const [ytItems, spItems, sources] = await (async () => {
    const pending = []
    const activeSources = []

    if (ytKey) {
      pending.push(withTimeout(fetchYouTube(signals, ytKey), 'YouTube').catch(err => {
        console.warn('fetch-content/yt failed:', err.message)
        return []
      }))
      activeSources.push('youtube')
    } else {
      pending.push(Promise.resolve([]))
    }

    if (spClientId && spSecret) {
      pending.push(withTimeout(fetchSpotify(signals, spClientId, spSecret), 'Spotify').catch(err => {
        console.warn('fetch-content/spotify failed:', err.message)
        return []
      }))
      activeSources.push('spotify')
    } else {
      pending.push(Promise.resolve([]))
    }

    const [yt, sp] = await Promise.all(pending)
    return [yt, sp, activeSources]
  })()

  const items = dedupe([...ytItems, ...spItems])
  const fallback = items.length === 0

  console.log(`fetch-content: ${ytItems.length} YouTube + ${spItems.length} Spotify = ${items.length} total items`)

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, sources, fallback }),
  }
}
