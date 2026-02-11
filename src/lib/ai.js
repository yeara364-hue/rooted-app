// AI Recommendation Generator for Rooted
// Numa's voice: wise stillness + curious invitation

const ACTIVITIES = {
  meditation: {
    high: [
      { title: 'Mindful Energy Meditation', description: 'Channel your positive energy into focused awareness.', duration: '10 minutes' },
      { title: 'Gratitude Visualization', description: 'Celebrate how you\'re feeling by visualizing joy.', duration: '8 minutes' },
    ],
    medium: [
      { title: 'Centering Breath Meditation', description: 'Find your calm center through breath.', duration: '12 minutes' },
      { title: 'Body Scan Relaxation', description: 'A gentle scan from head to toe.', duration: '15 minutes' },
    ],
    low: [
      { title: 'Compassionate Rest Meditation', description: 'Meet yourself with kindness where you are.', duration: '10 minutes' },
      { title: 'Letting Go Meditation', description: 'Release what you\'re carrying.', duration: '12 minutes' },
    ]
  },
  breathing: {
    high: [
      { title: 'Energizing Breath Work', description: 'Amplify your natural energy with rhythm.', duration: '5 minutes' },
      { title: 'Joy Breath', description: 'A pattern to enhance vitality.', duration: '6 minutes' },
    ],
    medium: [
      { title: 'Box Breathing', description: 'A calming 4-4-4-4 pattern for balance.', duration: '5 minutes' },
      { title: '4-7-8 Relaxation Breath', description: 'Activate your body\'s calm response.', duration: '7 minutes' },
    ],
    low: [
      { title: 'Gentle Wave Breathing', description: 'Slow, ocean-like breaths.', duration: '8 minutes' },
      { title: 'Rest & Restore Breathing', description: 'The gentlest practice.', duration: '6 minutes' },
    ]
  },
  yoga: {
    high: [
      { title: 'Energizing Flow', description: 'Dynamic movement to match your energy.', duration: '20 minutes' },
      { title: 'Sun Salutation Practice', description: 'Classic flowing movements.', duration: '15 minutes' },
    ],
    medium: [
      { title: 'Balancing Flow', description: 'A mix of energizing and calming poses.', duration: '20 minutes' },
      { title: 'Mindful Movement', description: 'Slow, intentional yoga.', duration: '18 minutes' },
    ],
    low: [
      { title: 'Restorative Yoga', description: 'Supported, restful poses.', duration: '25 minutes' },
      { title: 'Gentle Stretches', description: 'Soft movements without effort.', duration: '15 minutes' },
    ]
  },
  movement: {
    high: [
      { title: 'Joyful Movement', description: 'Free-form movement to music you love.', duration: '15 minutes' },
      { title: 'Energizing Walk', description: 'Take your good energy outside.', duration: '20 minutes' },
    ],
    medium: [
      { title: 'Mindful Walking', description: 'Slow steps, present breath.', duration: '15 minutes' },
      { title: 'Gentle Stretching', description: 'Wake up your body gently.', duration: '10 minutes' },
    ],
    low: [
      { title: 'Desk Stretches', description: 'Simple stretches, no mat needed.', duration: '5 minutes' },
      { title: 'Gentle Neck & Shoulders', description: 'Release where tension gathers.', duration: '8 minutes' },
    ]
  }
}

