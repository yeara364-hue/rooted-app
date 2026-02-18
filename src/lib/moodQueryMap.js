/**
 * Search queries, category weights, and duration ranges for YouTube mood recommendations.
 * Each mood has 2 categories with 4-5 queries each. A random query is picked per fetch.
 */

export const MOOD_QUERIES = {
  stressed: {
    meditation: [
      'guided meditation for stress relief 10 minutes',
      'body scan stress release meditation',
      'mindfulness meditation anxiety and stress 10 minutes',
      'stress relief visualization guided meditation',
      '5 minute quick calm meditation stress'
    ],
    yoga: [
      'gentle yoga for stress relief 15 minutes',
      'desk yoga tension relief 8 minutes',
      'yoga for stress and anxiety beginner',
      'slow yoga flow for tight shoulders and stress',
      'yin yoga stress relief calm'
    ]
  },

  sad: {
    meditation: [
      'loving kindness meditation for sadness',
      'self-compassion meditation guided 15 minutes',
      'healing sadness meditation gentle',
      'release sadness emotion meditation guided',
      'comfort meditation when feeling low'
    ],
    movement: [
      'gentle movement yoga for sadness and grief',
      'mood lifting gentle yoga 15 minutes',
      'heart opening yoga for emotional healing',
      'restorative yoga for low mood',
      'gentle walk meditation for sadness outdoor'
    ]
  },

  tired: {
    meditation: [
      'yoga nidra deep rest 20 minutes',
      'NSDR non sleep deep rest guided 20 minutes',
      'body scan for fatigue and exhaustion meditation',
      'restorative relaxation meditation tired body',
      'short guided rest meditation 10 minutes'
    ],
    yoga: [
      'bedtime yoga gentle 12 minutes',
      'restorative yoga for fatigue and exhaustion',
      'yin yoga slow deep stretch tired',
      'legs up wall restorative yoga',
      'energy restore gentle yoga morning'
    ]
  },

  angry: {
    meditation: [
      'meditation for anger management guided',
      'calming anger breathing meditation 10 minutes',
      'release anger frustration meditation guided',
      'cool down meditation intense emotions',
      'mindfulness for anger control guided'
    ],
    yoga: [
      'yoga for anger release intense flow',
      'vigorous vinyasa flow anger frustration',
      'power yoga emotional release 15 minutes',
      'intense yoga workout stress and anger',
      'warrior yoga flow energy release'
    ]
  },

  happy: {
    meditation: [
      'gratitude meditation guided morning',
      'joy and happiness meditation 10 minutes',
      'positive energy abundance meditation',
      'loving kindness and joy meditation',
      'celebrate good feelings guided meditation'
    ],
    yoga: [
      'energizing morning yoga flow 15 minutes',
      'fun upbeat yoga vinyasa flow',
      'power yoga feel good energizing',
      'dance yoga flow joyful movement',
      'happy yoga morning routine beginner'
    ]
  },

  neutral: {
    meditation: [
      'mindfulness meditation 10 minutes beginners',
      'body scan awareness meditation morning',
      'simple breathing meditation for presence',
      'daily mindfulness practice 10 minutes',
      'grounding meditation neutral present moment'
    ],
    yoga: [
      'morning yoga routine 15 minutes full body',
      'gentle daily yoga flow beginner',
      'yoga for beginners gentle full body stretch',
      'daily morning yoga 10 minutes',
      'balanced yoga flow all levels'
    ]
  },

  anxious: {
    meditation: [
      'anxiety relief meditation guided 10 minutes',
      'panic calming breathing meditation gentle',
      'reduce anxiety mindfulness meditation 10 min',
      'nervous system calm guided meditation anxiety',
      'anxiety somatic meditation breathwork'
    ],
    yoga: [
      'yoga for anxiety calm nervous system 15 minutes',
      'gentle yoga nervous system reset parasympathetic',
      'slow restorative yoga anxiety relief',
      'breathwork yoga for anxiety beginners',
      'grounding yoga poses anxiety calm'
    ]
  },

  unfocused: [
    'focus meditation guided 10 minutes productivity',
    'concentration meditation study and work',
    'clarity focus mindfulness meditation',
    'short focus reset meditation 5 minutes',
    'energizing yoga brain clarity focus 10 minutes'
  ],

  lowEnergy: {
    meditation: [
      'energy boost morning meditation guided',
      'morning activation visualization meditation',
      'motivating guided meditation get moving',
      'wake up and feel alive meditation',
      'gentle morning mindfulness energy'
    ],
    yoga: [
      'energizing yoga for low energy 15 minutes',
      'morning yoga energy boost wake up',
      'yoga to energize tired body morning',
      'quick energizing yoga 10 minutes',
      'uplifting yoga flow for motivation'
    ]
  },

  overwhelmed: {
    meditation: [
      'overwhelm relief meditation guided calm',
      'simplify your mind meditation overwhelm',
      'gentle meditation for burnout and overwhelm',
      'slow down breathing meditation overwhelmed',
      'one thing at a time grounding meditation'
    ],
    yoga: [
      'gentle yoga for overwhelm and stress',
      'slow restorative yoga emotional reset',
      'yin yoga for burnout relief 20 minutes',
      'gentle floor yoga overwhelm exhaustion',
      'legs up wall yoga calm overwhelm'
    ]
  }
}

// Handle unfocused which accidentally got set as an array (legacy) — normalize it
if (Array.isArray(MOOD_QUERIES.unfocused)) {
  MOOD_QUERIES.unfocused = {
    meditation: [
      'focus meditation guided 10 minutes productivity',
      'concentration meditation study and work',
      'clarity focus mindfulness meditation',
      'short focus reset meditation 5 minutes'
    ],
    yoga: [
      'energizing yoga brain clarity focus 10 minutes',
      'balance poses yoga focus concentration',
      'standing yoga flow mental clarity',
      'desk yoga break focus reset'
    ]
  }
}

export const CATEGORY_WEIGHTS = {
  stressed:    { meditation: 0.5, yoga: 0.5 },
  sad:         { meditation: 0.6, movement: 0.4 },
  tired:       { meditation: 0.6, yoga: 0.4 },
  angry:       { meditation: 0.4, yoga: 0.6 },
  happy:       { meditation: 0.4, yoga: 0.6 },
  neutral:     { meditation: 0.5, yoga: 0.5 },
  anxious:     { meditation: 0.7, yoga: 0.3 },
  unfocused:   { meditation: 0.6, yoga: 0.4 },
  lowEnergy:   { meditation: 0.3, yoga: 0.7 },
  overwhelmed: { meditation: 0.7, yoga: 0.3 }
}

export const DURATION_RANGES = {
  meditation: { min: 300,  max: 1200 },  // 5–20 min
  yoga:       { min: 480,  max: 1500 },  // 8–25 min
  movement:   { min: 300,  max: 900  }   // 5–15 min
}
