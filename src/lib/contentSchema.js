/**
 * Rooted Content Schema
 *
 * Shared internal model used by all content sources:
 * local hardcoded items, YouTube, Spotify, nearby events.
 *
 * Every source normalizes into a ContentItem before the curation
 * layer or the UI ever sees it. This makes sources interchangeable.
 *
 * ── ContentItem fields ────────────────────────────────────────────────
 *
 * id                string   Namespaced unique key: "yt:{videoId}", "sp:{id}", "local:{id}"
 * source            string   'youtube' | 'spotify' | 'local' | 'nearby'
 * type              string   'media' | 'audio' | 'movement' | 'breathing' |
 *                            'journal' | 'micro' | 'lifestyle' | 'cognitive' | 'wildcard'
 * contentFormat     string   'video' | 'playlist' | 'exercise' | 'prompt' | 'article'
 * platform          string?  'youtube' | 'spotify'  — used by card renderers for routing
 * title             string
 * subtitle          string?
 * description       string?
 * image             string?  direct image URL (thumbnail, cover)
 * url               string?  canonical deep link
 * youtubeId         string?  raw YouTube video ID for player
 * spotifyPlaylistId string?  raw Spotify playlist ID for player
 * duration          string|number|null  display string ("10 min") or seconds (60)
 * tags              string[]
 * signals           object   hints used by curation layer
 *   .moods          string[] moods this content fits
 *   .intents        string[] sections it belongs to: move|calm|reflect|reset
 *   .energy         string[] energy levels: low|medium|high
 *   .timeOfDay      string[] morning|afternoon|evening|night
 * relevanceScore    number?  set by AI curation layer (0–10)
 * microCopy         string?  set by AI curation layer
 * _section          string?  assigned section: 'move'|'calm'|'reflect'|'reset'
 */

// ── Mood / signal constants ────────────────────────────────────────────────────

export const SECTIONS = ['move', 'calm', 'reflect', 'reset']

// Primary section intent(s) per mood — ordered by relevance
export const MOOD_TO_INTENTS = {
  stressed: ['calm', 'reset', 'reflect'],
  sad:      ['calm', 'reflect', 'move'],
  tired:    ['reset', 'calm', 'move'],
  angry:    ['move', 'reset', 'calm'],
  happy:    ['move', 'calm', 'reflect'],
  neutral:  ['calm', 'move', 'reflect', 'reset'],
}

// Derived energy level per mood
export const MOOD_TO_ENERGY = {
  stressed: 'medium',
  sad:      'low',
  tired:    'low',
  angry:    'high',
  happy:    'high',
  neutral:  'medium',
}

// Which content duration tier fits each energy level
export const ENERGY_TO_DURATION = {
  low:    'short',    // YouTube: < 4 min
  medium: 'medium',   // YouTube: 4–20 min
  high:   'medium',
}

// Which YouTube video duration filter to request
export const ENERGY_TO_YT_DURATION = {
  low:    'short',    // videoDuration=short (<4 min) — gentle, accessible
  medium: 'medium',   // videoDuration=medium (4–20 min)
  high:   'medium',   // energetic but still wellness-focused
}

export function getTimeOfDay(hour) {
  const h = hour ?? new Date().getHours()
  if (h >= 5  && h < 12) return 'morning'
  if (h >= 12 && h < 17) return 'afternoon'
  if (h >= 17 && h < 22) return 'evening'
  return 'night'
}

/**
 * Build a full signals object from mood + optional overrides.
 * This is the canonical way to construct signals for retrieval + curation.
 */
export function buildSignals(mood, overrides = {}) {
  const safeMood = mood || 'neutral'
  return {
    mood:      safeMood,
    timeOfDay: getTimeOfDay(),
    intents:   MOOD_TO_INTENTS[safeMood] || MOOD_TO_INTENTS.neutral,
    energy:    MOOD_TO_ENERGY[safeMood]  || 'medium',
    ...overrides,
  }
}

// ── Normalizers ───────────────────────────────────────────────────────────────

/**
 * Normalize a raw YouTube search result item into a ContentItem.
 * sectionHint is the section we searched for ('move' | 'calm' | etc.)
 */
export function normalizeYouTubeItem(ytItem, sectionHint, signals) {
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
    duration:      null,  // not available in search response without a second API call
    tags:          [],
    signals: {
      moods:     [signals.mood],
      intents:   sectionHint ? [sectionHint] : signals.intents,
      energy:    [signals.energy],
      timeOfDay: [signals.timeOfDay],
    },
    relevanceScore: null,
    microCopy:      null,
    _section:       sectionHint || null,
  }
}

/**
 * Normalize a raw Spotify playlist object into a ContentItem.
 */
export function normalizeSpotifyItem(playlist, sectionHint, signals) {
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
      intents:   sectionHint ? [sectionHint] : signals.intents,
      energy:    [signals.energy],
      timeOfDay: [signals.timeOfDay],
    },
    relevanceScore: null,
    microCopy:      null,
    _section:       sectionHint || null,
  }
}

/**
 * Wrap a local item so it can travel through the same curation pipeline.
 * Non-destructive: original fields are preserved for card renderer compatibility.
 */
export function normalizeLocalItem(item) {
  return {
    // Schema fields
    id:                `local:${item.id}`,
    source:            'local',
    type:              item.type,
    contentFormat:     item.platform === 'youtube' ? 'video'
                     : item.platform === 'spotify' ? 'playlist'
                     : item.type,
    platform:          item.platform || null,
    title:             item.title,
    subtitle:          item.subtitle || null,
    description:       item.description || null,
    image:             item.image || null,
    url:               item.url || null,
    youtubeId:         item.youtubeId || null,
    spotifyPlaylistId: item.spotifyPlaylistId || null,
    duration:          item.duration || null,
    tags:              item.tags || [],
    signals: {
      moods:     [],
      intents:   [],
      energy:    [],
      timeOfDay: [],
    },
    relevanceScore: item.relevanceBase || null,
    microCopy:      null,
    _section:       null,
    // Preserve all original fields for card renderer compat (pattern, prompt, instruction, etc.)
    ...item,
  }
}