const MUSIC_SUGGESTIONS = {
  great: {
    high: { suggestion: 'Upbeat indie folk or feel-good sounds', why: 'to match your brightness' },
    medium: { suggestion: 'Warm acoustic melodies', why: 'to complement this good feeling' },
    low: { suggestion: 'Gentle acoustic sounds', why: 'to nurture your calm' },
  },
  good: {
    high: { suggestion: 'Chill electronic or lo-fi', why: 'to keep the flow' },
    medium: { suggestion: 'Jazz or bossa nova', why: 'easy-going sounds for an easy-going day' },
    low: { suggestion: 'Ambient or nature sounds', why: 'to support rest' },
  },
  okay: {
    high: { suggestion: 'Motivating instrumental music', why: 'to gently shift things' },
    medium: { suggestion: 'Calm piano or acoustic guitar', why: 'neutral and beautiful' },
    low: { suggestion: 'Peaceful ambient sounds', why: 'permission to simply be' },
  },
  low: {
    high: { suggestion: 'Uplifting but gentle folk', why: 'hope without pressure' },
    medium: { suggestion: 'Soothing instrumental sounds', why: 'to be with you' },
    low: { suggestion: 'Soft ambient music', why: 'gentle, non-demanding' },
  },
  stressed: {
    high: { suggestion: 'Nature sounds or calming classical', why: 'to help you settle' },
    medium: { suggestion: 'Slow tempo spa music', why: 'to ease your system' },
    low: { suggestion: 'Deep relaxation tracks', why: 'for rest and recovery' },
  }
}

// Numa's greetings - wise stillness + curious invitation
const NUMA_GREETINGS = {
  great: {
    high: [
      "There's a lightness in you today. I feel it too.",
      "You're carrying something bright. What would feel good right now?",
      "This energy is a gift. How shall we use it?"
    ],
    medium: [
      "A quiet brightness today. That's something worth noticing.",
      "You seem settled. There's no rush here.",
      "I notice a gentle good in you today."
    ],
    low: [
      "Even when energy is low, your spirit is soft. That's enough.",
      "Rest can hold joy too. What do you need?",
      "You're here. That's what matters today."
    ]
  },
  good: {
    high: [
      "Good energy flowing through you. Where would you like it to go?",
      "Today has potential. What feels right?",
      "You're ready for something. Let's find what."
    ],
    medium: [
      "A steady day ahead. What would feel nourishing?",
      "You're in a balanced place. That's rare. Notice it.",
      "Some days are simply good. This seems like one."
    ],
    low: [
      "Good but tired. Both are true. Both matter.",
      "Sometimes good feels quiet. That's okay.",
      "What would support this gentle good feeling?"
    ]
  },
  okay: {
    high: [
      "Energy without direction? Let's give it somewhere to land.",
      "You have fuel, even if the feeling is neutral. That's something.",
      "What might shift 'okay' toward something warmer?"
    ],
    medium: [
      "Some days are just this. There's no need to push.",
      "Okay is honest. I appreciate that.",
      "What would feel good, even small?"
    ],
    low: [
      "Low and neutral. Be gentle with yourself.",
      "There is no pressure here. What do you need?",
      "Sometimes okay is enough. Let's start there."
    ]
  },
  low: {
    high: [
      "Heavy heart but restless body? I understand. Let's work with that.",
      "There's energy in you, even through the weight. Let's use it kindly.",
      "Movement might help. What feels possible?"
    ],
    medium: [
      "I see you today. Hard days happen. You don't have to carry this alone.",
      "This won't last forever. For now, what's one small kindness?",
      "I'm here. What would feel supportive?"
    ],
    low: [
      "It's okay to not be okay. Just being here is enough.",
      "When everything is heavy, rest is the answer. Let's be gentle.",
      "You showed up. That took something. Rest now."
    ]
  },
  stressed: {
    high: [
      "That restless feeling makes sense. Let's find some ground.",
      "Your body is holding a lot. Let's help it settle.",
      "Stress with energy needs somewhere to go. I'll help you find it."
    ],
    medium: [
      "Stress can be so heavy. What would help you put some of it down?",
      "I notice the tension. Let's soften what we can.",
      "One thing at a time. What needs attention first?"
    ],
    low: [
      "Stress and exhaustion together. That's hard. Be very gentle now.",
      "Your only job right now is to rest. Everything else can wait.",
      "When it's all too much, simplify. Breathe. That's enough."
    ]
  }
}

