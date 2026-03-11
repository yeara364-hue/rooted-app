/**
 * AI ranking for nearby events and places.
 *
 * POST body: { items: [...], mood: string }
 * Returns:   { ranked: [{ ...item, reason: string }, ...] }  — top 3
 *
 * Uses OpenAI gpt-4o-mini if OPENAI_API_KEY is set.
 * Falls back to deterministic keyword scoring if no key is present.
 * Never invents items — only re-orders and annotates what was passed in.
 */

// ── Fallback: keyword-based scoring ──────────────────────────────────────────

const MOOD_KEYWORDS = {
  stressed:  ['breathwork', 'meditation', 'sound bath', 'yoga', 'mindful', 'calm', 'gentle', 'restorative', 'pilates'],
  sad:       ['meditation', 'sound bath', 'mindful', 'community', 'gentle', 'compassion'],
  tired:     ['restorative', 'gentle', 'yoga', 'stretching', 'rest', 'yin'],
  angry:     ['breathwork', 'yoga', 'power', 'vinyasa', 'release'],
  happy:     ['dance', 'community', 'yoga', 'wellness', 'outdoor'],
}

const FALLBACK_REASONS = {
  breathwork:    (mood) => `Breathwork directly targets ${mood === 'stressed' ? 'stress' : 'your current state'} through the nervous system.`,
  meditation:    (mood) => `Meditation gives your mind a place to settle right now.`,
  'sound bath':  (mood) => `Sound bath requires nothing from you — just let it work.`,
  yoga:          (mood) => `Yoga combines movement and breath — effective for ${mood === 'angry' ? 'releasing tension' : 'shifting energy'}.`,
  pilates:       ()     => `Pilates builds a calm, controlled focus that counteracts overwhelm.`,
  fitness:       (mood) => `Physical movement is one of the fastest mood regulators.`,
  community:     ()     => `Connection with others often lifts what solitude can't.`,
  wellness:      ()     => `A dedicated wellness space close by — low-friction reset.`,
}

function fallbackReason(item, mood) {
  const text = `${item.title || ''} ${item.category || ''} ${item.description || ''}`.toLowerCase()
  for (const [kw, fn] of Object.entries(FALLBACK_REASONS)) {
    if (text.includes(kw)) return fn(mood)
  }
  if (item._kind === 'event') return `This event is nearby and fits what you need right now.`
  return `A nearby space that supports the shift you're looking for.`
}

function scoreItem(item, mood) {
  const keywords = MOOD_KEYWORDS[mood] || MOOD_KEYWORDS.stressed
  const text = `${item.title || ''} ${item.category || ''} ${item.description || ''} ${item.venueName || ''}`.toLowerCase()
  let score = 0
  for (const kw of keywords) {
    if (text.includes(kw)) score += 2
  }
  if (item._kind === 'event') score += 1   // time-bound = higher intent
  if (item.lat && item.lng)    score += 1   // has precise location
  return score
}

function fallbackRank(items, mood) {
  return items
    .map((item, i) => ({ item, score: scoreItem(item, mood), originalIndex: i }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ item }) => ({ ...item, reason: fallbackReason(item, mood) }))
}

// ── OpenAI ranking ────────────────────────────────────────────────────────────

async function aiRank(items, mood, apiKey) {
  const itemList = items.map((item, i) => ({
    index: i,
    title: item.title,
    kind: item._kind,
    category: item.category || null,
    description: item.description || null,
    time: item.startTime || item.datetime || null,
    place: item.venueName || item.location || item.address || null,
  }))

  const prompt = `You are a wellness recommendation engine. A user is currently feeling: "${mood}".

Here are real nearby events and places that have been fetched from live data sources:
${JSON.stringify(itemList, null, 2)}

Rank the top 3 items that best fit someone feeling "${mood}" right now. Prefer:
- Low friction (easy to attend, close, no preparation)
- Direct mood relevance (breathwork > generic fitness for stressed; sound bath > dance for tired)
- Variety (don't return 3 identical categories)

For each, write a short reason (max 12 words) explaining WHY it fits this mood.

Return ONLY valid JSON — an array of exactly up to 3 objects:
[
  { "index": <number from the list above>, "reason": "<short reason>" },
  ...
]

Never invent items. Only use indices from the list above.`

  console.log('rank-nearby: sending request to OpenRouter AI...')
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'http://localhost:8888',
      'X-Title': 'Rooted',
    },
    body: JSON.stringify({
      model: 'openrouter/free',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenRouter error ${response.status}`)
  }

  const data = await response.json()
  const text = data?.choices?.[0]?.message?.content?.trim() || ''
  console.log('rank-nearby: OpenRouter raw output:', text)

  // Strip markdown code fences if present
  const json = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  const parsed = JSON.parse(json)

  return parsed
    .filter(r => typeof r.index === 'number' && items[r.index])
    .slice(0, 3)
    .map(r => ({ ...items[r.index], reason: r.reason }))
}

// ── Handler ───────────────────────────────────────────────────────────────────

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  let items, mood
  try {
    ;({ items, mood } = JSON.parse(event.body || '{}'))
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) }
  }

  if (!Array.isArray(items) || items.length === 0) {
    return {
      statusCode: 200,
      body: JSON.stringify({ ranked: [], fallback: true }),
    }
  }

  console.log('rank-nearby: ranking', items.length, 'items for mood:', mood)

  const apiKey = process.env.OPENROUTER_API_KEY
  console.log('rank-nearby: OPENROUTER_API_KEY present?', !!apiKey)

  if (!apiKey) {
    console.log('rank-nearby: using fallback')
    const ranked = fallbackRank(items, mood)
    console.log('rank-nearby: final ranked result (fallback):', JSON.stringify(ranked, null, 2))
    return {
      statusCode: 200,
      body: JSON.stringify({ ranked, fallback: true }),
    }
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 6000)

    const ranked = await Promise.race([
      aiRank(items, mood, apiKey),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI ranking timed out')), 6000)
      ),
    ])

    clearTimeout(timeout)
    console.log('rank-nearby: using OpenRouter AI')
    console.log('rank-nearby: AI returned', ranked.length, 'ranked items')
    console.log('rank-nearby: final ranked result (AI):', JSON.stringify(ranked, null, 2))

    return {
      statusCode: 200,
      body: JSON.stringify({ ranked }),
    }
  } catch (err) {
    console.warn('rank-nearby: AI failed, using fallback —', err.message)
    console.log('rank-nearby: using fallback')
    const ranked = fallbackRank(items, mood)
    console.log('rank-nearby: final ranked result (fallback):', JSON.stringify(ranked, null, 2))
    return {
      statusCode: 200,
      body: JSON.stringify({ ranked, fallback: true }),
    }
  }
}
