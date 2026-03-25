import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { getMemory, getInsights } from '../lib/memory'
import NumaAvatar from '../components/NumaAvatar'
import MediaPlayerModal from '../components/MediaPlayerModal'
import {
  markCompleted,
  getAllStats,
  CompletionMethod,
  ContentType,
  isCompletedToday
} from '../lib/tracking'
import {
  Sparkles,
  Dumbbell,
  Mic,
  Flame,
  Clock,
  TrendingUp,
  ChevronRight,
  Music,
  Play,
  Send,
  Loader2,
  Wind,
  PenLine,
  Zap,
  Heart,
  Info,
  CheckCircle2,
  X,
  UtensilsCrossed,
  Star,
  Timer,
  Award,
  Activity
} from 'lucide-react'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatRelativeTime(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  return `${diffDays}d ago`
}

function detectMood(text) {
  if (!text || !text.trim()) return 'neutral'
  const lowerText = text.toLowerCase()
  const moodKeywords = {
    sad: ['sad', 'down', 'depressed', 'unhappy', 'lonely', 'hopeless', 'crying', 'tears', 'miserable', 'heartbroken', 'grief', 'blue', 'low', 'upset', 'hurt', 'broken'],
    stressed: ['stressed', 'anxious', 'anxiety', 'overwhelmed', 'worried', 'panic', 'nervous', 'tense', 'pressure', 'frantic', 'scared', 'afraid', 'freaking'],
    tired: ['tired', 'exhausted', 'drained', 'sleepy', 'fatigued', 'worn out', 'low energy', 'sluggish', 'burnt out', 'weary', 'drowsy'],
    angry: ['angry', 'frustrated', 'annoyed', 'irritated', 'mad', 'furious', 'pissed', 'rage', 'hate', 'fed up'],
    happy: ['happy', 'great', 'wonderful', 'amazing', 'fantastic', 'joyful', 'blessed', 'grateful', 'good', 'positive', 'excited', 'awesome', 'love', 'calm', 'peaceful', 'relaxed', 'content', 'fine', 'okay', 'energized', 'motivated']
  }
  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) return mood
    }
  }
  return 'neutral'
}

function extractSignals(text) {
  if (!text || !text.trim()) return []
  const lowerText = text.toLowerCase()
  const signalKeywords = {
    sleep: ['sleep', 'insomnia', 'cant sleep', "can't sleep", 'sleeping', 'bed', 'rest', 'nightmare', 'woke up'],
    lonely: ['lonely', 'alone', 'isolated', 'no friends', 'miss someone', 'nobody', 'by myself'],
    work: ['work', 'job', 'boss', 'deadline', 'meeting', 'office', 'career', 'coworker', 'project', 'busy'],
    panic: ['panic', 'panicking', 'heart racing', 'cant breathe', "can't breathe", 'attack', 'spiraling'],
    motivation: ['motivation', 'unmotivated', 'lazy', 'procrastinating', 'stuck', 'cant start', "can't start"],
    focus: ['focus', 'distracted', 'concentrate', 'attention', 'scatter', 'adhd', 'mind wandering'],
    breakup: ['breakup', 'broke up', 'ex', 'relationship', 'dumped', 'divorce', 'separated'],
    social: ['social', 'people', 'party', 'friends', 'conversation', 'awkward', 'shy'],
    body: ['body', 'weight', 'eating', 'food', 'exercise', 'gym', 'appearance', 'self-image'],
    headache: ['headache', 'head hurts', 'migraine', 'pain', 'tension', 'ache']
  }
  const detected = []
  for (const [signal, keywords] of Object.entries(signalKeywords)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) { detected.push(signal); break }
    }
  }
  return detected
}

// Smoothie recipes for sad/stressed moods
const smoothieRecipes = {
  stressed: {
    id: 'recipe-stress',
    type: 'recipe',
    title: 'Calm & Cool Smoothie',
    subtitle: 'Magnesium-rich stress reliever',
    signal: 'body',
    ingredients: ['1 banana (frozen)', '1 cup spinach', '1 tbsp almond butter', '1 cup oat milk', '1 tbsp honey', 'Pinch of cinnamon'],
    steps: ['Add oat milk to blender', 'Add frozen banana and spinach', 'Add almond butter and honey', 'Blend until smooth', 'Top with cinnamon', 'Enjoy slowly, mindfully']
  },
  sad: {
    id: 'recipe-sad',
    type: 'recipe',
    title: 'Sunshine Mood Boost',
    subtitle: 'Vitamin D & serotonin support',
    signal: 'body',
    ingredients: ['1 cup mango (frozen)', '1/2 banana', '1 cup orange juice', '1 tbsp chia seeds', '1/2 cup Greek yogurt', 'Splash of vanilla'],
    steps: ['Pour orange juice into blender', 'Add frozen mango and banana', 'Add yogurt and chia seeds', 'Add vanilla splash', 'Blend until creamy', 'Sip and let the sunshine in']
  }
}