// Numa's way of introducing activities
const NUMA_ACTIVITY_INTROS = {
  meditation: [
    "I thought we might sit together.",
    "Let's find some stillness.",
    "A moment of quiet might help."
  ],
  breathing: [
    "Let's start with breath. Just breath.",
    "Your breath is always there. Let's return to it.",
    "Sometimes all we need is to breathe."
  ],
  yoga: [
    "Your body might want to move gently.",
    "Let's give your body some care.",
    "Gentle movement, nothing forced."
  ],
  movement: [
    "What if we moved, just for a little while?",
    "Your body has wisdom. Let's listen to it.",
    "Movement doesn't have to be big to matter."
  ]
}

// Numa's closings - soft, not preachy
const NUMA_CLOSINGS = [
  "I'll be here when you're ready.",
  "Take what you need. Leave the rest.",
  "There's no wrong way to do this.",
  "You're doing enough.",
  "One moment at a time.",
  "I'm with you.",
  "No rush. No pressure.",
  "This is your time."
]

// Memory-aware phrases Numa can use
const MEMORY_PHRASES = {
  streak: {
    short: [
      "You've been showing up. I notice that.",
      "A few days in a row now. That's something.",
      "You keep coming back. That matters."
    ],
    medium: [
      "A week of showing up for yourself. That takes intention.",
      "Seven days. You're building something here.",
      "This consistency is quiet, but powerful."
    ],
    long: [
      "Two weeks of this. I want you to know I see it.",
      "You've made this a practice. That's rare.",
      "This commitment to yourself... it's beautiful to witness."
    ]
  },
  moodPattern: {
    stressed: [
      "I've noticed stress visits often. That's a lot to carry week after week.",
      "Stress has been a theme. I want you to know that's not your fault.",
      "You've been holding a lot of tension lately. Let's be extra gentle."
    ],
    low: [
      "Things have been heavy lately. I see that.",
      "Low moods have been visiting. You're still here though.",
      "It's been a hard stretch. You don't have to pretend otherwise."
    ],
    good: [
      "You've been in a good place lately. Worth noticing.",
      "There's been a steadiness in you recently. That's grounding.",
      "Good has been your baseline. That's something to appreciate."
    ]
  },
  moodTrend: {
    improving: [
      "I've noticed things shifting in a brighter direction lately.",
      "Something is lifting. Can you feel it too?",
      "There's a gentle upward curve in how you've been feeling."
    ],
    declining: [
      "I've noticed things have been harder recently.",
      "The last few days have been heavy. I'm here.",
      "It's been a downward stretch. That's real. Let's be gentle."
    ]
  },
  timeOfDay: {
    different: [
      "You usually come in the {usual}. This is different.",
      "A {current} visit today. Something shift in your routine?",
      "Not your usual time. I'm here whenever you need."
    ]
  },
  returning: [
    "Welcome back.",
    "I'm glad you're here again.",
    "Here you are. I was waiting."
  ]
}

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function selectActivityType(mood, energy, goals, activityPrefs = {}) {
  const { preferred = [], avoid = [] } = activityPrefs

  // Helper to filter out avoided types and prefer preferred ones
  const filterAndPrioritize = (options) => {
    // Remove avoided types
    let filtered = options.filter(opt => !avoid.includes(opt))
    // If all were filtered out, use original
    if (filtered.length === 0) filtered = options

    // If we have preferred types in the options, prioritize them
    const preferredInOptions = filtered.filter(opt => preferred.includes(opt))
    if (preferredInOptions.length > 0 && Math.random() < 0.7) {
      // 70% chance to pick a preferred type
      return pickRandom(preferredInOptions)
    }

    return pickRandom(filtered)
  }

  if (mood === 'stressed' || goals?.includes('stress') || goals?.includes('calm')) {
    const options = energy === 'low' ? ['breathing', 'meditation'] : ['meditation', 'breathing']
    return filterAndPrioritize(options)
  }
  if (goals?.includes('movement') && energy !== 'low') {
    const options = mood === 'great' ? ['movement', 'yoga'] : ['yoga', 'movement']
    return filterAndPrioritize(options)
  }
  if (energy === 'low') {
    return filterAndPrioritize(['breathing', 'meditation'])
  }
  if (energy === 'high') {
    return filterAndPrioritize(['yoga', 'movement', 'meditation'])
  }
  return filterAndPrioritize(['meditation', 'breathing', 'yoga'])
}

