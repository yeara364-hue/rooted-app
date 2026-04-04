/**
 * ai-enhance-content
 *
 * POST body: { mood, timeOfDay, items: [{ id, title, type, subtitle? }] }
 * Returns:   { enhancements: [{ id, enhancedTitle?, microCopy? }] }
 *
 * - Sends up to 5 items to OpenRouter for light enhancement
 * - Falls back to empty enhancements if AI fails or is slow
 * - Never blocks the UI — frontend always renders original content first
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL          = 'mistralai/mistral-7b-instruct:free'
const TIMEOUT_MS     = 5000

function timeLabel(timeOfDay) {
  return {
    morning:   'start of the day',
    afternoon: 'midday',
    evening:   'end of the day',
    night:     'late night',
  }[timeOfDay] || 'during the day'
}

function buildPrompt(mood, timeOfDay, items) {
  const list = items.map(i =>
    `- id: ${i.id} | type: ${i.type} | title: "${i.title}"${i.subtitle ? ` | subtitle: "${i.subtitle}"` : ''}`
  ).join('\n')

  return `You are a wellness content writer for a calm, premium app called Rooted.

User context: feeling "${mood}" at ${timeLabel(timeOfDay)}.

Content items:
${list}

For each item, optionally write:
- enhancedTitle: a warmer, more personal title (max 6 words). Skip if the original is already good.
- microCopy: one short line (max 8 words) explaining why this fits right now.

Rules:
- Only include fields where you genuinely improve the original
- Never use generic phrases like "Find Your Peace" or "Take a Moment"
- Match the mood — "${mood}" should be felt in the tone
- Return ONLY valid JSON, no markdown:

[
  { "id": "...", "enhancedTitle": "...", "microCopy": "..." },
  ...
]`
}

async function callOpenRouter(apiKey, prompt, siteUrl) {
  const res = await fetch(OPENROUTER_URL, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      Authorization:   `Bearer ${apiKey}`,
      'HTTP-Referer':  siteUrl,
      'X-Title':       'Rooted',
    },
    body: JSON.stringify({
      model:       MODEL,
      messages:    [{ role: 'user', content: prompt }],
      max_tokens:  350,
      temperature: 0.6,
    }),
  })

  if (!res.ok) throw new Error(`OpenRouter ${res.status}`)

  const data = await res.json()
  const text = data?.choices?.[0]?.message?.content?.trim() || ''

  // Strip markdown fences if present
  const json = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  return JSON.parse(json)
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  let mood, timeOfDay, items
  try {
    ;({ mood, timeOfDay, items } = JSON.parse(event.body || '{}'))
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  // Validate and clamp inputs
  if (!Array.isArray(items) || items.length === 0) {
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ enhancements: [] }) }
  }

  const safeItems = items
    .filter(i => i && typeof i.id === 'string' && typeof i.title === 'string')
    .slice(0, 5)

  const safeMood = typeof mood === 'string' ? mood : 'neutral'
  const safeTime = ['morning','afternoon','evening','night'].includes(timeOfDay)
    ? timeOfDay : 'afternoon'

  const apiKey  = process.env.OPENROUTER_API_KEY
  const siteUrl = process.env.URL || 'https://rooted.app'

  // No API key — return empty so frontend uses originals
  if (!apiKey) {
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ enhancements: [], fallback: true }) }
  }

  const prompt = buildPrompt(safeMood, safeTime, safeItems)

  try {
    const parsed = await Promise.race([
      callOpenRouter(apiKey, prompt, siteUrl),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS)),
    ])

    if (!Array.isArray(parsed)) throw new Error('Non-array response')

    // Validate: only keep entries with IDs that were actually sent
    const validIds = new Set(safeItems.map(i => i.id))
    const enhancements = parsed
      .filter(e => e?.id && validIds.has(e.id))
      .map(e => ({
        id: e.id,
        ...(e.enhancedTitle && typeof e.enhancedTitle === 'string'
          ? { enhancedTitle: e.enhancedTitle.trim() } : {}),
        ...(e.microCopy && typeof e.microCopy === 'string'
          ? { microCopy: e.microCopy.trim() } : {}),
      }))

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enhancements }),
    }
  } catch (err) {
    // Any failure — return empty so the UI renders original content unchanged
    console.warn('ai-enhance-content: failed —', err.message)
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enhancements: [], fallback: true }),
    }
  }
}
