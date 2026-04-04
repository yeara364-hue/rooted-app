/**
 * curate-content — AI-driven selection, ranking, and section assignment
 *
 * POST body:
 *   {
 *     items:   ContentItem[],   // normalized pool from fetch-content + local fallback items
 *     signals: {
 *       mood, timeOfDay, intents, energy
 *     }
 *   }
 *
 * Returns:
 *   {
 *     sections: {
 *       move:    ContentItem[],  // top 5, ranked
 *       calm:    ContentItem[],  // top 5, ranked
 *       reflect: ContentItem[],  // top 5, ranked
 *       reset:   ContentItem[],  // top 5, ranked
 *     },
 *     fallback: boolean
 *   }
 *
 * What the AI does:
 *   - Assigns each item to the best matching section
 *   - Ranks within each section by relevance to signals
 *   - Avoids assigning the same type 3x in a row within a section
 *   - Returns a microCopy line per item (max 10 words, mood-aware)
 *   - Never invents items — only annotates/reorders what was passed in
 *
 * If AI fails or times out, a deterministic fallback ranker is used
 * that scores items by keyword + signal match.
 *
 * Timeout: 6s for AI call
 */

// ── Deterministic fallback ranker ─────────────────────────────────────────────
//
// Used when AI is unavailable. Scores items by:
//   - section hint match (item._section matches target section)
//   - keyword match between title/description and section/mood terms
//   - type suitability per section

const SECTION_TYPES = {
  move:    ['movement', 'media'],
  calm:    ['audio', 'breathing', 'media'],
  reflect: ['journal', 'cognitive'],
  reset:   ['breathing', 'micro', 'lifestyle'],
}

const SECTION_KEYWORDS = {
  move:    ['yoga', 'stretch', 'movement', 'dance', 'flow', 'exercise', 'walk', 'vinyasa', 'pilates'],
  calm:    ['meditation', 'calm', 'relax', 'breathing', 'playlist', 'peace', 'sleep', 'ambient', 'stress'],
  reflect: ['journal', 'reflect', 'prompt', 'self', 'awareness', 'mind', 'gratitude', 'clarity', 'intention'],
  reset:   ['breath', 'quick', 'reset', 'micro', 'grounding', 'instant', 'short', 'break', '2 min', '5 min'],
}

const MOOD_KEYWORDS = {
  stressed: ['calm', 'stress', 'anxiety', 'relax', 'breath', 'relief'],
  sad:      ['comfort', 'compassion', 'gentle', 'warmth', 'healing', 'self-love'],
  tired:    ['energy', 'restore', 'revive', 'gentle', 'wake', 'nourish'],
  angry:    ['release', 'tension', 'power', 'flow', 'outlet', 'discharge'],
  happy:    ['joy', 'dance', 'energize', 'celebrate', 'radiant', 'vibrant'],
  neutral:  ['mindful', 'balance', 'focus', 'clarity', 'center'],
}

function scoreItem(item, section, signals) {
  const text = `${item.title} ${item.subtitle || ''} ${item.description || ''}`.toLowerCase()
  let score = item.relevanceScore || item.relevanceBase || 5

  // Bonus: item was fetched for this section
  if (item._section === section) score += 4

  // Bonus: item type is suitable for this section
  if (SECTION_TYPES[section]?.includes(item.type)) score += 2

  // Bonus: keyword matches for section
  const sectionKws = SECTION_KEYWORDS[section] || []
  for (const kw of sectionKws) {
    if (text.includes(kw)) { score += 1; break }
  }

  // Bonus: keyword matches for mood
  const moodKws = MOOD_KEYWORDS[signals.mood] || []
  for (const kw of moodKws) {
    if (text.includes(kw)) { score += 1; break }
  }

  return score
}

function fallbackCurate(items, signals) {
  const sections = { move: [], calm: [], reflect: [], reset: [] }

  // Score each item for each section and assign to best match
  for (const item of items) {
    let bestSection = item._section
    if (!bestSection || !sections[bestSection]) {
      // Find best section by score
      let bestScore = -1
      for (const s of Object.keys(sections)) {
        const sc = scoreItem(item, s, signals)
        if (sc > bestScore) { bestScore = sc; bestSection = s }
      }
    }
    if (sections[bestSection]) {
      sections[bestSection].push({ ...item, relevanceScore: scoreItem(item, bestSection, signals) })
    }
  }

  // Sort each section and cap at 5
  for (const s of Object.keys(sections)) {
    sections[s] = sections[s]
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
      .slice(0, 5)
  }

  return sections
}

// ── AI curation ───────────────────────────────────────────────────────────────