/**
 * Generate a memory-aware opening from Numa
 */
function generateMemoryAwareOpening(insights) {
  if (!insights || !insights.hasHistory) return null

  const phrases = []

  // Streak recognition (prioritize this)
  if (insights.streakDays >= 14) {
    phrases.push(pickRandom(MEMORY_PHRASES.streak.long))
  } else if (insights.streakDays >= 7) {
    phrases.push(pickRandom(MEMORY_PHRASES.streak.medium))
  } else if (insights.streakDays >= 3) {
    phrases.push(pickRandom(MEMORY_PHRASES.streak.short))
  }

  // Mood trend (only if no streak message, to avoid overload)
  if (phrases.length === 0) {
    if (insights.moodTrend === 'improving') {
      phrases.push(pickRandom(MEMORY_PHRASES.moodTrend.improving))
    } else if (insights.moodTrend === 'declining') {
      phrases.push(pickRandom(MEMORY_PHRASES.moodTrend.declining))
    }
  }

  // Mood pattern (only if nothing else)
  if (phrases.length === 0 && insights.mostCommonMood) {
    if (insights.mostCommonMood === 'stressed' && MEMORY_PHRASES.moodPattern.stressed) {
      phrases.push(pickRandom(MEMORY_PHRASES.moodPattern.stressed))
    } else if (insights.mostCommonMood === 'low' && MEMORY_PHRASES.moodPattern.low) {
      phrases.push(pickRandom(MEMORY_PHRASES.moodPattern.low))
    } else if ((insights.mostCommonMood === 'good' || insights.mostCommonMood === 'great') && insights.totalCheckIns >= 5) {
      phrases.push(pickRandom(MEMORY_PHRASES.moodPattern.good))
    }
  }

  // Return the first (and only) phrase, or null
  return phrases.length > 0 ? phrases[0] : null
}

/**
 * Generate Numa's conversational response
 * Now accepts memory context for personalization
 */
export async function generateNumaResponse({ name, mood, energy, goals, experience, memoryInsights }) {
  await new Promise(resolve => setTimeout(resolve, 800))

  // Use activity preferences from memory if available
  const activityPrefs = memoryInsights ? {
    preferred: memoryInsights.preferredActivityTypes || [],
    avoid: memoryInsights.avoidActivityTypes || []
  } : {}

  const activityType = selectActivityType(mood, energy, goals, activityPrefs)
  const activityOptions = ACTIVITIES[activityType][energy]
  const activity = pickRandom(activityOptions)
  const music = MUSIC_SUGGESTIONS[mood]?.[energy] || MUSIC_SUGGESTIONS.okay.medium

  // Build Numa's conversation
  const greeting = pickRandom(NUMA_GREETINGS[mood]?.[energy] || NUMA_GREETINGS.okay.medium)
  const activityIntro = pickRandom(NUMA_ACTIVITY_INTROS[activityType])
  const closing = pickRandom(NUMA_CLOSINGS)

  // Check for memory-aware opening
  const memoryOpening = generateMemoryAwareOpening(memoryInsights)

  // Build messages array
  const messages = []

  // Add memory-aware opening if we have one (before greeting)
  if (memoryOpening) {
    messages.push({
      type: 'memory',
      text: memoryOpening
    })
  }

  // Standard greeting
  messages.push({
    type: 'greeting',
    text: greeting
  })

  // Activity
  messages.push({
    type: 'activity',
    text: activityIntro,
    activity: {
      type: activityType,
      ...activity
    }
  })

  // Music
  messages.push({
    type: 'music',
    text: `For music — ${music.suggestion}, ${music.why}.`
  })

  // Closing
  messages.push({
    type: 'closing',
    text: closing
  })

  return {
    messages,
    activity: {
      type: activityType,
      ...activity
    },
    music: {
      suggestion: music.suggestion,
      reason: music.why
    },
    mood,
    energy,
    hasMemoryContext: !!memoryOpening
  }
}

