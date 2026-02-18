/**
 * Content pool for the Rooted recommendation engine.
 * Each mood contains arrays of spotify, youtube, breathing, micro, journal, recipe, and info items.
 * Item shapes match the existing card component contracts exactly.
 */

export const contentPool = {
  stressed: {
    spotify: [
      { id: 'str-sp-1', type: 'media', category: 'music', title: 'Stress Relief Playlist', subtitle: 'Calm instrumental tracks', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DWXe9gFZP0gtP', signal: 'work', relevanceBase: 8 },
      { id: 'str-sp-2', type: 'media', category: 'music', title: 'Peaceful Piano', subtitle: 'Relaxing piano melodies', duration: '3+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX4sWSpwq3LiO', signal: 'focus', relevanceBase: 8 },
      { id: 'str-sp-3', type: 'media', category: 'music', title: 'Nature Sounds', subtitle: 'Rain, ocean & forest ambience', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX4PP3DA4J0N8', signal: 'sleep', relevanceBase: 7 },
      { id: 'str-sp-4', type: 'media', category: 'music', title: 'Calm Vibes', subtitle: 'Gentle electronic downtempo', duration: '1+ hour', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX3Ogo9pFvBkY', signal: 'work', relevanceBase: 7 },
      { id: 'str-sp-5', type: 'media', category: 'music', title: 'Deep Focus', subtitle: 'Ambient music for concentration', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DWZeKCadgRdKQ', signal: 'focus', relevanceBase: 8 },
      { id: 'str-sp-6', type: 'media', category: 'music', title: 'Lo-Fi Beats', subtitle: 'Chill beats to unwind', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DWWQRwui0ExPn', signal: 'work', relevanceBase: 7 },
      { id: 'str-sp-7', type: 'media', category: 'music', title: 'Ambient Relaxation', subtitle: 'Atmospheric soundscapes', duration: '3+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX3PIPIT6JEa0', signal: 'panic', relevanceBase: 9 },
      { id: 'str-sp-8', type: 'media', category: 'music', title: 'Spa & Wellness', subtitle: 'Therapeutic melodies', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX9uKNf5jGX6m', signal: 'body', relevanceBase: 7 },
      { id: 'str-sp-9', type: 'media', category: 'music', title: 'Calm Classics', subtitle: 'Soothing classical pieces', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DWVFeEut75IAL', signal: 'focus', relevanceBase: 7 },
      { id: 'str-sp-10', type: 'media', category: 'music', title: 'Breathe Easy', subtitle: 'Music for slow breathing', duration: '1+ hour', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DWU0ScTcjJBdj', signal: 'panic', relevanceBase: 9 }
    ],
    youtubeFallback: [
      { id: 'str-yt-1', type: 'media', category: 'meditation', title: 'Anxiety Relief Meditation', subtitle: 'Guided stress release', duration: '10 min', platform: 'youtube', youtubeVideoId: 'O-6f5wQXSu8', signal: 'panic', relevanceBase: 10 },
      { id: 'str-yt-2', type: 'media', category: 'yoga', title: 'Gentle Stress Relief Yoga', subtitle: 'Slow stretches for tension', duration: '20 min', platform: 'youtube', youtubeVideoId: 'hJbRpHZr_d0', signal: 'body', relevanceBase: 9 },
      { id: 'str-yt-3', type: 'media', category: 'meditation', title: '10-Minute Calm Down', subtitle: 'Quick guided relaxation', duration: '10 min', platform: 'youtube', youtubeVideoId: 'z6X5oEIg6Ak', signal: 'panic', relevanceBase: 9 },
      { id: 'str-yt-4', type: 'media', category: 'yoga', title: 'Yoga for Anxiety', subtitle: 'Calming flow for tension', duration: '25 min', platform: 'youtube', youtubeVideoId: 'bJJWArKlKW8', signal: 'body', relevanceBase: 8 },
      { id: 'str-yt-5', type: 'media', category: 'meditation', title: 'Body Scan for Stress', subtitle: 'Progressive muscle relaxation', duration: '15 min', platform: 'youtube', youtubeVideoId: 'QS2yDmWk0vs', signal: 'headache', relevanceBase: 9 },
      { id: 'str-yt-6', type: 'media', category: 'meditation', title: 'Letting Go of Worry', subtitle: 'Release anxious thoughts', duration: '12 min', platform: 'youtube', youtubeVideoId: '1ZYbU82GVz4', signal: 'work', relevanceBase: 8 },
      { id: 'str-yt-7', type: 'media', category: 'yoga', title: 'Desk Yoga Break', subtitle: 'Quick stretches at your desk', duration: '8 min', platform: 'youtube', youtubeVideoId: 'M-8FvC3GR6o', signal: 'work', relevanceBase: 7 },
      { id: 'str-yt-8', type: 'media', category: 'meditation', title: 'Evening Wind Down', subtitle: 'End-of-day decompression', duration: '18 min', platform: 'youtube', youtubeVideoId: 'aEqlQvczMJQ', signal: 'sleep', relevanceBase: 8 },
      { id: 'str-yt-9', type: 'media', category: 'yoga', title: 'Tension Release Flow', subtitle: 'Target neck & shoulders', duration: '15 min', platform: 'youtube', youtubeVideoId: 'SedzswEwpPw', signal: 'headache', relevanceBase: 8 },
      { id: 'str-yt-10', type: 'media', category: 'meditation', title: 'Mindful Breathing Guide', subtitle: 'Simple breath awareness', duration: '8 min', platform: 'youtube', youtubeVideoId: 'SEfs5TJZ6Nk', signal: 'panic', relevanceBase: 9 }
    ],
    breathing: [
      { id: 'str-br-1', type: 'breathing', title: 'Box Breathing (4-4-4-4)', subtitle: 'Equal parts for calm focus', duration: 60, pattern: { inhale: 4, hold1: 4, exhale: 4, hold2: 4 }, signal: 'panic', relevanceBase: 10 },
      { id: 'str-br-2', type: 'breathing', title: 'Extended Exhale (4-2-6-0)', subtitle: 'Activate your calm response', duration: 60, pattern: { inhale: 4, hold1: 2, exhale: 6, hold2: 0 }, signal: 'work', relevanceBase: 9 },
      { id: 'str-br-3', type: 'breathing', title: 'Coherent Breathing (5-5)', subtitle: '6 breaths per minute rhythm', duration: 60, pattern: { inhale: 5, hold1: 0, exhale: 5, hold2: 0 }, signal: 'focus', relevanceBase: 8 }
    ],
    micro: [
      { id: 'str-mi-1', type: 'micro', title: 'Shoulder Roll Release', subtitle: 'Release physical tension', duration: '60 sec', instruction: 'Slowly roll your shoulders forward 5 times, then backward 5 times. Drop them as low as they go.', signal: 'headache', relevanceBase: 7 },
      { id: 'str-mi-2', type: 'micro', title: 'Grounding 5-4-3-2-1', subtitle: 'Reconnect with the present', duration: '90 sec', instruction: 'Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.', signal: 'panic', relevanceBase: 9 },
      { id: 'str-mi-3', type: 'micro', title: 'Cold Water Reset', subtitle: 'Splash cold water on your face', duration: '30 sec', instruction: 'Run cold water over your wrists or splash your face. Focus on the sensation.', signal: 'panic', relevanceBase: 8 },
      { id: 'str-mi-4', type: 'micro', title: 'Progressive Jaw Release', subtitle: 'Unclench and relax', duration: '60 sec', instruction: 'Clench your jaw tight for 5 seconds, then release completely. Repeat 3 times.', signal: 'headache', relevanceBase: 7 },
      { id: 'str-mi-5', type: 'micro', title: 'Worry Dump', subtitle: 'Write it all out', duration: '90 sec', instruction: 'Grab a piece of paper and write every worry you have. Then fold it up and set it aside.', signal: 'work', relevanceBase: 8 }
    ],
    journal: [
      { id: 'str-jo-1', type: 'journal', title: 'Stress Brain Dump', prompt: 'Write down everything that is weighing on you right now. No filter, no editing.', signal: 'work', relevanceBase: 6 },
      { id: 'str-jo-2', type: 'journal', title: 'What I Can Control', prompt: 'List 3 things stressing you, then circle only what you can actually control right now.', signal: 'work', relevanceBase: 7 },
      { id: 'str-jo-3', type: 'journal', title: 'Permission Slip', prompt: 'Write yourself a permission slip: "I give myself permission to..." What do you need to let go of?', signal: 'focus', relevanceBase: 6 }
    ],
    recipes: [
      { id: 'str-re-1', type: 'recipe', title: 'Calm & Cool Smoothie', subtitle: 'Magnesium-rich stress reliever', signal: 'body', ingredients: ['1 banana (frozen)', '1 cup spinach', '1 tbsp almond butter', '1 cup oat milk', '1 tbsp honey', 'Pinch of cinnamon'], steps: ['Add oat milk to blender', 'Add frozen banana and spinach', 'Add almond butter and honey', 'Blend until smooth', 'Top with cinnamon', 'Enjoy slowly, mindfully'] }
    ],
    info: [
      { id: 'str-in-1', type: 'info', title: 'Why This Helps', content: 'When stressed, your body activates the fight-or-flight response. Breathing exercises activate the parasympathetic nervous system, signaling safety.', signal: 'focus', relevanceBase: 4 }
    ]
  },

  sad: {
    spotify: [
      { id: 'sad-sp-1', type: 'media', category: 'music', title: 'Comfort & Healing', subtitle: 'Warm gentle melodies', duration: '1+ hour', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX3YSRoSdA634', signal: 'breakup', relevanceBase: 9 },
      { id: 'sad-sp-2', type: 'media', category: 'music', title: 'Mood Booster', subtitle: 'Uplifting feel-good songs', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX3rxVfibe1L0', signal: 'motivation', relevanceBase: 8 },
      { id: 'sad-sp-3', type: 'media', category: 'music', title: 'Soft Pop Hits', subtitle: 'Easy listening pop', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DWTwnEm1IYyoj', signal: 'social', relevanceBase: 7 },
      { id: 'sad-sp-4', type: 'media', category: 'music', title: 'Acoustic Comfort', subtitle: 'Warm acoustic guitar tracks', duration: '1+ hour', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX4E3UdUs7fUx', signal: 'lonely', relevanceBase: 8 },
      { id: 'sad-sp-5', type: 'media', category: 'music', title: 'Healing Frequencies', subtitle: '432Hz calming tones', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DWZqd5JICZI0u', signal: 'sleep', relevanceBase: 7 },
      { id: 'sad-sp-6', type: 'media', category: 'music', title: 'Rainy Day Vibes', subtitle: 'Cozy indie folk tracks', duration: '1+ hour', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DXbvABJXBIyiY', signal: 'lonely', relevanceBase: 7 },
      { id: 'sad-sp-7', type: 'media', category: 'music', title: 'Calm Instrumentals', subtitle: 'Strings and piano for reflection', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX4sWSpwq3LiO', signal: 'breakup', relevanceBase: 8 },
      { id: 'sad-sp-8', type: 'media', category: 'music', title: 'Feel Good Classics', subtitle: 'Timeless happy tunes', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DXdPec7aLTmlC', signal: 'motivation', relevanceBase: 8 }
    ],
    youtubeFallback: [
      { id: 'sad-yt-1', type: 'media', category: 'meditation', title: 'Self-Compassion Meditation', subtitle: 'Kind words for yourself', duration: '15 min', platform: 'youtube', youtubeVideoId: 'IeblJdB2-Vo', signal: 'lonely', relevanceBase: 10 },
      { id: 'sad-yt-2', type: 'media', category: 'movement', title: 'Mood-Lifting Walk', subtitle: 'Gentle movement meditation', duration: '10 min', platform: 'youtube', youtubeVideoId: 'inpok4MKVLM', signal: 'body', relevanceBase: 8 },
      { id: 'sad-yt-3', type: 'media', category: 'meditation', title: 'Loving Kindness Meditation', subtitle: 'Send love to yourself & others', duration: '12 min', platform: 'youtube', youtubeVideoId: '-d_AA9H4z9U', signal: 'lonely', relevanceBase: 9 },
      { id: 'sad-yt-4', type: 'media', category: 'meditation', title: 'Healing Inner Child', subtitle: 'Reconnect with your younger self', duration: '20 min', platform: 'youtube', youtubeVideoId: 'GlEHKzR_8fA', signal: 'breakup', relevanceBase: 9 },
      { id: 'sad-yt-5', type: 'media', category: 'yoga', title: 'Gentle Heart-Opening Yoga', subtitle: 'Open your chest & breathe', duration: '18 min', platform: 'youtube', youtubeVideoId: '2FiNvl9OrkM', signal: 'body', relevanceBase: 8 },
      { id: 'sad-yt-6', type: 'media', category: 'meditation', title: 'Release Sadness Meditation', subtitle: 'Let go of heavy emotions', duration: '15 min', platform: 'youtube', youtubeVideoId: '7H0FKzQjkWM', signal: 'breakup', relevanceBase: 9 },
      { id: 'sad-yt-7', type: 'media', category: 'movement', title: 'Dance It Out', subtitle: 'Free-form mood movement', duration: '8 min', platform: 'youtube', youtubeVideoId: 'oVl3Dha4p-g', signal: 'motivation', relevanceBase: 7 },
      { id: 'sad-yt-8', type: 'media', category: 'meditation', title: 'Gratitude When Sad', subtitle: 'Finding light in darkness', duration: '10 min', platform: 'youtube', youtubeVideoId: 'Lxprri_H9Is', signal: 'motivation', relevanceBase: 8 }
    ],
    breathing: [
      { id: 'sad-br-1', type: 'breathing', title: 'Soothing Breath (4-2-6-0)', subtitle: 'Long exhale for calm', duration: 60, pattern: { inhale: 4, hold1: 2, exhale: 6, hold2: 0 }, signal: 'sleep', relevanceBase: 8 },
      { id: 'sad-br-2', type: 'breathing', title: 'Heart Breathing (4-4-4-4)', subtitle: 'Hand on heart, gentle rhythm', duration: 60, pattern: { inhale: 4, hold1: 4, exhale: 4, hold2: 4 }, signal: 'lonely', relevanceBase: 9 },
      { id: 'sad-br-3', type: 'breathing', title: 'Belly Breathing (5-0-5-0)', subtitle: 'Deep diaphragm breaths', duration: 60, pattern: { inhale: 5, hold1: 0, exhale: 5, hold2: 0 }, signal: 'breakup', relevanceBase: 8 }
    ],
    micro: [
      { id: 'sad-mi-1', type: 'micro', title: 'Warm Cup Ritual', subtitle: 'Comfort in a mug', duration: '90 sec', instruction: 'Make a warm drink. Hold it with both hands. Feel the warmth and take 3 slow sips.', signal: 'lonely', relevanceBase: 8 },
      { id: 'sad-mi-2', type: 'micro', title: 'Hand on Heart', subtitle: 'Self-soothing touch', duration: '60 sec', instruction: 'Place your hand on your heart. Feel it beat. Whisper "I am here for myself."', signal: 'breakup', relevanceBase: 9 },
      { id: 'sad-mi-3', type: 'micro', title: 'Comfort Object', subtitle: 'Hold something soft', duration: '60 sec', instruction: 'Find something soft — a blanket, pillow, or sweater. Hold it close for 60 seconds.', signal: 'lonely', relevanceBase: 7 },
      { id: 'sad-mi-4', type: 'micro', title: 'Sunshine Seek', subtitle: 'Find natural light', duration: '90 sec', instruction: 'Go to a window or step outside. Close your eyes and let sunlight touch your face for 90 seconds.', signal: 'body', relevanceBase: 7 }
    ],
    journal: [
      { id: 'sad-jo-1', type: 'journal', title: 'Letter to Yourself', prompt: 'Write a letter to yourself from the perspective of someone who loves you deeply. What would they say?', signal: 'lonely', relevanceBase: 7 },
      { id: 'sad-jo-2', type: 'journal', title: 'Small Wins Today', prompt: 'List 3 things — no matter how tiny — that you managed to do today. Celebrate each one.', signal: 'motivation', relevanceBase: 7 },
      { id: 'sad-jo-3', type: 'journal', title: 'What I Need Right Now', prompt: 'If you could ask for anything right now, what would it be? Write it down without judgment.', signal: 'breakup', relevanceBase: 6 }
    ],
    recipes: [
      { id: 'sad-re-1', type: 'recipe', title: 'Sunshine Mood Boost', subtitle: 'Vitamin D & serotonin support', signal: 'body', ingredients: ['1 cup mango (frozen)', '1/2 banana', '1 cup orange juice', '1 tbsp chia seeds', '1/2 cup Greek yogurt', 'Splash of vanilla'], steps: ['Pour orange juice into blender', 'Add frozen mango and banana', 'Add yogurt and chia seeds', 'Add vanilla splash', 'Blend until creamy', 'Sip and let the sunshine in'] }
    ],
    info: [
      { id: 'sad-in-1', type: 'info', title: 'Why This Helps', content: 'Sadness slows us down. Gentle movement and self-compassion activate reward circuits in the brain, releasing small doses of dopamine and oxytocin.', signal: 'social', relevanceBase: 4 }
    ]
  },

  tired: {
    spotify: [
      { id: 'tir-sp-1', type: 'media', category: 'music', title: 'Sleep & Relax', subtitle: 'Drift off peacefully', duration: '3+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DWZd79rJ6a7lp', signal: 'sleep', relevanceBase: 9 },
      { id: 'tir-sp-2', type: 'media', category: 'music', title: 'Night Rain', subtitle: 'Rainfall sounds for sleep', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX8ymr6UES7vc', signal: 'sleep', relevanceBase: 8 },
      { id: 'tir-sp-3', type: 'media', category: 'music', title: 'Energy Boost', subtitle: 'Upbeat tracks to wake up', duration: '1+ hour', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX76Wlfdnj7AP', signal: 'motivation', relevanceBase: 7 },
      { id: 'tir-sp-4', type: 'media', category: 'music', title: 'Gentle Wake Up', subtitle: 'Soft morning melodies', duration: '1+ hour', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX6ThddIjWuGT', signal: 'body', relevanceBase: 7 },
      { id: 'tir-sp-5', type: 'media', category: 'music', title: 'Deep Sleep Sounds', subtitle: 'Delta waves for rest', duration: '3+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DWYcDQ1hSjOpY', signal: 'sleep', relevanceBase: 9 },
      { id: 'tir-sp-6', type: 'media', category: 'music', title: 'Afternoon Reset', subtitle: 'Mellow beats for a recharge', duration: '1+ hour', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX0SM0LYsmbMT', signal: 'focus', relevanceBase: 7 },
      { id: 'tir-sp-7', type: 'media', category: 'music', title: 'Yoga Nidra Music', subtitle: 'Sleep meditation soundtrack', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DWZqd5JICZI0u', signal: 'sleep', relevanceBase: 8 },
      { id: 'tir-sp-8', type: 'media', category: 'music', title: 'Morning Coffee Jazz', subtitle: 'Easy jazz to gently wake', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX4wta20PHgwo', signal: 'motivation', relevanceBase: 7 }
    ],
    youtubeFallback: [
      { id: 'tir-yt-1', type: 'media', category: 'meditation', title: 'Body Scan for Rest', subtitle: 'Full body relaxation', duration: '15 min', platform: 'youtube', youtubeVideoId: 'T0nuKuHmMmc', signal: 'sleep', relevanceBase: 10 },
      { id: 'tir-yt-2', type: 'media', category: 'yoga', title: 'Bedtime Yoga', subtitle: 'Gentle stretches for sleep', duration: '12 min', platform: 'youtube', youtubeVideoId: 'BiWDsfZ3zbo', signal: 'body', relevanceBase: 8 },
      { id: 'tir-yt-3', type: 'media', category: 'meditation', title: 'Yoga Nidra Sleep', subtitle: 'Deep conscious rest', duration: '20 min', platform: 'youtube', youtubeVideoId: 'M0u9GST_j3s', signal: 'sleep', relevanceBase: 9 },
      { id: 'tir-yt-4', type: 'media', category: 'yoga', title: '5-Minute Wake Up Stretch', subtitle: 'Quick morning energizer', duration: '5 min', platform: 'youtube', youtubeVideoId: '4pKly2JojMw', signal: 'body', relevanceBase: 7 },
      { id: 'tir-yt-5', type: 'media', category: 'meditation', title: 'Power Nap Meditation', subtitle: 'Quick 10-minute recharge', duration: '10 min', platform: 'youtube', youtubeVideoId: 'tGhRguYQKMI', signal: 'focus', relevanceBase: 8 },
      { id: 'tir-yt-6', type: 'media', category: 'meditation', title: 'Sleep Stories', subtitle: 'Calm tales to drift off to', duration: '25 min', platform: 'youtube', youtubeVideoId: 'rvaqPPjGMIQ', signal: 'sleep', relevanceBase: 8 },
      { id: 'tir-yt-7', type: 'media', category: 'yoga', title: 'Restorative Yoga', subtitle: 'Slow supported poses', duration: '20 min', platform: 'youtube', youtubeVideoId: 'qx3bfGTpsfY', signal: 'body', relevanceBase: 8 },
      { id: 'tir-yt-8', type: 'media', category: 'movement', title: 'Gentle Energy Flow', subtitle: 'Wake up your body slowly', duration: '10 min', platform: 'youtube', youtubeVideoId: 'vLMmMv3IJUE', signal: 'motivation', relevanceBase: 7 }
    ],
    breathing: [
      { id: 'tir-br-1', type: 'breathing', title: 'Sleep Breathing 4-7-8', subtitle: 'The relaxation breath', duration: 60, pattern: { inhale: 4, hold1: 7, exhale: 8, hold2: 0 }, signal: 'sleep', relevanceBase: 10 },
      { id: 'tir-br-2', type: 'breathing', title: 'Energizing Breath (4-0-4-0)', subtitle: 'Quick rhythmic breathing', duration: 60, pattern: { inhale: 4, hold1: 0, exhale: 4, hold2: 0 }, signal: 'motivation', relevanceBase: 7 },
      { id: 'tir-br-3', type: 'breathing', title: 'Ocean Breath (5-0-7-0)', subtitle: 'Ujjayi for calming rest', duration: 60, pattern: { inhale: 5, hold1: 0, exhale: 7, hold2: 0 }, signal: 'sleep', relevanceBase: 8 }
    ],
    micro: [
      { id: 'tir-mi-1', type: 'micro', title: 'Eye Palming', subtitle: 'Rest your tired eyes', duration: '60 sec', instruction: 'Rub your palms together until warm. Cup them gently over closed eyes. Breathe deeply.', signal: 'headache', relevanceBase: 7 },
      { id: 'tir-mi-2', type: 'micro', title: 'Legs Up the Wall', subtitle: 'Reverse blood flow for energy', duration: '90 sec', instruction: 'Lie on your back with legs up against a wall. Close your eyes and breathe for 90 seconds.', signal: 'body', relevanceBase: 8 },
      { id: 'tir-mi-3', type: 'micro', title: 'Cold Face Splash', subtitle: 'Instant alertness boost', duration: '30 sec', instruction: 'Splash cold water on your face 3 times. Pat dry and take 3 deep breaths.', signal: 'focus', relevanceBase: 7 },
      { id: 'tir-mi-4', type: 'micro', title: 'Standing Stretch', subtitle: 'Reach for the sky', duration: '60 sec', instruction: 'Stand up, interlace fingers overhead, and stretch tall. Hold 10 seconds, repeat 3 times.', signal: 'body', relevanceBase: 7 }
    ],
    journal: [
      { id: 'tir-jo-1', type: 'journal', title: 'Energy Audit', prompt: 'What drained your energy today? What gave you energy? Write down both lists.', signal: 'work', relevanceBase: 5 },
      { id: 'tir-jo-2', type: 'journal', title: 'Rest Permission', prompt: 'Write a note to yourself giving permission to rest. What would change if you truly rested?', signal: 'motivation', relevanceBase: 6 },
      { id: 'tir-jo-3', type: 'journal', title: 'Sleep Reflection', prompt: 'How has your sleep been this week? What one thing could improve your rest tonight?', signal: 'sleep', relevanceBase: 6 }
    ],
    recipes: [
      { id: 'tir-re-1', type: 'recipe', title: 'Green Energy Smoothie', subtitle: 'Natural energy without caffeine', signal: 'body', ingredients: ['1 cup spinach', '1 banana', '1/2 cup pineapple', '1 tbsp flax seeds', '1 cup coconut water', 'Ice cubes'], steps: ['Add coconut water to blender', 'Add spinach and banana', 'Add pineapple and flax seeds', 'Add ice cubes', 'Blend until smooth', 'Drink and feel the boost'] }
    ],
    info: [
      { id: 'tir-in-1', type: 'info', title: 'Why This Helps', content: 'Fatigue often comes from both physical and mental overload. Gentle movement and breathing exercises improve oxygen flow and help your body recover without stimulants.', signal: 'focus', relevanceBase: 4 }
    ]
  },

  angry: {
    spotify: [
      { id: 'ang-sp-1', type: 'media', category: 'music', title: 'Release & Unwind', subtitle: 'Let the tension go', duration: '1+ hour', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX3Ogo9pFvBkY', signal: 'social', relevanceBase: 8 },
      { id: 'ang-sp-2', type: 'media', category: 'music', title: 'Workout Energy', subtitle: 'Channel anger into movement', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX76Wlfdnj7AP', signal: 'body', relevanceBase: 8 },
      { id: 'ang-sp-3', type: 'media', category: 'music', title: 'Rage Room Beats', subtitle: 'Heavy beats to release', duration: '1+ hour', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX1tyCD9QhIWF', signal: 'motivation', relevanceBase: 7 },
      { id: 'ang-sp-4', type: 'media', category: 'music', title: 'Calm After Storm', subtitle: 'Post-anger soothing music', duration: '1+ hour', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DWU0ScTcjJBdj', signal: 'panic', relevanceBase: 8 },
      { id: 'ang-sp-5', type: 'media', category: 'music', title: 'Nature Calm', subtitle: 'Forest & water sounds', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX4PP3DA4J0N8', signal: 'focus', relevanceBase: 7 },
      { id: 'ang-sp-6', type: 'media', category: 'music', title: 'Chill Hits', subtitle: 'Mellow popular tracks', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX0UrRvztWcAU', signal: 'social', relevanceBase: 7 },
      { id: 'ang-sp-7', type: 'media', category: 'music', title: 'Deep House Calm', subtitle: 'Rhythmic & grounding', duration: '1+ hour', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX2TRYkJECvfC', signal: 'body', relevanceBase: 7 },
      { id: 'ang-sp-8', type: 'media', category: 'music', title: 'Instrumental Focus', subtitle: 'Channel energy into clarity', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DWZeKCadgRdKQ', signal: 'work', relevanceBase: 7 }
    ],
    youtubeFallback: [
      { id: 'ang-yt-1', type: 'media', category: 'meditation', title: 'Letting Go Meditation', subtitle: 'Release anger mindfully', duration: '12 min', platform: 'youtube', youtubeVideoId: 'q0dM0wGZPfg', signal: 'work', relevanceBase: 9 },
      { id: 'ang-yt-2', type: 'media', category: 'yoga', title: 'Yoga for Frustration', subtitle: 'Move through the fire', duration: '18 min', platform: 'youtube', youtubeVideoId: 'Nw2oBIrxy_Q', signal: 'body', relevanceBase: 9 },
      { id: 'ang-yt-3', type: 'media', category: 'meditation', title: 'Anger Management Guided', subtitle: 'Tools for when you\'re fuming', duration: '15 min', platform: 'youtube', youtubeVideoId: 'BjY619aKOmU', signal: 'social', relevanceBase: 8 },
      { id: 'ang-yt-4', type: 'media', category: 'movement', title: 'Kickboxing Stress Relief', subtitle: 'Physical release workout', duration: '20 min', platform: 'youtube', youtubeVideoId: 'lRVacp1HFbE', signal: 'body', relevanceBase: 8 },
      { id: 'ang-yt-5', type: 'media', category: 'meditation', title: 'Compassion for Anger', subtitle: 'Understand your anger', duration: '10 min', platform: 'youtube', youtubeVideoId: '1ZYbU82GVz4', signal: 'social', relevanceBase: 8 },
      { id: 'ang-yt-6', type: 'media', category: 'yoga', title: 'Power Yoga Release', subtitle: 'Strong flow for frustration', duration: '25 min', platform: 'youtube', youtubeVideoId: '6hVMqxmrebE', signal: 'body', relevanceBase: 8 },
      { id: 'ang-yt-7', type: 'media', category: 'meditation', title: 'Cooling Down Meditation', subtitle: 'From fire to calm', duration: '8 min', platform: 'youtube', youtubeVideoId: 'SEfs5TJZ6Nk', signal: 'panic', relevanceBase: 8 },
      { id: 'ang-yt-8', type: 'media', category: 'movement', title: 'Walk Off the Anger', subtitle: 'Mindful walking practice', duration: '10 min', platform: 'youtube', youtubeVideoId: 'inpok4MKVLM', signal: 'body', relevanceBase: 7 }
    ],
    breathing: [
      { id: 'ang-br-1', type: 'breathing', title: 'Cooling Breath (4-0-8-2)', subtitle: 'Extend exhale to cool down', duration: 60, pattern: { inhale: 4, hold1: 0, exhale: 8, hold2: 2 }, signal: 'panic', relevanceBase: 10 },
      { id: 'ang-br-2', type: 'breathing', title: 'Lion\'s Breath (3-0-5-0)', subtitle: 'Exhale with open mouth', duration: 60, pattern: { inhale: 3, hold1: 0, exhale: 5, hold2: 0 }, signal: 'body', relevanceBase: 8 },
      { id: 'ang-br-3', type: 'breathing', title: 'Slow Count Breath (6-2-6-2)', subtitle: 'Slow everything down', duration: 60, pattern: { inhale: 6, hold1: 2, exhale: 6, hold2: 2 }, signal: 'work', relevanceBase: 8 }
    ],
    micro: [
      { id: 'ang-mi-1', type: 'micro', title: 'Ice Cube Hold', subtitle: 'Redirect intense sensation', duration: '60 sec', instruction: 'Hold an ice cube in your fist. Focus on the cold sensation as it melts. Breathe slowly.', signal: 'panic', relevanceBase: 8 },
      { id: 'ang-mi-2', type: 'micro', title: 'Power Pose', subtitle: 'Stand tall and reclaim power', duration: '90 sec', instruction: 'Stand with feet wide, hands on hips or arms overhead. Hold for 90 seconds. Own the space.', signal: 'motivation', relevanceBase: 7 },
      { id: 'ang-mi-3', type: 'micro', title: 'Scream Into a Pillow', subtitle: 'Safe release of frustration', duration: '30 sec', instruction: 'Grab a pillow, press your face into it, and scream or growl. Release it all. Then take 3 deep breaths.', signal: 'social', relevanceBase: 8 },
      { id: 'ang-mi-4', type: 'micro', title: 'Rip Paper Release', subtitle: 'Satisfying destruction', duration: '60 sec', instruction: 'Grab old paper or newspaper. Rip it into small pieces as aggressively as you want. Focus on the sensation.', signal: 'work', relevanceBase: 7 }
    ],
    journal: [
      { id: 'ang-jo-1', type: 'journal', title: 'Anger Letter', prompt: 'Write an uncensored letter to whoever or whatever made you angry. You will NOT send this. Let it all out.', signal: 'work', relevanceBase: 8 },
      { id: 'ang-jo-2', type: 'journal', title: 'Beneath the Anger', prompt: 'Anger often masks other emotions. What\'s underneath yours right now? Fear? Hurt? Disappointment?', signal: 'social', relevanceBase: 7 },
      { id: 'ang-jo-3', type: 'journal', title: 'Boundary Check', prompt: 'Was a boundary crossed? What boundary do you need to set or communicate? Write it clearly.', signal: 'work', relevanceBase: 7 }
    ],
    recipes: [],
    info: [
      { id: 'ang-in-1', type: 'info', title: 'Why This Helps', content: 'Anger triggers adrenaline and cortisol. Physical movement burns off these stress chemicals, while breathing activates your vagus nerve to calm the fight response.', signal: 'focus', relevanceBase: 4 }
    ]
  },

  happy: {
    spotify: [
      { id: 'hap-sp-1', type: 'media', category: 'music', title: 'Happy Hits', subtitle: 'Feel-good favorites', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DXdPec7aLTmlC', signal: 'social', relevanceBase: 10 },
      { id: 'hap-sp-2', type: 'media', category: 'music', title: 'Good Vibes', subtitle: 'Uplifting positive energy', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX0UrRvztWcAU', signal: 'motivation', relevanceBase: 9 },
      { id: 'hap-sp-3', type: 'media', category: 'music', title: 'Dance Party', subtitle: 'Get moving and celebrate', duration: '1+ hour', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX0BcQWzuB7ZO', signal: 'body', relevanceBase: 8 },
      { id: 'hap-sp-4', type: 'media', category: 'music', title: 'Sunny Day Playlist', subtitle: 'Bright acoustic vibes', duration: '1+ hour', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX1BzILRveYHb', signal: 'social', relevanceBase: 8 },
      { id: 'hap-sp-5', type: 'media', category: 'music', title: 'Confidence Boost', subtitle: 'Songs that empower', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX4fpCWaHOned', signal: 'motivation', relevanceBase: 8 },
      { id: 'hap-sp-6', type: 'media', category: 'music', title: 'Road Trip Jams', subtitle: 'Adventure & freedom', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DXdLK5wjKyhVm', signal: 'social', relevanceBase: 7 },
      { id: 'hap-sp-7', type: 'media', category: 'music', title: 'Peaceful Morning', subtitle: 'Start the day grateful', duration: '1+ hour', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX6ThddIjWuGT', signal: 'focus', relevanceBase: 7 },
      { id: 'hap-sp-8', type: 'media', category: 'music', title: 'Feel Good Indie', subtitle: 'Warm indie pop tracks', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX2sUQwD7tbmL', signal: 'motivation', relevanceBase: 8 }
    ],
    youtubeFallback: [
      { id: 'hap-yt-1', type: 'media', category: 'meditation', title: 'Gratitude Meditation', subtitle: 'Deepen your thankfulness', duration: '10 min', platform: 'youtube', youtubeVideoId: 'Lxprri_H9Is', signal: 'motivation', relevanceBase: 9 },
      { id: 'hap-yt-2', type: 'media', category: 'yoga', title: 'Joyful Morning Flow', subtitle: 'Energizing sun salutations', duration: '20 min', platform: 'youtube', youtubeVideoId: 'sTANio_2E0Q', signal: 'body', relevanceBase: 8 },
      { id: 'hap-yt-3', type: 'media', category: 'meditation', title: 'Manifest Your Best Day', subtitle: 'Visualization for success', duration: '12 min', platform: 'youtube', youtubeVideoId: 'GlEHKzR_8fA', signal: 'motivation', relevanceBase: 8 },
      { id: 'hap-yt-4', type: 'media', category: 'yoga', title: 'Dance Yoga Fusion', subtitle: 'Playful movement flow', duration: '15 min', platform: 'youtube', youtubeVideoId: '4pKly2JojMw', signal: 'body', relevanceBase: 7 },
      { id: 'hap-yt-5', type: 'media', category: 'meditation', title: 'Abundance Meditation', subtitle: 'Attract more goodness', duration: '10 min', platform: 'youtube', youtubeVideoId: 'z6X5oEIg6Ak', signal: 'focus', relevanceBase: 8 },
      { id: 'hap-yt-6', type: 'media', category: 'movement', title: 'Happy Dance Workout', subtitle: 'Dance like nobody\'s watching', duration: '18 min', platform: 'youtube', youtubeVideoId: 'oVl3Dha4p-g', signal: 'social', relevanceBase: 8 },
      { id: 'hap-yt-7', type: 'media', category: 'yoga', title: 'Sunset Yoga Flow', subtitle: 'Celebrate the day', duration: '15 min', platform: 'youtube', youtubeVideoId: '2FiNvl9OrkM', signal: 'body', relevanceBase: 7 },
      { id: 'hap-yt-8', type: 'media', category: 'meditation', title: 'Self-Love Affirmations', subtitle: 'Positive words for yourself', duration: '8 min', platform: 'youtube', youtubeVideoId: 'IeblJdB2-Vo', signal: 'motivation', relevanceBase: 8 }
    ],
    breathing: [
      { id: 'hap-br-1', type: 'breathing', title: 'Energizing Breath (4-4-4-0)', subtitle: 'Boost your vitality', duration: 60, pattern: { inhale: 4, hold1: 4, exhale: 4, hold2: 0 }, signal: 'focus', relevanceBase: 6 },
      { id: 'hap-br-2', type: 'breathing', title: 'Joy Breath (4-2-4-2)', subtitle: 'Rhythmic and uplifting', duration: 60, pattern: { inhale: 4, hold1: 2, exhale: 4, hold2: 2 }, signal: 'motivation', relevanceBase: 7 }
    ],
    micro: [
      { id: 'hap-mi-1', type: 'micro', title: 'Joy List', subtitle: 'Name what makes you smile', duration: '60 sec', instruction: 'Write down 5 things that brought you joy recently. Read them out loud with a smile.', signal: 'motivation', relevanceBase: 9 },
      { id: 'hap-mi-2', type: 'micro', title: 'Share the Joy', subtitle: 'Spread the good vibes', duration: '90 sec', instruction: 'Send a kind message to someone. Tell them something you appreciate about them.', signal: 'social', relevanceBase: 8 },
      { id: 'hap-mi-3', type: 'micro', title: 'Victory Dance', subtitle: 'Celebrate yourself!', duration: '60 sec', instruction: 'Stand up and do a 60-second dance to your favorite song. Let yourself be silly.', signal: 'body', relevanceBase: 7 },
      { id: 'hap-mi-4', type: 'micro', title: 'Gratitude Text', subtitle: 'Send a thank you note', duration: '90 sec', instruction: 'Think of someone who helped you recently. Send them a quick thank-you message right now.', signal: 'social', relevanceBase: 8 }
    ],
    journal: [
      { id: 'hap-jo-1', type: 'journal', title: 'Peak Moment Capture', prompt: 'Describe the happiest moment of your week in vivid detail. What made it special?', signal: 'motivation', relevanceBase: 7 },
      { id: 'hap-jo-2', type: 'journal', title: 'Future Joy Map', prompt: 'What 3 things would make next week even better? Plan one small joy for each day.', signal: 'focus', relevanceBase: 6 },
      { id: 'hap-jo-3', type: 'journal', title: 'Gratitude Overflow', prompt: 'List 10 things you\'re grateful for right now. Include at least 3 about yourself.', signal: 'motivation', relevanceBase: 7 }
    ],
    recipes: [],
    info: [
      { id: 'hap-in-1', type: 'info', title: 'Why This Helps', content: 'When you\'re happy, your brain is primed for growth. Gratitude practices and movement compound positive emotions and build lasting resilience.', signal: 'focus', relevanceBase: 4 }
    ]
  },

  neutral: {
    spotify: [
      { id: 'neu-sp-1', type: 'media', category: 'music', title: 'Focus Flow', subtitle: 'Deep work soundtrack', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DWZeKCadgRdKQ', signal: 'work', relevanceBase: 9 },
      { id: 'neu-sp-2', type: 'media', category: 'music', title: 'Chill Tracks', subtitle: 'Relaxed but present', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX0UrRvztWcAU', signal: 'social', relevanceBase: 7 },
      { id: 'neu-sp-3', type: 'media', category: 'music', title: 'Lo-Fi Study', subtitle: 'Background study beats', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DWWQRwui0ExPn', signal: 'focus', relevanceBase: 8 },
      { id: 'neu-sp-4', type: 'media', category: 'music', title: 'Discover Weekly', subtitle: 'Fresh music picks', duration: '1+ hour', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX4JAvHpjipBk', signal: 'motivation', relevanceBase: 7 },
      { id: 'neu-sp-5', type: 'media', category: 'music', title: 'Ambient Chill', subtitle: 'Soft atmospheric sounds', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX3PIPIT6JEa0', signal: 'focus', relevanceBase: 7 },
      { id: 'neu-sp-6', type: 'media', category: 'music', title: 'Acoustic Morning', subtitle: 'Start the day mindfully', duration: '1+ hour', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX4E3UdUs7fUx', signal: 'motivation', relevanceBase: 7 },
      { id: 'neu-sp-7', type: 'media', category: 'music', title: 'Jazz Vibes', subtitle: 'Smooth jazz for any mood', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX4wta20PHgwo', signal: 'social', relevanceBase: 7 },
      { id: 'neu-sp-8', type: 'media', category: 'music', title: 'Mindful Melodies', subtitle: 'Present-moment music', duration: '1+ hour', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DWU0ScTcjJBdj', signal: 'focus', relevanceBase: 8 }
    ],
    youtubeFallback: [
      { id: 'neu-yt-1', type: 'media', category: 'meditation', title: 'Mindful Moment', subtitle: 'Quick awareness check-in', duration: '10 min', platform: 'youtube', youtubeVideoId: 'inpok4MKVLM', signal: 'focus', relevanceBase: 8 },
      { id: 'neu-yt-2', type: 'media', category: 'yoga', title: 'Daily Yoga Practice', subtitle: 'Balanced full-body flow', duration: '15 min', platform: 'youtube', youtubeVideoId: 'g_tea8ZNk5A', signal: 'body', relevanceBase: 8 },
      { id: 'neu-yt-3', type: 'media', category: 'meditation', title: 'Focus & Clarity', subtitle: 'Sharpen your attention', duration: '12 min', platform: 'youtube', youtubeVideoId: 'z6X5oEIg6Ak', signal: 'focus', relevanceBase: 8 },
      { id: 'neu-yt-4', type: 'media', category: 'yoga', title: 'Morning Sun Salutation', subtitle: 'Classic energizing flow', duration: '10 min', platform: 'youtube', youtubeVideoId: 'sTANio_2E0Q', signal: 'body', relevanceBase: 7 },
      { id: 'neu-yt-5', type: 'media', category: 'meditation', title: 'Breath Awareness', subtitle: 'Simply observe your breath', duration: '8 min', platform: 'youtube', youtubeVideoId: 'SEfs5TJZ6Nk', signal: 'focus', relevanceBase: 7 },
      { id: 'neu-yt-6', type: 'media', category: 'movement', title: 'Walking Meditation', subtitle: 'Mindful steps anywhere', duration: '10 min', platform: 'youtube', youtubeVideoId: 'inpok4MKVLM', signal: 'body', relevanceBase: 7 },
      { id: 'neu-yt-7', type: 'media', category: 'meditation', title: 'Body Awareness Scan', subtitle: 'Check in with yourself', duration: '15 min', platform: 'youtube', youtubeVideoId: 'T0nuKuHmMmc', signal: 'body', relevanceBase: 8 },
      { id: 'neu-yt-8', type: 'media', category: 'yoga', title: 'Flexibility Flow', subtitle: 'Gentle full-body stretch', duration: '12 min', platform: 'youtube', youtubeVideoId: 'BiWDsfZ3zbo', signal: 'body', relevanceBase: 7 }
    ],
    breathing: [
      { id: 'neu-br-1', type: 'breathing', title: 'Balancing Breath (4-2-4-2)', subtitle: 'Even in, even out', duration: 60, pattern: { inhale: 4, hold1: 2, exhale: 4, hold2: 2 }, signal: 'focus', relevanceBase: 8 },
      { id: 'neu-br-2', type: 'breathing', title: 'Mindful Breathing (5-0-5-0)', subtitle: 'Simple awareness breath', duration: 60, pattern: { inhale: 5, hold1: 0, exhale: 5, hold2: 0 }, signal: 'focus', relevanceBase: 7 }
    ],
    micro: [
      { id: 'neu-mi-1', type: 'micro', title: 'Mindful Minute', subtitle: 'Pause and observe', duration: '60 sec', instruction: 'Close your eyes. For 60 seconds, simply notice: sounds, sensations, breath. No judgment.', signal: 'focus', relevanceBase: 7 },
      { id: 'neu-mi-2', type: 'micro', title: 'Gratitude Pause', subtitle: 'Quick thankfulness check', duration: '60 sec', instruction: 'Name 3 things you\'re grateful for right now. Say each one out loud slowly.', signal: 'motivation', relevanceBase: 7 },
      { id: 'neu-mi-3', type: 'micro', title: 'Intention Setting', subtitle: 'Choose your next hour', duration: '60 sec', instruction: 'Set one clear intention for the next hour. Write it down or say it aloud: "For the next hour, I will..."', signal: 'focus', relevanceBase: 7 },
      { id: 'neu-mi-4', type: 'micro', title: 'Hydration Check', subtitle: 'Drink a full glass of water', duration: '60 sec', instruction: 'Pour a full glass of water. Drink it slowly over 60 seconds. Notice the sensation.', signal: 'body', relevanceBase: 6 }
    ],
    journal: [
      { id: 'neu-jo-1', type: 'journal', title: 'Check-in Questions', prompt: 'What is on your mind? What are you looking forward to? What do you need today?', signal: 'focus', relevanceBase: 6 },
      { id: 'neu-jo-2', type: 'journal', title: 'Daily Reflection', prompt: 'What went well today? What could have been better? What will you do differently tomorrow?', signal: 'motivation', relevanceBase: 6 },
      { id: 'neu-jo-3', type: 'journal', title: 'Curiosity Prompt', prompt: 'What\'s something you\'ve been curious about lately? Why does it interest you? Explore it on paper.', signal: 'focus', relevanceBase: 5 }
    ],
    recipes: [],
    info: [
      { id: 'neu-in-1', type: 'info', title: 'Why This Helps', content: 'Even when you feel neutral, small wellness practices compound over time. Consistent check-ins build emotional awareness and resilience.', signal: 'focus', relevanceBase: 4 }
    ]
  },

  anxious: {
    spotify: [
      { id: 'anx-sp-1', type: 'media', category: 'music', title: 'Anxiety Relief Music', subtitle: 'Calming frequencies', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DWXe9gFZP0gtP', signal: 'panic', relevanceBase: 9 },
      { id: 'anx-sp-2', type: 'media', category: 'music', title: 'Weightless Sounds', subtitle: 'Scientifically calming tones', duration: '1+ hour', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX3PIPIT6JEa0', signal: 'panic', relevanceBase: 9 },
      { id: 'anx-sp-3', type: 'media', category: 'music', title: 'Safe & Sound', subtitle: 'Cozy acoustic calm', duration: '1+ hour', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX4E3UdUs7fUx', signal: 'lonely', relevanceBase: 8 },
      { id: 'anx-sp-4', type: 'media', category: 'music', title: 'Ocean Waves', subtitle: 'Natural water sounds', duration: '3+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX4PP3DA4J0N8', signal: 'sleep', relevanceBase: 8 },
      { id: 'anx-sp-5', type: 'media', category: 'music', title: 'Slow Piano', subtitle: 'Gentle keys for calm', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX4sWSpwq3LiO', signal: 'focus', relevanceBase: 8 },
      { id: 'anx-sp-6', type: 'media', category: 'music', title: 'Breathwork Soundtrack', subtitle: 'Music for breathing exercises', duration: '1+ hour', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DWU0ScTcjJBdj', signal: 'panic', relevanceBase: 9 },
      { id: 'anx-sp-7', type: 'media', category: 'music', title: 'Ambient Healing', subtitle: 'Ethereal soundscapes', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX9uKNf5jGX6m', signal: 'body', relevanceBase: 7 },
      { id: 'anx-sp-8', type: 'media', category: 'music', title: 'Calm Classical', subtitle: 'Baroque for the nervous system', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DWVFeEut75IAL', signal: 'focus', relevanceBase: 7 }
    ],
    youtubeFallback: [
      { id: 'anx-yt-1', type: 'media', category: 'meditation', title: 'Panic Attack Relief', subtitle: 'Immediate grounding guide', duration: '8 min', platform: 'youtube', youtubeVideoId: 'O-6f5wQXSu8', signal: 'panic', relevanceBase: 10 },
      { id: 'anx-yt-2', type: 'media', category: 'meditation', title: 'Anxiety Detox', subtitle: 'Release worry cycle', duration: '15 min', platform: 'youtube', youtubeVideoId: 'QS2yDmWk0vs', signal: 'panic', relevanceBase: 9 },
      { id: 'anx-yt-3', type: 'media', category: 'yoga', title: 'Yoga for Anxiety', subtitle: 'Calming poses for nerves', duration: '25 min', platform: 'youtube', youtubeVideoId: 'bJJWArKlKW8', signal: 'body', relevanceBase: 8 },
      { id: 'anx-yt-4', type: 'media', category: 'meditation', title: 'Safe Place Visualization', subtitle: 'Create your mental sanctuary', duration: '12 min', platform: 'youtube', youtubeVideoId: '1ZYbU82GVz4', signal: 'panic', relevanceBase: 9 },
      { id: 'anx-yt-5', type: 'media', category: 'meditation', title: 'Stop Overthinking', subtitle: 'Break the thought spiral', duration: '10 min', platform: 'youtube', youtubeVideoId: 'aEqlQvczMJQ', signal: 'focus', relevanceBase: 8 },
      { id: 'anx-yt-6', type: 'media', category: 'yoga', title: 'Gentle Nervous System Reset', subtitle: 'Vagus nerve activation', duration: '18 min', platform: 'youtube', youtubeVideoId: 'SedzswEwpPw', signal: 'body', relevanceBase: 8 },
      { id: 'anx-yt-7', type: 'media', category: 'meditation', title: 'Body Scan for Anxiety', subtitle: 'Notice and release tension', duration: '20 min', platform: 'youtube', youtubeVideoId: 'T0nuKuHmMmc', signal: 'body', relevanceBase: 8 },
      { id: 'anx-yt-8', type: 'media', category: 'meditation', title: '3-Minute Breathing Space', subtitle: 'Quick anxiety reset', duration: '3 min', platform: 'youtube', youtubeVideoId: 'SEfs5TJZ6Nk', signal: 'panic', relevanceBase: 9 }
    ],
    breathing: [
      { id: 'anx-br-1', type: 'breathing', title: 'Box Breathing (4-4-4-4)', subtitle: 'Navy SEAL calming technique', duration: 60, pattern: { inhale: 4, hold1: 4, exhale: 4, hold2: 4 }, signal: 'panic', relevanceBase: 10 },
      { id: 'anx-br-2', type: 'breathing', title: 'Extended Exhale (4-0-8-0)', subtitle: 'Double exhale for calm', duration: 60, pattern: { inhale: 4, hold1: 0, exhale: 8, hold2: 0 }, signal: 'panic', relevanceBase: 10 },
      { id: 'anx-br-3', type: 'breathing', title: '4-7-8 Calm Down (4-7-8-0)', subtitle: 'Deep relaxation breath', duration: 60, pattern: { inhale: 4, hold1: 7, exhale: 8, hold2: 0 }, signal: 'sleep', relevanceBase: 9 }
    ],
    micro: [
      { id: 'anx-mi-1', type: 'micro', title: 'Grounding 5-4-3-2-1', subtitle: 'Reconnect with the present', duration: '90 sec', instruction: 'Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.', signal: 'panic', relevanceBase: 9 },
      { id: 'anx-mi-2', type: 'micro', title: 'Butterfly Hug', subtitle: 'Self-soothing bilateral tap', duration: '60 sec', instruction: 'Cross arms over chest, tap alternating shoulders slowly. Breathe deeply as you tap.', signal: 'panic', relevanceBase: 9 },
      { id: 'anx-mi-3', type: 'micro', title: 'Ice Dive Response', subtitle: 'Cold water vagus reset', duration: '30 sec', instruction: 'Fill a bowl with cold water and ice. Hold your breath and submerge your face for 15-30 seconds.', signal: 'panic', relevanceBase: 8 },
      { id: 'anx-mi-4', type: 'micro', title: 'Name Your Fear', subtitle: 'Externalize the worry', duration: '60 sec', instruction: 'Say aloud: "I notice I am feeling anxious about ___." Name it 3 times. Notice it lose power.', signal: 'work', relevanceBase: 8 }
    ],
    journal: [
      { id: 'anx-jo-1', type: 'journal', title: 'Worry Inventory', prompt: 'List every worry on your mind. Rate each 1-10. Circle only the ones above 7 — those are worth your attention.', signal: 'work', relevanceBase: 7 },
      { id: 'anx-jo-2', type: 'journal', title: 'Best/Worst/Likely', prompt: 'What\'s the worst that could happen? The best? The most likely? Write all three scenarios.', signal: 'panic', relevanceBase: 7 },
      { id: 'anx-jo-3', type: 'journal', title: 'Safety Inventory', prompt: 'List 5 things that are going right in your life right now. Remind yourself of what is stable.', signal: 'panic', relevanceBase: 7 }
    ],
    recipes: [
      { id: 'anx-re-1', type: 'recipe', title: 'Chamomile Calm Smoothie', subtitle: 'Soothing anti-anxiety blend', signal: 'body', ingredients: ['1 cup chamomile tea (cooled)', '1 banana (frozen)', '1/2 cup blueberries', '1 tbsp honey', '1/4 tsp lavender extract', '1/2 cup almond milk'], steps: ['Brew chamomile tea and cool', 'Add cooled tea and almond milk to blender', 'Add frozen banana and blueberries', 'Add honey and lavender', 'Blend until smooth', 'Sip slowly, breathe between sips'] }
    ],
    info: [
      { id: 'anx-in-1', type: 'info', title: 'Why This Helps', content: 'Anxiety activates your amygdala (threat center). Grounding techniques and controlled breathing activate the prefrontal cortex, overriding the fear response.', signal: 'focus', relevanceBase: 4 }
    ]
  },

  unfocused: {
    spotify: [
      { id: 'unf-sp-1', type: 'media', category: 'music', title: 'Deep Focus', subtitle: 'Concentration soundtrack', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DWZeKCadgRdKQ', signal: 'focus', relevanceBase: 9 },
      { id: 'unf-sp-2', type: 'media', category: 'music', title: 'Lo-Fi Beats', subtitle: 'Study-friendly beats', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DWWQRwui0ExPn', signal: 'focus', relevanceBase: 8 },
      { id: 'unf-sp-3', type: 'media', category: 'music', title: 'Brain Food', subtitle: 'Music for mental clarity', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DWXLeA8Omikj7', signal: 'focus', relevanceBase: 9 },
      { id: 'unf-sp-4', type: 'media', category: 'music', title: 'White Noise', subtitle: 'Block out distractions', duration: '3+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX4hpot8sYudB', signal: 'focus', relevanceBase: 7 },
      { id: 'unf-sp-5', type: 'media', category: 'music', title: 'Classical Focus', subtitle: 'Baroque for brainpower', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DWVFeEut75IAL', signal: 'focus', relevanceBase: 8 },
      { id: 'unf-sp-6', type: 'media', category: 'music', title: 'Electronic Focus', subtitle: 'Minimal techno for flow state', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX2TRYkJECvfC', signal: 'work', relevanceBase: 8 },
      { id: 'unf-sp-7', type: 'media', category: 'music', title: 'Ambient Study', subtitle: 'Atmospheric study sounds', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX3PIPIT6JEa0', signal: 'focus', relevanceBase: 8 },
      { id: 'unf-sp-8', type: 'media', category: 'music', title: 'Coffee Shop Sounds', subtitle: 'Background cafe ambience', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX4wta20PHgwo', signal: 'work', relevanceBase: 7 }
    ],
    youtubeFallback: [
      { id: 'unf-yt-1', type: 'media', category: 'meditation', title: 'Focus Meditation', subtitle: 'Sharpen your attention', duration: '10 min', platform: 'youtube', youtubeVideoId: 'z6X5oEIg6Ak', signal: 'focus', relevanceBase: 9 },
      { id: 'unf-yt-2', type: 'media', category: 'meditation', title: 'Clear Your Mind', subtitle: 'Mental declutter session', duration: '12 min', platform: 'youtube', youtubeVideoId: '1ZYbU82GVz4', signal: 'focus', relevanceBase: 8 },
      { id: 'unf-yt-3', type: 'media', category: 'yoga', title: 'Wake Up Yoga', subtitle: 'Energize body and mind', duration: '10 min', platform: 'youtube', youtubeVideoId: '4pKly2JojMw', signal: 'body', relevanceBase: 7 },
      { id: 'unf-yt-4', type: 'media', category: 'meditation', title: 'Pomodoro Meditation', subtitle: 'Set intention then work', duration: '5 min', platform: 'youtube', youtubeVideoId: 'SEfs5TJZ6Nk', signal: 'work', relevanceBase: 8 },
      { id: 'unf-yt-5', type: 'media', category: 'meditation', title: 'Concentration Practice', subtitle: 'Single-point focus training', duration: '15 min', platform: 'youtube', youtubeVideoId: 'QS2yDmWk0vs', signal: 'focus', relevanceBase: 9 },
      { id: 'unf-yt-6', type: 'media', category: 'movement', title: 'Desk Stretch Break', subtitle: 'Quick energy reset', duration: '5 min', platform: 'youtube', youtubeVideoId: 'M-8FvC3GR6o', signal: 'work', relevanceBase: 7 },
      { id: 'unf-yt-7', type: 'media', category: 'meditation', title: 'Breath Counting', subtitle: 'Count breaths to refocus', duration: '8 min', platform: 'youtube', youtubeVideoId: 'aEqlQvczMJQ', signal: 'focus', relevanceBase: 8 },
      { id: 'unf-yt-8', type: 'media', category: 'yoga', title: 'Standing Focus Flow', subtitle: 'Balance poses for mental clarity', duration: '12 min', platform: 'youtube', youtubeVideoId: 'g_tea8ZNk5A', signal: 'body', relevanceBase: 7 }
    ],
    breathing: [
      { id: 'unf-br-1', type: 'breathing', title: 'Energizing Breath (4-4-4-4)', subtitle: 'Box breathing for clarity', duration: 60, pattern: { inhale: 4, hold1: 4, exhale: 4, hold2: 4 }, signal: 'focus', relevanceBase: 9 },
      { id: 'unf-br-2', type: 'breathing', title: 'Stimulating Breath (3-0-3-0)', subtitle: 'Fast rhythm to wake up', duration: 60, pattern: { inhale: 3, hold1: 0, exhale: 3, hold2: 0 }, signal: 'motivation', relevanceBase: 8 }
    ],
    micro: [
      { id: 'unf-mi-1', type: 'micro', title: 'Brain Dump', subtitle: 'Clear mental clutter', duration: '90 sec', instruction: 'Write down everything on your mind — tasks, worries, ideas. Get it all out of your head onto paper.', signal: 'work', relevanceBase: 8 },
      { id: 'unf-mi-2', type: 'micro', title: 'Single Task Reset', subtitle: 'Pick ONE thing', duration: '60 sec', instruction: 'Close all tabs. Pick one task. Set a 25-minute timer. Only that task exists right now.', signal: 'focus', relevanceBase: 9 },
      { id: 'unf-mi-3', type: 'micro', title: 'Cold Water Wake-Up', subtitle: 'Splash and focus', duration: '30 sec', instruction: 'Splash cold water on your face. The shock activates alertness. Take 3 sharp breaths.', signal: 'body', relevanceBase: 7 },
      { id: 'unf-mi-4', type: 'micro', title: 'Eye Focus Exercise', subtitle: 'Train visual attention', duration: '60 sec', instruction: 'Pick an object across the room. Stare at it for 30 seconds. Then close eyes 30 seconds. Repeat.', signal: 'focus', relevanceBase: 7 }
    ],
    journal: [
      { id: 'unf-jo-1', type: 'journal', title: 'Priority Matrix', prompt: 'List everything you need to do. Star the 3 most important. Cross out anything that can wait until tomorrow.', signal: 'work', relevanceBase: 7 },
      { id: 'unf-jo-2', type: 'journal', title: 'Distraction Log', prompt: 'What keeps pulling your attention away? List your top distractions and one action for each.', signal: 'focus', relevanceBase: 7 },
      { id: 'unf-jo-3', type: 'journal', title: 'Why Does This Matter?', prompt: 'Pick the task you\'re avoiding. Write down WHY it matters to you. Connect it to a bigger goal.', signal: 'motivation', relevanceBase: 6 }
    ],
    recipes: [],
    info: [
      { id: 'unf-in-1', type: 'info', title: 'Why This Helps', content: 'Unfocused states often come from decision fatigue or dopamine depletion. Brief meditation and single-tasking reduce cognitive load and restore prefrontal cortex function.', signal: 'focus', relevanceBase: 4 }
    ]
  },

  lowEnergy: {
    spotify: [
      { id: 'low-sp-1', type: 'media', category: 'music', title: 'Energy Boost', subtitle: 'Get up and go tracks', duration: '1+ hour', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX76Wlfdnj7AP', signal: 'motivation', relevanceBase: 8 },
      { id: 'low-sp-2', type: 'media', category: 'music', title: 'Morning Motivation', subtitle: 'Kickstart your day', duration: '1+ hour', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DXc5e2bJhV6pu', signal: 'motivation', relevanceBase: 8 },
      { id: 'low-sp-3', type: 'media', category: 'music', title: 'Gentle Wake Up', subtitle: 'Ease into alertness', duration: '1+ hour', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX6ThddIjWuGT', signal: 'body', relevanceBase: 7 },
      { id: 'low-sp-4', type: 'media', category: 'music', title: 'Feel Good Pop', subtitle: 'Catchy upbeat tunes', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DXdPec7aLTmlC', signal: 'social', relevanceBase: 7 },
      { id: 'low-sp-5', type: 'media', category: 'music', title: 'Power Workout', subtitle: 'High energy beats', duration: '1+ hour', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX76Wlfdnj7AP', signal: 'body', relevanceBase: 8 },
      { id: 'low-sp-6', type: 'media', category: 'music', title: 'Uplifting Instrumental', subtitle: 'Cinematic energy music', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX4fpCWaHOned', signal: 'motivation', relevanceBase: 8 },
      { id: 'low-sp-7', type: 'media', category: 'music', title: 'Afternoon Pickup', subtitle: 'Beat the 3pm slump', duration: '1+ hour', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX0SM0LYsmbMT', signal: 'work', relevanceBase: 7 },
      { id: 'low-sp-8', type: 'media', category: 'music', title: 'Jazz Energy', subtitle: 'Upbeat jazz for vitality', duration: '1+ hour', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX4wta20PHgwo', signal: 'focus', relevanceBase: 7 }
    ],
    youtubeFallback: [
      { id: 'low-yt-1', type: 'media', category: 'yoga', title: '10-Minute Energy Boost', subtitle: 'Quick movement to wake up', duration: '10 min', platform: 'youtube', youtubeVideoId: '4pKly2JojMw', signal: 'body', relevanceBase: 9 },
      { id: 'low-yt-2', type: 'media', category: 'movement', title: 'Morning Stretch Routine', subtitle: 'Gentle wake-up flow', duration: '8 min', platform: 'youtube', youtubeVideoId: 'vLMmMv3IJUE', signal: 'body', relevanceBase: 8 },
      { id: 'low-yt-3', type: 'media', category: 'yoga', title: 'Sun Salutation Flow', subtitle: 'Classic energy builder', duration: '12 min', platform: 'youtube', youtubeVideoId: 'sTANio_2E0Q', signal: 'body', relevanceBase: 8 },
      { id: 'low-yt-4', type: 'media', category: 'meditation', title: 'Motivation Meditation', subtitle: 'Spark your inner drive', duration: '10 min', platform: 'youtube', youtubeVideoId: 'Lxprri_H9Is', signal: 'motivation', relevanceBase: 8 },
      { id: 'low-yt-5', type: 'media', category: 'movement', title: 'Quick HIIT Burst', subtitle: '5-min intense energy boost', duration: '5 min', platform: 'youtube', youtubeVideoId: 'lRVacp1HFbE', signal: 'body', relevanceBase: 7 },
      { id: 'low-yt-6', type: 'media', category: 'yoga', title: 'Backbend Energy Flow', subtitle: 'Heart-opening for vitality', duration: '15 min', platform: 'youtube', youtubeVideoId: '2FiNvl9OrkM', signal: 'body', relevanceBase: 8 },
      { id: 'low-yt-7', type: 'media', category: 'meditation', title: 'Body Activation Scan', subtitle: 'Wake up each body part', duration: '10 min', platform: 'youtube', youtubeVideoId: 'T0nuKuHmMmc', signal: 'body', relevanceBase: 7 },
      { id: 'low-yt-8', type: 'media', category: 'movement', title: 'Dance Wake Up', subtitle: 'Dance to start the day', duration: '8 min', platform: 'youtube', youtubeVideoId: 'oVl3Dha4p-g', signal: 'motivation', relevanceBase: 7 }
    ],
    breathing: [
      { id: 'low-br-1', type: 'breathing', title: 'Energizing Kapalbhati (3-0-2-0)', subtitle: 'Sharp exhales for energy', duration: 60, pattern: { inhale: 3, hold1: 0, exhale: 2, hold2: 0 }, signal: 'motivation', relevanceBase: 8 },
      { id: 'low-br-2', type: 'breathing', title: 'Power Breath (4-4-4-0)', subtitle: 'Build energy with holds', duration: 60, pattern: { inhale: 4, hold1: 4, exhale: 4, hold2: 0 }, signal: 'body', relevanceBase: 8 }
    ],
    micro: [
      { id: 'low-mi-1', type: 'micro', title: 'Jumping Jacks Burst', subtitle: '20 jumping jacks right now', duration: '60 sec', instruction: 'Do 20 jumping jacks as fast as you can. Then stand still and feel the energy rush.', signal: 'body', relevanceBase: 8 },
      { id: 'low-mi-2', type: 'micro', title: 'Cold Shower Finish', subtitle: 'Last 30 seconds cold', duration: '30 sec', instruction: 'At the end of your next shower, turn it cold for 30 seconds. Breathe through it.', signal: 'body', relevanceBase: 7 },
      { id: 'low-mi-3', type: 'micro', title: 'Power Song', subtitle: 'Play your hype track', duration: '90 sec', instruction: 'Play your most energizing song. Stand up, move to it. Let it fill you with energy.', signal: 'motivation', relevanceBase: 8 },
      { id: 'low-mi-4', type: 'micro', title: 'Sunshine Break', subtitle: 'Step into natural light', duration: '90 sec', instruction: 'Go outside or to a sunny window. Let sunlight hit your face for 90 seconds. Deep breaths.', signal: 'body', relevanceBase: 7 }
    ],
    journal: [
      { id: 'low-jo-1', type: 'journal', title: 'Energy Tracker', prompt: 'Rate your energy 1-10 at different times today. What patterns do you see?', signal: 'body', relevanceBase: 6 },
      { id: 'low-jo-2', type: 'journal', title: 'What Energizes Me', prompt: 'List 5 activities that give you energy. When was the last time you did each one?', signal: 'motivation', relevanceBase: 6 },
      { id: 'low-jo-3', type: 'journal', title: 'Sleep & Fuel Check', prompt: 'How many hours of sleep did you get? What did you eat today? What could improve?', signal: 'sleep', relevanceBase: 5 }
    ],
    recipes: [
      { id: 'low-re-1', type: 'recipe', title: 'Green Energy Smoothie', subtitle: 'Natural caffeine-free boost', signal: 'body', ingredients: ['1 cup spinach', '1 banana', '1/2 cup mango', '1 tbsp chia seeds', '1 cup coconut water', '1/2 inch fresh ginger'], steps: ['Add coconut water to blender', 'Add spinach and banana', 'Add mango, chia seeds, and ginger', 'Blend until smooth', 'Drink immediately for best effect', 'Feel the natural energy build'] }
    ],
    info: [
      { id: 'low-in-1', type: 'info', title: 'Why This Helps', content: 'Low energy often signals dehydration, poor sleep, or lack of movement. Short bursts of exercise increase blood flow and release endorphins for a natural energy lift.', signal: 'body', relevanceBase: 4 }
    ]
  },

  overwhelmed: {
    spotify: [
      { id: 'ovr-sp-1', type: 'media', category: 'music', title: 'Calm Down Corner', subtitle: 'Simplify and breathe', duration: '1+ hour', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DWU0ScTcjJBdj', signal: 'panic', relevanceBase: 9 },
      { id: 'ovr-sp-2', type: 'media', category: 'music', title: 'Peaceful Piano', subtitle: 'One instrument, one breath', duration: '3+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX4sWSpwq3LiO', signal: 'focus', relevanceBase: 8 },
      { id: 'ovr-sp-3', type: 'media', category: 'music', title: 'Silence & Space', subtitle: 'Minimal ambient sounds', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX3PIPIT6JEa0', signal: 'panic', relevanceBase: 8 },
      { id: 'ovr-sp-4', type: 'media', category: 'music', title: 'Rain on Windows', subtitle: 'Cozy rain sounds', duration: '3+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX8ymr6UES7vc', signal: 'sleep', relevanceBase: 7 },
      { id: 'ovr-sp-5', type: 'media', category: 'music', title: 'Simple Acoustic', subtitle: 'Unplugged gentle songs', duration: '1+ hour', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX4E3UdUs7fUx', signal: 'lonely', relevanceBase: 7 },
      { id: 'ovr-sp-6', type: 'media', category: 'music', title: 'Night Calm', subtitle: 'Quiet music for winding down', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DWYcDQ1hSjOpY', signal: 'sleep', relevanceBase: 7 },
      { id: 'ovr-sp-7', type: 'media', category: 'music', title: 'Meditation Music', subtitle: 'Continuous calming tones', duration: '2+ hours', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DX9uKNf5jGX6m', signal: 'panic', relevanceBase: 8 },
      { id: 'ovr-sp-8', type: 'media', category: 'music', title: 'One Breath at a Time', subtitle: 'Ultra-slow tempo music', duration: '1+ hour', platform: 'spotify', spotifyPlaylistId: '37i9dQZF1DWZqd5JICZI0u', signal: 'panic', relevanceBase: 8 }
    ],
    youtubeFallback: [
      { id: 'ovr-yt-1', type: 'media', category: 'meditation', title: 'When Everything is Too Much', subtitle: 'Guided overwhelm relief', duration: '12 min', platform: 'youtube', youtubeVideoId: 'O-6f5wQXSu8', signal: 'panic', relevanceBase: 10 },
      { id: 'ovr-yt-2', type: 'media', category: 'meditation', title: 'Simplify Your Mind', subtitle: 'Mental decluttering', duration: '10 min', platform: 'youtube', youtubeVideoId: '1ZYbU82GVz4', signal: 'work', relevanceBase: 8 },
      { id: 'ovr-yt-3', type: 'media', category: 'yoga', title: 'Restorative Reset Yoga', subtitle: 'Gentle supported poses', duration: '20 min', platform: 'youtube', youtubeVideoId: 'qx3bfGTpsfY', signal: 'body', relevanceBase: 8 },
      { id: 'ovr-yt-4', type: 'media', category: 'meditation', title: 'Grounding Meditation', subtitle: 'Come back to earth', duration: '8 min', platform: 'youtube', youtubeVideoId: 'SEfs5TJZ6Nk', signal: 'panic', relevanceBase: 9 },
      { id: 'ovr-yt-5', type: 'media', category: 'meditation', title: 'Just Breathe Session', subtitle: 'Nothing else to do', duration: '5 min', platform: 'youtube', youtubeVideoId: 'aEqlQvczMJQ', signal: 'panic', relevanceBase: 9 },
      { id: 'ovr-yt-6', type: 'media', category: 'yoga', title: 'Legs Up the Wall', subtitle: 'One pose, total rest', duration: '10 min', platform: 'youtube', youtubeVideoId: 'BiWDsfZ3zbo', signal: 'body', relevanceBase: 8 },
      { id: 'ovr-yt-7', type: 'media', category: 'meditation', title: 'Permission to Pause', subtitle: 'It\'s okay to stop', duration: '10 min', platform: 'youtube', youtubeVideoId: 'QS2yDmWk0vs', signal: 'work', relevanceBase: 8 },
      { id: 'ovr-yt-8', type: 'media', category: 'meditation', title: 'Body Scan Release', subtitle: 'Let your body soften', duration: '15 min', platform: 'youtube', youtubeVideoId: 'T0nuKuHmMmc', signal: 'body', relevanceBase: 8 }
    ],
    breathing: [
      { id: 'ovr-br-1', type: 'breathing', title: 'Ultra-Slow Breath (6-0-8-0)', subtitle: 'Maximum calming effect', duration: 60, pattern: { inhale: 6, hold1: 0, exhale: 8, hold2: 0 }, signal: 'panic', relevanceBase: 10 },
      { id: 'ovr-br-2', type: 'breathing', title: 'Simple Calm (4-2-4-2)', subtitle: 'Just breathe, nothing else', duration: 60, pattern: { inhale: 4, hold1: 2, exhale: 4, hold2: 2 }, signal: 'focus', relevanceBase: 8 },
      { id: 'ovr-br-3', type: 'breathing', title: 'Sighing Breath (4-0-8-0)', subtitle: 'Exhale like a sigh of relief', duration: 60, pattern: { inhale: 4, hold1: 0, exhale: 8, hold2: 0 }, signal: 'work', relevanceBase: 9 }
    ],
    micro: [
      { id: 'ovr-mi-1', type: 'micro', title: 'One Thing Only', subtitle: 'Pick the single most important thing', duration: '60 sec', instruction: 'Look at your to-do list. Cross out everything except ONE thing. That\'s your only job right now.', signal: 'work', relevanceBase: 9 },
      { id: 'ovr-mi-2', type: 'micro', title: 'Cozy Corner', subtitle: 'Create a safe space', duration: '90 sec', instruction: 'Find a quiet corner. Sit down. Wrap yourself in a blanket if you can. Just breathe for 90 seconds.', signal: 'panic', relevanceBase: 8 },
      { id: 'ovr-mi-3', type: 'micro', title: 'Phone on Airplane', subtitle: 'Disconnect for 5 minutes', duration: '60 sec', instruction: 'Put your phone on airplane mode. Close your eyes. Give yourself 60 seconds of complete silence.', signal: 'focus', relevanceBase: 8 },
      { id: 'ovr-mi-4', type: 'micro', title: 'Name 3 Truths', subtitle: 'Ground in reality', duration: '60 sec', instruction: 'Say aloud: "My name is ___. I am in ___. Right now I am safe." Repeat 3 times slowly.', signal: 'panic', relevanceBase: 9 }
    ],
    journal: [
      { id: 'ovr-jo-1', type: 'journal', title: 'Brain Dump Everything', prompt: 'Empty your mind onto paper. Every thought, task, worry — write it all down. Don\'t organize, just dump.', signal: 'work', relevanceBase: 7 },
      { id: 'ovr-jo-2', type: 'journal', title: 'What Can Wait?', prompt: 'Of everything on your plate, what can wait until tomorrow? Next week? Cross those off for now.', signal: 'work', relevanceBase: 7 },
      { id: 'ovr-jo-3', type: 'journal', title: 'Help I Need', prompt: 'What would help you right now? Who could you ask? Write down one person and one request.', signal: 'social', relevanceBase: 6 }
    ],
    recipes: [
      { id: 'ovr-re-1', type: 'recipe', title: 'Simple Calm Tea Blend', subtitle: 'Easy 2-minute calming ritual', signal: 'body', ingredients: ['1 chamomile tea bag', '1 tsp honey', 'Squeeze of lemon', 'Warm water', 'Pinch of cinnamon (optional)'], steps: ['Boil water and let cool slightly', 'Steep chamomile tea for 5 minutes', 'Add honey and lemon', 'Sprinkle cinnamon if desired', 'Hold the mug with both hands', 'Sip slowly, breathe between sips'] }
    ],
    info: [
      { id: 'ovr-in-1', type: 'info', title: 'Why This Helps', content: 'Overwhelm happens when your brain tries to process too much at once. Simplifying your focus to one breath or one task reduces cognitive load and activates your calm response.', signal: 'focus', relevanceBase: 4 }
    ]
  }
}

/**
 * Mood options for UI buttons (expanded)
 */
export const moodOptions = [
  { id: 'happy', emoji: '😊', label: 'Happy' },
  { id: 'sad', emoji: '😢', label: 'Sad' },
  { id: 'stressed', emoji: '😰', label: 'Stressed' },
  { id: 'anxious', emoji: '😟', label: 'Anxious' },
  { id: 'tired', emoji: '😴', label: 'Tired' },
  { id: 'angry', emoji: '😠', label: 'Angry' },
  { id: 'unfocused', emoji: '🌀', label: 'Unfocused' },
  { id: 'lowEnergy', emoji: '🔋', label: 'Low Energy' },
  { id: 'overwhelmed', emoji: '😵', label: 'Overwhelmed' }
]

/**
 * Smoothie recipes by mood
 */
export const smoothieRecipes = {
  stressed: contentPool.stressed.recipes[0],
  sad: contentPool.sad.recipes[0],
  tired: contentPool.tired.recipes[0],
  anxious: contentPool.anxious.recipes[0],
  lowEnergy: contentPool.lowEnergy.recipes[0],
  overwhelmed: contentPool.overwhelmed.recipes[0]
}
