import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { getMemory, getInsights } from '../lib/memory'
import NumaAvatar from '../components/NumaAvatar'
import MediaPlayerModal from '../components/MediaPlayerModal'
import SquareActivityCard from '../components/SquareActivityCard'
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
const breathingImg = "/illustrations/breathing-01.png.webp";
const sleepImg = "/illustrations/sleep-01.png.webp";
const yogaImg = "/illustrations/yoga-01.png.webp";

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
  { id: 'happy', emoji: '😊', label: 'Happy' },
  { id: 'sad', emoji: '😢', label: 'Sad' },
  { id: 'stressed', emoji: '😰', label: 'Stressed' },
  { id: 'tired', emoji: '😴', label: 'Tired' },
  { id: 'angry', emoji: '😠', label: 'Angry' }
]

// Recipe Modal Component
function RecipeModal({ recipe, isOpen, onClose, onTrackingUpdate, onActionComplete }) {
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
    if (onActionComplete) onActionComplete()
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
function CompactBreathingCard({ item, onStart, onTrackingUpdate, onActionComplete }) {
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
            if (onActionComplete) onActionComplete()
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
  }, [isActive, timeLeft, pattern, item, onTrackingUpdate, onActionComplete])

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
function CompactMicroCard({ item, onTrackingUpdate, onActionComplete }) {
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
            if (onActionComplete) onActionComplete()
            return 0
          }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [isActive, timeLeft, item, onTrackingUpdate, onActionComplete])

  const handleClick = () => {
    if (isActive) {
      // Mark done early
      clearInterval(intervalRef.current)
      setIsActive(false)
      markCompleted(item.id, ContentType.MICRO, CompletionMethod.VERIFIED, item.title, 60 - timeLeft)
      setCompleted(true)
      if (onTrackingUpdate) onTrackingUpdate()
      if (onActionComplete) onActionComplete()
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
function CompactJournalCard({ item, onTrackingUpdate, onActionComplete }) {
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
      if (onActionComplete) onActionComplete()
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

// Tooltip messages by mood
const TOOLTIP_MESSAGES = {
  stressed: [
    "You're doing great! Taking a moment for yourself is powerful.",
    "Proud of you for choosing to pause and breathe.",
    "Small steps like this make a big difference."
  ],
  sad: [
    "I see you taking care of yourself. That takes courage.",
    "You showed up for yourself today. That matters.",
    "Every small act of self-care counts."
  ],
  tired: [
    "Rest is productive. You're listening to your body.",
    "Good job honoring what you need right now.",
    "You're taking care of yourself. Keep going."
  ],
  angry: [
    "You channeled that energy into something healthy. Well done.",
    "Choosing this was a powerful move. Nice work.",
    "You're handling this with strength."
  ],
  happy: [
    "Love seeing you invest in your wellbeing!",
    "You're building great habits. Keep it up!",
    "That positive energy is contagious!"
  ],
  neutral: [
    "Great job completing that!",
    "You're building consistency. Nice work.",
    "Every action adds up. Keep going!"
  ]
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
  const [tooltipMessage, setTooltipMessage] = useState('')
  const [showTooltip, setShowTooltip] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const tooltipTimeoutRef = useRef(null)

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

  // Re-compute recommendations whenever selectedMood changes
  useEffect(() => {
    const newRecommendations = getRecommendationsForMood(currentMood, detectedSignals)
    setRecommendations(newRecommendations)
  }, [currentMood, detectedSignals])

  const topPicks = getTopPicks(recommendations)
  const moreOptions = recommendations.filter(r => !topPicks.find(tp => tp.id === r.id))

  // Trigger tooltip when action is completed
  const triggerTooltip = useCallback(() => {
    const messages = TOOLTIP_MESSAGES[currentMood] || TOOLTIP_MESSAGES.neutral
    const randomMessage = messages[Math.floor(Math.random() * messages.length)]

    setTooltipMessage(randomMessage)
    setShowTooltip(true)
    setNumaState('awake')

    // Clear any existing timeout
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current)
    }

    // Auto-hide after 2.8 seconds and return to sleeping
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(false)
      setNumaState('sleeping')
    }, 2800)
  }, [currentMood])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current)
      }
    }
  }, [])

  // Action complete callback
  const onActionComplete = useCallback(() => {
    triggerTooltip()
  }, [triggerTooltip])

  const handleMoodSelect = (moodId) => {
    setSelectedMood(moodId)
    setDetectedMood(moodId)
    setDetectedSignals([])
    setShowReply(false)
    setShowTopPicks(false)
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
      case 'breathing': return <CompactBreathingCard key={item.id} item={item} onStart={() => {}} onTrackingUpdate={refreshStats} onActionComplete={onActionComplete} />
      case 'micro': return <CompactMicroCard key={item.id} item={item} onTrackingUpdate={refreshStats} onActionComplete={onActionComplete} />
      case 'journal': return <CompactJournalCard key={item.id} item={item} onTrackingUpdate={refreshStats} onActionComplete={onActionComplete} />
      case 'recipe': return <CompactRecipeCard key={item.id} item={item} onOpen={() => { setSelectedRecipe(item); setRecipeModalOpen(true) }} />
      case 'info': return null // Skip info cards in top picks
      case 'media': default:
        return <CompactMediaCard key={item.id} item={item} onClick={() => handleRecommendationClick(item)} getCategoryColor={getCategoryColor} getCategoryIcon={getCategoryIcon} />
    }
  }

  // Full-size card renderer for grid
  const renderCard = (item) => {
    switch (item.type) {
      case 'breathing': return (
        <div key={item.id} className="bg-white rounded-2xl border border-sand hover:border-sage hover:shadow-lg transition-all hover:scale-[1.02] overflow-hidden">
          <div className="p-4">
            <div className="w-12 h-12 rounded-full bg-sage/20 flex items-center justify-center mb-3">
              <Wind className="w-6 h-6 text-sage" />
            </div>
            <h3 className="text-earth font-medium text-sm mb-1">{item.title}</h3>
            <p className="text-earth-light text-xs mb-3">{item.subtitle}</p>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-earth-light flex items-center gap-1">
                <Timer className="w-3 h-3" /> {item.duration}s
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sage/10 text-sage">Breathing</span>
            </div>
            <CompactBreathingCard item={item} onStart={() => {}} onTrackingUpdate={refreshStats} onActionComplete={onActionComplete} />
          </div>
        </div>
      )
      case 'micro': return (
        <div key={item.id} className="bg-white rounded-2xl border border-sand hover:border-sage hover:shadow-lg transition-all hover:scale-[1.02] overflow-hidden">
          <div className="p-4">
            <div className="w-12 h-12 rounded-full bg-terracotta/20 flex items-center justify-center mb-3">
              <Zap className="w-6 h-6 text-terracotta" />
            </div>
            <h3 className="text-earth font-medium text-sm mb-1">{item.title}</h3>
            <p className="text-earth-light text-xs line-clamp-2 mb-3">{item.instruction}</p>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-earth-light flex items-center gap-1">
                <Timer className="w-3 h-3" /> {item.duration}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-terracotta/10 text-terracotta">Micro Action</span>
            </div>
            <CompactMicroCard item={item} onTrackingUpdate={refreshStats} onActionComplete={onActionComplete} />
          </div>
        </div>
      )
      case 'journal': return (
        <div key={item.id} className="bg-white rounded-2xl border border-sand hover:border-sage hover:shadow-lg transition-all hover:scale-[1.02] overflow-hidden">
          <div className="p-4">
            <div className="w-12 h-12 rounded-full bg-earth/20 flex items-center justify-center mb-3">
              <PenLine className="w-6 h-6 text-earth" />
            </div>
            <h3 className="text-earth font-medium text-sm mb-1">{item.title}</h3>
            <p className="text-earth-light text-xs italic line-clamp-2 mb-3">"{item.prompt}"</p>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-earth/10 text-earth">Journal</span>
            </div>
            <CompactJournalCard item={item} onTrackingUpdate={refreshStats} onActionComplete={onActionComplete} />
          </div>
        </div>
      )
      case 'info': return null
      case 'recipe': return (
        <div key={item.id} className="bg-white rounded-2xl border border-sand hover:border-sage hover:shadow-lg transition-all hover:scale-[1.02] overflow-hidden">
          <div className="p-4">
            <div className="w-12 h-12 rounded-full bg-terracotta/20 flex items-center justify-center mb-3">
              <UtensilsCrossed className="w-6 h-6 text-terracotta" />
            </div>
            <h3 className="text-earth font-medium text-sm mb-1">{item.title}</h3>
            <p className="text-earth-light text-xs line-clamp-1 mb-3">{item.subtitle}</p>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-terracotta/10 text-terracotta">Recipe</span>
            </div>
            <button onClick={() => { setSelectedRecipe(item); setRecipeModalOpen(true) }} className="w-full py-2 px-3 text-xs font-medium rounded-lg bg-terracotta/10 text-terracotta hover:bg-terracotta/20 transition-colors">
              View Recipe
            </button>
          </div>
        </div>
      )
      case 'media': default:
        return (
          <div key={item.id} className="bg-white rounded-2xl border border-sand hover:border-sage hover:shadow-lg transition-all hover:scale-[1.02] overflow-hidden">
            <div className="p-4">
              <div className={`w-12 h-12 rounded-full ${getCategoryColor(item.category)} flex items-center justify-center mb-3`}>
                {getCategoryIcon(item.category)}
              </div>
              <h3 className="text-earth font-medium text-sm line-clamp-1 mb-1">{item.title}</h3>
              <p className="text-earth-light text-xs line-clamp-1 mb-3">{item.subtitle}</p>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-earth-light flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {item.duration}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.platform === 'youtube' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  {item.platform === 'youtube' ? 'YouTube' : 'Spotify'}
                </span>
              </div>
              <button onClick={() => handleRecommendationClick(item)} className={`w-full py-2 px-3 text-xs font-medium rounded-lg transition-colors ${item.platform === 'youtube' ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}>
                {item.platform === 'youtube' ? 'Play Video' : 'Listen Now'}
              </button>
            </div>
          </div>
        )
    }
  }

  // Helper to resolve asset paths with Vite base URL
  const withBase = (p) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`

  return (
    <div className="min-h-screen bg-cream flex flex-col pb-20">
      <div className="max-w-5xl mx-auto w-full px-4 md:px-8 py-6 space-y-6">
        {/* Header */}
        <div>
          <p className="text-earth-light text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <h1 className="text-3xl font-semibold text-earth mt-1">{getGreeting()}, {user?.name}</h1>
          {insights.streakDays >= 2 && (
            <div className="inline-flex items-center gap-1.5 mt-2 bg-terracotta/10 text-terracotta px-3 py-1.5 rounded-full">
              <Flame className="w-4 h-4" /><span className="text-sm font-medium">{insights.streakDays} day streak!</span>
            </div>
          )}
        </div>

        {/* Numa Avatar */}
        <div className="flex justify-center relative">
          <NumaAvatar mood={currentMood} state={numaState} size={80} />
          {showTooltip && (
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-sage text-cream px-4 py-2 rounded-xl shadow-lg animate-fadeSlideUp whitespace-nowrap text-sm font-medium z-10">
              {tooltipMessage}
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-sage"></div>
            </div>
          )}
        </div>

        {/* Numa's Enhanced Reply */}
        {(isThinking || showReply) && (
          <div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-sage/20 shadow-sm">
            {isThinking ? (
              <div className="flex items-center gap-2 text-earth-light"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Numa is thinking...</span></div>
            ) : numaReplyData && (
              <div>
                <p className="text-earth text-sm leading-relaxed">{numaReplyData.intro}</p>
                <p className="text-earth-light text-sm mt-2">{numaReplyData.explanation}</p>
                <ul className="mt-3 space-y-1">
                  {numaReplyData.topPicks.map((pick, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-sage">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{pick.title}</span>
                    </li>
                  ))}
                </ul>
                {detectedSignals.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {detectedSignals.map(signal => (
                      <span key={signal} className="text-[10px] bg-sage/10 text-sage px-2 py-0.5 rounded-full">{signal}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        )}

        {/* Top Picks Section - Compact, scannable */}
        {showTopPicks && (
          <div ref={topPicksRef} className="animate-fadeSlideUp">
            <div className="flex items-center gap-1.5 mb-2">
              <Star className="w-4 h-4 text-sage/70" />
              <h2 className="text-sm font-medium text-earth-light">Top picks for you</h2>
            </div>
            <div className="space-y-2">
              {topPicks.map(item => renderCompactCard(item))}
            </div>
          </div>
        )}

        {/* Check-in Section */}
        <div>
          <h2 className="text-sm font-medium text-earth-light mb-3">How are you feeling?</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {moodOptions.map((mood) => (
              <button key={mood.id} onClick={() => handleMoodSelect(mood.id)} className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-full transition-all ${selectedMood === mood.id ? 'bg-sage text-cream shadow-md scale-105' : 'bg-cream-dark border border-sand hover:border-sage text-earth'}`}>
                <span>{mood.emoji}</span><span>{mood.label}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <input type="text" value={checkInText} onChange={(e) => setCheckInText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheckInSubmit()} placeholder="Tell Numa how you're feeling..." className="flex-1 h-12 bg-cream-dark border border-sand rounded-xl px-4 text-earth placeholder:text-earth-light/50 focus:outline-none focus:border-sage transition-colors" />
            <button onClick={handleCheckInSubmit} disabled={isThinking || (!checkInText.trim() && !selectedMood)} className="h-12 w-12 bg-sage hover:bg-sage-dark disabled:bg-sand disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
              {isThinking ? <Loader2 className="w-5 h-5 text-cream animate-spin" /> : <Send className="w-5 h-5 text-cream" />}
            </button>
          </div>
          {detectedMood && showReply && <p className="text-xs text-earth-light mt-2">Detected: <span className="font-medium capitalize">{detectedMood}</span> {getMoodEmoji(detectedMood)}</p>}
        </div>

        {/* Recommended for You */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-earth">Recommended for You <span className="text-xs bg-sage/10 text-sage px-2 py-1 rounded-full capitalize ml-2">{getMoodEmoji(currentMood)} {currentMood}</span></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(showTopPicks ? moreOptions : recommendations).map(item => renderCard(item))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-medium text-earth-light mb-3">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <button key={action.id} onClick={() => handleQuickAction(action.id)} className="flex flex-col items-center p-4 bg-cream-dark rounded-2xl border border-sand hover:border-sage transition-colors">
                  <div className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center mb-2`}><Icon className="w-6 h-6 text-cream" /></div>
                  <span className="text-earth text-sm font-medium">{action.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Featured for you */}
        <div className="mb-8">
          <h2 className="text-sm font-medium text-earth mb-3">Featured for you</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:-mx-8 md:px-8 scrollbar-hide">
            <SquareActivityCard
              title="Calm Breathing"
              subtitle="5-minute guided breathing exercise for instant calm"
              duration="5 min"
              platform="in-app"
              illustration={breathingImg}
              onClick={() => {
                const breathingItem = recommendations.find(r => r.type === 'breathing')
                if (breathingItem) handleRecommendationClick(breathingItem)
              }}
            />
            <SquareActivityCard
              title="Deep Sleep Meditation"
              subtitle="Fall asleep faster with this calming meditation"
              duration="20 min"
              platform="youtube"
              illustration={sleepImg}
              onClick={() => {
                const mediaItem = recommendations.find(r => r.type === 'media' && r.category === 'meditation')
                if (mediaItem) handleRecommendationClick(mediaItem)
              }}
            />
            <SquareActivityCard
              title="Morning Yoga Flow"
              subtitle="Gentle stretches to start your day with energy"
              duration="15 min"
              platform="spotify"
              illustration={yogaImg}
              onClick={() => {
                const yogaItem = recommendations.find(r => r.type === 'media' && r.category === 'yoga')
                if (yogaItem) handleRecommendationClick(yogaItem)
              }}
            />
          </div>
        </div>

        {/* Today's Progress Stats */}
        <div>
          <h2 className="text-sm font-medium text-earth-light mb-3">Today's Progress</h2>
          <div className="grid grid-cols-3 gap-3">
          <div className="bg-cream-dark rounded-2xl p-4 border border-sand text-center">
            <Award className="w-5 h-5 text-sage mx-auto mb-2" />
            <p className="text-2xl font-semibold text-earth">{trackingStats.completedToday}</p>
            <p className="text-xs text-earth-light mt-1">Completed</p>
            {trackingStats.completedToday > 0 && (
              <p className="text-[10px] text-sage mt-0.5">
                {trackingStats.verifiedToday} verified • {trackingStats.estimatedToday} est.
              </p>
            )}
          </div>
          <div className="bg-cream-dark rounded-2xl p-4 border border-sand text-center">
            <Clock className="w-5 h-5 text-terracotta mx-auto mb-2" />
            <p className="text-2xl font-semibold text-earth">{trackingStats.minutesToday}</p>
            <p className="text-xs text-earth-light mt-1">Minutes</p>
          </div>
          <div className="bg-cream-dark rounded-2xl p-4 border border-sand text-center">
            <Flame className="w-5 h-5 text-earth mx-auto mb-2" />
            <p className="text-2xl font-semibold text-earth">{trackingStats.streak}</p>
            <p className="text-xs text-earth-light mt-1">Day streak</p>
          </div>
          </div>
        </div>

        {/* Recent Activity from Tracking */}
        <div>
          <h2 className="text-sm font-medium text-earth-light mb-3">Recent Activity</h2>
        {trackingStats.recentActivity.length > 0 ? (
          <div className="space-y-2">
            {trackingStats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 bg-cream-dark rounded-xl p-3 border border-sand">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === ContentType.BREATHING ? 'bg-sage/20' :
                  activity.type === ContentType.MICRO ? 'bg-terracotta/20' :
                  activity.type === ContentType.JOURNAL ? 'bg-earth/20' :
                  activity.type === ContentType.RECIPE ? 'bg-terracotta/20' :
                  activity.type === ContentType.YOUTUBE ? 'bg-red-100' :
                  activity.type === ContentType.SPOTIFY ? 'bg-green-100' : 'bg-sage/20'
                }`}>
                  {activity.type === ContentType.BREATHING && <Wind className="w-5 h-5 text-sage" />}
                  {activity.type === ContentType.MICRO && <Zap className="w-5 h-5 text-terracotta" />}
                  {activity.type === ContentType.JOURNAL && <PenLine className="w-5 h-5 text-earth" />}
                  {activity.type === ContentType.RECIPE && <UtensilsCrossed className="w-5 h-5 text-terracotta" />}
                  {activity.type === ContentType.YOUTUBE && <Play className="w-5 h-5 text-red-500" />}
                  {activity.type === ContentType.SPOTIFY && <Music className="w-5 h-5 text-green-600" />}
                  {!activity.type && <Activity className="w-5 h-5 text-sage" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-earth text-sm font-medium truncate">{activity.title || activity.type}</p>
                  <p className="text-earth-light text-xs flex items-center gap-1">
                    {activity.method === CompletionMethod.VERIFIED ? (
                      <><CheckCircle2 className="w-3 h-3 text-sage" /> Verified</>
                    ) : (
                      <><Clock className="w-3 h-3 text-earth-light" /> Estimated</>
                    )}
                  </p>
                </div>
                <span className="text-earth-light text-xs flex-shrink-0">{activity.timeFormatted}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-cream-dark rounded-xl p-6 border border-sand text-center">
            <Activity className="w-8 h-8 text-earth-light/50 mx-auto mb-2" />
            <p className="text-earth-light text-sm">No activities yet today</p>
            <p className="text-earth-light/70 text-xs mt-1">Complete a breathing exercise or watch a video to start tracking</p>
          </div>
          )}
        </div>

        {/* CTA */}
        {!todayCheckIn && (
          <div>
            <button onClick={() => navigate('/checkin')} className="w-full bg-terracotta hover:bg-terracotta-dark text-cream py-4 rounded-2xl font-medium transition-colors">Start Today's Check-in</button>
          </div>
        )}
      </div>

      <MediaPlayerModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedMedia(null) }} media={selectedMedia} onCompleted={refreshStats} />
      <RecipeModal recipe={selectedRecipe} isOpen={recipeModalOpen} onClose={() => { setRecipeModalOpen(false); setSelectedRecipe(null) }} onTrackingUpdate={refreshStats} onActionComplete={onActionComplete} />

      {/* Animation styles */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeSlideUp {
          animation: fadeSlideUp 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