/**
 * Generate Numa's response to voice/text input
 * Now memory-aware for more personalized empathy
 */
export async function generateNumaReply(userMessage, context = {}) {
  await new Promise(resolve => setTimeout(resolve, 600))

  const message = userMessage.toLowerCase()

  const emotions = {
    stressed: /stress|overwhelm|too much|can't cope|anxious|worry|panic/i.test(message),
    sad: /sad|down|depressed|hopeless|lonely|empty|crying/i.test(message),
    tired: /tired|exhausted|no energy|drained|burnt out|fatigue/i.test(message),
    anxious: /anxious|nervous|scared|afraid|worry|uncertain/i.test(message),
    angry: /angry|frustrated|annoyed|irritated|mad/i.test(message),
    happy: /happy|good|great|excited|grateful|joy/i.test(message),
    neutral: true
  }

  let dominantEmotion = 'neutral'
  for (const [emotion, matches] of Object.entries(emotions)) {
    if (matches && emotion !== 'neutral') {
      dominantEmotion = emotion
      break
    }
  }

  // Base empathetic responses
  const responses = {
    stressed: [
      "I hear the weight in that. You're carrying a lot.",
      "That sounds really hard. You don't have to solve everything right now.",
      "When everything feels like too much, the only job is the next breath."
    ],
    sad: [
      "I'm here with you in this. You don't have to feel differently than you do.",
      "Sadness is heavy. Thank you for sharing it with me.",
      "It's okay to feel this way. I'm not going anywhere."
    ],
    tired: [
      "Rest isn't earned. You can rest just because you need to.",
      "Your body is asking for something. Let's listen to it.",
      "Being tired is real. What's one small way you could be gentle with yourself?"
    ],
    anxious: [
      "That unsettled feeling is hard to sit with. I'm here.",
      "Your worry makes sense given what you're holding. Let's breathe together.",
      "Anxiety lies sometimes. You're safer than it wants you to believe."
    ],
    angry: [
      "That frustration is valid. You don't have to push it away.",
      "Anger often protects something softer underneath. I'm curious what's there.",
      "It's okay to feel this. What do you need right now?"
    ],
    happy: [
      "I feel that warmth too. What a gift.",
      "This is worth noticing. Soak it in.",
      "Good moments matter. Thank you for sharing this one with me."
    ],
    neutral: [
      "I'm listening. Take your time.",
      "Thank you for sharing that with me.",
      "I'm here. What else is on your mind?"
    ]
  }

  // Memory-aware additions when user mentions patterns
  const memoryAware = {
    stressed: [
      "I know stress has been visiting a lot lately. You're not alone in this.",
      "This isn't the first time you've felt this way. I remember. I'm here.",
    ],
    tired: [
      "You've mentioned tiredness before. Your body is asking for something consistent.",
      "Rest keeps coming up. Maybe it's time to really listen.",
    ],
    sad: [
      "I've heard this heaviness before. It's okay that it's still here.",
      "Sadness doesn't always leave quickly. I'll keep sitting with you.",
    ]
  }

  // 30% chance to use memory-aware response if available and context suggests history
  let reply = pickRandom(responses[dominantEmotion])
  if (context.hasHistory && memoryAware[dominantEmotion] && Math.random() < 0.3) {
    reply = pickRandom(memoryAware[dominantEmotion])
  }

  return {
    text: reply,
    detectedEmotion: dominantEmotion,
    shouldAdjustRecommendations: ['stressed', 'sad', 'anxious', 'tired'].includes(dominantEmotion)
  }
}

// Legacy function for backwards compatibility
export async function generateRecommendations(params) {
  const response = await generateNumaResponse(params)
  return {
    message: response.messages.find(m => m.type === 'greeting')?.text || '',
    activity: response.activity,
    music: response.music,
    encouragement: response.messages.find(m => m.type === 'closing')?.text || ''
  }
}
