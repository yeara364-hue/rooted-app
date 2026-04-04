import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { getMemory, getInsights } from '../lib/memory'
import { useExternalContent, mergeSection } from '../lib/useExternalContent'
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
// Types: media | micro | breathing | journal | info | movement | lifestyle | cognitive | audio | wildcard | recipe
const moodContent = {
  stressed: {
    media: [
      { id: 's1', type: 'media', category: 'meditation', title: 'Anxiety Relief Meditation', subtitle: 'Guided breathing for calm', duration: '10 min', platform: 'youtube', youtubeVideoId: 'O-6f5wQXSu8', signal: 'panic', relevanceBase: 10 },
      { id: 's2', type: 'media', category: 'music', title: 'Stress Relief Playlist', subtitle: 'Calming ambient sounds', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DWXe9gFZP0gtP', signal: 'work', relevanceBase: 8 },
      { id: 's3', type: 'media', category: 'yoga', title: 'Gentle Stress Relief Yoga', subtitle: 'Release tension in body', duration: '20 min', platform: 'youtube', youtubeVideoId: 'hJbRpHZr_d0', signal: 'body', relevanceBase: 9 },
    ],
    microActions: [
      { id: 's4', type: 'micro', title: 'Shoulder Roll Release', subtitle: 'Release neck tension now', duration: '60 sec', instruction: 'Roll shoulders slowly backward 5 times, then forward 5 times. Drop shoulders away from ears.', signal: 'headache', relevanceBase: 7 },
      { id: 's5', type: 'micro', title: 'Grounding 5-4-3-2-1', subtitle: 'Anchor to the present', duration: '90 sec', instruction: 'Name 5 things you see, 4 you hear, 3 you feel, 2 you smell, 1 you taste.', signal: 'panic', relevanceBase: 9 },
    ],
    journal: { id: 's6', type: 'journal', title: 'Stress Brain Dump', prompt: 'Write everything stressing you out without filtering. Then circle the ONE thing you can control right now.', signal: 'work', relevanceBase: 6 },
    breathing: { id: 's7', type: 'breathing', title: 'Box Breathing', subtitle: '4-4-4-4 calming pattern', duration: 60, pattern: { inhale: 4, hold1: 4, exhale: 4, hold2: 4 }, signal: 'panic', relevanceBase: 10 },
    whyHelps: { id: 's8', type: 'info', title: 'Why This Helps', content: 'Slow breathing activates your parasympathetic nervous system, signaling safety to your brain and reducing cortisol.', signal: 'focus', relevanceBase: 4 },
    movement: [
      { id: 'smv1', type: 'movement', title: 'Neck & Shoulder Release', subtitle: 'Melt tension in 3 min', duration: '3 min', instruction: 'Tilt head slowly to each side (hold 5s). Roll shoulders backward 5×. Interlace fingers and stretch arms overhead.', signal: 'headache', relevanceBase: 8 },
      { id: 'smv2', type: 'movement', title: 'Full-Body Shake Out', subtitle: 'Discharge nervous energy', duration: '2 min', instruction: 'Stand up. Shake your hands, then arms, then legs, then whole body for 30 seconds. Stop. Breathe. Notice.', signal: 'panic', relevanceBase: 7 },
    ],
    lifestyle: [
      { id: 'sls1', type: 'lifestyle', title: 'Step Outside for 5 Min', subtitle: 'Reset your environment', duration: '5 min', instruction: 'Leave your phone behind. Walk outside or stand by a window. Look far into the distance. Breathe fresh air slowly.', signal: 'work', relevanceBase: 8 },
      { id: 'sls2', type: 'lifestyle', title: 'Make a Hot Drink Slowly', subtitle: 'A mindful pause ritual', duration: '5 min', instruction: 'Prepare tea or coffee with full attention — no phone, no multitasking. Focus on the warmth, the smell, the ritual.', signal: 'work', relevanceBase: 6 },
    ],
    cognitive: [
      { id: 'scg1', type: 'cognitive', title: "What's In My Control?", subtitle: 'Separate facts from fear', duration: '3 min', prompt: 'Draw two columns: "In my control" vs "Not in my control." Place every stressor. Only act on the left column.', signal: 'work', relevanceBase: 8 },
      { id: 'scg2', type: 'cognitive', title: 'The Worry Download', subtitle: 'Empty the mental noise', duration: '3 min', prompt: 'Write every worry fast, no filtering. When done, fold the paper away. Your brain has offloaded. Now breathe.', signal: 'panic', relevanceBase: 7 },
    ],
    audio: [
      { id: 'sau1', type: 'audio', title: 'Forest Rain Soundscape', subtitle: 'Nature sounds for deep calm', duration: '∞', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX4PP3DA4J0N8', signal: 'panic', relevanceBase: 7 },
    ],
    wildcard: [
      { id: 'swc1', type: 'wildcard', title: 'Cold Water Face Splash', subtitle: 'Activate the dive reflex', duration: '30 sec', instruction: 'Splash cold water on your face 3 times, or hold a cold cloth to your forehead for 30s. Rapidly calms heart rate.', signal: 'panic', relevanceBase: 8 },
    ],
  },
  sad: {
    media: [
      { id: 'sd1', type: 'media', category: 'meditation', title: 'Self-Compassion Meditation', subtitle: 'Kindness for difficult times', duration: '15 min', platform: 'youtube', youtubeVideoId: 'IeblJdB2-Vo', signal: 'lonely', relevanceBase: 10 },
      { id: 'sd2', type: 'media', category: 'music', title: 'Comfort & Healing', subtitle: 'Gentle, uplifting tracks', duration: '1+ hour', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX3YSRoSdA634', signal: 'breakup', relevanceBase: 9 },
      { id: 'sd3', type: 'media', category: 'movement', title: 'Mood-Lifting Walk', subtitle: 'Gentle movement meditation', duration: '10 min', platform: 'youtube', youtubeVideoId: 'inpok4MKVLM', signal: 'body', relevanceBase: 8 },
    ],
    microActions: [
      { id: 'sd4', type: 'micro', title: 'Warm Cup Ritual', subtitle: 'Comfort in small moments', duration: '90 sec', instruction: "Make a warm drink. Hold the cup with both hands. Feel the warmth. Take 3 slow sips.", signal: 'lonely', relevanceBase: 8 },
      { id: 'sd5', type: 'micro', title: 'Hand on Heart', subtitle: 'Self-soothing touch', duration: '60 sec', instruction: "Place hand on heart. Feel your heartbeat. Say 'I'm here for you' to yourself 3 times.", signal: 'breakup', relevanceBase: 9 },
    ],
    journal: { id: 'sd6', type: 'journal', title: 'Letter to Yourself', prompt: 'Write a short letter to yourself as if you were comforting a dear friend going through this.', signal: 'lonely', relevanceBase: 7 },
    breathing: { id: 'sd7', type: 'breathing', title: 'Soothing Breath', subtitle: 'Longer exhale for calm', duration: 60, pattern: { inhale: 4, hold1: 2, exhale: 6, hold2: 0 }, signal: 'sleep', relevanceBase: 8 },
    whyHelps: { id: 'sd8', type: 'info', title: 'Why This Helps', content: 'Self-compassion practices activate the same brain regions as receiving comfort from others, releasing oxytocin.', signal: 'social', relevanceBase: 4 },
    movement: [
      { id: 'sdmv1', type: 'movement', title: 'Gentle Heart Openers', subtitle: 'Soften the heaviness', duration: '5 min', instruction: 'Clasp hands behind back, gently open chest to the sky. Hold 30s. Try a soft backbend. Move slowly with your breath.', signal: 'breakup', relevanceBase: 7 },
      { id: 'sdmv2', type: 'movement', title: 'Slow Walk, No Destination', subtitle: 'Move without purpose', duration: '10 min', instruction: 'Walk slowly outside — no headphones, no goal. Notice the ground underfoot, the sky above. Let your body lead.', signal: 'lonely', relevanceBase: 8 },
    ],
    lifestyle: [
      { id: 'sdls1', type: 'lifestyle', title: 'Reach Out to One Person', subtitle: 'Connection matters most', duration: '2 min', instruction: "Text or call someone you trust. You don't have to explain everything. 'Thinking of you' is enough to start.", signal: 'lonely', relevanceBase: 9 },
      { id: 'sdls2', type: 'lifestyle', title: 'Tidy One Small Thing', subtitle: 'Reclaim a little order', duration: '3 min', instruction: 'Choose the smallest, most manageable task — make your bed, clear one surface. Small acts of agency restore power.', signal: 'work', relevanceBase: 6 },
    ],
    cognitive: [
      { id: 'sdcg1', type: 'cognitive', title: 'What Would I Tell a Friend?', subtitle: 'Compassionate reframe', duration: '3 min', prompt: "If your closest friend felt exactly like you do now, what would you tell them? Write it. Then read it to yourself.", signal: 'lonely', relevanceBase: 9 },
      { id: 'sdcg2', type: 'cognitive', title: 'Three Small Wins', subtitle: 'Find light in today', duration: '2 min', prompt: 'Name 3 things — however tiny — that you did or experienced today. Getting out of bed counts. Eating counts. You count.', signal: 'motivation', relevanceBase: 7 },
    ],
    audio: [
      { id: 'sdau1', type: 'audio', title: 'Healing Frequencies', subtitle: '432Hz ambient calm', duration: '∞', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX2FebmnYH5MQ', signal: 'sleep', relevanceBase: 7 },
    ],
    wildcard: [
      { id: 'sdwc1', type: 'wildcard', title: 'Hold Something Warm & Soft', subtitle: 'Sensory self-soothing', duration: '2 min', instruction: "Find something warm or soft — a blanket, a pet, a pillow. Hold it. Slow your breathing. You're allowed to be comforted.", signal: 'lonely', relevanceBase: 7 },
    ],
  },
  tired: {
    media: [
      { id: 't1', type: 'media', category: 'meditation', title: 'Body Scan for Rest', subtitle: 'Release and restore', duration: '15 min', platform: 'youtube', youtubeVideoId: 'T0nuKuHmMmc', signal: 'sleep', relevanceBase: 10 },
      { id: 't2', type: 'media', category: 'music', title: 'Sleep & Relax', subtitle: 'Soothing soundscapes', duration: '3+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DWZd79rJ6a7lp', signal: 'sleep', relevanceBase: 9 },
      { id: 't3', type: 'media', category: 'yoga', title: 'Bedtime Yoga', subtitle: 'Gentle wind-down', duration: '12 min', platform: 'youtube', youtubeVideoId: 'BiWDsfZ3zbo', signal: 'body', relevanceBase: 8 },
    ],
    microActions: [
      { id: 't4', type: 'micro', title: 'Eye Palming', subtitle: 'Rest tired eyes', duration: '60 sec', instruction: 'Rub hands together until warm. Cup over closed eyes. Breathe deeply in the darkness.', signal: 'headache', relevanceBase: 7 },
      { id: 't5', type: 'micro', title: 'Legs Up the Wall', subtitle: 'Instant energy reset', duration: '90 sec', instruction: 'Lie down, put legs up against a wall. Let blood flow reverse. Breathe slowly.', signal: 'body', relevanceBase: 8 },
    ],
    journal: { id: 't6', type: 'journal', title: 'Energy Audit', prompt: 'List 3 things that drained you today. List 1 thing that gave you energy. How can you get more of the latter?', signal: 'work', relevanceBase: 5 },
    breathing: { id: 't7', type: 'breathing', title: 'Sleep Breathing', subtitle: '4-7-8 relaxation', duration: 60, pattern: { inhale: 4, hold1: 7, exhale: 8, hold2: 0 }, signal: 'sleep', relevanceBase: 10 },
    whyHelps: { id: 't8', type: 'info', title: 'Why This Helps', content: 'The 4-7-8 breath acts as a natural tranquilizer for the nervous system, helping prepare body for sleep.', signal: 'focus', relevanceBase: 4 },
    movement: [
      { id: 'tmv1', type: 'movement', title: 'Desk Stretch Reset', subtitle: 'Release without leaving your seat', duration: '3 min', instruction: 'Roll neck side to side, stretch arms overhead, twist torso left and right. Stand and fold forward 30s.', signal: 'body', relevanceBase: 8 },
      { id: 'tmv2', type: 'movement', title: 'Cat-Cow Spine Flow', subtitle: 'Wake up the spine gently', duration: '2 min', instruction: 'On hands and knees, arch and round your back in sync with breath. 10 slow rounds. Let your spine breathe.', signal: 'body', relevanceBase: 7 },
    ],
    lifestyle: [
      { id: 'tls1', type: 'lifestyle', title: 'Dim the Lights', subtitle: 'Signal rest to your brain', duration: '1 min', instruction: 'Switch off bright overheads, use a lamp or candle. Your nervous system is wired to respond to light — softer light = calmer brain.', signal: 'sleep', relevanceBase: 7 },
      { id: 'tls2', type: 'lifestyle', title: 'Drink a Full Glass of Water', subtitle: 'Fatigue is often dehydration', duration: '1 min', instruction: 'Drink a full glass slowly. Many midday crashes are caused by mild dehydration, not true tiredness.', signal: 'body', relevanceBase: 6 },
    ],
    cognitive: [
      { id: 'tcg1', type: 'cognitive', title: 'Permission to Rest', subtitle: 'Let yourself stop', duration: '2 min', prompt: 'Write: "I give myself permission to rest right now because..." Finish the sentence 3 ways. You are allowed to pause.', signal: 'work', relevanceBase: 8 },
      { id: 'tcg2', type: 'cognitive', title: 'What Does My Body Need?', subtitle: 'Listen inward', duration: '2 min', prompt: 'Check in: Am I hungry? Thirsty? Tense? Overstimulated? Write one honest answer. Then take one small action in response.', signal: 'body', relevanceBase: 7 },
    ],
    audio: [
      { id: 'tau1', type: 'audio', title: 'Delta Wave Sleep Sounds', subtitle: 'Deep rest frequencies', duration: '∞', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX2FebmnYH5MQ', signal: 'sleep', relevanceBase: 9 },
    ],
    wildcard: [
      { id: 'twc1', type: 'wildcard', title: '20-Minute Power Nap', subtitle: 'The most effective rest reset', duration: '20 min', instruction: "Set a timer for 20 minutes. Lie down in a dark space. You don't need to fall asleep — horizontal stillness alone restores.", signal: 'sleep', relevanceBase: 9 },
    ],
  },
  angry: {
    media: [
      { id: 'a1', type: 'media', category: 'meditation', title: 'Letting Go Meditation', subtitle: 'Release frustration', duration: '12 min', platform: 'youtube', youtubeVideoId: 'q0dM0wGZPfg', signal: 'work', relevanceBase: 9 },
      { id: 'a2', type: 'media', category: 'music', title: 'Release & Unwind', subtitle: 'Process emotions through sound', duration: '1+ hour', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX3Ogo9pFvBkY', signal: 'social', relevanceBase: 8 },
      { id: 'a3', type: 'media', category: 'yoga', title: 'Yoga for Frustration', subtitle: 'Move through it', duration: '18 min', platform: 'youtube', youtubeVideoId: 'Nw2oBIrxy_Q', signal: 'body', relevanceBase: 9 },
    ],
    microActions: [
      { id: 'a4', type: 'micro', title: 'Ice Cube Hold', subtitle: 'Redirect intense feelings', duration: '60 sec', instruction: 'Hold an ice cube in your hand. Focus entirely on the sensation until it melts or feelings shift.', signal: 'panic', relevanceBase: 8 },
      { id: 'a5', type: 'micro', title: 'Power Pose', subtitle: 'Channel the energy', duration: '90 sec', instruction: 'Stand tall, hands on hips, feet wide. Hold for 90 seconds while breathing deeply.', signal: 'motivation', relevanceBase: 7 },
    ],
    journal: { id: 'a6', type: 'journal', title: 'Anger Letter', prompt: "Write an uncensored letter to whoever/whatever made you angry. Don't send it. Then write what you actually need.", signal: 'work', relevanceBase: 8 },
    breathing: { id: 'a7', type: 'breathing', title: 'Cooling Breath', subtitle: 'Lower your temperature', duration: 60, pattern: { inhale: 4, hold1: 0, exhale: 8, hold2: 2 }, signal: 'panic', relevanceBase: 10 },
    whyHelps: { id: 'a8', type: 'info', title: 'Why This Helps', content: "Physical sensations like cold interrupt anger's momentum by engaging different neural pathways.", signal: 'focus', relevanceBase: 4 },
    movement: [
      { id: 'amv1', type: 'movement', title: 'Stomp Walk', subtitle: 'Ground the energy physically', duration: '5 min', instruction: 'Walk briskly and stomp each foot intentionally. Let your arms swing. Breathe loudly through your nose. Move the energy through you.', signal: 'panic', relevanceBase: 9 },
      { id: 'amv2', type: 'movement', title: 'Pillow Press Release', subtitle: 'Safe physical expression', duration: '2 min', instruction: 'Find a pillow. Press it firmly into the bed 10 times with full breath — or yell into it once. Physical release, no harm.', signal: 'social', relevanceBase: 8 },
    ],
    lifestyle: [
      { id: 'als1', type: 'lifestyle', title: 'Walk Alone for 10 Min', subtitle: 'Space changes your state', duration: '10 min', instruction: 'Leave the situation physically. Walk without a destination. Solitude + movement is one of the fastest anger regulators.', signal: 'social', relevanceBase: 9 },
      { id: 'als2', type: 'lifestyle', title: 'Write & Tear Up', subtitle: 'Full release without harm', duration: '3 min', instruction: "Write everything you feel. Don't censor. Then tear it up. The physical act of destruction completes the emotional cycle.", signal: 'work', relevanceBase: 7 },
    ],
    cognitive: [
      { id: 'acg1', type: 'cognitive', title: "What's This Really About?", subtitle: 'Find the root emotion', duration: '3 min', prompt: 'Anger is often secondary. Ask: what am I actually feeling underneath this — fear? hurt? disrespect? Write the honest answer.', signal: 'social', relevanceBase: 8 },
      { id: 'acg2', type: 'cognitive', title: 'The 24-Hour Test', subtitle: 'Scale the importance', duration: '2 min', prompt: 'Will this matter in 24 hours? A week? A year? Write your honest answer. Does your current reaction match the actual scale?', signal: 'work', relevanceBase: 9 },
    ],
    audio: [
      { id: 'aau1', type: 'audio', title: 'Thunderstorm & Rain', subtitle: 'Match then release the intensity', duration: '∞', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX4sWSpwq3LiO', signal: 'panic', relevanceBase: 7 },
    ],
    wildcard: [
      { id: 'awc1', type: 'wildcard', title: 'Cold Water on Wrists', subtitle: 'Instant nervous system reset', duration: '30 sec', instruction: 'Run cold water over your inner wrists for 30 seconds. Pulse points cool blood quickly, lowering heart rate and emotional intensity.', signal: 'panic', relevanceBase: 9 },
    ],
  },
  happy: {
    media: [
      { id: 'h1', type: 'media', category: 'meditation', title: 'Gratitude Meditation', subtitle: 'Amplify your joy', duration: '10 min', platform: 'youtube', youtubeVideoId: 'Lxprri_H9Is', signal: 'motivation', relevanceBase: 9 },
      { id: 'h2', type: 'media', category: 'music', title: 'Happy Hits', subtitle: 'Feel-good favorites', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DXdPec7aLTmlC', signal: 'social', relevanceBase: 10 },
      { id: 'h3', type: 'media', category: 'yoga', title: 'Joyful Morning Flow', subtitle: 'Celebrate your body', duration: '20 min', platform: 'youtube', youtubeVideoId: 'sTANio_2E0Q', signal: 'body', relevanceBase: 8 },
    ],
    microActions: [
      { id: 'h4', type: 'micro', title: 'Joy List', subtitle: 'Capture this feeling', duration: '60 sec', instruction: 'Write down 3 things making you happy right now. Save this list for harder days.', signal: 'motivation', relevanceBase: 9 },
      { id: 'h5', type: 'micro', title: 'Share the Joy', subtitle: 'Spread positive energy', duration: '90 sec', instruction: 'Text someone you appreciate. Just one sentence about why they matter to you.', signal: 'social', relevanceBase: 8 },
    ],
    journal: { id: 'h6', type: 'journal', title: 'Peak Moment Capture', prompt: 'Describe this good feeling in detail. What led to it? How can you create more moments like this?', signal: 'motivation', relevanceBase: 7 },
    breathing: { id: 'h7', type: 'breathing', title: 'Energizing Breath', subtitle: 'Amplify good vibes', duration: 60, pattern: { inhale: 4, hold1: 4, exhale: 4, hold2: 0 }, signal: 'focus', relevanceBase: 6 },
    whyHelps: { id: 'h8', type: 'info', title: 'Why This Helps', content: 'Savoring positive moments strengthens neural pathways for happiness, making joy more accessible over time.', signal: 'focus', relevanceBase: 4 },
    movement: [
      { id: 'hmv1', type: 'movement', title: 'Dance Break', subtitle: 'Express joy through your body', duration: '3 min', instruction: "Play a song you love and move freely for the full song. No rules. Let your body express what words can't.", signal: 'social', relevanceBase: 9 },
      { id: 'hmv2', type: 'movement', title: 'Victory Stretch', subtitle: 'Own your energy', duration: '2 min', instruction: 'Stand wide. Arms overhead in a V. Hold 30s. Walk tall. Let your body celebrate.', signal: 'motivation', relevanceBase: 7 },
    ],
    lifestyle: [
      { id: 'hls1', type: 'lifestyle', title: 'Do Something for Someone', subtitle: 'Joy multiplies when shared', duration: '5 min', instruction: 'Use this good energy for a small act of kindness — a note, a favor, a check-in. Happy states are naturally more generous.', signal: 'social', relevanceBase: 8 },
      { id: 'hls2', type: 'lifestyle', title: 'Write a Gratitude Note', subtitle: 'Express it while you feel it', duration: '3 min', instruction: "Write a short note to someone who helped you — and send it. You'll feel even better. So will they.", signal: 'social', relevanceBase: 8 },
    ],
    cognitive: [
      { id: 'hcg1', type: 'cognitive', title: 'Savoring Practice', subtitle: 'Slow down and absorb this', duration: '3 min', prompt: 'Describe this good feeling as richly as possible. What does it feel like in your body? What thoughts come with it? Sit with it fully.', signal: 'motivation', relevanceBase: 9 },
      { id: 'hcg2', type: 'cognitive', title: 'What Made This Possible?', subtitle: 'Map your own happiness', duration: '3 min', prompt: 'What actions, choices, or circumstances led to this feeling? Write them. This is your personal map to more joy.', signal: 'motivation', relevanceBase: 7 },
    ],
    audio: [
      { id: 'hau1', type: 'audio', title: 'Uplifting Acoustic', subtitle: 'Gentle celebration soundtrack', duration: '∞', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX1s9knjP51Oa', signal: 'social', relevanceBase: 7 },
    ],
    wildcard: [
      { id: 'hwc1', type: 'wildcard', title: 'Capture This Moment', subtitle: 'Make a memory on purpose', duration: '2 min', instruction: 'Take a photo, record a short voice note, or write one sentence about right now. Future you will be glad you did.', signal: 'motivation', relevanceBase: 7 },
    ],
  },
  neutral: {
    media: [
      { id: 'n1', type: 'media', category: 'meditation', title: 'Mindful Moment', subtitle: 'Center yourself', duration: '10 min', platform: 'youtube', youtubeVideoId: 'inpok4MKVLM', signal: 'focus', relevanceBase: 8 },
      { id: 'n2', type: 'media', category: 'music', title: 'Focus Flow', subtitle: 'Lo-fi beats', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DWZeKCadgRdKQ', signal: 'work', relevanceBase: 9 },
      { id: 'n3', type: 'media', category: 'yoga', title: 'Daily Yoga Practice', subtitle: 'Balance mind & body', duration: '15 min', platform: 'youtube', youtubeVideoId: 'g_tea8ZNk5A', signal: 'body', relevanceBase: 8 },
    ],
    microActions: [
      { id: 'n4', type: 'micro', title: 'Mindful Minute', subtitle: 'Present moment awareness', duration: '60 sec', instruction: 'Close eyes. Notice 3 sounds, 2 physical sensations, 1 emotion. Open eyes refreshed.', signal: 'focus', relevanceBase: 7 },
      { id: 'n5', type: 'micro', title: 'Gratitude Pause', subtitle: 'Shift perspective', duration: '60 sec', instruction: "Think of 3 small things you're grateful for today. Really feel the appreciation.", signal: 'motivation', relevanceBase: 7 },
    ],
    journal: { id: 'n6', type: 'journal', title: 'Check-in Questions', prompt: 'What do I need right now? What am I avoiding? What would make today feel complete?', signal: 'focus', relevanceBase: 6 },
    breathing: { id: 'n7', type: 'breathing', title: 'Balancing Breath', subtitle: 'Equal inhale & exhale', duration: 60, pattern: { inhale: 4, hold1: 2, exhale: 4, hold2: 2 }, signal: 'focus', relevanceBase: 8 },
    whyHelps: { id: 'n8', type: 'info', title: 'Why This Helps', content: 'Regular mindfulness practice builds emotional awareness, helping you recognize and respond to feelings earlier.', signal: 'focus', relevanceBase: 4 },
    movement: [
      { id: 'nmv1', type: 'movement', title: 'Full-Body Wake-Up', subtitle: 'Energize without caffeine', duration: '5 min', instruction: 'Roll neck, roll shoulders, fold forward, side stretch both sides. End with 10 jumping jacks or brisk walking in place.', signal: 'body', relevanceBase: 7 },
      { id: 'nmv2', type: 'movement', title: 'Posture Check & Reset', subtitle: 'Alignment changes mood', duration: '2 min', instruction: 'Sit tall, roll shoulders back, tuck chin slightly. Breathe into your chest. Good posture literally shifts your mood chemistry.', signal: 'focus', relevanceBase: 6 },
    ],
    lifestyle: [
      { id: 'nls1', type: 'lifestyle', title: 'Set One Intention', subtitle: 'Direct your energy', duration: '2 min', instruction: "Choose one thing you want to feel or accomplish today. Write it down somewhere visible. Intention shapes action.", signal: 'motivation', relevanceBase: 8 },
      { id: 'nls2', type: 'lifestyle', title: '5-Minute Tidy', subtitle: 'Clear space, clear mind', duration: '5 min', instruction: 'Set a timer for 5 minutes. Clear one visible surface. Physical environment directly affects mental clarity.', signal: 'focus', relevanceBase: 7 },
    ],
    cognitive: [
      { id: 'ncg1', type: 'cognitive', title: 'Morning Pages Starter', subtitle: 'Clear the mental slate', duration: '5 min', prompt: 'Write whatever comes to mind — thoughts, observations, plans, nonsense. Three paragraphs, no editing. Clear the buffer.', signal: 'focus', relevanceBase: 8 },
      { id: 'ncg2', type: 'cognitive', title: 'Intention for Today', subtitle: 'Start with purpose', duration: '2 min', prompt: "Complete these: \"Today I want to feel ___.  One thing I'll do for myself is ___. One thing I'll do for others is ___.\"", signal: 'motivation', relevanceBase: 8 },
    ],
    audio: [
      { id: 'nau1', type: 'audio', title: 'Deep Focus Soundscape', subtitle: 'Concentration & flow state', duration: '∞', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DWZeKCadgRdKQ', signal: 'work', relevanceBase: 7 },
    ],
    wildcard: [
      { id: 'nwc1', type: 'wildcard', title: '30-Second Cold Rinse', subtitle: 'Instant alertness reset', duration: '30 sec', instruction: 'End your next shower with 30 seconds of cold water. Activates the nervous system and boosts dopamine for hours.', signal: 'focus', relevanceBase: 7 },
    ],
  },
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
  // ── Global pool — breathing ───────────────────────────────────────────────
  'g_b1': 'https://images.unsplash.com/photo-1474418397713-7ede21d49118?w=400&q=80', // still mountain lake — box breathing
  'g_b2': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', // ocean horizon — 4-7-8
  'g_b3': 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=400&q=80', // morning mist — physiological sigh
  // ── Global pool — micro / quick actions ──────────────────────────────────
  'g_m1': 'https://images.unsplash.com/photo-1556909114-44e3e9399a2b?w=400&q=80',    // water splash sink — cold water
  'g_m2': 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=400&q=80', // grounded hands on floor — 5-4-3-2-1
  'g_m3': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&q=80', // looking out window — screen break
  'g_m4': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80', // movement energy — shake it off
  // ── Global pool — lifestyle ───────────────────────────────────────────────
  'g_ls1': 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80', // step outside sunlight
  'g_ls2': 'https://images.unsplash.com/photo-1512314889357-e157c22f938d?w=400&q=80', // phone face down
  'g_ls3': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80',    // glass of water
  'g_ls4': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80', // walk in nature
  'g_ls5': 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=400&q=80', // morning light warm
  // ── Global pool — journal ────────────────────────────────────────────────
  'g_j1': 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&q=80',  // pen on paper — three sentences
  'g_j2': 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&q=80',  // notebook open — brain dump
  'g_j3': 'https://images.unsplash.com/photo-1501618669935-18b6ecceee58?w=400&q=80',  // journal warm light — one word
  // ── Global pool — audio ──────────────────────────────────────────────────
  'g_au1': 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=400&q=80', // rain on window — rainfall
  'g_au2': 'https://images.unsplash.com/photo-1418065460487-3e41a6d18738?w=400&q=80', // forest birdsong scene
  'g_au3': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80', // headphones focus beats
}

// Grouped fallback images — used when ITEM_IMAGES has no match for this ID
// Grouped by semantic theme so fallbacks feel contextually appropriate
const TYPE_FALLBACK_IMAGES = {
  // Content types
  breathing:  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', // calm ocean horizon
  movement:   'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80', // yoga mat stretch
  micro:      'https://images.unsplash.com/photo-1543218024-57a70143bdc9?w=400&q=80',    // warm hands around mug
  lifestyle:  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80', // sun through forest
  journal:    'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&q=80', // pen on open notebook
  audio:      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80', // headphones close-up
  cognitive:  'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&q=80', // contemplative window light
  wildcard:   'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=400&q=80', // warm golden sunrise
  media:      'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=400&q=80', // meditation beach
  info:       'https://images.unsplash.com/photo-1515023115689-589c33041d3c?w=400&q=80', // still water surface
  smoothie:   'https://images.unsplash.com/photo-1543218024-57a70143bdc9?w=400&q=80',    // nourishing warmth
  recipe:     'https://images.unsplash.com/photo-1543218024-57a70143bdc9?w=400&q=80',    // warm nourishment
  // Semantic theme groups (used by resolveContentImage keyword matching)
  yoga:       'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80', // outdoor yoga sun
  meditation: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=400&q=80', // seated meditation beach
  breathwork: 'https://images.unsplash.com/photo-1474418397713-7ede21d49118?w=400&q=80', // mountain stillness
  walk:       'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80', // sunlit path walking
  nature:     'https://images.unsplash.com/photo-1418065460487-3e41a6d18738?w=400&q=80', // forest light
  sleep:      'https://images.unsplash.com/photo-1534082021195-09db37f8c4e9?w=400&q=80', // soft ambient sleep
  stress:     'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&q=80', // contemplative calm
  grounding:  'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=400&q=80', // hands on earth
  water:      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', // ocean horizon calm
  music:      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80', // headphones warm
  writing:    'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&q=80', // notebook open
  stretch:    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80', // stretching studio
  reset:      'https://images.unsplash.com/photo-1515023115689-589c33041d3c?w=400&q=80', // still water reset
}

// Last-resort — if every tier above misses, use this safe wellness image
const ABSOLUTE_FALLBACK = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80'

// ── resolveContentImage ───────────────────────────────────────────────────────
// Three-tier image resolution with keyword-based semantic matching.
// Never returns undefined — always returns a valid src string.
//
// Tier 1: exact ITEM_IMAGES[item.id] match
// Tier 2: TYPE_FALLBACK_IMAGES keyed by item.type, then keyword-matched from
//         title/subtitle/description against semantic theme groups
// Tier 3: ABSOLUTE_FALLBACK
function resolveContentImage(item) {
  if (!item) return ABSOLUTE_FALLBACK

  // Tier 0 — item carries its own image (external sources: YouTube thumbnails, Spotify covers)
  if (item.image && typeof item.image === 'string' && item.image.startsWith('http')) return item.image

  // Tier 1 — exact ID match in local map (bare ID or with "local:" prefix)
  const bareId = item.id?.replace(/^local:/, '')
  if (bareId && ITEM_IMAGES[bareId]) return ITEM_IMAGES[bareId]

  // Tier 2a — type match
  if (item.type && TYPE_FALLBACK_IMAGES[item.type]) return TYPE_FALLBACK_IMAGES[item.type]

  // Tier 2b — keyword match from title/subtitle/description
  const text = `${item.title || ''} ${item.subtitle || ''} ${item.description || ''}`.toLowerCase()
  const KEYWORD_THEMES = [
    ['yoga',       ['yoga', 'pose', 'asana', 'vinyasa']],
    ['meditation', ['meditat', 'mindful', 'awareness', 'present']],
    ['breathwork', ['breath', 'inhale', 'exhale', 'pranayama', 'box breath', '4-7-8']],
    ['walk',       ['walk', 'stroll', 'steps', 'path', 'hike']],
    ['nature',     ['forest', 'nature', 'outdoor', 'sunlight', 'trees', 'birdsong']],
    ['sleep',      ['sleep', 'wind down', 'bedtime', 'rest', 'night']],
    ['stress',     ['stress', 'anxious', 'calm', 'relax', 'tension', 'nervous']],
    ['grounding',  ['ground', 'anchor', '5-4-3-2-1', 'sensory', 'present moment']],
    ['water',      ['water', 'ocean', 'rain', 'river', 'lake', 'wave']],
    ['music',      ['music', 'playlist', 'headphones', 'listen', 'audio', 'beats', 'sound']],
    ['writing',    ['journal', 'write', 'writing', 'notebook', 'reflect', 'prompt']],
    ['stretch',    ['stretch', 'flexibility', 'release', 'mobility', 'loosen']],
    ['reset',      ['reset', 'quick', 'micro', 'splash', 'shake', 'instant']],
  ]
  for (const [theme, keywords] of KEYWORD_THEMES) {
    if (keywords.some(kw => text.includes(kw))) return TYPE_FALLBACK_IMAGES[theme]
  }

  // Tier 3 — absolute fallback
  return ABSOLUTE_FALLBACK
}

// Universal content pool — works for any mood, always included in recommendations
const globalPool = [
  // ── Breathing ────────────────────────────────────────────────────────────
  { id: 'g_b1', type: 'breathing', title: 'Box Breathing', subtitle: '4-4-4-4 reset', description: 'Used by Navy SEALs to calm under pressure. Equal counts in all four phases build steady control.', duration: 60, pattern: { inhale: 4, hold1: 4, exhale: 4, hold2: 4 }, signal: 'focus', relevanceBase: 8 },
  { id: 'g_b2', type: 'breathing', title: '4-7-8 Breath', subtitle: 'Deep nervous system reset', description: 'Slow breaths activate your parasympathetic system within minutes. Hard to stay wound up while doing this.', duration: 90, pattern: { inhale: 4, hold1: 7, exhale: 8, hold2: 0 }, signal: 'focus', relevanceBase: 8 },
  { id: 'g_b3', type: 'breathing', title: 'Physiological Sigh', subtitle: 'Fastest stress off-switch', description: 'Double inhale through the nose, long exhale through the mouth. Instant calm in under 30 seconds.', duration: 30, pattern: { inhale: 2, hold1: 1, exhale: 6, hold2: 0 }, signal: 'focus', relevanceBase: 9 },

  // ── Quick actions / micro ─────────────────────────────────────────────────
  { id: 'g_m1', type: 'micro', title: 'Cold Water Splash', subtitle: 'Instant physiological calm', description: 'Splash cold water on your face and wrists. Triggers the dive reflex — immediate nervous system reset.', duration: '30 sec', instruction: 'Splash cold water on your face and wrists. Activates the dive reflex — immediate calm.', signal: 'body', relevanceBase: 8 },
  { id: 'g_m2', type: 'micro', title: '5-4-3-2-1 Grounding', subtitle: 'Interrupt anxious loops now', description: 'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. Anchors you in the present.', duration: '2 min', instruction: 'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.', signal: 'focus', relevanceBase: 9 },
  { id: 'g_m3', type: 'micro', title: 'Screen Break — 20ft Rule', subtitle: 'Eyes need rest too', description: 'Look at something 20 feet away for 20 seconds. Repeat 5x. Reduces eye strain and releases background tension.', duration: '2 min', instruction: 'Look at something 20 feet away for 20 seconds. Repeat 5x. The 20-20-20 rule.', signal: 'body', relevanceBase: 7 },
  { id: 'g_m4', type: 'micro', title: 'Shake It Off', subtitle: 'Animals shake off stress — so can you', description: 'Shake your hands, arms, and body loosely for 60 seconds. Releases physical tension stored in muscles.', duration: '60 sec', instruction: 'Shake your hands, arms, and whole body loosely for 60 seconds. Let it be ridiculous. It works.', signal: 'body', relevanceBase: 8 },

  // ── Lifestyle ─────────────────────────────────────────────────────────────
  { id: 'g_ls1', type: 'lifestyle', title: 'Step Outside for 5 Minutes', subtitle: 'Nature resets the nervous system', description: 'Even 5 minutes of daylight and fresh air measurably reduces cortisol and improves mood.', duration: '5 min', instruction: 'Leave your current space. No destination. Natural light and air do the work.', signal: 'body', relevanceBase: 9 },
  { id: 'g_ls2', type: 'lifestyle', title: 'Phone Face Down, 20 Min', subtitle: 'Real rest requires real distance', description: 'Even the presence of your phone reduces cognitive capacity. Out of sight is genuinely out of mind.', duration: '20 min', instruction: 'Put your phone face down in another room. Do anything else — or nothing.', signal: 'focus', relevanceBase: 8 },
  { id: 'g_ls3', type: 'lifestyle', title: 'Drink a Full Glass of Water', subtitle: 'Dehydration mimics low mood', description: 'Mild dehydration causes fatigue, irritability, and poor focus — often mistaken for mood issues. Try it.', duration: '1 min', instruction: 'Drink a full glass of water now, slowly. See if anything shifts in the next 10 minutes.', signal: 'body', relevanceBase: 7 },
  { id: 'g_ls4', type: 'lifestyle', title: '10-Minute Walk, No Phone', subtitle: 'Move without an agenda', description: 'Rhythmic forward movement reduces rumination. Walking without input is one of the most underrated resets.', duration: '10 min', instruction: '10 minutes outside, no phone, no podcast. Just walk. Notice what you notice.', signal: 'body', relevanceBase: 9 },
  { id: 'g_ls5', type: 'lifestyle', title: 'Morning Light Exposure', subtitle: 'Set your circadian clock', description: 'Sunlight in the first hour of waking calibrates cortisol and melatonin for the entire day ahead.', duration: '5 min', instruction: 'Go outside within an hour of waking — no sunglasses. Stand in sunlight for at least 5 minutes.', signal: 'body', relevanceBase: 8 },

  // ── Journal ───────────────────────────────────────────────────────────────
  { id: 'g_j1', type: 'journal', title: 'Three Sentences Right Now', subtitle: 'Minimum effective reflection', description: 'A structured 3-sentence check-in creates real insight without the pressure of a full journal entry.', duration: '2 min', prompt: 'Finish these: "Right now I feel ___. The reason is probably ___. One thing that might help is ___."', signal: 'focus', relevanceBase: 8 },
  { id: 'g_j2', type: 'journal', title: 'Brain Dump', subtitle: 'Empty your mental buffer', description: 'Writing thoughts down reduces the energy spent maintaining them — freeing attention for the present.', duration: '5 min', prompt: 'Write everything on your mind: worries, to-dos, random thoughts. No order. No editing. Just clear it out.', signal: 'focus', relevanceBase: 8 },
  { id: 'g_j3', type: 'journal', title: 'One Word, Then Three Sentences', subtitle: 'Label it to lessen it', description: 'Naming an emotion (affect labeling) reduces its intensity. One of the simplest, most evidence-backed interventions.', duration: '1 min', prompt: 'What one word describes how you feel right now? Write it. Then write 3 sentences about why that word fits.', signal: 'focus', relevanceBase: 7 },

  // ── Audio ─────────────────────────────────────────────────────────────────
  { id: 'g_au1', type: 'audio', title: 'Rainfall Soundscape', subtitle: 'Pink noise for calm focus', description: 'Rain masks distracting sounds and helps the brain settle. A reliable background for focus or unwinding.', duration: '∞', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX4sWSpwq3LiO', signal: 'focus', relevanceBase: 7 },
  { id: 'g_au2', type: 'audio', title: 'Forest & Birdsong', subtitle: 'Nature sounds for recovery', description: 'Natural soundscapes lower blood pressure and support mental recovery — measurably better than silence for many.', duration: '∞', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX4E3UdUs7fUx', signal: 'body', relevanceBase: 7 },
  { id: 'g_au3', type: 'audio', title: 'Binaural Focus Beats', subtitle: '40Hz for concentration', description: '40Hz binaural beats are associated with improved focus and working memory in peer-reviewed research.', duration: '∞', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DWZd79rJ6a7lp', signal: 'work', relevanceBase: 7 },
]

// Calculate relevance score for an item based on mood and signals
function calculateRelevance(item, mood, signals) {
  let score = item.relevanceBase || 5
  if (signals.includes(item.signal)) score += 5
  if (item.type === 'breathing' || item.type === 'micro') score += 2
  if (item.type === 'movement') score += 1
  if (item.type === 'wildcard') score += 1
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
    { ...content.whyHelps, reason: primarySignal || content.whyHelps.signal },
    ...(content.movement || []).map(item => ({ ...item, reason: primarySignal || item.signal })),
    ...(content.lifestyle || []).map(item => ({ ...item, reason: primarySignal || item.signal })),
    ...(content.cognitive || []).map(item => ({ ...item, reason: primarySignal || item.signal })),
    ...(content.audio || []).map(item => ({ ...item, reason: primarySignal || item.signal })),
    ...(content.wildcard || []).map(item => ({ ...item, reason: primarySignal || item.signal })),
    ...globalPool.map(item => ({ ...item, reason: primarySignal || item.signal })),
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

// Get top 3 picks sorted by relevance, max 2 per type for diversity
function getTopPicks(recommendations) {
  const sorted = [...recommendations].sort((a, b) => b.relevanceScore - a.relevanceScore)
  const typeCounts = {}
  const picks = []
  for (const item of sorted) {
    const t = item.type || 'other'
    if ((typeCounts[t] || 0) >= 2) continue
    picks.push(item)
    typeCounts[t] = (typeCounts[t] || 0) + 1
    if (picks.length >= 3) break
  }
  return picks
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
  { id: 'happy',    label: 'Happy',    bg: '#EAF2E8', border: '#C4D9C0', text: '#3A6238' },
  { id: 'sad',      label: 'Sad',      bg: '#E6EEF7', border: '#BDD0E6', text: '#2A4E6E' },
  { id: 'stressed', label: 'Stressed', bg: '#FAF0E6', border: '#E8CEBC', text: '#7A4828' },
  { id: 'tired',    label: 'Tired',    bg: '#F0EAF6', border: '#D4C4E4', text: '#54386E' },
  { id: 'angry',    label: 'Angry',    bg: '#FAE8E8', border: '#E6C0C0', text: '#7A2E2E' },
]

// Premium 3D sphere mood icons — warm clay gradient, refined expressions, matches reference
const MoodFace = ({ id, size = 48 }) => {
  // Each instance needs unique IDs to avoid gradient conflicts across 5 icons
  const gId  = `mfg-${id}`
  const shId = `mfs-${id}`
  const vb = '0 0 56 56'
  const fc = '#7b6a58'    // warm dark brown for all features
  const sw = '1.9'

  // Sphere shell — warm cream-to-tan radial gradient with highlights
  const Shell = () => (
    <defs>
      <radialGradient id={gId} cx="34%" cy="26%" r="76%" gradientUnits="objectBoundingBox">
        <stop offset="0%"   stopColor="#ede2d3" />  {/* warm cream highlight */}
        <stop offset="38%"  stopColor="#d9c9b6" />  {/* mid-tone clay */}
        <stop offset="72%"  stopColor="#c5b49f" />  {/* warm tan */}
        <stop offset="100%" stopColor="#b3a390" />  {/* shadow edge */}
      </radialGradient>
      <filter id={shId} x="-25%" y="-25%" width="150%" height="150%">
        <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#6b5a48" floodOpacity="0.18" />
      </filter>
    </defs>
  )

  const cx = 28, cy = 28, r = 24

  return (
    <svg width={size} height={size} viewBox={vb} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <Shell />
      {/* Sphere body */}
      <circle cx={cx} cy={cy} r={r} fill={`url(#${gId})`} filter={`url(#${shId})`} />
      {/* Primary specular highlight — upper left */}
      <ellipse cx="19" cy="17" rx="8" ry="5" fill="rgba(255,255,255,0.32)" />
      {/* Secondary soft rim — lower right edge, very subtle */}
      <ellipse cx="35" cy="37" rx="5" ry="3.5" fill="rgba(255,255,255,0.08)" />

      {/* ── Expressions ── */}
      {id === 'happy' && <>
        {/* Closed crescent eyes — arcs opening downward */}
        <path d="M15 25 Q19.5 20 24 25" stroke={fc} strokeWidth={sw} />
        <path d="M32 25 Q36.5 20 41 25" stroke={fc} strokeWidth={sw} />
        {/* Gentle wide smile */}
        <path d="M15 32 Q28 42 41 32" stroke={fc} strokeWidth={sw} />
      </>}

      {id === 'sad' && <>
        {/* Brows angling down toward nose */}
        <path d="M14 20 L22 23.5" stroke={fc} strokeWidth={sw} />
        <path d="M42 20 L34 23.5" stroke={fc} strokeWidth={sw} />
        {/* Small round eyes */}
        <circle cx="20" cy="27" r="1.8" fill={fc} />
        <circle cx="36" cy="27" r="1.8" fill={fc} />
        {/* Frown */}
        <path d="M17 37 Q28 30 39 37" stroke={fc} strokeWidth={sw} />
        {/* Single teardrop */}
        <path d="M18 30 Q16 34.5 18 36 Q20.5 36 20.5 33.5 Q20.5 30 18 30" fill={fc} opacity="0.35" />
      </>}

      {id === 'stressed' && <>
        {/* Tense inward brows */}
        <path d="M14 22 L22 25.5" stroke={fc} strokeWidth={sw} />
        <path d="M42 22 L34 25.5" stroke={fc} strokeWidth={sw} />
        {/* Squinting eyes */}
        <path d="M15 29 Q20 25.5 25 29" stroke={fc} strokeWidth={sw} />
        <path d="M31 29 Q36 25.5 41 29" stroke={fc} strokeWidth={sw} />
        {/* Wavy tight mouth */}
        <path d="M16 37 Q20 33.5 24 37 Q28 40.5 32 37 Q36 33.5 40 37" stroke={fc} strokeWidth={sw} />
        {/* Sweat drop — upper right */}
        <path d="M42 12 Q44.5 16.5 42 18.5 Q39.5 18.5 39.5 16 Q39.5 12 42 12" fill={fc} opacity="0.30" />
      </>}

      {id === 'tired' && <>
        {/* Heavy drooping lids — eye arc with a straight lower line */}
        <path d="M14 25 Q19.5 20 25 25" stroke={fc} strokeWidth={sw} />
        <path d="M14 27 Q19.5 27 25 27" stroke={fc} strokeWidth="1.2" opacity="0.38" />
        <path d="M31 25 Q36.5 20 42 25" stroke={fc} strokeWidth={sw} />
        <path d="M31 27 Q36.5 27 42 27" stroke={fc} strokeWidth="1.2" opacity="0.38" />
        {/* Flat tired mouth */}
        <path d="M19 36 Q28 38 37 36" stroke={fc} strokeWidth={sw} />
        {/* zZ — italic, soft */}
        <text x="33" y="17" fontSize="8" fill={fc} opacity="0.48"
              fontFamily="Georgia, serif" fontStyle="italic">zZ</text>
      </>}

      {id === 'angry' && <>
        {/* Steep furrowed brows */}
        <path d="M13 20 L24 27" stroke={fc} strokeWidth="2.4" />
        <path d="M43 20 L32 27" stroke={fc} strokeWidth="2.4" />
        {/* Small compressed eyes */}
        <circle cx="21" cy="30" r="1.7" fill={fc} />
        <circle cx="35" cy="30" r="1.7" fill={fc} />
        {/* Tight downward frown */}
        <path d="M18 40 Q28 32 38 40" stroke={fc} strokeWidth={sw} />
      </>}
    </svg>
  )
}

// Compact monoline face icons — designed for 18px chip use, no fill, minimal
const TinyFace = ({ id, color }) => {
  const p = { width: 18, height: 18, viewBox: '0 0 18 18', fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }
  const c = color || '#B7A46A'
  const sw = '1.25'
  switch (id) {
    case 'happy': return (
      <svg {...p}>
        <circle cx="9" cy="9" r="7.2" stroke={c} strokeWidth={sw} />
        <path d="M6 10.8 Q9 13.4 12 10.8" stroke={c} strokeWidth={sw} />
        <circle cx="6.8" cy="7.8" r="0.75" fill={c} />
        <circle cx="11.2" cy="7.8" r="0.75" fill={c} />
      </svg>
    )
    case 'sad': return (
      <svg {...p}>
        <circle cx="9" cy="9" r="7.2" stroke={c} strokeWidth={sw} />
        <path d="M6 12.2 Q9 9.8 12 12.2" stroke={c} strokeWidth={sw} />
        <circle cx="6.8" cy="7.8" r="0.75" fill={c} />
        <circle cx="11.2" cy="7.8" r="0.75" fill={c} />
        <path d="M6.5 9.8 Q5.4 12.2 6.5 13 Q7.6 13 7.6 11.8 Q7.6 9.8 6.5 9.8" fill={c} opacity="0.35" />
      </svg>
    )
    case 'stressed': return (
      <svg {...p}>
        <circle cx="9" cy="9" r="7.2" stroke={c} strokeWidth={sw} />
        <path d="M5.8 11 Q7.2 9.5 9 11 Q10.8 12.5 12.2 11" stroke={c} strokeWidth={sw} />
        <path d="M6 7.2 L7.8 8.2" stroke={c} strokeWidth={sw} />
        <path d="M12 7.2 L10.2 8.2" stroke={c} strokeWidth={sw} />
        <path d="M13.5 4.5 Q14.5 6.2 13.5 7.2 Q12.4 7.2 12.4 6 Q12.4 4.5 13.5 4.5" fill={c} opacity="0.30" />
      </svg>
    )
    case 'tired': return (
      <svg {...p}>
        <circle cx="9" cy="9" r="7.2" stroke={c} strokeWidth={sw} />
        <path d="M6 10.5 Q9 11.5 12 10.5" stroke={c} strokeWidth={sw} />
        <path d="M5.5 7 Q7 5.8 8.5 7" stroke={c} strokeWidth={sw} />
        <path d="M9.5 7 Q11 5.8 12.5 7" stroke={c} strokeWidth={sw} />
        <text x="10.5" y="6" fontSize="3.8" fill={c} opacity="0.50" fontFamily="serif" fontStyle="italic">zz</text>
      </svg>
    )
    case 'angry': return (
      <svg {...p}>
        <circle cx="9" cy="9" r="7.2" stroke={c} strokeWidth={sw} />
        <path d="M6 12 Q9 9.8 12 12" stroke={c} strokeWidth={sw} />
        <path d="M5.5 6.8 L8.2 8.2" stroke={c} strokeWidth="1.5" />
        <path d="M12.5 6.8 L9.8 8.2" stroke={c} strokeWidth="1.5" />
        <circle cx="7.2" cy="9.5" r="0.7" fill={c} />
        <circle cx="10.8" cy="9.5" r="0.7" fill={c} />
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

  // ── AI enhancement layer ──────────────────────────────────────────────────
  // Keyed by item.id → { enhancedTitle?, microCopy? }
  // Never blocks rendering — merges in silently after base content loads.
  const [enhancements, setEnhancements] = useState({})

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

  // ── External content layer — non-blocking, merges on top of local sections ──
  // Only activates when the user has expressed a mood (not the default neutral state).
  // On failure or timeout the hook returns null and local content is used unchanged.
  const { externalSections } = useExternalContent(currentMood === 'neutral' ? null : currentMood)

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

  // ── Intent-based content sections ─────────────────────────────────────────
  const intentMoods = [
    currentMood,
    ...['stressed', 'sad', 'tired', 'angry', 'happy', 'neutral'].filter(m => m !== currentMood),
  ]
  const dedupe = (arr) => arr.filter((item, idx, a) => a.findIndex(i => i.id === item.id) === idx)

  // ── Local content pools (always computed synchronously) ──────────────────
  const localMove = dedupe([
    ...intentMoods.flatMap(m => (moodContent[m]?.media || []).filter(i => i.category === 'yoga' || i.category === 'movement')),
    ...intentMoods.flatMap(m => moodContent[m]?.movement || []),
    ...globalPool.filter(i => i.type === 'movement'),
  ])

  const localCalm = dedupe([
    ...intentMoods.flatMap(m => (moodContent[m]?.media || []).filter(i => i.category === 'meditation' || i.category === 'music')),
    ...intentMoods.flatMap(m => moodContent[m]?.audio || []),
    ...globalPool.filter(i => i.type === 'audio'),
    ...intentMoods.flatMap(m => moodContent[m]?.breathing ? [moodContent[m].breathing] : []),
  ])

  const localReflect = dedupe([
    ...intentMoods.map(m => moodContent[m]?.journal).filter(Boolean),
    ...intentMoods.flatMap(m => moodContent[m]?.cognitive || []),
    ...globalPool.filter(i => i.type === 'journal' || i.type === 'cognitive'),
  ])

  const localReset = dedupe([
    ...intentMoods.flatMap(m => [moodContent[m]?.breathing, ...(moodContent[m]?.microActions || [])].filter(Boolean)),
    ...intentMoods.flatMap(m => moodContent[m]?.lifestyle || []),
    ...globalPool.filter(i => i.type === 'breathing' || i.type === 'micro' || i.type === 'lifestyle'),
  ])

  // ── Merged sections: external AI-curated items lead, local items fill gaps ──
  // mergeSection deduplicates and caps at 6. If externalSections is null
  // (API unconfigured, loading, or failed), each section is pure local content.
  const sectionMove    = mergeSection(externalSections?.move,    localMove,    6)
  const sectionCalm    = mergeSection(externalSections?.calm,    localCalm,    6)
  const sectionReflect = mergeSection(externalSections?.reflect, localReflect, 6)
  const sectionReset   = mergeSection(externalSections?.reset,   localReset,   6)

  // ── Card helpers ────────────────────────────────────────────────────────────
  const getTypeBadge = (item) => {
    if (item.type === 'media') return item.platform === 'youtube'
      ? { label: 'Video',      bg: 'rgba(90,60,42,0.82)' }
      : { label: 'Playlist',   bg: 'rgba(60,92,64,0.82)' }
    if (item.type === 'breathing') return { label: 'Breathing',   bg: 'rgba(62,96,72,0.85)' }
    if (item.type === 'micro')     return { label: 'Quick',        bg: 'rgba(140,88,54,0.85)' }
    if (item.type === 'journal')   return { label: 'Journal',      bg: 'rgba(72,56,44,0.85)' }
    if (item.type === 'movement')  return { label: 'Movement',     bg: 'rgba(72,104,72,0.85)' }
    if (item.type === 'lifestyle') return { label: 'Lifestyle',    bg: 'rgba(88,70,50,0.85)' }
    if (item.type === 'audio')     return { label: 'Playlist',     bg: 'rgba(44,80,88,0.85)' }
    if (item.type === 'cognitive') return { label: 'Reflection',   bg: 'rgba(68,54,80,0.85)' }
    if (item.type === 'wildcard')  return { label: 'Surprise',     bg: 'rgba(134,102,38,0.85)' }
    return { label: 'Tip', bg: 'rgba(78,68,58,0.78)' }
  }

  const getCardCta = (item) =>
    item.type === 'media'       ? (item.platform === 'youtube' ? 'Watch' : 'Listen')
    : item.type === 'breathing' ? 'Breathe'
    : item.type === 'micro'     ? 'Quick'
    : item.type === 'journal'   ? 'Write'
    : item.type === 'cognitive' ? 'Reflect'
    : item.type === 'audio'     ? 'Listen'
    : item.type === 'movement'  ? 'Move'
    : item.type === 'lifestyle' ? 'Start'
    : 'Begin'

  const getHeroCta = (item) =>
    item.type === 'media' && item.platform === 'youtube' ? 'Start Session'
    : item.type === 'media'     ? 'Start Listening'
    : item.type === 'breathing' ? 'Start Breathing'
    : item.type === 'micro'     ? 'Quick Reset'
    : item.type === 'journal'   ? 'Start Writing'
    : item.type === 'movement'  ? 'Start Moving'
    : item.type === 'audio'     ? 'Start Listening'
    : 'Begin'

  const handleCardClick = (item) => {
    if (item.type === 'recipe') { setSelectedRecipe(item); setRecipeModalOpen(true) }
    else if (item.type === 'media') handleRecommendationClick(item)
    else navigate(`/mood/${currentMood}`)
  }

  // ── AI enhancement effect ────────────────────────────────────────────────
  // Fires after sections are computed (currentMood changes).
  // Sends the featured card from each section (max 5 items total).
  // Never blocks rendering — merges into `enhancements` map when ready.
  useEffect(() => {
    // Collect the featured (first) item from each non-empty section — these are
    // the most visible cards and benefit most from personalisation.
    const featuredItems = [
      sectionMove[0],
      sectionCalm[0],
      sectionReflect[0],
      sectionReset[0],
    ].filter(Boolean).slice(0, 5)

    if (featuredItems.length === 0) return

    const hour = new Date().getHours()
    const timeOfDay =
      hour >= 5  && hour < 12 ? 'morning'   :
      hour >= 12 && hour < 17 ? 'afternoon' :
      hour >= 17 && hour < 22 ? 'evening'   : 'night'

    const payload = {
      mood: currentMood,
      timeOfDay,
      items: featuredItems.map(i => ({
        id:       i.id,
        title:    i.title,
        type:     i.type,
        subtitle: i.subtitle || null,
      })),
    }

    let cancelled = false

    fetch('/.netlify/functions/ai-enhance-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => {
        if (cancelled) return
        if (!Array.isArray(data?.enhancements)) return

        // Merge into a flat map keyed by item id
        const map = {}
        for (const e of data.enhancements) {
          if (e?.id && (e.enhancedTitle || e.microCopy)) {
            map[e.id] = {
              ...(e.enhancedTitle ? { enhancedTitle: e.enhancedTitle } : {}),
              ...(e.microCopy     ? { microCopy:     e.microCopy     } : {}),
            }
          }
        }
        setEnhancements(prev => ({ ...prev, ...map }))
      })
      .catch(() => { /* AI failed — original content stays, nothing to do */ })

    return () => { cancelled = true }
  }, [currentMood]) // re-run whenever mood changes

  // ─────────────────────────────────────────────────────────────────────────
  // DESIGN SYSTEM — single source of truth for all card proportions
  // Every measurement below derives from this token set.
  // ─────────────────────────────────────────────────────────────────────────
  const DS = {
    // Section rhythm
    sectionGap:    '48px',   // vertical space between sections
    titleToCard:   '14px',   // section heading → featured card
    featToRow:     '12px',   // featured card → compact scroll row
    rowGap:        '10px',   // gap between cards in scroll rows
    gridGap:       '12px',   // gap in 2-col Reflect grid

    // Featured (hero) card — 16:6.3 aspect at 880px usable width
    featH:         '218px',
    featRadius:    '18px',
    featPad:       '16px 18px 20px',
    featShadow:    '0 5px 22px rgba(50,32,16,0.14)',
    featTitleSize: '20px',
    featSubSize:   '12.5px',
    featCtaSize:   '12px',

    // Compact scroll card  — 170×(113+84) ≈ 170×197 total
    compW:         '170px',
    compImgH:      '113px',  // 66.5% of width → consistent golden ratio feel
    compBodyPad:   '10px 12px 12px',
    compRadius:    '14px',
    compShadow:    '0 2px 10px rgba(50,32,16,0.09)',

    // Reflect grid card (2-col, wider) — image taller since card is wider
    reflImgH:      '130px',
    reflBodyPad:   '11px 13px 13px',
    reflRadius:    '14px',
    reflShadow:    '0 2px 10px rgba(50,32,16,0.09)',

    // Quick-reset card — slightly narrower, image same ratio as compact
    resetW:        '158px',
    resetImgH:     '105px',  // 66.5% of 158 ≈ 105
    resetBodyPad:  '9px 11px 11px',
    resetRadius:   '14px',
    resetShadow:   '0 2px 10px rgba(50,32,16,0.08)',

    // Shared typography
    cardTitleSize: '12.5px',
    cardSubSize:   '10.5px',
    cardCtaSize:   '10.5px',
    badgeSize:     '9.5px',

    // Shared colors
    cardBg:        '#FEFAF4',
    titleColor:    '#3D2F24',
    subColor:      '#8A7060',
    ctaColor:      '#6B8A5E',
    badgeDark:     'rgba(50,38,28,0.82)',
    durationBg:    'rgba(0,0,0,0.28)',
    imgOverlay:    'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.32) 100%)',
  }

  // ── Featured (section hero) card ──────────────────────────────────────────
  const renderFeaturedCard = (item) => {
    const imageUrl = resolveContentImage(item)
    const badge = getTypeBadge(item)
    const durationText = typeof item.duration === 'number' ? `${item.duration}s` : item.duration || ''
    const heroCta = getHeroCta(item)

    // Merge AI enhancements safely — originals are always the fallback
    const enh = enhancements[item.id] || {}
    const displayTitle = enh.enhancedTitle || item.title
    const displaySub   = enh.microCopy     || item.subtitle || item.description || null

    return (
      <button
        key={item.id}
        onClick={() => handleCardClick(item)}
        className="w-full relative overflow-hidden text-left hover:scale-[1.005] active:scale-[0.998] transition-transform duration-200"
        style={{ height: DS.featH, borderRadius: DS.featRadius, boxShadow: DS.featShadow, display: 'block' }}
      >
        <img
          src={imageUrl}
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
          loading="lazy"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = ABSOLUTE_FALLBACK }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.18) 38%, rgba(0,0,0,0.66) 100%)' }} />
        <div className="absolute inset-0 flex flex-col justify-between" style={{ padding: DS.featPad }}>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: DS.badgeSize, fontWeight: 600, color: '#fff', padding: '4px 9px', borderRadius: '100px', background: badge.bg, backdropFilter: 'blur(6px)' }}>
              {badge.label}
            </span>
            {durationText && (
              <span style={{ fontSize: DS.badgeSize, fontWeight: 500, color: 'rgba(255,255,255,0.90)', padding: '4px 9px', borderRadius: '100px', background: DS.durationBg, backdropFilter: 'blur(4px)' }}>
                {durationText}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-white font-bold leading-tight" style={{ fontSize: DS.featTitleSize, textShadow: '0 2px 10px rgba(0,0,0,0.55)' }}>
              {displayTitle}
            </h3>
            {displaySub && (
              <p className="mt-1 leading-snug line-clamp-1" style={{ fontSize: DS.featSubSize, color: 'rgba(255,255,255,0.80)', textShadow: '0 1px 5px rgba(0,0,0,0.4)' }}>
                {displaySub}
              </p>
            )}
            <span className="inline-block mt-3 rounded-full text-white font-semibold pointer-events-none"
              style={{ fontSize: DS.featCtaSize, padding: '7px 16px', background: 'rgba(107,138,94,0.88)', backdropFilter: 'blur(8px)', boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}>
              {heroCta}
            </span>
          </div>
        </div>
      </button>
    )
  }

  // ── Compact scroll card ───────────────────────────────────────────────────
  const renderCompactCard = (item) => {
    const imageUrl = resolveContentImage(item)
    const badge = getTypeBadge(item)
    const cta = getCardCta(item)
    const durationText = typeof item.duration === 'number' ? `${item.duration}s` : item.duration || ''
    return (
      <button
        key={item.id}
        onClick={() => handleCardClick(item)}
        className="flex-shrink-0 text-left hover:-translate-y-[3px] hover:shadow-md transition-all duration-200"
        style={{ width: DS.compW, borderRadius: DS.compRadius, overflow: 'hidden', background: DS.cardBg, boxShadow: DS.compShadow }}
      >
        <div className="relative" style={{ height: DS.compImgH }}>
          <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} loading="lazy" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = ABSOLUTE_FALLBACK }} />
          <div className="absolute inset-0" style={{ background: DS.imgOverlay }} />
          <span className="absolute top-2 left-2" style={{ fontSize: DS.badgeSize, fontWeight: 600, color: '#fff', padding: '3px 8px', borderRadius: '100px', background: badge.bg, backdropFilter: 'blur(6px)' }}>
            {badge.label}
          </span>
          {durationText && (
            <span className="absolute bottom-2 left-2" style={{ fontSize: '9px', fontWeight: 500, color: '#fff', padding: '3px 7px', borderRadius: '100px', background: DS.durationBg, backdropFilter: 'blur(4px)' }}>
              {durationText}
            </span>
          )}
        </div>
        <div style={{ padding: DS.compBodyPad }}>
          <p className="font-semibold leading-snug line-clamp-2" style={{ fontSize: DS.cardTitleSize, color: DS.titleColor }}>
            {item.title}
          </p>
          {(item.subtitle || item.description) && (
            <p className="line-clamp-1 mt-0.5" style={{ fontSize: DS.cardSubSize, color: DS.subColor }}>
              {item.subtitle || item.description}
            </p>
          )}
          <p className="mt-2 font-semibold" style={{ fontSize: DS.cardCtaSize, color: DS.ctaColor }}>
            {cta} →
          </p>
        </div>
      </button>
    )
  }

  // ── Reflect grid card (2-col) — same visual language as compact ───────────
  const renderReflectCard = (item) => {
    const imageUrl = resolveContentImage(item)
    const cta = getCardCta(item)
    const durationText = typeof item.duration === 'number' ? `${item.duration}s` : item.duration || ''
    const promptPreview = item.prompt ? item.prompt.replace(/^(Finish these:|Complete these:)\s*/i, '').slice(0, 60) + '…' : null
    return (
      <button
        key={item.id}
        onClick={() => handleCardClick(item)}
        className="text-left hover:-translate-y-[3px] hover:shadow-md transition-all duration-200"
        style={{ borderRadius: DS.reflRadius, overflow: 'hidden', background: DS.cardBg, boxShadow: DS.reflShadow }}
      >
        <div className="relative" style={{ height: DS.reflImgH }}>
          <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} loading="lazy" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = ABSOLUTE_FALLBACK }} />
          <div className="absolute inset-0" style={{ background: DS.imgOverlay }} />
          <span className="absolute top-2 left-2" style={{ fontSize: DS.badgeSize, fontWeight: 600, color: '#fff', padding: '3px 8px', borderRadius: '100px', background: DS.badgeDark, backdropFilter: 'blur(6px)' }}>
            Journal
          </span>
          {durationText && (
            <span className="absolute bottom-2 left-2" style={{ fontSize: '9px', fontWeight: 500, color: '#fff', padding: '3px 7px', borderRadius: '100px', background: DS.durationBg }}>
              {durationText}
            </span>
          )}
        </div>
        <div style={{ padding: DS.reflBodyPad }}>
          <p className="font-semibold leading-snug line-clamp-2" style={{ fontSize: DS.cardTitleSize, color: DS.titleColor }}>
            {item.title}
          </p>
          {promptPreview && (
            <p className="line-clamp-2 mt-1 leading-snug" style={{ fontSize: DS.cardSubSize, color: DS.subColor }}>
              {promptPreview}
            </p>
          )}
          <p className="mt-2 font-semibold" style={{ fontSize: DS.cardCtaSize, color: DS.ctaColor }}>
            {cta} →
          </p>
        </div>
      </button>
    )
  }

  // ── Quick reset card — compact but same visual DNA ────────────────────────
  const renderQuickCard = (item) => {
    const imageUrl = resolveContentImage(item)
    const badge = getTypeBadge(item)
    const cta = getCardCta(item)
    const durationText = typeof item.duration === 'number' ? `${item.duration}s` : item.duration || ''
    return (
      <button
        key={item.id}
        onClick={() => handleCardClick(item)}
        className="flex-shrink-0 text-left hover:-translate-y-[3px] hover:shadow-md transition-all duration-200"
        style={{ width: DS.resetW, borderRadius: DS.resetRadius, overflow: 'hidden', background: DS.cardBg, boxShadow: DS.resetShadow }}
      >
        <div className="relative" style={{ height: DS.resetImgH }}>
          <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} loading="lazy" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = ABSOLUTE_FALLBACK }} />
          <div className="absolute inset-0" style={{ background: DS.imgOverlay }} />
          <span className="absolute top-2 left-2" style={{ fontSize: DS.badgeSize, fontWeight: 600, color: '#fff', padding: '3px 8px', borderRadius: '100px', background: badge.bg, backdropFilter: 'blur(6px)' }}>
            {badge.label}
          </span>
          {durationText && (
            <span className="absolute bottom-2 left-2" style={{ fontSize: '9px', fontWeight: 500, color: '#fff', padding: '3px 7px', borderRadius: '100px', background: DS.durationBg }}>
              {durationText}
            </span>
          )}
        </div>
        <div style={{ padding: DS.resetBodyPad }}>
          <p className="font-semibold leading-snug line-clamp-2" style={{ fontSize: DS.cardTitleSize, color: DS.titleColor }}>
            {item.title}
          </p>
          {(item.subtitle || item.description) && (
            <p className="line-clamp-1 mt-0.5" style={{ fontSize: DS.cardSubSize, color: DS.subColor }}>
              {item.subtitle || item.description}
            </p>
          )}
          <p className="mt-1.5 font-semibold" style={{ fontSize: DS.cardCtaSize, color: DS.ctaColor }}>
            {cta} →
          </p>
        </div>
      </button>
    )
  }

  // Alias for top picks row
  const renderSmallCard = renderCompactCard

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(175deg, #f5ede0 0%, #ede4d4 60%, #e6dccf 100%)' }}>
      {/* ── Top bar ── */}
      <div style={{ maxWidth: '920px', margin: '0 auto', padding: '0 20px' }}>
      <div className="pt-5 pb-3 flex items-center justify-between">
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
      </div>

      {/* ── Hero — editorial 65/35 asymmetric grid ── */}
      {/*
        Height strategy:
          - Topbar is ~48px, so usable viewport = 100vh - 48px
          - We target 84% of that so ~8vh of the next section peeks (scroll affordance)
          - clamp() keeps it sane: never smaller than 380px, never taller than 520px
          - This means a 768px laptop gets ≈ 604px usable → 84% = ~508px → capped at 520px ✓
          - A 900px laptop gets ≈ 714px → 84% = ~600px → capped at 520px ✓
          - A 1080px desktop gets ≈ 868px → 84% = ~730px → capped at 520px ✓
      */}
      <div style={{ maxWidth: '920px', margin: '0 auto', padding: '0 20px' }}>
        <div
          className="rounded-[20px] overflow-hidden shadow-2xl"
          style={{ height: 'clamp(380px, calc((100vh - 48px) * 0.84), 520px)', background: '#c4b5a5' }}
        >
          <div className="grid h-full" style={{ gridTemplateColumns: '68% 32%', gap: '4px' }}>

            {/* ── LEFT PANEL ── */}
            <div className="relative" style={{ height: '100%', overflow: 'hidden' }}>
              <img
                src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=85"
                alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                loading="eager"
              />
              <div className="absolute inset-0" style={{
                zIndex: 1,
                background: 'linear-gradient(to right, rgba(24,60,67,0.52) 0%, rgba(24,60,67,0.15) 55%, transparent 100%)'
              }} />
              <div className="absolute inset-0" style={{
                zIndex: 1,
                background: 'linear-gradient(to top, rgba(24,60,67,0.96) 0%, rgba(35,75,82,0.72) 28%, rgba(35,75,82,0.28) 58%, transparent 82%)'
              }} />

              {/* Interactive UI block */}
              <div
                className="absolute bottom-0 left-0"
                style={{ padding: 'clamp(12px, 2vh, 18px) 18px clamp(14px, 2vh, 18px)', width: '100%', maxWidth: '300px', zIndex: 2 }}
              >
                {/* Greeting */}
                <h1
                  className="text-white font-bold leading-tight"
                  style={{ fontSize: '1.3rem', textShadow: '0 2px 14px rgba(0,0,0,0.65)', marginBottom: '9px' }}
                >
                  {getGreeting()}, {user?.name || 'Yaara'} 🌿
                </h1>

                {/* Mood card */}
                <div style={{
                  background: 'linear-gradient(165deg, #F9F3E8 0%, #F3EBDD 45%, #EDE3CE 100%)',
                  borderRadius: '20px',
                  boxShadow: '0 12px 36px rgba(24,60,67,0.46), 0 4px 12px rgba(24,60,67,0.22)',
                  border: '1px solid rgba(255,255,255,0.88)',
                  padding: '12px 11px 11px',
                  maxWidth: '360px',
                }}>
                  <p style={{
                    textAlign: 'center',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    color: '#3F342B',
                    letterSpacing: '-0.01em',
                    marginBottom: '9px',
                    lineHeight: 1.3,
                  }}>
                    How are you feeling right now?
                  </p>

                  {/* Mood chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', justifyContent: 'center', marginBottom: '9px' }}>
                    {moodOptions.map((mood) => (
                      <button
                        key={mood.id}
                        onClick={() => handleMoodSelect(mood.id)}
                        className="hover:scale-[1.03] active:scale-[0.97] transition-transform duration-150"
                        style={{
                          width: 'calc(33.33% - 3.5px)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                          padding: '7px 6px',
                          borderRadius: '100px',
                          background: mood.bg,
                          border: `1px solid ${mood.border}`,
                          boxShadow: '0 2px 5px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.70)',
                          cursor: 'pointer',
                        }}
                      >
                        <TinyFace id={mood.id} color={mood.text} />
                        <span style={{
                          fontSize: '11.5px',
                          fontWeight: 600,
                          letterSpacing: '0.005em',
                          color: mood.text,
                          whiteSpace: 'nowrap',
                        }}>
                          {mood.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Input */}
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={checkInText}
                      onChange={(e) => setCheckInText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCheckInSubmit()}
                      placeholder="Or describe how you feel..."
                      className="placeholder:text-[#9B8C7C]"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '9px 38px 9px 14px',
                        borderRadius: '100px',
                        border: '1.5px solid #CDBFA9',
                        background: '#FAF6EF',
                        boxShadow: 'inset 0 2px 5px rgba(90,70,50,0.08)',
                        fontSize: '12px',
                        color: '#3F342B',
                        outline: 'none',
                        fontFamily: 'inherit',
                      }}
                    />
                    <button
                      onClick={handleCheckInSubmit}
                      disabled={isThinking || (!checkInText.trim() && !selectedMood)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        opacity: isThinking || (!checkInText.trim() && !selectedMood) ? 0.25 : 0.65,
                        transition: 'opacity 0.15s',
                      }}
                    >
                      {isThinking
                        ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#B7A46A' }} />
                        : <Send className="w-4 h-4" style={{ color: '#B7A46A' }} />}
                    </button>
                  </div>

                  {detectedMood && showReply && (
                    <p style={{ fontSize: '9px', color: '#9B8C7C', marginTop: '6px', paddingLeft: '4px' }}>
                      Detected: <strong style={{ textTransform: 'capitalize', color: '#6B5847' }}>{detectedMood}</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── RIGHT PANEL ── */}
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

      {/* ── Centered content container — aligns with hero (920px) ── */}
      <div style={{ maxWidth: '920px', margin: '0 auto', padding: '0 20px' }}>

        {/* ── Numa reply (after check-in) ── */}
        {(isThinking || showReply) && (
          <div style={{ marginTop: '20px' }}>
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
          <div ref={topPicksRef} style={{ marginTop: '32px' }} className="animate-fadeSlideUp">
            <div style={{ marginBottom: DS.titleToCard }}>
              <p style={{ fontSize: '21px', fontWeight: 700, color: DS.titleColor, letterSpacing: '-0.015em', lineHeight: 1.2 }}>Just for you</p>
              <p style={{ fontSize: DS.cardSubSize, color: DS.subColor, marginTop: '3px' }}>Based on how you're feeling right now.</p>
            </div>
            <div className="flex overflow-x-auto pb-2 scrollbar-hide" style={{ gap: DS.rowGap, marginLeft: '-20px', paddingLeft: '20px', marginRight: '-20px', paddingRight: '20px' }}>
              {topPicks.filter(i => i.type !== 'info').map(item => renderSmallCard(item))}
            </div>
          </div>
        )}

        {/* ── Intent-based content sections ── */}
        <div style={{ marginTop: '36px', display: 'flex', flexDirection: 'column', gap: DS.sectionGap }}>

          {/* ── Move your body ── */}
          {sectionMove.length > 0 && (
            <section>
              <div style={{ marginBottom: DS.titleToCard }}>
                <h2 style={{ fontSize: '21px', fontWeight: 700, color: DS.titleColor, letterSpacing: '-0.015em', lineHeight: 1.2 }}>Move your body</h2>
                <p style={{ fontSize: DS.cardSubSize, color: DS.subColor, marginTop: '3px' }}>Let movement carry what words can't.</p>
              </div>
              {renderFeaturedCard(sectionMove[0])}
              {sectionMove.length > 1 && (
                <div className="flex overflow-x-auto pb-1 scrollbar-hide" style={{ gap: DS.rowGap, marginTop: DS.featToRow, marginLeft: '-20px', paddingLeft: '20px', marginRight: '-20px', paddingRight: '20px' }}>
                  {sectionMove.slice(1).map(item => renderCompactCard(item))}
                </div>
              )}
            </section>
          )}

          {/* ── Calm your mind ── */}
          {sectionCalm.length > 0 && (
            <section>
              <div style={{ marginBottom: DS.titleToCard }}>
                <h2 style={{ fontSize: '21px', fontWeight: 700, color: DS.titleColor, letterSpacing: '-0.015em', lineHeight: 1.2 }}>Calm your mind</h2>
                <p style={{ fontSize: DS.cardSubSize, color: DS.subColor, marginTop: '3px' }}>Sounds and stillness to soften the noise.</p>
              </div>
              {renderFeaturedCard(sectionCalm[0])}
              {sectionCalm.length > 1 && (
                <div className="flex overflow-x-auto pb-1 scrollbar-hide" style={{ gap: DS.rowGap, marginTop: DS.featToRow, marginLeft: '-20px', paddingLeft: '20px', marginRight: '-20px', paddingRight: '20px' }}>
                  {sectionCalm.slice(1).map(item => renderCompactCard(item))}
                </div>
              )}
            </section>
          )}

          {/* ── Reflect — featured card + 2-col grid, matching section rhythm ── */}
          {sectionReflect.length > 0 && (
            <section>
              <div style={{ marginBottom: DS.titleToCard }}>
                <h2 style={{ fontSize: '21px', fontWeight: 700, color: DS.titleColor, letterSpacing: '-0.015em', lineHeight: 1.2 }}>Reflect</h2>
                <p style={{ fontSize: DS.cardSubSize, color: DS.subColor, marginTop: '3px' }}>A few quiet words to yourself.</p>
              </div>
              {renderFeaturedCard(sectionReflect[0])}
              {sectionReflect.length > 1 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: DS.gridGap, marginTop: DS.featToRow }}>
                  {sectionReflect.slice(1, 5).map(item => renderReflectCard(item))}
                </div>
              )}
            </section>
          )}

          {/* ── Quick reset ── */}
          {sectionReset.length > 0 && (
            <section style={{ paddingBottom: '8px' }}>
              <div style={{ marginBottom: DS.titleToCard }}>
                <h2 style={{ fontSize: '21px', fontWeight: 700, color: DS.titleColor, letterSpacing: '-0.015em', lineHeight: 1.2 }}>Quick reset</h2>
                <p style={{ fontSize: DS.cardSubSize, color: DS.subColor, marginTop: '3px' }}>One minute. That's all it takes.</p>
              </div>
              <div className="flex overflow-x-auto pb-1 scrollbar-hide" style={{ gap: DS.rowGap, marginLeft: '-20px', paddingLeft: '20px', marginRight: '-20px', paddingRight: '20px' }}>
                {sectionReset.map(item => renderQuickCard(item))}
              </div>
            </section>
          )}

        </div>

        {!todayCheckIn && (
          <div className="py-6">
            <button
              onClick={() => navigate('/checkin')}
              className="bg-terracotta hover:bg-terracotta-dark text-cream px-6 py-3 rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              Start Today's Check-in
            </button>
          </div>
        )}

      </div>{/* end centered container */}

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
