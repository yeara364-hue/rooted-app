/**
 * Unified Progress Tracking Layer
 * Tracks completions, sessions, and engagement across all content types
 */

const STORAGE_KEY = 'rooted_tracking'

// Event types
export const CompletionMethod = {
  VERIFIED: 'verified',
  ESTIMATED: 'estimated'
}

export const ContentType = {
  BREATHING: 'breathing',
  MICRO: 'micro',
  JOURNAL: 'journal',
  RECIPE: 'recipe',
  YOUTUBE: 'youtube',
  SPOTIFY: 'spotify',
  MEDITATION: 'meditation',
  YOGA: 'yoga',
  MUSIC: 'music'
}

// Initialize or get tracking data
function getTrackingData() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('Error reading tracking data:', e)
  }
  return {
    sessions: {},        // Active sessions: { [itemId]: { startTime, type } }
    completions: [],     // Array of completion events
    dailyStats: {},      // { [dateKey]: { verified: n, estimated: n, minutes: n } }
    recentActivity: []   // Last N activities for display
  }
}

// Save tracking data
function saveTrackingData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    // Dispatch custom event for real-time UI updates
    window.dispatchEvent(new CustomEvent('tracking-updated', { detail: data }))
  } catch (e) {
    console.error('Error saving tracking data:', e)
  }
}

// Get today's date key
function getTodayKey() {
  return new Date().toISOString().split('T')[0]
}

// Format time for display
function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

/**
 * Start a tracking session for an item
 */
export function startSession(itemId, type, title = '') {
  const data = getTrackingData()
  const now = Date.now()

  data.sessions[itemId] = {
    startTime: now,
    type,
    title
  }

  saveTrackingData(data)
  return data.sessions[itemId]
}

/**
 * End a tracking session and calculate duration
 */
export function endSession(itemId) {
  const data = getTrackingData()
  const session = data.sessions[itemId]

  if (!session) {
    return null
  }

  const duration = Math.floor((Date.now() - session.startTime) / 1000) // seconds
  const today = getTodayKey()

  // Update daily minutes
  if (!data.dailyStats[today]) {
    data.dailyStats[today] = { verified: 0, estimated: 0, minutes: 0 }
  }
  data.dailyStats[today].minutes += Math.round(duration / 60)

  // Clean up session
  delete data.sessions[itemId]

  saveTrackingData(data)
  return { duration, type: session.type, title: session.title }
}

/**
 * Get session duration in seconds (for active session)
 */
export function getSessionDuration(itemId) {
  const data = getTrackingData()
  const session = data.sessions[itemId]

  if (!session) return 0
  return Math.floor((Date.now() - session.startTime) / 1000)
}

/**
 * Check if a session is active
 */
export function hasActiveSession(itemId) {
  const data = getTrackingData()
  return !!data.sessions[itemId]
}

/**
 * Mark an item as completed
 */
export function markCompleted(itemId, type, method, title = '', durationSeconds = 0) {
  const data = getTrackingData()
  const today = getTodayKey()
  const now = Date.now()

  // End any active session for this item
  if (data.sessions[itemId]) {
    const session = data.sessions[itemId]
    durationSeconds = Math.floor((now - session.startTime) / 1000)
    delete data.sessions[itemId]
  }

  // Create completion event
  const completion = {
    id: `${itemId}-${now}`,
    itemId,
    type,
    method,
    title,
    duration: durationSeconds,
    timestamp: now,
    date: today
  }

  data.completions.push(completion)

  // Update daily stats
  if (!data.dailyStats[today]) {
    data.dailyStats[today] = { verified: 0, estimated: 0, minutes: 0 }
  }

  if (method === CompletionMethod.VERIFIED) {
    data.dailyStats[today].verified++
  } else {
    data.dailyStats[today].estimated++
  }

  // Add duration to minutes
  if (durationSeconds > 0) {
    data.dailyStats[today].minutes += Math.round(durationSeconds / 60)
  }

  // Update recent activity (keep last 20)
  data.recentActivity.unshift({
    id: completion.id,
    itemId,
    type,
    method,
    title,
    timestamp: now,
    timeFormatted: formatTime(now)
  })
  data.recentActivity = data.recentActivity.slice(0, 20)

  saveTrackingData(data)
  return completion
}

/**
 * Check if item was completed today
 */
export function isCompletedToday(itemId) {
  const data = getTrackingData()
  const today = getTodayKey()
  return data.completions.some(c => c.itemId === itemId && c.date === today)
}

/**
 * Get today's stats
 */
export function getTodayStats() {
  const data = getTrackingData()
  const today = getTodayKey()
  const stats = data.dailyStats[today] || { verified: 0, estimated: 0, minutes: 0 }

  return {
    completedToday: stats.verified + stats.estimated,
    verifiedToday: stats.verified,
    estimatedToday: stats.estimated,
    minutesToday: stats.minutes
  }
}

/**
 * Get recent activity (last n items)
 */
export function getRecentActivity(limit = 5) {
  const data = getTrackingData()
  return data.recentActivity.slice(0, limit)
}

/**
 * Calculate streak
 * A day counts if: 1 verified OR 2+ estimated completions
 */
export function calculateStreak() {
  const data = getTrackingData()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let streak = 0
  let checkDate = new Date(today)

  // Check today first
  const todayKey = getTodayKey()
  const todayStats = data.dailyStats[todayKey]

  if (todayStats && (todayStats.verified >= 1 || todayStats.estimated >= 2)) {
    streak = 1
  } else {
    // If today doesn't count, start checking from yesterday
    checkDate.setDate(checkDate.getDate() - 1)
  }

  // Check previous days
  for (let i = 0; i < 365; i++) {
    const dateKey = checkDate.toISOString().split('T')[0]
    const dayStats = data.dailyStats[dateKey]

    if (dayStats && (dayStats.verified >= 1 || dayStats.estimated >= 2)) {
      if (streak === 0) streak = 1
      else streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

/**
 * Get all tracking stats for display
 */
export function getAllStats() {
  const todayStats = getTodayStats()
  const streak = calculateStreak()
  const recentActivity = getRecentActivity(5)

  return {
    ...todayStats,
    streak,
    recentActivity
  }
}

/**
 * Get completions by type for today
 */
export function getCompletionsByType() {
  const data = getTrackingData()
  const today = getTodayKey()
  const todayCompletions = data.completions.filter(c => c.date === today)

  const byType = {}
  todayCompletions.forEach(c => {
    if (!byType[c.type]) {
      byType[c.type] = { verified: 0, estimated: 0 }
    }
    if (c.method === CompletionMethod.VERIFIED) {
      byType[c.type].verified++
    } else {
      byType[c.type].estimated++
    }
  })

  return byType
}

/**
 * Hook to listen for tracking updates
 */
export function useTrackingUpdates(callback) {
  if (typeof window !== 'undefined') {
    const handler = (e) => callback(e.detail)
    window.addEventListener('tracking-updated', handler)
    return () => window.removeEventListener('tracking-updated', handler)
  }
  return () => {}
}

/**
 * Clear all tracking data (for testing)
 */
export function clearTrackingData() {
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new CustomEvent('tracking-updated', { detail: getTrackingData() }))
}
