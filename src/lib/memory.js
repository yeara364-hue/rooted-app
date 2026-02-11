/**
 * Numa's Memory System
 *
 * Tracks patterns over time to make Numa feel like she remembers:
 * - Mood patterns (what moods appear most often)
 * - Time patterns (when does the user typically check in)
 * - What helped (which activities were marked as helpful)
 * - Conversation themes (recurring topics in voice/text input)
 *
 * All data is stored in localStorage for the MVP.
 * In production, this would sync to a database.
 */

const STORAGE_KEY = 'rooted-numa-memory'

// Get all stored memory
export function getMemory() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    return createEmptyMemory()
  }
  return JSON.parse(stored)
}

// Save memory
function saveMemory(memory) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memory))
}

// Create empty memory structure
function createEmptyMemory() {
  return {
    checkIns: [],           // Array of { date, mood, energy, time }
    conversations: [],       // Array of { date, userMessage, detectedEmotion }
    helpfulActivities: [],   // Array of { type, title, rating }
    patterns: {
      commonMoods: {},       // { mood: count }
      commonEnergies: {},    // { energy: count }
      commonEmotions: {},    // { emotion: count }
      timeOfDay: {},         // { morning/afternoon/evening: count }
    },
    insights: {
      lastUpdated: null,
      streakDays: 0,
      totalCheckIns: 0,
    }
  }
}

/**
 * Record a daily check-in
 */
export function recordCheckIn(mood, energy) {
  const memory = getMemory()
  const now = new Date()
  const hour = now.getHours()

  // Determine time of day
  let timeOfDay = 'morning'
  if (hour >= 12 && hour < 17) timeOfDay = 'afternoon'
  else if (hour >= 17) timeOfDay = 'evening'

  // Add check-in
  memory.checkIns.push({
    date: now.toISOString(),
    mood,
    energy,
    timeOfDay
  })

  // Keep only last 30 days
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
  memory.checkIns = memory.checkIns.filter(
    c => new Date(c.date).getTime() > thirtyDaysAgo
  )

  // Update patterns
  memory.patterns.commonMoods[mood] = (memory.patterns.commonMoods[mood] || 0) + 1
  memory.patterns.commonEnergies[energy] = (memory.patterns.commonEnergies[energy] || 0) + 1
  memory.patterns.timeOfDay[timeOfDay] = (memory.patterns.timeOfDay[timeOfDay] || 0) + 1

  // Update insights
  memory.insights.totalCheckIns++
  memory.insights.lastUpdated = now.toISOString()

  // Calculate streak
  memory.insights.streakDays = calculateStreak(memory.checkIns)

  saveMemory(memory)
  return memory
}

/**
 * Record a conversation message
 */
export function recordConversation(userMessage, detectedEmotion) {
  const memory = getMemory()

  memory.conversations.push({
    date: new Date().toISOString(),
    userMessage: userMessage.substring(0, 200), // Truncate for privacy
    detectedEmotion
  })

  // Keep only last 50 conversations
  memory.conversations = memory.conversations.slice(-50)

  // Update emotion patterns
  if (detectedEmotion) {
    memory.patterns.commonEmotions[detectedEmotion] =
      (memory.patterns.commonEmotions[detectedEmotion] || 0) + 1
  }

  saveMemory(memory)
  return memory
}

/**
 * Record feedback on an activity
 */
export function recordActivityFeedback(activityType, activityTitle, helpful) {
  const memory = getMemory()

  memory.helpfulActivities.push({
    type: activityType,
    title: activityTitle,
    helpful,
    date: new Date().toISOString()
  })

  // Keep only last 30 ratings
  memory.helpfulActivities = memory.helpfulActivities.slice(-30)

  saveMemory(memory)
  return memory
}

/**
 * Calculate check-in streak
 */
function calculateStreak(checkIns) {
  if (checkIns.length === 0) return 0

  // Sort by date descending
  const sorted = [...checkIns].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  )

  // Get unique days
  const days = [...new Set(sorted.map(c => new Date(c.date).toDateString()))]

  let streak = 0
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()

  // Check if most recent is today or yesterday
  if (days[0] !== today && days[0] !== yesterday) {
    return 0
  }

  // Count consecutive days
  for (let i = 0; i < days.length; i++) {
    const expectedDate = new Date(Date.now() - (i * 86400000)).toDateString()
    if (days[i] === expectedDate) {
      streak++
    } else {
      break
    }
  }

  return streak
}

/**
 * Get insights for Numa to reference
 */
