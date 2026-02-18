import { contentPool, smoothieRecipes } from './contentPool'
import { fetchYouTubeForMood } from './youtubeService'

const STORAGE_KEY = 'rooted_recently_shown'
const MAX_RECENT = 30
const RECENT_EXCLUDE_COUNT = 15

function getRecentlyShown() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveRecentlyShown(ids) {
  try {
    const trimmed = ids.slice(0, MAX_RECENT)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch {
    // localStorage unavailable — silently ignore
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

/**
 * Pick N random items from array, excluding recently shown IDs.
 * Falls back to full pool if too few fresh items.
 */
function pickRandom(items, count, recentIds) {
  if (!items || items.length === 0) return []
  const fresh = items.filter(item => !recentIds.includes(item.id))
  const pool = fresh.length >= count ? fresh : items
  return shuffle(pool).slice(0, count)
}

function calculateRelevance(item, signals) {
  let score = item.relevanceBase || 5
  if (signals.includes(item.signal)) score += 5
  if (item.type === 'breathing' || item.type === 'micro') score += 2
  if (item.type === 'media') score += 1
  return score
}

/**
 * Main recommendation function (async — fetches YouTube live).
 * Returns { topPicks, allRecommendations, moreOptions }
 */
export async function getRecommendations(mood, signals = []) {
  const pool = contentPool[mood] || contentPool.neutral
  const recentIds = getRecentlyShown().slice(0, RECENT_EXCLUDE_COUNT)
  const primarySignal = signals.length > 0 ? signals[0] : null

  // Pick static content
  const spotifyPicks = pickRandom(pool.spotify, 2, recentIds)
  const breathingPick = pickRandom(pool.breathing, 1, recentIds)
  const microPicks = pickRandom(pool.micro, 2, recentIds)
  const journalPick = pickRandom(pool.journal, 1, recentIds)
  const infoPick = pickRandom(pool.info || [], 1, recentIds)

  // Fetch YouTube dynamically (falls back to youtubeFallback on error)
  const youtubePicks = await fetchYouTubeForMood(mood)

  let items = [
    ...spotifyPicks,
    ...youtubePicks,
    ...breathingPick,
    ...microPicks,
    ...journalPick,
    ...infoPick
  ].map(item => ({
    ...item,
    reason: primarySignal || item.signal
  }))

  // Add recipe if available for this mood
  const recipe = smoothieRecipes[mood]
  if (recipe) {
    items.push({ ...recipe, reason: primarySignal || 'body', relevanceBase: 7 })
  }

  // Score all items
  items = items.map(item => ({
    ...item,
    relevanceScore: calculateRelevance(item, signals)
  }))

  // Sort by relevance for top picks
  const sorted = [...items].sort((a, b) => b.relevanceScore - a.relevanceScore)
  const topPicks = sorted.slice(0, 3)
  const moreOptions = items.filter(r => !topPicks.find(tp => tp.id === r.id))

  // Record shown IDs for non-YouTube items (YouTube history is managed in youtubeService)
  const shownIds = items.filter(i => i.platform !== 'youtube').map(i => i.id)
  const updatedRecent = [...shownIds, ...getRecentlyShown()]
  saveRecentlyShown(updatedRecent)

  return { topPicks, allRecommendations: items, moreOptions }
}

/**
 * Clear recently shown items (for testing / dev)
 */
export function clearRecentlyShown() {
  localStorage.removeItem(STORAGE_KEY)
}