async function aiCurate(items, signals, apiKey) {
  // Send only the fields AI needs — keep prompt compact
  const compactItems = items.map(item => ({
    id:      item.id,
    section: item._section || null,   // hint
    type:    item.type,
    title:   item.title,
    desc:    (item.subtitle || item.description || '').slice(0, 80),
  }))

  const TIME_CONTEXT = {
    morning:   'start of the day, fresh energy available',
    afternoon: 'midday, possibly fatigued, needs reset or focus',
    evening:   'end of workday, unwinding mode',
    night:     'late, preparing for rest or sleep',
  }

  const prompt = `You are a wellness content curator for a calm, premium app called Rooted.

User context:
- Feeling: "${signals.mood}"
- Time: ${signals.timeOfDay} (${TIME_CONTEXT[signals.timeOfDay] || ''})
- Energy: ${signals.energy}
- Priority intents: ${signals.intents.join(' > ')}

Available content items (${compactItems.length} total):
${JSON.stringify(compactItems, null, 2)}

Task: Assign each item to one of these four sections and rank them.

Sections:
- "move"    → physical movement, yoga, stretching, exercise
- "calm"    → meditation, breathing, ambient music, playlists for relaxation
- "reflect" → journaling, self-reflection, cognitive prompts, mindfulness talks
- "reset"   → quick 1–5 min actions, breathing exercises, micro-resets

Rules:
1. Each item goes to exactly one section
2. Choose the most useful content for the user's current mood and time
3. Avoid putting 3+ items of the same type (e.g., 3 YouTube videos) consecutively in a section
4. Prioritize variety and diversity within each section
5. For each item, write a microCopy: max 10 words, warm and specific to this user's mood
6. Return a maximum of 5 items per section
7. It is OK to leave a section empty if no items fit it well

Return ONLY valid JSON — no markdown, no explanation:
{
  "move":    [{ "id": "...", "microCopy": "..." }, ...],
  "calm":    [{ "id": "...", "microCopy": "..." }, ...],
  "reflect": [{ "id": "...", "microCopy": "..." }, ...],
  "reset":   [{ "id": "...", "microCopy": "..." }, ...]
}`

  const siteUrl = process.env.URL || 'https://rooted.app'
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization:  `Bearer ${apiKey}`,
      'HTTP-Referer': siteUrl,
      'X-Title':      'Rooted',
    },
    body: JSON.stringify({
      model:      'mistralai/mistral-7b-instruct:free',
      messages:   [{ role: 'user', content: prompt }],
      max_tokens: 800,
      temperature: 0.4,   // lower temp = more consistent structure
    }),
  })

  if (!response.ok) throw new Error(`OpenRouter error ${response.status}`)

  const data = await response.json()
  const text = data?.choices?.[0]?.message?.content?.trim() || ''
  console.log('curate-content: AI raw output length:', text.length)

  // Strip any markdown code fences
  const json = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  const parsed = JSON.parse(json)

  // Validate shape
  if (typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('AI returned unexpected structure')
  }

  // Build a lookup map for quick item retrieval
  const itemMap = {}
  for (const item of items) itemMap[item.id] = item

  // Build valid ID set to reject hallucinated IDs
  const validIds = new Set(items.map(i => i.id))

  // Assemble final sections
  const sections = { move: [], calm: [], reflect: [], reset: [] }
  for (const sectionName of Object.keys(sections)) {
    const raw = parsed[sectionName]
    if (!Array.isArray(raw)) continue
    for (const entry of raw) {
      if (!entry?.id || !validIds.has(entry.id)) continue
      const item = itemMap[entry.id]
      if (!item) continue
      sections[sectionName].push({
        ...item,
        _section:  sectionName,
        microCopy: typeof entry.microCopy === 'string' ? entry.microCopy.trim() : null,
      })
      if (sections[sectionName].length >= 5) break
    }
  }

  return sections
}

// ── Handler ───────────────────────────────────────────────────────────────────

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  let items, signals
  try {
    ;({ items, signals } = JSON.parse(event.body || '{}'))
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) }
  }

  if (!Array.isArray(items) || items.length === 0) {
    return {
      statusCode: 200,
      body: JSON.stringify({ sections: { move: [], calm: [], reflect: [], reset: [] }, fallback: true }),
    }
  }

  const safeMood   = typeof signals?.mood === 'string' ? signals.mood : 'neutral'
  const safeTime   = ['morning', 'afternoon', 'evening', 'night'].includes(signals?.timeOfDay) ? signals.timeOfDay : 'afternoon'
  const safeEnergy = ['low', 'medium', 'high'].includes(signals?.energy) ? signals.energy : 'medium'
  const safeIntents = Array.isArray(signals?.intents) ? signals.intents : ['calm', 'move', 'reflect', 'reset']
  const safeSignals = { mood: safeMood, timeOfDay: safeTime, energy: safeEnergy, intents: safeIntents }

  console.log('curate-content: %d items, mood=%s time=%s energy=%s', items.length, safeMood, safeTime, safeEnergy)

  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    console.log('curate-content: no API key — using deterministic fallback')
    const sections = fallbackCurate(items, safeSignals)
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sections, fallback: true }),
    }
  }

  try {
    const sections = await Promise.race([
      aiCurate(items, safeSignals, apiKey),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI curation timed out')), 6000)
      ),
    ])

    const totalCurated = Object.values(sections).reduce((n, arr) => n + arr.length, 0)
    console.log('curate-content: AI success —', totalCurated, 'items across 4 sections')

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sections }),
    }
  } catch (err) {
    console.warn('curate-content: AI failed, using fallback —', err.message)
    const sections = fallbackCurate(items, safeSignals)
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sections, fallback: true }),
    }
  }
}