export function getInsights() {
  const memory = getMemory()

  // Find most common mood
  const moodCounts = Object.entries(memory.patterns.commonMoods)
  const mostCommonMood = moodCounts.length > 0
    ? moodCounts.sort((a, b) => b[1] - a[1])[0][0]
    : null

  // Find most common energy
  const energyCounts = Object.entries(memory.patterns.commonEnergies)
  const mostCommonEnergy = energyCounts.length > 0
    ? energyCounts.sort((a, b) => b[1] - a[1])[0][0]
    : null

  // Find most common emotion in conversations
  const emotionCounts = Object.entries(memory.patterns.commonEmotions)
  const mostCommonEmotion = emotionCounts.length > 0
    ? emotionCounts.sort((a, b) => b[1] - a[1])[0][0]
    : null

  // Find preferred time of day
  const timeCounts = Object.entries(memory.patterns.timeOfDay)
  const preferredTime = timeCounts.length > 0
    ? timeCounts.sort((a, b) => b[1] - a[1])[0][0]
    : null

  // Recent trend (last 7 check-ins vs previous 7)
  const recent = memory.checkIns.slice(-7)
  const previous = memory.checkIns.slice(-14, -7)

  let moodTrend = 'stable'
  if (recent.length >= 3 && previous.length >= 3) {
    const moodScore = { great: 5, good: 4, okay: 3, low: 2, stressed: 1 }
    const recentAvg = recent.reduce((sum, c) => sum + (moodScore[c.mood] || 3), 0) / recent.length
    const previousAvg = previous.reduce((sum, c) => sum + (moodScore[c.mood] || 3), 0) / previous.length

    if (recentAvg > previousAvg + 0.5) moodTrend = 'improving'
    else if (recentAvg < previousAvg - 0.5) moodTrend = 'declining'
  }

  // Analyze activity feedback
  const activityStats = analyzeActivityFeedback(memory.helpfulActivities)

  return {
    totalCheckIns: memory.insights.totalCheckIns,
    streakDays: memory.insights.streakDays,
    mostCommonMood,
    mostCommonEnergy,
    mostCommonEmotion,
    preferredTime,
    moodTrend,
    hasHistory: memory.checkIns.length >= 3,
    // Activity preferences
    preferredActivityTypes: activityStats.preferred,
    avoidActivityTypes: activityStats.avoid,
    hasActivityFeedback: memory.helpfulActivities.length >= 3
  }
}

/**
 * Analyze activity feedback to find preferences
 */
function analyzeActivityFeedback(activities) {
  if (activities.length < 3) {
    return { preferred: [], avoid: [] }
  }

  // Count helpful vs not helpful by type
  const stats = {}
  activities.forEach(a => {
    if (!stats[a.type]) {
      stats[a.type] = { helpful: 0, notHelpful: 0 }
    }
    if (a.helpful) {
      stats[a.type].helpful++
    } else {
      stats[a.type].notHelpful++
    }
  })

  const preferred = []
  const avoid = []

  Object.entries(stats).forEach(([type, counts]) => {
    const total = counts.helpful + counts.notHelpful
    if (total >= 2) {
      const helpfulRatio = counts.helpful / total
      if (helpfulRatio >= 0.7) {
        preferred.push(type)
      } else if (helpfulRatio <= 0.3) {
        avoid.push(type)
      }
    }
  })

  return { preferred, avoid }
}

/**
 * Generate memory-aware context for Numa's responses
 */
export function getMemoryContext() {
  const insights = getInsights()
  const memory = getMemory()

  const context = {
    shouldMention: {},
    phrases: []
  }

  // Streak acknowledgment
  if (insights.streakDays >= 3) {
    context.shouldMention.streak = true
    context.phrases.push(getStreakPhrase(insights.streakDays))
  }

  // Pattern recognition
  if (insights.hasHistory) {
    if (insights.mostCommonMood === 'stressed') {
      context.shouldMention.stressPattern = true
      context.phrases.push("I've noticed stress comes up often. That's a lot to carry.")
    }
    if (insights.mostCommonEnergy === 'low') {
      context.shouldMention.energyPattern = true
      context.phrases.push("Your energy has been low lately. Let's be extra gentle.")
    }
    if (insights.moodTrend === 'improving') {
      context.shouldMention.improvement = true
      context.phrases.push("I've noticed things shifting in a good direction.")
    }
    if (insights.moodTrend === 'declining') {
      context.shouldMention.decline = true
      context.phrases.push("This has been a hard stretch. I see that.")
    }
  }

  // Preferred time acknowledgment
  if (insights.preferredTime && insights.totalCheckIns >= 5) {
    const currentHour = new Date().getHours()
    let currentTime = 'morning'
    if (currentHour >= 12 && currentHour < 17) currentTime = 'afternoon'
    else if (currentHour >= 17) currentTime = 'evening'

    if (currentTime !== insights.preferredTime) {
      context.phrases.push(`You usually check in during the ${insights.preferredTime}. This is different.`)
    }
  }

  return context
}

function getStreakPhrase(days) {
  if (days >= 14) return `${days} days of showing up for yourself. That's real commitment.`
  if (days >= 7) return `A week of consistent check-ins. That matters.`
  if (days >= 3) return `${days} days in a row. You're building something.`
  return null
}

/**
 * Clear all memory (for testing or user request)
 */
export function clearMemory() {
  localStorage.removeItem(STORAGE_KEY)
}