// Expanded recommendation content per mood
const moodContent = {
  stressed: {
    media: [
      { id: 's1', type: 'media', category: 'meditation', title: 'Anxiety Relief Meditation', subtitle: 'Guided breathing for calm', duration: '10 min', platform: 'youtube', youtubeVideoId: 'O-6f5wQXSu8', signal: 'panic', relevanceBase: 10 },
      { id: 's2', type: 'media', category: 'music', title: 'Stress Relief Playlist', subtitle: 'Calming ambient sounds', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DWXe9gFZP0gtP', signal: 'work', relevanceBase: 8 },
      { id: 's3', type: 'media', category: 'yoga', title: 'Gentle Stress Relief Yoga', subtitle: 'Release tension in body', duration: '20 min', platform: 'youtube', youtubeVideoId: 'hJbRpHZr_d0', signal: 'body', relevanceBase: 9 }
    ],
    microActions: [
      { id: 's4', type: 'micro', title: 'Shoulder Roll Release', subtitle: 'Release neck tension now', duration: '60 sec', instruction: 'Roll shoulders slowly backward 5 times, then forward 5 times. Drop shoulders away from ears.', signal: 'headache', relevanceBase: 7 },
      { id: 's5', type: 'micro', title: 'Grounding 5-4-3-2-1', subtitle: 'Anchor to the present', duration: '90 sec', instruction: 'Name 5 things you see, 4 you hear, 3 you feel, 2 you smell, 1 you taste.', signal: 'panic', relevanceBase: 9 }
    ],
    journal: { id: 's6', type: 'journal', title: 'Stress Brain Dump', prompt: 'Write everything stressing you out without filtering. Then circle the ONE thing you can control right now.', signal: 'work', relevanceBase: 6 },
    breathing: { id: 's7', type: 'breathing', title: 'Box Breathing', subtitle: '4-4-4-4 calming pattern', duration: 60, pattern: { inhale: 4, hold1: 4, exhale: 4, hold2: 4 }, signal: 'panic', relevanceBase: 10 },
    whyHelps: { id: 's8', type: 'info', title: 'Why This Helps', content: 'Slow breathing activates your parasympathetic nervous system, signaling safety to your brain and reducing cortisol.', signal: 'focus', relevanceBase: 4 }
  },
  sad: {
    media: [
      { id: 'sd1', type: 'media', category: 'meditation', title: 'Self-Compassion Meditation', subtitle: 'Kindness for difficult times', duration: '15 min', platform: 'youtube', youtubeVideoId: 'IeblJdB2-Vo', signal: 'lonely', relevanceBase: 10 },
      { id: 'sd2', type: 'media', category: 'music', title: 'Comfort & Healing', subtitle: 'Gentle, uplifting tracks', duration: '1+ hour', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX3YSRoSdA634', signal: 'breakup', relevanceBase: 9 },
      { id: 'sd3', type: 'media', category: 'movement', title: 'Mood-Lifting Walk', subtitle: 'Gentle movement meditation', duration: '10 min', platform: 'youtube', youtubeVideoId: 'inpok4MKVLM', signal: 'body', relevanceBase: 8 }
    ],
    microActions: [
      { id: 'sd4', type: 'micro', title: 'Warm Cup Ritual', subtitle: 'Comfort in small moments', duration: '90 sec', instruction: 'Make a warm drink. Hold the cup with both hands. Feel the warmth. Take 3 slow sips.', signal: 'lonely', relevanceBase: 8 },
      { id: 'sd5', type: 'micro', title: 'Hand on Heart', subtitle: 'Self-soothing touch', duration: '60 sec', instruction: 'Place hand on heart. Feel your heartbeat. Say "I\'m here for you" to yourself 3 times.', signal: 'breakup', relevanceBase: 9 }
    ],
    journal: { id: 'sd6', type: 'journal', title: 'Letter to Yourself', prompt: 'Write a short letter to yourself as if you were comforting a dear friend going through this.', signal: 'lonely', relevanceBase: 7 },
    breathing: { id: 'sd7', type: 'breathing', title: 'Soothing Breath', subtitle: 'Longer exhale for calm', duration: 60, pattern: { inhale: 4, hold1: 2, exhale: 6, hold2: 0 }, signal: 'sleep', relevanceBase: 8 },
    whyHelps: { id: 'sd8', type: 'info', title: 'Why This Helps', content: 'Self-compassion practices activate the same brain regions as receiving comfort from others, releasing oxytocin.', signal: 'social', relevanceBase: 4 }
  },
  tired: {
    media: [
      { id: 't1', type: 'media', category: 'meditation', title: 'Body Scan for Rest', subtitle: 'Release and restore', duration: '15 min', platform: 'youtube', youtubeVideoId: 'T0nuKuHmMmc', signal: 'sleep', relevanceBase: 10 },
      { id: 't2', type: 'media', category: 'music', title: 'Sleep & Relax', subtitle: 'Soothing soundscapes', duration: '3+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DWZd79rJ6a7lp', signal: 'sleep', relevanceBase: 9 },
      { id: 't3', type: 'media', category: 'yoga', title: 'Bedtime Yoga', subtitle: 'Gentle wind-down', duration: '12 min', platform: 'youtube', youtubeVideoId: 'BiWDsfZ3zbo', signal: 'body', relevanceBase: 8 }
    ],
    microActions: [
      { id: 't4', type: 'micro', title: 'Eye Palming', subtitle: 'Rest tired eyes', duration: '60 sec', instruction: 'Rub hands together until warm. Cup over closed eyes. Breathe deeply in darkness.', signal: 'headache', relevanceBase: 7 },
      { id: 't5', type: 'micro', title: 'Legs Up the Wall', subtitle: 'Instant energy reset', duration: '90 sec', instruction: 'Lie down, put legs up against wall or furniture. Let blood flow reverse. Breathe.', signal: 'body', relevanceBase: 8 }
    ],
    journal: { id: 't6', type: 'journal', title: 'Energy Audit', prompt: 'List 3 things that drained you today. List 1 thing that gave you energy. How can you get more of the latter?', signal: 'work', relevanceBase: 5 },
    breathing: { id: 't7', type: 'breathing', title: 'Sleep Breathing', subtitle: '4-7-8 relaxation', duration: 60, pattern: { inhale: 4, hold1: 7, exhale: 8, hold2: 0 }, signal: 'sleep', relevanceBase: 10 },
    whyHelps: { id: 't8', type: 'info', title: 'Why This Helps', content: 'The 4-7-8 breath acts as a natural tranquilizer for the nervous system, helping prepare body for sleep.', signal: 'focus', relevanceBase: 4 }
  },
  angry: {
    media: [
      { id: 'a1', type: 'media', category: 'meditation', title: 'Letting Go Meditation', subtitle: 'Release frustration', duration: '12 min', platform: 'youtube', youtubeVideoId: 'q0dM0wGZPfg', signal: 'work', relevanceBase: 9 },
      { id: 'a2', type: 'media', category: 'music', title: 'Release & Unwind', subtitle: 'Process emotions', duration: '1+ hour', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX3Ogo9pFvBkY', signal: 'social', relevanceBase: 8 },
      { id: 'a3', type: 'media', category: 'yoga', title: 'Yoga for Frustration', subtitle: 'Move through it', duration: '18 min', platform: 'youtube', youtubeVideoId: 'Nw2oBIrxy_Q', signal: 'body', relevanceBase: 9 }
    ],
    microActions: [
      { id: 'a4', type: 'micro', title: 'Ice Cube Hold', subtitle: 'Redirect intense feelings', duration: '60 sec', instruction: 'Hold an ice cube in your hand. Focus entirely on the sensation until it melts or feelings shift.', signal: 'panic', relevanceBase: 8 },
      { id: 'a5', type: 'micro', title: 'Power Pose', subtitle: 'Channel the energy', duration: '90 sec', instruction: 'Stand tall, hands on hips, feet wide. Hold for 90 seconds while breathing deeply.', signal: 'motivation', relevanceBase: 7 }
    ],
    journal: { id: 'a6', type: 'journal', title: 'Anger Letter', prompt: 'Write an uncensored letter to whoever/whatever made you angry. Don\'t send it. Then write what you actually need.', signal: 'work', relevanceBase: 8 },
    breathing: { id: 'a7', type: 'breathing', title: 'Cooling Breath', subtitle: 'Lower your temperature', duration: 60, pattern: { inhale: 4, hold1: 0, exhale: 8, hold2: 2 }, signal: 'panic', relevanceBase: 10 },
    whyHelps: { id: 'a8', type: 'info', title: 'Why This Helps', content: 'Physical sensations like cold can interrupt anger\'s momentum by engaging different neural pathways.', signal: 'focus', relevanceBase: 4 }
  },
  happy: {
    media: [
      { id: 'h1', type: 'media', category: 'meditation', title: 'Gratitude Meditation', subtitle: 'Amplify your joy', duration: '10 min', platform: 'youtube', youtubeVideoId: 'Lxprri_H9Is', signal: 'motivation', relevanceBase: 9 },
      { id: 'h2', type: 'media', category: 'music', title: 'Happy Hits', subtitle: 'Feel-good favorites', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DXdPec7aLTmlC', signal: 'social', relevanceBase: 10 },
      { id: 'h3', type: 'media', category: 'yoga', title: 'Joyful Morning Flow', subtitle: 'Celebrate your body', duration: '20 min', platform: 'youtube', youtubeVideoId: 'sTANio_2E0Q', signal: 'body', relevanceBase: 8 }
    ],
    microActions: [
      { id: 'h4', type: 'micro', title: 'Joy List', subtitle: 'Capture this feeling', duration: '60 sec', instruction: 'Write down 3 things making you happy right now. Save this list for harder days.', signal: 'motivation', relevanceBase: 9 },
      { id: 'h5', type: 'micro', title: 'Share the Joy', subtitle: 'Spread positive energy', duration: '90 sec', instruction: 'Text someone you appreciate. Just one sentence about why they matter to you.', signal: 'social', relevanceBase: 8 }
    ],
    journal: { id: 'h6', type: 'journal', title: 'Peak Moment Capture', prompt: 'Describe this good feeling in detail. What led to it? How can you create more moments like this?', signal: 'motivation', relevanceBase: 7 },
    breathing: { id: 'h7', type: 'breathing', title: 'Energizing Breath', subtitle: 'Amplify good vibes', duration: 60, pattern: { inhale: 4, hold1: 4, exhale: 4, hold2: 0 }, signal: 'focus', relevanceBase: 6 },
    whyHelps: { id: 'h8', type: 'info', title: 'Why This Helps', content: 'Savoring positive moments strengthens neural pathways for happiness, making joy more accessible over time.', signal: 'focus', relevanceBase: 4 }
  },
  neutral: {
    media: [
      { id: 'n1', type: 'media', category: 'meditation', title: 'Mindful Moment', subtitle: 'Center yourself', duration: '10 min', platform: 'youtube', youtubeVideoId: 'inpok4MKVLM', signal: 'focus', relevanceBase: 8 },
      { id: 'n2', type: 'media', category: 'music', title: 'Focus Flow', subtitle: 'Lo-fi beats', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DWZeKCadgRdKQ', signal: 'work', relevanceBase: 9 },
      { id: 'n3', type: 'media', category: 'yoga', title: 'Daily Yoga Practice', subtitle: 'Balance mind & body', duration: '15 min', platform: 'youtube', youtubeVideoId: 'g_tea8ZNk5A', signal: 'body', relevanceBase: 8 }
    ],
    microActions: [
      { id: 'n4', type: 'micro', title: 'Mindful Minute', subtitle: 'Present moment awareness', duration: '60 sec', instruction: 'Close eyes. Notice 3 sounds, 2 physical sensations, 1 emotion. Open eyes refreshed.', signal: 'focus', relevanceBase: 7 },
      { id: 'n5', type: 'micro', title: 'Gratitude Pause', subtitle: 'Shift perspective', duration: '60 sec', instruction: 'Think of 3 small things you\'re grateful for today. Really feel the appreciation.', signal: 'motivation', relevanceBase: 7 }
    ],
    journal: { id: 'n6', type: 'journal', title: 'Check-in Questions', prompt: 'What do I need right now? What am I avoiding? What would make today feel complete?', signal: 'focus', relevanceBase: 6 },
    breathing: { id: 'n7', type: 'breathing', title: 'Balancing Breath', subtitle: 'Equal inhale & exhale', duration: 60, pattern: { inhale: 4, hold1: 2, exhale: 4, hold2: 2 }, signal: 'focus', relevanceBase: 8 },
    whyHelps: { id: 'n8', type: 'info', title: 'Why This Helps', content: 'Regular mindfulness practice builds emotional awareness, helping you recognize and respond to feelings earlier.', signal: 'focus', relevanceBase: 4 }
  }
}

// Unsplash image map — keyed by content item ID
const ITEM_IMAGES = {
  // ── Move your body ────────────────────────────────────────────────────────
  's3':  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80', // yoga outdoor sun
  'sd3': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80', // forest path walk
  't3':  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80', // gentle floor yoga
  'a3':  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80', // yoga flow studio
  'h3':  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80',    // sunrise yoga pose
  'n3':  'https://images.unsplash.com/photo-1545389336-cf090694435a?w=400&q=80',    // daily yoga soft
  // ── Calm your mind ───────────────────────────────────────────────────────
  's1':  'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=400&q=80', // meditation beach
  'sd1': 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&q=80', // self-compassion
  't1':  'https://images.unsplash.com/photo-1447752741948-09b73cd5c2c4?w=400&q=80', // forest stillness
  'a1':  'https://images.unsplash.com/photo-1486218119243-13883505764c?w=400&q=80', // open field calm
  'h1':  'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=400&q=80', // gratitude light
  'n1':  'https://images.unsplash.com/photo-1515023115689-589c33041d3c?w=400&q=80', // calm water
  's2':  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80', // headphones listening
  'sd2': 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?w=400&q=80', // warm music room
  't2':  'https://images.unsplash.com/photo-1534082021195-09db37f8c4e9?w=400&q=80', // sleep ambient
  'a2':  'https://images.unsplash.com/photo-1418065460487-3e41a6d18738?w=400&q=80', // nature sounds forest
  'h2':  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80', // joyful music
  'n2':  'https://images.unsplash.com/photo-1434030216411-0b5bf851f9ea?w=400&q=80', // lo-fi desk window
  // ── Reflect ──────────────────────────────────────────────────────────────
  's6':  'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&q=80', // pen on paper
  'sd6': 'https://images.unsplash.com/photo-1501618669935-18b6ecceee58?w=400&q=80', // warm journal window
  't6':  'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&q=80', // notebook morning
  'a6':  'https://images.unsplash.com/photo-1517842645780-f73ac4182bc4?w=400&q=80', // writing warm light
  'h6':  'https://images.unsplash.com/photo-1501618669935-18b6ecceee58?w=400&q=80', // open journal
  'n6':  'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&q=80', // blank notebook
  // ── Quick reset (breathing + micro) ─────────────────────────────────────
  's7':  'https://images.unsplash.com/photo-1474418397713-7ede21d49118?w=400&q=80', // mountain reflection
  'sd7': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', // ocean calm
  't7':  'https://images.unsplash.com/photo-1447752741948-09b73cd5c2c4?w=400&q=80', // night forest
  'a7':  'https://images.unsplash.com/photo-1515023115689-589c33041d3c?w=400&q=80', // cool still water
  'h7':  'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=400&q=80', // sunrise energy
  'n7':  'https://images.unsplash.com/photo-1474418397713-7ede21d49118?w=400&q=80', // balance still lake
  's4':  'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=400&q=80', // shoulder release
  's5':  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80', // grounding nature
  'sd4': 'https://images.unsplash.com/photo-1543218024-57a70143bdc9?w=400&q=80',    // warm tea hands
  'sd5': 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&q=80', // hand on heart
  't4':  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&q=80', // eye rest soft
  't5':  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80', // restorative pose
  'a4':  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', // cold water focus
  'a5':  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80', // standing strong
  'h4':  'https://images.unsplash.com/photo-1517842645780-f73ac4182bc4?w=400&q=80', // joy writing
  'h5':  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80', // connection warmth
  'n4':  'https://images.unsplash.com/photo-1515023115689-589c33041d3c?w=400&q=80', // mindful present
  'n5':  'https://images.unsplash.com/photo-1543218024-57a70143bdc9?w=400&q=80',    // gratitude pause
}

// Calculate relevance score for an item based on mood and signals
function calculateRelevance(item, mood, signals) {
  let score = item.relevanceBase || 5
  // Boost if item signal matches any detected signal
  if (signals.includes(item.signal)) score += 5
  // Small boost for breathing/micro for immediate relief
  if (item.type === 'breathing' || item.type === 'micro') score += 2
  // Boost media slightly for engagement
  if (item.type === 'media') score += 1
  return score
}

// Get all recommendations with relevance scores
function getRecommendationsForMood(mood, signals = []) {
  const content = moodContent[mood] || moodContent.neutral
  const primarySignal = signals.length > 0 ? signals[0] : null

  let items = [
    ...content.media.map(item => ({ ...item, reason: primarySignal || item.signal })),
    ...content.microActions.map(item => ({ ...item, reason: primarySignal || item.signal })),
    { ...content.journal, reason: primarySignal || content.journal.signal },
    { ...content.breathing, reason: primarySignal || content.breathing.signal },
    { ...content.whyHelps, reason: primarySignal || content.whyHelps.signal }
  ]

  // Add smoothie recipe for sad/stressed moods
  if ((mood === 'sad' || mood === 'stressed') && smoothieRecipes[mood]) {
    items.push({ ...smoothieRecipes[mood], reason: primarySignal || 'body', relevanceBase: 7 })
  }

  // Calculate relevance for each item
  items = items.map(item => ({
    ...item,
    relevanceScore: calculateRelevance(item, mood, signals)
  }))

  return items
}

// Get top 3 picks sorted by relevance
function getTopPicks(recommendations) {
  return [...recommendations]
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 3)
}

// Generate enhanced Numa reply with top picks reference
function generateEnhancedNumaReply(mood, signals, topPicks, userName) {
  const name = userName || 'friend'
  const signalContext = signals.length > 0 ? signals[0] : null

  const moodIntros = {
    sad: `I hear you, ${name}. When we're feeling down, small acts of care can make a difference.`,
    stressed: `I can sense the tension you're carrying, ${name}. Let's find some relief together.`,
    tired: `Your body is asking for rest, ${name}. Let's be gentle with your energy.`,
    angry: `Those feelings are valid, ${name}. Let's channel them in a healthy way.`,
    happy: `I love that energy, ${name}! Let's make the most of this good feeling.`,
    neutral: `Thanks for checking in, ${name}. I've got some ideas for you.`
  }

  const signalPhrases = {
    sleep: 'sleep concerns',
    lonely: 'feeling alone',
    work: 'work stress',
    panic: 'anxiety',
    motivation: 'motivation',
    focus: 'focus',
    breakup: 'heartbreak',
    social: 'social energy',
    body: 'body awareness',
    headache: 'physical tension'
  }

  const intro = moodIntros[mood] || moodIntros.neutral
  const signalPhrase = signalContext ? signalPhrases[signalContext] : null

  // Build the pick descriptions
  const pickDescriptions = topPicks.map(pick => {
    if (pick.type === 'breathing') return 'a breathing reset'
    if (pick.type === 'micro') return 'a quick grounding exercise'
    if (pick.type === 'media' && pick.category === 'meditation') return 'a calming meditation'
    if (pick.type === 'media' && pick.category === 'music') return 'soothing music'
    if (pick.type === 'media' && pick.category === 'yoga') return 'gentle movement'
    if (pick.type === 'recipe') return 'a nourishing smoothie'
    if (pick.type === 'journal') return 'a journaling prompt'
    return pick.title.toLowerCase()
  })

  const explanation = signalPhrase
    ? `Based on your ${mood} mood and ${signalPhrase}, I picked ${pickDescriptions.join(', ')}.`
    : `Based on how you're feeling, I picked ${pickDescriptions.join(', ')}.`

  return { intro, explanation, topPicks }
}

const moodOptions = [
  { id: 'happy', label: 'Happy' },
  { id: 'sad', label: 'Sad' },
  { id: 'stressed', label: 'Stressed' },
  { id: 'tired', label: 'Tired' },
  { id: 'angry', label: 'Angry' },
]

// Soft 3D sphere face icons — warm beige gradient, minimal features, premium wellness feel
const MoodFace = ({ id, size = 48 }) => {
  const gId = `mf-${id}`
  const vb = '0 0 52 52'
  const fc = '#7a6858'   // feature colour — warm dark brown
  const sw = '1.8'       // stroke width

  // Shared sphere: radial gradient sphere + highlight
  const Sphere = () => (
    <>
      <defs>
        <radialGradient id={gId} cx="36%" cy="28%" r="72%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#e8ddd0" />
          <stop offset="48%"  stopColor="#d2c4b2" />
          <stop offset="100%" stopColor="#b8ad9e" />
        </radialGradient>
        <filter id={`sh-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="rgba(0,0,0,0.13)" />
        </filter>
      </defs>
      {/* Sphere body */}
      <circle cx="26" cy="26" r="23" fill={`url(#${gId})`} filter={`url(#sh-${id})`} />
      {/* Soft specular highlight */}
      <ellipse cx="18" cy="16" rx="7.5" ry="4.5" fill="rgba(255,255,255,0.30)" />
    </>
  )

  switch (id) {
    case 'happy': return (
      <svg width={size} height={size} viewBox={vb} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <Sphere />
        {/* Closed-eye crescents curving upward */}
        <path d="M14 24 Q18 19 22 24" stroke={fc} strokeWidth={sw} />
        <path d="M30 24 Q34 19 38 24" stroke={fc} strokeWidth={sw} />
        {/* Wide gentle smile */}
        <path d="M14 31 Q26 40 38 31" stroke={fc} strokeWidth={sw} />
      </svg>
    )
    case 'sad': return (
      <svg width={size} height={size} viewBox={vb} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <Sphere />
        {/* Downward slanting brows */}
        <path d="M14 19 L21 22" stroke={fc} strokeWidth={sw} />
        <path d="M38 19 L31 22" stroke={fc} strokeWidth={sw} />
        {/* Small dot eyes */}
        <circle cx="19" cy="25" r="1.6" fill={fc} />
        <circle cx="33" cy="25" r="1.6" fill={fc} />
        {/* Frown */}
        <path d="M16 35 Q26 28 36 35" stroke={fc} strokeWidth={sw} />
        {/* Tear */}
        <path d="M17 28 Q15 32 17 33 Q19 33 19 31 Q19 28 17 28" fill={fc} opacity="0.38" />
      </svg>
    )
    case 'stressed': return (
      <svg width={size} height={size} viewBox={vb} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <Sphere />
        {/* Worried inward brows */}
        <path d="M14 21 L21 24" stroke={fc} strokeWidth={sw} />
        <path d="M38 21 L31 24" stroke={fc} strokeWidth={sw} />
        {/* Squinting eyes */}
        <path d="M14 27 Q18 24 22 27" stroke={fc} strokeWidth={sw} />
        <path d="M30 27 Q34 24 38 27" stroke={fc} strokeWidth={sw} />
        {/* Wavy tense mouth */}
        <path d="M15 34 Q19 31 23 34 Q27 37 31 34 Q35 31 37 34" stroke={fc} strokeWidth={sw} />
        {/* Sweat drop */}
        <path d="M39 13 Q41 17 39 19 Q37 19 37 17 Q37 13 39 13" fill={fc} opacity="0.32" />
      </svg>
    )
    case 'tired': return (
      <svg width={size} height={size} viewBox={vb} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <Sphere />
        {/* Heavy drooping eyelid arcs */}
        <path d="M13 23 Q18 18 23 23" stroke={fc} strokeWidth={sw} />
        <path d="M13 25 Q18 25 23 25" stroke={fc} strokeWidth="1.1" opacity="0.45" />
        <path d="M29 23 Q34 18 39 23" stroke={fc} strokeWidth={sw} />
        <path d="M29 25 Q34 25 39 25" stroke={fc} strokeWidth="1.1" opacity="0.45" />
        {/* Slightly downturned flat mouth */}
        <path d="M18 34 Q26 36 34 34" stroke={fc} strokeWidth={sw} />
        {/* zz */}
        <text x="32" y="17" fontSize="7.5" fill={fc} opacity="0.50"
              fontFamily="Georgia, serif" fontStyle="italic" fontWeight="400">zz</text>
      </svg>
    )
    case 'angry': return (
      <svg width={size} height={size} viewBox={vb} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <Sphere />
        {/* Sharp furrowed brows angled steeply */}
        <path d="M12 19 L23 25" stroke={fc} strokeWidth="2.2" />
        <path d="M40 19 L29 25" stroke={fc} strokeWidth="2.2" />
        {/* Small tight eyes */}
        <circle cx="19" cy="28" r="1.5" fill={fc} />
        <circle cx="33" cy="28" r="1.5" fill={fc} />
        {/* Tight frown */}
        <path d="M17 37 Q26 30 35 37" stroke={fc} strokeWidth={sw} />
      </svg>
    )
    default: return null
  }
}

// Recipe Modal Component
function RecipeModal({ recipe, isOpen, onClose, onTrackingUpdate }) {
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    if (isOpen && recipe) {
      setCompleted(isCompletedToday(recipe.id))
    }
  }, [isOpen, recipe])

  if (!isOpen || !recipe) return null

  const handleMadeIt = () => {
    markCompleted(recipe.id, ContentType.RECIPE, CompletionMethod.VERIFIED, recipe.title, 0)
    setCompleted(true)
    if (onTrackingUpdate) onTrackingUpdate()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cream rounded-2xl max-w-sm w-full max-h-[80vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-br from-terracotta to-terracotta-dark p-6 rounded-t-2xl relative">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <X className="w-4 h-4 text-cream" />
          </button>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
            <UtensilsCrossed className="w-6 h-6 text-cream" />
          </div>
          <h2 className="text-cream text-xl font-semibold">{recipe.title}</h2>
          <p className="text-cream/80 text-sm mt-1">{recipe.subtitle}</p>
        </div>
        <div className="p-6">
          <h3 className="text-earth font-medium text-sm mb-3">Ingredients</h3>
          <ul className="space-y-2 mb-6">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex items-center gap-2 text-earth-light text-sm">
                <div className="w-1.5 h-1.5 bg-sage rounded-full" />
                {ing}
              </li>
            ))}
          </ul>
          <h3 className="text-earth font-medium text-sm mb-3">Steps</h3>
          <ol className="space-y-3 mb-6">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="w-6 h-6 bg-sage/20 text-sage rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium">
                  {i + 1}
                </span>
                <span className="text-earth-light pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
          {/* Made it button */}
          <button
            onClick={handleMadeIt}
            disabled={completed}
            className={`w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${completed ? 'bg-sage/20 text-sage' : 'bg-sage hover:bg-sage-dark text-cream'}`}
          >
            {completed ? (
              <><CheckCircle2 className="w-5 h-5" /> Made it today!</>
            ) : (
              <><UtensilsCrossed className="w-5 h-5" /> I made it!</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Breathing Timer Component (Full size for carousel)
function BreathingCard({ item, mood, onTrackingUpdate }) {
  const [isActive, setIsActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(item.duration)
  const [phase, setPhase] = useState('ready')
  const [phaseTime, setPhaseTime] = useState(0)
  const [completed, setCompleted] = useState(false)
  const intervalRef = useRef(null)
  const { pattern } = item

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setIsActive(false)
            setPhase('done')
            // Mark as verified when timer completes
            markCompleted(item.id, ContentType.BREATHING, CompletionMethod.VERIFIED, item.title, item.duration)
            setCompleted(true)
            if (onTrackingUpdate) onTrackingUpdate()
            return 0
          }
          return t - 1
        })
        setPhaseTime(pt => {
          const newPt = pt + 1
          const totalCycle = pattern.inhale + pattern.hold1 + pattern.exhale + pattern.hold2
          const cyclePos = newPt % totalCycle
          if (cyclePos < pattern.inhale) setPhase('inhale')
          else if (cyclePos < pattern.inhale + pattern.hold1) setPhase('hold')
          else if (cyclePos < pattern.inhale + pattern.hold1 + pattern.exhale) setPhase('exhale')
          else setPhase('hold')
          return newPt
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [isActive, timeLeft, pattern, item, onTrackingUpdate])

  const startBreathing = () => { setIsActive(true); setTimeLeft(item.duration); setPhaseTime(0); setPhase('inhale'); setCompleted(false) }
  const stopBreathing = () => { setIsActive(false); setPhase('ready'); setTimeLeft(item.duration); setPhaseTime(0) }
  const phaseLabels = { ready: 'Tap to start', inhale: 'Breathe in...', hold: 'Hold...', exhale: 'Breathe out...', done: 'Complete!' }

  return (
    <div className={`flex-shrink-0 w-44 bg-gradient-to-br from-sage/20 to-sage/5 rounded-2xl border-2 ${completed ? 'border-sage' : 'border-sage/30'} overflow-hidden`}>
      {completed && <div className="bg-sage/20 px-2 py-0.5 flex items-center justify-center gap-1"><CheckCircle2 className="w-3 h-3 text-sage" /><span className="text-sage text-[10px] font-medium">Done today</span></div>}
      <div className="h-24 flex flex-col items-center justify-center relative">
        <div className={`w-16 h-16 rounded-full border-4 border-sage flex items-center justify-center transition-transform duration-1000 ${phase === 'inhale' ? 'scale-125' : phase === 'exhale' ? 'scale-75' : 'scale-100'}`}>
          <Wind className={`w-6 h-6 text-sage ${isActive ? 'animate-pulse' : ''}`} />
        </div>
        {isActive && <span className="absolute bottom-2 text-xs text-sage font-medium">{timeLeft}s</span>}
      </div>
      <div className="p-3">
        <p className="text-earth text-sm font-medium">{item.title}</p>
        <p className="text-sage text-xs mt-1 font-medium">{phaseLabels[phase]}</p>
        <button onClick={isActive ? stopBreathing : startBreathing} className={`mt-2 w-full py-1.5 rounded-lg text-xs font-medium transition-colors ${isActive ? 'bg-sage/20 text-sage' : 'bg-sage text-cream'}`}>
          {isActive ? 'Stop' : phase === 'done' ? 'Again' : 'Start 60s'}
        </button>
        <p className="text-[10px] text-earth-light/60 mt-2">Because: {mood} + {item.reason}</p>
      </div>
    </div>
  )
}

// Compact Breathing Card for Top Picks
function CompactBreathingCard({ item, onStart, onTrackingUpdate }) {
  const [isActive, setIsActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(item.duration)
  const [phase, setPhase] = useState('ready')
  const [completed, setCompleted] = useState(() => isCompletedToday(item.id))
  const intervalRef = useRef(null)
  const { pattern } = item

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setIsActive(false)
            setPhase('done')
            markCompleted(item.id, ContentType.BREATHING, CompletionMethod.VERIFIED, item.title, item.duration)
            setCompleted(true)
            if (onTrackingUpdate) onTrackingUpdate()
            return 0
          }
          return t - 1
        })
        const totalCycle = pattern.inhale + pattern.hold1 + pattern.exhale + pattern.hold2
        const cyclePos = (item.duration - timeLeft + 1) % totalCycle
        if (cyclePos < pattern.inhale) setPhase('inhale')
        else if (cyclePos < pattern.inhale + pattern.hold1) setPhase('hold')
        else if (cyclePos < pattern.inhale + pattern.hold1 + pattern.exhale) setPhase('exhale')
        else setPhase('hold')
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [isActive, timeLeft, pattern, item, onTrackingUpdate])

  const handleClick = () => {
    if (isActive) {
      clearInterval(intervalRef.current)
      setIsActive(false)
      setPhase('ready')
      setTimeLeft(item.duration)
    } else {
      setIsActive(true)
      setTimeLeft(item.duration)
      setPhase('inhale')
    }
  }

  const phaseText = { ready: 'Start', inhale: 'In...', hold: 'Hold...', exhale: 'Out...', done: 'Done!' }

  return (
    <button onClick={handleClick} className={`w-full flex items-center gap-3 p-3 ${completed ? 'bg-sage/10' : 'bg-white/50 hover:bg-white/70'} rounded-xl border ${completed ? 'border-sage/40' : 'border-sage/20'} transition-all group`}>
      <div className={`w-10 h-10 rounded-full ${isActive ? 'bg-sage' : 'bg-sage/20'} flex items-center justify-center flex-shrink-0 transition-all duration-500 ${phase === 'inhale' ? 'scale-125' : phase === 'exhale' ? 'scale-75' : 'scale-100'}`}>
        {completed && !isActive ? <CheckCircle2 className="w-5 h-5 text-sage" /> : <Wind className={`w-5 h-5 ${isActive ? 'text-cream' : 'text-sage'}`} />}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-earth text-sm font-medium truncate">{item.title}</p>
        <p className="text-earth-light/70 text-xs truncate">{isActive ? phaseText[phase] : completed ? 'Completed today' : item.subtitle || '60 sec breathing reset'}</p>
      </div>
      <div className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${isActive ? 'bg-terracotta text-cream' : completed ? 'bg-sage/20 text-sage' : 'bg-sage text-cream group-hover:bg-sage-dark'}`}>
        {isActive ? `${timeLeft}s` : completed ? 'Again' : 'Start'}
      </div>
    </button>
  )
}

// Micro Action Card (Full size for carousel)
function MicroActionCard({ item, mood, onTrackingUpdate }) {
  const [isActive, setIsActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [completed, setCompleted] = useState(() => isCompletedToday(item.id))
  const intervalRef = useRef(null)

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setIsActive(false)
            markCompleted(item.id, ContentType.MICRO, CompletionMethod.VERIFIED, item.title, 60)
            setCompleted(true)
            if (onTrackingUpdate) onTrackingUpdate()
            return 0
          }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [isActive, timeLeft, item, onTrackingUpdate])

  const handleStart = () => { setIsActive(true); setTimeLeft(60) }
  const handleDone = () => {
    clearInterval(intervalRef.current)
    setIsActive(false)
    markCompleted(item.id, ContentType.MICRO, CompletionMethod.VERIFIED, item.title, 60 - timeLeft)
    setCompleted(true)
    if (onTrackingUpdate) onTrackingUpdate()
  }

  return (
    <div className={`flex-shrink-0 w-44 bg-gradient-to-br from-terracotta/20 to-terracotta/5 rounded-2xl border-2 ${completed ? 'border-sage' : 'border-terracotta/30'} overflow-hidden`}>
      {completed && <div className="bg-sage/20 px-2 py-0.5 flex items-center justify-center gap-1"><CheckCircle2 className="w-3 h-3 text-sage" /><span className="text-sage text-[10px] font-medium">Done today</span></div>}
      <div className="h-20 flex items-center justify-center">
        <div className={`w-10 h-10 rounded-full ${isActive ? 'bg-terracotta animate-pulse' : 'bg-terracotta'} flex items-center justify-center`}>
          {isActive ? <Timer className="w-5 h-5 text-cream" /> : <Zap className="w-5 h-5 text-cream" />}
        </div>
      </div>
      <div className="p-3">
        <p className="text-earth text-sm font-medium line-clamp-1">{item.title}</p>
        <p className="text-earth-light text-xs mt-1 line-clamp-2">{item.instruction}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-terracotta">{isActive ? `${timeLeft}s left` : item.duration}</span>
          {isActive ? (
            <button onClick={handleDone} className="text-xs px-2 py-0.5 rounded-full bg-sage text-cream">Done!</button>
          ) : (
            <button onClick={handleStart} className={`text-xs px-2 py-0.5 rounded-full transition-colors ${completed ? 'bg-sage/20 text-sage' : 'bg-terracotta/20 text-terracotta'}`}>
              {completed ? 'Again' : 'Do it'}
            </button>
          )}
        </div>
        <p className="text-[10px] text-earth-light/60 mt-2">Because: {mood} + {item.reason}</p>
      </div>
    </div>
  )
}

// Compact Micro Action Card for Top Picks
function CompactMicroCard({ item, onTrackingUpdate }) {
  const [isActive, setIsActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [completed, setCompleted] = useState(() => isCompletedToday(item.id))
  const intervalRef = useRef(null)

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setIsActive(false)
            markCompleted(item.id, ContentType.MICRO, CompletionMethod.VERIFIED, item.title, 60)
            setCompleted(true)
            if (onTrackingUpdate) onTrackingUpdate()
            return 0
          }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [isActive, timeLeft, item, onTrackingUpdate])

  const handleClick = () => {
    if (isActive) {
      // Mark done early
      clearInterval(intervalRef.current)
      setIsActive(false)
      markCompleted(item.id, ContentType.MICRO, CompletionMethod.VERIFIED, item.title, 60 - timeLeft)
      setCompleted(true)
      if (onTrackingUpdate) onTrackingUpdate()
    } else if (!completed) {
      setIsActive(true)
      setTimeLeft(60)
    }
  }

  return (
    <div className={`w-full flex items-center gap-3 p-3 ${completed ? 'bg-sage/10' : 'bg-white/50 hover:bg-white/70'} rounded-xl border ${completed ? 'border-sage/40' : 'border-terracotta/20'} transition-all`}>
      <div className={`w-10 h-10 rounded-full ${isActive ? 'bg-terracotta animate-pulse' : completed ? 'bg-sage/30' : 'bg-terracotta/20'} flex items-center justify-center flex-shrink-0`}>
        {completed && !isActive ? <CheckCircle2 className="w-5 h-5 text-sage" /> : isActive ? <Timer className="w-5 h-5 text-cream" /> : <Zap className="w-5 h-5 text-terracotta" />}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-earth text-sm font-medium truncate">{item.title}</p>
        <p className="text-earth-light/70 text-xs truncate">{isActive ? `${timeLeft}s remaining...` : completed ? 'Completed today' : `${item.duration} • ${item.instruction?.slice(0, 30)}...`}</p>
      </div>
      <button onClick={handleClick} className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${isActive ? 'bg-sage text-cream' : completed ? 'bg-sage/20 text-sage' : 'bg-terracotta/20 text-terracotta hover:bg-terracotta/30'}`}>
        {isActive ? 'Done!' : completed ? 'Again' : 'Start'}
      </button>
    </div>
  )
}

// Journal Card (Full size for carousel)
function JournalCard({ item, mood, onTrackingUpdate }) {
  const [isOpen, setIsOpen] = useState(false)
  const [text, setText] = useState('')
  const [completed, setCompleted] = useState(() => isCompletedToday(item.id))

  const handleSave = () => {
    if (text.trim().length > 10) {
      markCompleted(item.id, ContentType.JOURNAL, CompletionMethod.VERIFIED, item.title, 0)
      setCompleted(true)
      setIsOpen(false)
      setText('')
      if (onTrackingUpdate) onTrackingUpdate()
    }
  }

  return (
    <>
      <div className={`flex-shrink-0 w-48 bg-gradient-to-br from-earth/10 to-earth/5 rounded-2xl border-2 ${completed ? 'border-sage' : 'border-earth/20'} overflow-hidden`}>
        {completed && <div className="bg-sage/20 px-2 py-0.5 flex items-center justify-center gap-1"><CheckCircle2 className="w-3 h-3 text-sage" /><span className="text-sage text-[10px] font-medium">Done today</span></div>}
        <div className="h-20 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-earth flex items-center justify-center">
            <PenLine className="w-5 h-5 text-cream" />
          </div>
        </div>
        <div className="p-3">
          <p className="text-earth text-sm font-medium">{item.title}</p>
          <p className="text-earth-light text-xs mt-1 line-clamp-3 italic">"{item.prompt}"</p>
          <button onClick={() => setIsOpen(true)} className={`mt-2 text-xs px-3 py-1 rounded-full ${completed ? 'bg-sage/20 text-sage' : 'bg-earth/20 text-earth'}`}>
            {completed ? 'Write again' : 'Start writing'}
          </button>
          <p className="text-[10px] text-earth-light/60 mt-2">Because: {mood} + {item.reason}</p>
        </div>
      </div>

      {/* Journal Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
          <div className="bg-cream rounded-2xl max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-sand flex items-center justify-between">
              <h3 className="text-earth font-medium">{item.title}</h3>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-sand/50 flex items-center justify-center"><X className="w-4 h-4 text-earth" /></button>
            </div>
            <div className="p-4">
              <p className="text-earth-light text-sm italic mb-4">"{item.prompt}"</p>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write your thoughts..."
                className="w-full h-40 p-3 bg-white border border-sand rounded-xl text-earth text-sm resize-none focus:outline-none focus:border-sage"
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-earth-light">{text.length} characters</span>
                <button onClick={handleSave} disabled={text.trim().length < 10} className="px-4 py-2 bg-sage hover:bg-sage-dark disabled:bg-sand disabled:cursor-not-allowed text-cream text-sm font-medium rounded-lg transition-colors">
                  Save Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Compact Journal Card for Top Picks
function CompactJournalCard({ item, onTrackingUpdate }) {
  const [isOpen, setIsOpen] = useState(false)
  const [text, setText] = useState('')
  const [completed, setCompleted] = useState(() => isCompletedToday(item.id))

  const handleSave = () => {
    if (text.trim().length > 10) {
      markCompleted(item.id, ContentType.JOURNAL, CompletionMethod.VERIFIED, item.title, 0)
      setCompleted(true)
      setIsOpen(false)
      setText('')
      if (onTrackingUpdate) onTrackingUpdate()
    }
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={`w-full flex items-center gap-3 p-3 ${completed ? 'bg-sage/10' : 'bg-white/50 hover:bg-white/70'} rounded-xl border ${completed ? 'border-sage/40' : 'border-earth/20'} transition-all text-left`}>
        <div className={`w-10 h-10 rounded-full ${completed ? 'bg-sage/30' : 'bg-earth/20'} flex items-center justify-center flex-shrink-0`}>
          {completed ? <CheckCircle2 className="w-5 h-5 text-sage" /> : <PenLine className="w-5 h-5 text-earth" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-earth text-sm font-medium truncate">{item.title}</p>
          <p className="text-earth-light/70 text-xs truncate italic">{completed ? 'Completed today' : `"${item.prompt?.slice(0, 40)}..."`}</p>
        </div>
        <div className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg ${completed ? 'bg-sage/20 text-sage' : 'bg-earth/10 text-earth'}`}>
          {completed ? 'Again' : 'Write'}
        </div>
      </button>

      {/* Journal Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
          <div className="bg-cream rounded-2xl max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-sand flex items-center justify-between">
              <h3 className="text-earth font-medium">{item.title}</h3>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-sand/50 flex items-center justify-center"><X className="w-4 h-4 text-earth" /></button>
            </div>
            <div className="p-4">
              <p className="text-earth-light text-sm italic mb-4">"{item.prompt}"</p>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write your thoughts..."
                className="w-full h-40 p-3 bg-white border border-sand rounded-xl text-earth text-sm resize-none focus:outline-none focus:border-sage"
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-earth-light">{text.length} characters</span>
                <button onClick={handleSave} disabled={text.trim().length < 10} className="px-4 py-2 bg-sage hover:bg-sage-dark disabled:bg-sand disabled:cursor-not-allowed text-cream text-sm font-medium rounded-lg transition-colors">
                  Save Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Info Card
function InfoCard({ item, mood }) {
  return (
    <div className="flex-shrink-0 w-44 bg-gradient-to-br from-sage/10 to-cream rounded-2xl border border-sage/20 overflow-hidden">
      <div className="h-16 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-sage/30 flex items-center justify-center"><Info className="w-4 h-4 text-sage" /></div>
      </div>
      <div className="p-3">
        <p className="text-sage text-xs font-medium">{item.title}</p>
        <p className="text-earth-light text-[11px] mt-1 leading-relaxed">{item.content}</p>
        <p className="text-[10px] text-earth-light/60 mt-2">Because: {mood} + {item.reason}</p>
      </div>
    </div>
  )
}

// Recipe Card (Full size for carousel)
function RecipeCard({ item, mood, onOpen }) {
  const [completed] = useState(() => isCompletedToday(item.id))

  return (
    <button onClick={onOpen} className={`flex-shrink-0 w-44 bg-gradient-to-br from-terracotta/20 to-orange-100 rounded-2xl border-2 ${completed ? 'border-sage' : 'border-terracotta/30'} overflow-hidden text-left`}>
      {completed && <div className="bg-sage/20 px-2 py-0.5 flex items-center justify-center gap-1"><CheckCircle2 className="w-3 h-3 text-sage" /><span className="text-sage text-[10px] font-medium">Made today</span></div>}
      <div className="h-20 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-terracotta flex items-center justify-center">
          <UtensilsCrossed className="w-5 h-5 text-cream" />
        </div>
      </div>
      <div className="p-3">
        <p className="text-earth text-sm font-medium line-clamp-1">{item.title}</p>
        <p className="text-earth-light text-xs mt-1 line-clamp-1">{item.subtitle}</p>
        <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${completed ? 'bg-sage/20 text-sage' : 'bg-terracotta/20 text-terracotta'}`}>{completed ? 'Make again' : 'View Recipe'}</span>
        <p className="text-[10px] text-earth-light/60 mt-2">Because: {mood} + {item.reason}</p>
      </div>
    </button>
  )
}

// Compact Recipe Card for Top Picks
function CompactRecipeCard({ item, onOpen }) {
  const [completed] = useState(() => isCompletedToday(item.id))

  return (
    <button onClick={onOpen} className={`w-full flex items-center gap-3 p-3 ${completed ? 'bg-sage/10' : 'bg-white/50 hover:bg-white/70'} rounded-xl border ${completed ? 'border-sage/40' : 'border-terracotta/20'} transition-all text-left group`}>
      <div className={`w-10 h-10 rounded-full ${completed ? 'bg-sage/30' : 'bg-terracotta/20 group-hover:bg-terracotta/30'} flex items-center justify-center flex-shrink-0 transition-colors`}>
        {completed ? <CheckCircle2 className="w-5 h-5 text-sage" /> : <UtensilsCrossed className="w-5 h-5 text-terracotta" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-earth text-sm font-medium truncate">{item.title}</p>
        <p className="text-earth-light/70 text-xs truncate">{completed ? 'Made today' : item.subtitle}</p>
      </div>
      <div className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${completed ? 'bg-sage/20 text-sage' : 'bg-terracotta/20 text-terracotta group-hover:bg-terracotta/30'}`}>
        {completed ? 'Again' : 'View'}
      </div>
    </button>
  )
}

// Compact Media Card for Top Picks
function CompactMediaCard({ item, onClick, getCategoryColor, getCategoryIcon }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-3 bg-white/50 hover:bg-white/70 rounded-xl border border-sage/20 transition-all text-left group">
      <div className={`w-10 h-10 rounded-full ${getCategoryColor(item.category)} flex items-center justify-center flex-shrink-0`}>
        {getCategoryIcon(item.category)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-earth text-sm font-medium truncate">{item.title}</p>
        <p className="text-earth-light/70 text-xs truncate">{item.subtitle} • {item.duration}</p>
      </div>
      <div className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${item.platform === 'youtube' ? 'bg-red-100 text-red-600 group-hover:bg-red-200' : 'bg-green-100 text-green-600 group-hover:bg-green-200'}`}>
        {item.platform === 'youtube' ? 'Play' : 'Listen'}
      </div>
    </button>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { user, todayCheckIn } = useUser()
  const insights = getInsights()
  const memory = getMemory()
  const topPicksRef = useRef(null)

  const [selectedMood, setSelectedMood] = useState(null)
  const [checkInText, setCheckInText] = useState('')
  const [detectedMood, setDetectedMood] = useState(null)
  const [detectedSignals, setDetectedSignals] = useState([])
  const [numaReplyData, setNumaReplyData] = useState(null)
  const [isThinking, setIsThinking] = useState(false)
  const [showReply, setShowReply] = useState(false)
  const [showTopPicks, setShowTopPicks] = useState(false)
  const [numaState, setNumaState] = useState('calm')
  const [selectedMedia, setSelectedMedia] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [recipeModalOpen, setRecipeModalOpen] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState(null)

  // Tracking stats state
  const [trackingStats, setTrackingStats] = useState(() => getAllStats())

  // Refresh tracking stats
  const refreshStats = useCallback(() => {
    setTrackingStats(getAllStats())
  }, [])

  // Listen for tracking updates
  useEffect(() => {
    const handler = () => refreshStats()
    window.addEventListener('tracking-updated', handler)
    return () => window.removeEventListener('tracking-updated', handler)
  }, [refreshStats])

  const currentMood = detectedMood || selectedMood || 'neutral'
  const recommendations = getRecommendationsForMood(currentMood, detectedSignals)
  const topPicks = getTopPicks(recommendations)
  const moreOptions = recommendations.filter(r => !topPicks.find(tp => tp.id === r.id))

  const handleMoodSelect = (moodId) => {
    navigate(`/mood/${moodId}`)
  }

  const handleCheckInSubmit = () => {
    if (!checkInText.trim() && !selectedMood) return
    const textInput = checkInText.trim()
    setIsThinking(true)
    setNumaState('thinking')
    setShowReply(false)
    setShowTopPicks(false)

    let finalMood = selectedMood
    let signals = []
    if (textInput) { finalMood = detectMood(textInput); signals = extractSignals(textInput) }
    finalMood = finalMood || 'neutral'

    setSelectedMood(finalMood)
    setDetectedMood(finalMood)
    setDetectedSignals(signals)

    const thinkingTime = 600 + Math.random() * 300
    setTimeout(() => {
      const newRecs = getRecommendationsForMood(finalMood, signals)
      const newTopPicks = getTopPicks(newRecs)
      const replyData = generateEnhancedNumaReply(finalMood, signals, newTopPicks, user?.name)
      setNumaReplyData(replyData)
      setIsThinking(false)
      setShowReply(true)
      setNumaState('responding')
      setCheckInText('')

      // Show top picks with animation delay
      setTimeout(() => {
        setShowTopPicks(true)
        // Smooth scroll to top picks
        setTimeout(() => {
          topPicksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      }, 300)

      setTimeout(() => setNumaState('calm'), 2000)
    }, thinkingTime)
  }

  const handleRecommendationClick = (item) => {
    if (item.type === 'recipe') { setSelectedRecipe(item); setRecipeModalOpen(true); return }
    if (item.type !== 'media') return
    setSelectedMedia({ title: item.title, description: item.subtitle, platform: item.platform, videoId: item.youtubeVideoId, playlistId: item.youtubePlaylistId || item.spotifyPlaylistId, trackId: item.spotifyTrackId })
    setIsModalOpen(true)
  }

  const meditationSessions = memory.helpfulActivities.filter(a => a.type === 'meditation' || a.type === 'breathing').length
  const yogaSessions = memory.helpfulActivities.filter(a => a.type === 'yoga' || a.type === 'movement').length
  const meditationMinutes = meditationSessions * 10
  const recentCheckIns = memory.checkIns.slice(-5).reverse()

  const quickActions = [
    { id: 'meditation', label: 'Meditation', icon: Sparkles, color: 'bg-sage' },
    { id: 'yoga', label: 'Yoga', icon: Dumbbell, color: 'bg-terracotta' },
    { id: 'checkin', label: 'Voice Check-in', icon: Mic, color: 'bg-earth' }
  ]

  const handleQuickAction = (actionId) => navigate(todayCheckIn ? '/recommendations' : '/checkin')
  const getMoodEmoji = (mood) => ({ great: '😊', good: '🙂', okay: '😐', low: '😔', stressed: '😰', happy: '😊', calm: '😌', sad: '😢', tired: '😴', energized: '⚡', angry: '😠', neutral: '🙂' }[mood] || '🙂')
  const getEnergyLabel = (energy) => ({ high: 'Energized', medium: 'Balanced', low: 'Tired' }[energy] || energy)
  const getCategoryIcon = (category) => { switch(category) { case 'meditation': return <Sparkles className="w-5 h-5 text-cream" />; case 'yoga': case 'movement': return <Dumbbell className="w-5 h-5 text-cream" />; case 'music': return <Music className="w-5 h-5 text-cream" />; default: return <Play className="w-5 h-5 text-cream" /> } }
  const getCategoryColor = (category) => { switch(category) { case 'meditation': return 'bg-sage'; case 'yoga': case 'movement': return 'bg-terracotta'; case 'music': return 'bg-earth'; default: return 'bg-sage' } }

  // Compact card renderer for Top Picks (horizontal layout)
  const renderCompactCard = (item) => {
    switch (item.type) {
      case 'breathing': return <CompactBreathingCard key={item.id} item={item} onStart={() => {}} onTrackingUpdate={refreshStats} />
      case 'micro': return <CompactMicroCard key={item.id} item={item} onTrackingUpdate={refreshStats} />
      case 'journal': return <CompactJournalCard key={item.id} item={item} onTrackingUpdate={refreshStats} />
      case 'recipe': return <CompactRecipeCard key={item.id} item={item} onOpen={() => { setSelectedRecipe(item); setRecipeModalOpen(true) }} />
      case 'info': return null // Skip info cards in top picks
      case 'media': default:
        return <CompactMediaCard key={item.id} item={item} onClick={() => handleRecommendationClick(item)} getCategoryColor={getCategoryColor} getCategoryIcon={getCategoryIcon} />
    }
  }

  // Full-size card renderer for carousel
  const renderCard = (item) => {
    switch (item.type) {
      case 'breathing': return <BreathingCard key={item.id} item={item} mood={currentMood} onTrackingUpdate={refreshStats} />
      case 'micro': return <MicroActionCard key={item.id} item={item} mood={currentMood} onTrackingUpdate={refreshStats} />
      case 'journal': return <JournalCard key={item.id} item={item} mood={currentMood} onTrackingUpdate={refreshStats} />
      case 'info': return <InfoCard key={item.id} item={item} mood={currentMood} />
      case 'recipe': return <RecipeCard key={item.id} item={item} mood={currentMood} onOpen={() => { setSelectedRecipe(item); setRecipeModalOpen(true) }} />
      case 'media': default:
        return (
          <button key={item.id} onClick={() => handleRecommendationClick(item)} className="flex-shrink-0 w-44 bg-cream-dark rounded-2xl border-2 border-sand hover:border-sage transition-colors text-left overflow-hidden">
            <div className={`h-20 flex items-center justify-center ${getCategoryColor(item.category)}/20`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getCategoryColor(item.category)}`}>{getCategoryIcon(item.category)}</div>
            </div>
            <div className="p-3">
              <p className="text-earth text-sm font-medium line-clamp-1">{item.title}</p>
              <p className="text-earth-light text-xs mt-1 line-clamp-1">{item.subtitle}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-earth-light">{item.duration}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${item.platform === 'youtube' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{item.platform === 'youtube' ? 'YouTube' : 'Spotify'}</span>
              </div>
              <p className="text-[10px] text-earth-light/60 mt-2">Because: {currentMood} + {item.reason}</p>
            </div>
          </button>
        )
    }
  }

  // Per-mood pill colors
  const moodPillStyles = {
    happy:    { default: 'bg-amber-50 border-amber-200',   active: 'bg-amber-100 border-amber-300 shadow-md scale-105' },
    sad:      { default: 'bg-sky-50 border-sky-200',       active: 'bg-sky-100 border-sky-300 shadow-md scale-105' },
    stressed: { default: 'bg-violet-50 border-violet-200', active: 'bg-violet-100 border-violet-300 shadow-md scale-105' },
    tired:    { default: 'bg-slate-50 border-slate-200',   active: 'bg-slate-100 border-slate-300 shadow-md scale-105' },
    angry:    { default: 'bg-rose-50 border-rose-200',     active: 'bg-rose-100 border-rose-300 shadow-md scale-105' },
  }

  // Mood-keyed header gradients for the featured card
  const moodHeaderGradient = {
    stressed: 'from-violet-100 to-violet-50',
    sad:      'from-sky-100 to-sky-50',
    tired:    'from-slate-100 to-slate-50',
    angry:    'from-rose-100 to-rose-50',
    happy:    'from-amber-100 to-amber-50',
    neutral:  'from-sage/20 to-sage/5',
  }

  // Large editorial hero card — shown as the primary recommendation
  const renderFeaturedCard = (item) => {
    const headerGrad = moodHeaderGradient[currentMood] || moodHeaderGradient.neutral

    if (item.type === 'media') {
      const isYoutube = item.platform === 'youtube'
      const btnClass = isYoutube ? 'bg-red-400 hover:bg-red-500' : 'bg-[#1DB954] hover:bg-green-600'
      return (
        <button
          onClick={() => handleRecommendationClick(item)}
          className="w-full rounded-2xl overflow-hidden shadow-md text-left mb-4 hover:shadow-lg transition-all duration-300 border border-white/70"
        >
          {/* Visual header */}
          <div className={`h-28 bg-gradient-to-br ${headerGrad} flex items-end justify-between px-4 pb-4 relative overflow-hidden`}>
            <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/20 pointer-events-none" />
            <div className="absolute right-6 top-4 w-14 h-14 rounded-full bg-white/12 pointer-events-none" />
            <div className={`w-11 h-11 rounded-xl ${getCategoryColor(item.category)} flex items-center justify-center shadow-md`}>
              <Play className="w-5 h-5 text-cream" />
            </div>
            <div className="absolute top-3 right-3 bg-white/70 backdrop-blur-sm rounded-full px-2.5 py-0.5">
              <span className="text-[10px] text-earth font-medium">{item.duration}</span>
            </div>
          </div>
          {/* Content */}
          <div className="bg-white/70 backdrop-blur-sm px-4 py-3">
            <p className="text-earth font-semibold text-[13px] leading-tight">{item.title}</p>
            <p className="text-earth-light/70 text-xs font-light mt-0.5 line-clamp-1">{item.subtitle}</p>
            <div className="mt-2">
              <span className={`inline-flex items-center gap-1 ${btnClass} text-white text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-sm transition-colors`}>
                <Play className="w-2.5 h-2.5 fill-current" />
                {isYoutube ? 'Watch now' : 'Listen now'}
              </span>
            </div>
          </div>
        </button>
      )
    }

    // Non-media: editorial wrapper with a colored header strip
    const typeLabel = item.type === 'breathing' ? 'Breathwork'
      : item.type === 'micro' ? 'Quick reset'
      : item.type === 'journal' ? 'Journaling'
      : 'Practice'
    return (
      <div className="rounded-2xl overflow-hidden shadow-sm mb-4 border border-white/70">
        <div className={`h-10 bg-gradient-to-br ${headerGrad} flex items-center px-4`}>
          <p className="text-earth text-[9px] uppercase tracking-[0.14em] font-medium opacity-40">{typeLabel}</p>
        </div>
        <div className="bg-white/70 backdrop-blur-sm">
          {renderCompactCard(item)}
        </div>
      </div>
    )
  }

  // Secondary tile — 2-column, visually distinct
  const renderSecondaryCard = (item) => {
    const handleItemClick = () => {
      if (item.type === 'recipe') { setSelectedRecipe(item); setRecipeModalOpen(true) }
      else if (item.type === 'media') handleRecommendationClick(item)
      else navigate(`/mood/${currentMood}`)
    }
    const iconBg = item.type === 'media' ? getCategoryColor(item.category)
      : item.type === 'breathing' ? 'bg-sage'
      : item.type === 'micro'     ? 'bg-terracotta'
      : item.type === 'journal'   ? 'bg-earth'
      : 'bg-sage'
    const iconEl = item.type === 'media' ? <Play className="w-4 h-4 text-cream" />
      : item.type === 'breathing' ? <Wind className="w-4 h-4 text-cream" />
      : item.type === 'micro'     ? <Zap className="w-4 h-4 text-cream" />
      : item.type === 'journal'   ? <PenLine className="w-4 h-4 text-cream" />
      : <Sparkles className="w-4 h-4 text-cream" />
    const cta = item.type === 'media' ? (item.platform === 'youtube' ? 'Watch →' : 'Listen →')
      : item.type === 'breathing' ? 'Breathe →'
      : item.type === 'micro'     ? 'Do it →'
      : item.type === 'journal'   ? 'Write →'
      : 'Begin →'
    const durationText = typeof item.duration === 'number' ? `${item.duration}s` : item.duration || ''
    return (
      <button
        key={item.id}
        onClick={handleItemClick}
        className="w-full bg-white/65 rounded-2xl p-3 border border-white/80 shadow-sm text-left hover:shadow-md transition-all duration-200"
      >
        <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center mb-2 shadow-sm`}>
          {iconEl}
        </div>
        <p className="text-earth text-[12px] font-semibold leading-snug line-clamp-2">{item.title}</p>
        {durationText && <p className="text-earth-light/45 text-[10px] mt-0.5">{durationText}</p>}
        <p className="text-sage text-[10px] font-medium mt-2">{cta}</p>
      </button>
    )
  }

  // ── Intent-based content sections ─────────────────────────────────────────
  // Current mood surfaces first; other moods provide variety
  const intentMoods = [
    currentMood,
    ...['stressed', 'sad', 'tired', 'angry', 'happy', 'neutral'].filter(m => m !== currentMood),
  ]
  const dedupe = (arr) => arr.filter((item, idx, a) => a.findIndex(i => i.id === item.id) === idx)

  const sectionMove = dedupe(
    intentMoods.flatMap(m => (moodContent[m]?.media || []).filter(i => i.category === 'yoga' || i.category === 'movement'))
  ).slice(0, 6)

  const sectionCalm = dedupe(
    intentMoods.flatMap(m => (moodContent[m]?.media || []).filter(i => i.category === 'meditation' || i.category === 'music'))
  ).slice(0, 6)

  const sectionReflect = dedupe(
    intentMoods.map(m => moodContent[m]?.journal).filter(Boolean)
  ).slice(0, 5)

  const sectionReset = dedupe(
    intentMoods.flatMap(m => [moodContent[m]?.breathing, ...(moodContent[m]?.microActions || [])].filter(Boolean))
  ).slice(0, 6)

  // Image-first card for horizontal section rows
  const renderSmallCard = (item) => {
    const handleClick = () => {
      if (item.type === 'recipe') { setSelectedRecipe(item); setRecipeModalOpen(true) }
      else if (item.type === 'media') handleRecommendationClick(item)
      else navigate(`/mood/${currentMood}`)
    }
    const imageUrl = ITEM_IMAGES[item.id]
    const cta = item.type === 'media'
      ? (item.platform === 'youtube' ? 'Watch' : 'Listen')
      : item.type === 'breathing' ? 'Start'
      : item.type === 'micro'     ? 'Do it'
      : item.type === 'journal'   ? 'Write'
      : 'Begin'
    const durationText = typeof item.duration === 'number' ? `${item.duration}s` : item.duration || ''
    const platformLabel = item.type === 'media'
      ? (item.platform === 'youtube' ? 'YT' : '♫')
      : null

    // Fallback gradient when no image available
    const fallbackGrad = item.type === 'media' && item.category === 'music'
      ? 'from-emerald-100 to-teal-50'
      : item.type === 'breathing' ? 'from-sage/30 to-sage/10'
      : item.type === 'micro'     ? 'from-terracotta/20 to-orange-50'
      : item.type === 'journal'   ? 'from-earth/20 to-amber-50'
      : 'from-violet-100 to-violet-50'

    return (
      <button
        key={item.id}
        onClick={handleClick}
        className="flex-shrink-0 w-48 rounded-2xl overflow-hidden shadow-md bg-white text-left hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
      >
        {/* Image — ~60% of card height */}
        <div className="h-[128px] relative overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${fallbackGrad}`} />
          )}
          {/* Subtle bottom scrim so text reads cleanly */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          {/* Duration bottom-left */}
          {durationText && (
            <div className="absolute bottom-2 left-2 bg-black/30 backdrop-blur-sm rounded-full px-1.5 py-0.5">
              <span className="text-white text-[8px] font-medium">{durationText}</span>
            </div>
          )}
          {/* Platform badge top-right */}
          {platformLabel && (
            <div className={`absolute top-2 right-2 rounded-full px-1.5 py-0.5 backdrop-blur-sm ${item.platform === 'youtube' ? 'bg-red-500/75' : 'bg-green-600/75'}`}>
              <span className="text-white text-[8px] font-semibold">{platformLabel}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-3 pt-2.5 pb-3">
          <p className="text-earth text-[11px] font-semibold leading-snug line-clamp-2">{item.title}</p>
          {item.subtitle && (
            <p className="text-earth-light/55 text-[9px] mt-0.5 line-clamp-1">{item.subtitle}</p>
          )}
          <p className="text-sage text-[9px] font-semibold mt-2">{cta} →</p>
        </div>
      </button>
    )
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(175deg, #f5ede0 0%, #ede4d4 60%, #e6dccf 100%)' }}>
      {/* ── Top bar ── */}
      <div className="px-6 md:px-10 pt-5 pb-3 flex items-center justify-between">
        <span className="text-[10px] text-earth-light/40 uppercase tracking-[0.18em] font-medium">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </span>
        <div className="flex items-center gap-4">
          {trackingStats.minutesToday > 0 && (
            <span className="text-xs text-earth-light/50">{trackingStats.minutesToday}m today</span>
          )}
          {insights.streakDays >= 2 && (
            <div className="inline-flex items-center gap-1.5 bg-terracotta/10 text-terracotta px-2.5 py-1 rounded-full">
              <Flame className="w-3 h-3" />
              <span className="text-[10px] font-medium">{insights.streakDays}d streak</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Hero — editorial 65/35 asymmetric grid ── */}
      <div className="px-4 md:px-8">
        {/* Outer container: rounded card, crisp shadow */}
        <div
          className="rounded-[24px] overflow-hidden shadow-2xl"
          style={{ height: 'clamp(520px, 58vw, 620px)', background: '#c4b5a5' }}
        >
          {/* 65 / 35 grid — 4px gap shows the warm background as a seam */}
          <div className="grid h-full" style={{ gridTemplateColumns: '65% 35%', gap: '4px' }}>

            {/* ── LEFT PANEL — dominant landscape + UI ── */}
            <div className="relative" style={{ height: '100%', overflow: 'hidden' }}>
              <img
                src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=85"
                alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                loading="eager"
              />

              {/* Overlay scrims — z-index 1 so they sit above the photo but below the UI */}
              <div className="absolute inset-0" style={{
                zIndex: 1,
                background: 'linear-gradient(to right, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.06) 55%, transparent 100%)'
              }} />
              <div className="absolute inset-0" style={{
                zIndex: 1,
                background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 30%, rgba(0,0,0,0.15) 58%, transparent 82%)'
              }} />

              {/* ── Interactive UI block — z-index 2, lower-left, always on top of overlays ── */}
              <div
                className="absolute bottom-0 left-0 p-6"
                style={{ width: '100%', maxWidth: '440px', zIndex: 2 }}
              >
                {/* 1. Greeting */}
                <h1
                  className="text-white font-bold leading-tight"
                  style={{ fontSize: '1.75rem', textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
                >
                  {getGreeting()}, {user?.name || 'Yaara'} 🌿
                </h1>

                {/* 2. Subtitle */}
                <p
                  className="text-white mt-1.5 mb-4"
                  style={{ fontSize: '14px', opacity: 0.8, textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}
                >
                  How are you feeling right now?
                </p>

                {/* 3 & 4. Mood selector + input card */}
                <div
                  style={{
                    background: 'rgba(237,229,218,0.90)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    borderRadius: '26px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
                    border: '1px solid rgba(255,255,255,0.55)',
                    padding: '20px 16px 16px',
                  }}
                >
                  {/* 3. Mood pills */}
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
                    {moodOptions.map((mood) => {
                      const isSelected = selectedMood === mood.id
                      return (
                        <button
                          key={mood.id}
                          onClick={() => handleMoodSelect(mood.id)}
                          style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 4px 10px',
                            borderRadius: '14px',
                            background: isSelected
                              ? 'rgba(255,255,255,0.55)'
                              : 'transparent',
                            border: isSelected
                              ? '1px solid rgba(190,175,158,0.50)'
                              : '1px solid transparent',
                            boxShadow: isSelected
                              ? '0 2px 8px rgba(0,0,0,0.06)'
                              : 'none',
                            cursor: 'pointer',
                            transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <MoodFace id={mood.id} size={46} />
                          <span style={{
                            fontSize: '10.5px',
                            fontWeight: 500,
                            letterSpacing: '0.01em',
                            color: isSelected ? '#5a4a3a' : '#9a8878',
                          }}>
                            {mood.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* 4. Input field — pill-shaped */}
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={checkInText}
                      onChange={(e) => setCheckInText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCheckInSubmit()}
                      placeholder="Or write how you feel..."
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '13px 48px 13px 20px',
                        borderRadius: '100px',
                        border: '1px solid rgba(190,175,158,0.30)',
                        background: 'rgba(248,243,236,0.80)',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)',
                        fontSize: '13.5px',
                        color: '#5a4a3a',
                        outline: 'none',
                        fontFamily: 'inherit',
                      }}
                    />
                    <button
                      onClick={handleCheckInSubmit}
                      disabled={isThinking || (!checkInText.trim() && !selectedMood)}
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        opacity: isThinking || (!checkInText.trim() && !selectedMood) ? 0.25 : 0.55,
                        transition: 'opacity 0.15s',
                      }}
                    >
                      {isThinking
                        ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#7a6858' }} />
                        : <Send className="w-4 h-4" style={{ color: '#7a6858' }} />}
                    </button>
                  </div>

                  {detectedMood && showReply && (
                    <p style={{ fontSize: '9px', color: 'rgba(74,55,40,0.45)', padding: '0 12px 8px' }}>
                      Detected: <strong style={{ textTransform: 'capitalize' }}>{detectedMood}</strong> {getMoodEmoji(detectedMood)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── RIGHT PANEL — single yoga image ── */}
            <div className="relative" style={{ height: '100%', overflow: 'hidden' }}>
              <img
                src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=85"
                alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }}
                loading="lazy"
              />
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 45%)'
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Numa reply (after check-in) ── */}
      {(isThinking || showReply) && (
        <div className="px-6 md:px-10 mt-6">
          <div className="bg-white/65 backdrop-blur-sm rounded-2xl px-5 py-4 border border-sage/10 shadow-sm max-w-xl">
            {isThinking ? (
              <div className="flex items-center gap-2 text-earth-light">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="text-sm italic">Numa is with you...</span>
              </div>
            ) : numaReplyData && (
              <div>
                <p className="text-earth text-[13px] leading-relaxed italic">"{numaReplyData.intro}"</p>
                <p className="text-earth-light/60 text-xs mt-1.5 leading-relaxed">{numaReplyData.explanation}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Top picks (after check-in) ── */}
      {showTopPicks && (
        <div ref={topPicksRef} className="mt-8 animate-fadeSlideUp">
          <div className="px-6 md:px-10 mb-4">
            <p className="text-xl font-semibold text-earth tracking-tight">Just for you</p>
            <p className="text-xs text-earth-light/50 font-light mt-0.5">Based on how you're feeling right now.</p>
          </div>
          <div className="flex gap-4 overflow-x-auto px-6 md:px-10 pb-2 scrollbar-hide">
            {topPicks.filter(i => i.type !== 'info').map(item => renderSmallCard(item))}
          </div>
        </div>
      )}

      {/* ── Intent-based content sections ── */}
      <div className="mt-10 px-6 md:px-10">
        {[
          { title: 'Move your body',  tagline: "Let movement carry what words can't.",    items: sectionMove },
          { title: 'Calm your mind',  tagline: 'Sounds and stillness to soften the noise.', items: sectionCalm },
          { title: 'Reflect',         tagline: 'A few quiet words to yourself.',           items: sectionReflect },
          { title: 'Quick reset',     tagline: "One minute. That's all it takes.",         items: sectionReset },
        ].map(({ title, tagline, items }) =>
          items.length > 0 ? (
            <div key={title} className="mb-10">
              <div className="mb-4">
                <p className="text-xl font-semibold text-earth tracking-tight">{title}</p>
                <p className="text-[12px] text-earth-light/45 font-light mt-0.5">{tagline}</p>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide" style={{ marginLeft: '-4px', paddingLeft: '4px' }}>
                {items.map(item => renderSmallCard(item))}
              </div>
            </div>
          ) : null
        )}
      </div>

      {!todayCheckIn && (
        <div className="px-6 md:px-10 pb-5">
          <button
            onClick={() => navigate('/checkin')}
            className="bg-terracotta hover:bg-terracotta-dark text-cream px-6 py-3 rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            Start Today's Check-in
          </button>
        </div>
      )}

      <MediaPlayerModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedMedia(null) }} media={selectedMedia} onCompleted={refreshStats} />
      <RecipeModal recipe={selectedRecipe} isOpen={recipeModalOpen} onClose={() => { setRecipeModalOpen(false); setSelectedRecipe(null) }} onTrackingUpdate={refreshStats} />

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeSlideUp { animation: fadeSlideUp 0.5s ease-out forwards; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
