import { MOOD_QUERIES, CATEGORY_WEIGHTS, DURATION_RANGES } from './moodQueryMap'
import { contentPool } from './contentPool'

const CACHE_TTL_MS = 24 * 60 * 60 * 1000  // 24 hours
const HISTORY_KEY_PREFIX = 'rooted_yt_history_'
const CACHE_KEY_PREFIX = 'rooted_yt_cache_'
const MAX_HISTORY_PER_MOOD = 5

// Simple non-cryptographic hash for cache keys
function hashQuery(query) {
  let hash = 0
  for (let i = 0; i < query.length; i++) {
    const char = query.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

function getCachedResults(queryHash) {
  try {
    const cached = localStorage.getItem(CACHE_KEY_PREFIX + queryHash)
    if (!cached) return null
    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY_PREFIX + queryHash)
      return null
    }
    return data
  } catch {
    return null
  }
}

function setCachedResults(queryHash, data) {
  try {
    localStorage.setItem(
      CACHE_KEY_PREFIX + queryHash,
      JSON.stringify({ data, timestamp: Date.now() })
    )
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

function getHistory(mood) {
  try {
    const data = localStorage.getItem(HISTORY_KEY_PREFIX + mood)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function addToHistory(mood, videoIds) {
  try {
    const existing = getHistory(mood)
    const updated = [...videoIds, ...existing].slice(0, MAX_HISTORY_PER_MOOD)
    localStorage.setItem(HISTORY_KEY_PREFIX + mood, JSON.stringify(updated))
  } catch {
    // ignore
  }
}

function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

async function fetchFromAPI(query, maxResults = 10) {
  const queryHash = hashQuery(query)
  const cached = getCachedResults(queryHash)
  if (cached) {
    console.log('[YouTube] Cache hit for query:', query)
    return cached
  }

  try {
    const res = await fetch('/api/youtubeSearch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, maxResults })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    if (Array.isArray(data) && data.length > 0) {
      setCachedResults(queryHash, data)
      console.log('[YouTube] Fetched', data.length, 'results for query:', query)
      return data
    }
    return []
  } catch (error) {
    console.error('[YouTube] Fetch error for query:', query, error)
    return []
  }
}

function pickFromResults(results, durationRange, history, count) {
  const { min, max } = durationRange
  // Prefer videos in duration range, fall back to all if not enough
  const inRange = results.filter(r => r.durationSeconds >= min && r.durationSeconds <= max)
  const pool = inRange.length >= count ? inRange : results

  // Exclude recently shown
  const fresh = pool.filter(r => !history.includes(r.videoId))
  const toUse = fresh.length >= count ? fresh : pool

  // Shuffle and prefer different channels for variety
  const shuffled = shuffle(toUse)
  const seenChannels = new Set()
  const picked = []

  for (const item of shuffled) {
    if (picked.length >= count) break
    if (!seenChannels.has(item.channelTitle)) {
      picked.push(item)
      seenChannels.add(item.channelTitle)
    }
  }

  // Fill remaining slots if channel dedup left gaps
  if (picked.length < count) {
    for (const item of shuffled) {
      if (picked.length >= count) break
      if (!picked.some(p => p.videoId === item.videoId)) {
        picked.push(item)
      }
    }
  }

  return picked
}

function mapToItem(result, mood, category) {
  return {
    id: `yt-live-${mood}-${category}-${result.videoId}`,
    type: 'media',
    category,
    title: result.title,
    subtitle: result.channelTitle,
    duration: result.duration,
    platform: 'youtube',
    youtubeVideoId: result.videoId,
    thumbnail: result.thumbnail,
    signal: null,
    relevanceBase: 8
  }
}

/**
 * Fetch 2 YouTube recommendations for a given mood (one per category, per weights).
 * Falls back to static youtubeFallback pool if the API fails or returns nothing.
 */
export async function fetchYouTubeForMood(mood) {
  const queries = MOOD_QUERIES[mood] || MOOD_QUERIES.neutral
  const weights = CATEGORY_WEIGHTS[mood] || CATEGORY_WEIGHTS.neutral
  const history = getHistory(mood)
  const categories = Object.keys(weights)

  const items = []

  for (const category of categories) {
    const queryList = queries[category]
    if (!queryList || queryList.length === 0) continue

    // Pick a random query from the list for this category
    const query = queryList[Math.floor(Math.random() * queryList.length)]
    const durationRange = DURATION_RANGES[category] || { min: 300, max: 1200 }

    const results = await fetchFromAPI(query, 10)
    const picked = pickFromResults(results, durationRange, history, 1)

    for (const r of picked) {
      items.push(mapToItem(r, mood, category))
    }
  }

  // Record shown videoIds in history
  if (items.length > 0) {
    addToHistory(mood, items.map(i => i.youtubeVideoId))
    console.log('[YouTube] Selected', items.length, 'items for mood:', mood)
  }

  // Fall back to static pool if API returned nothing
  if (items.length === 0) {
    console.warn('[YouTube] API returned nothing — using fallback pool for mood:', mood)
    const fallback = contentPool[mood]?.youtubeFallback || contentPool.neutral?.youtubeFallback || []
    return shuffle(fallback).slice(0, 2)
  }

  return items
}

/**
 * Clear all YouTube history (for testing / dev)
 */
export function clearYouTubeHistory() {
  Object.keys(localStorage)
    .filter(k => k.startsWith(HISTORY_KEY_PREFIX) || k.startsWith(CACHE_KEY_PREFIX))
    .forEach(k => localStorage.removeItem(k))
}
