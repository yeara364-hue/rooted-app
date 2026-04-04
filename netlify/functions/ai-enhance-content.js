/**
 * ai-enhance-content — DEBUG BUILD
 * Returns a debug object alongside enhancements so we can trace exactly
 * where the OpenRouter path breaks.
 * Remove debug fields once connection is confirmed working.
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL          = 'meta-llama/llama-3.2-3b-instruct:free'  // current free tier model
const TIMEOUT_MS     = 5000

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  // ── Parse body ──────────────────────────────────────────────────────────────
  let mood, timeOfDay, items
  try {
    ;({ mood, timeOfDay, items } = JSON.parse(event.body || '{}'))
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  const safeItems = (Array.isArray(items) ? items : [])
    .filter(i => i && typeof i.id === 'string' && typeof i.title === 'string')
    .slice(0, 5)

  const safeMood = typeof mood === 'string' ? mood : 'neutral'
  const safeTime = ['morning','afternoon','evening','night'].includes(timeOfDay)
    ? timeOfDay : 'afternoon'

  // ── Debug state — accumulated throughout the handler ────────────────────────
  const debug = {
    hasApiKey:            false,
    apiKeyPrefix:         null,     // first 8 chars only — enough to confirm correct key
    attemptedOpenRouter:  false,
    openRouterStatus:     null,
    openRouterOk:         null,
    rawResponseLength:    null,
    parseSucceeded:       null,
    reason:               null,
  }

  // ── Check API key ────────────────────────────────────────────────────────────
  const apiKey  = process.env.OPENROUTER_API_KEY
  const siteUrl = process.env.URL || 'https://rooted.app'

  debug.hasApiKey = !!apiKey
  if (apiKey) debug.apiKeyPrefix = apiKey.slice(0, 8) + '…'

  console.log('[ai-enhance] hasApiKey:', debug.hasApiKey, '| prefix:', debug.apiKeyPrefix)

  if (!apiKey) {
    debug.reason = 'OPENROUTER_API_KEY env var is missing or empty'
    console.log('[ai-enhance] fallback reason:', debug.reason)
    return respond([], true, debug)
  }

  if (safeItems.length === 0) {
    debug.reason = 'no valid items in request body'
    return respond([], true, debug)
  }

  // ── Build minimal prompt ─────────────────────────────────────────────────────
  const itemList = safeItems.map(i => `${i.id}: "${i.title}"`).join('\n')
  const prompt =
`User is feeling "${safeMood}" (${safeTime}).
For each item below, return a JSON array with optional enhancedTitle (max 5 words) and microCopy (max 8 words).
Return ONLY a JSON array, no markdown.

Items:
${itemList}

Example output:
[{"id":"abc","enhancedTitle":"Feel the calm","microCopy":"Steady breath, steady mind."}]`

  // ── Call OpenRouter ──────────────────────────────────────────────────────────
  debug.attemptedOpenRouter = true
  console.log('[ai-enhance] calling OpenRouter, model:', MODEL, '| url:', OPENROUTER_URL)

  let rawText = ''
  try {
    const fetchPromise = fetch(OPENROUTER_URL, {
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
        max_tokens:  250,
        temperature: 0.5,
      }),
    })

    const res = await Promise.race([
      fetchPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS)),
    ])

    debug.openRouterStatus = res.status
    debug.openRouterOk     = res.ok
    console.log('[ai-enhance] OpenRouter response status:', res.status, res.ok ? 'OK' : 'FAILED')

    if (!res.ok) {
      const errBody = await res.text()
      console.log('[ai-enhance] OpenRouter error body:', errBody.slice(0, 300))
      debug.reason = `OpenRouter returned HTTP ${res.status}`
      return respond([], true, debug)
    }

    const data = await res.json()
    rawText = data?.choices?.[0]?.message?.content?.trim() || ''
    debug.rawResponseLength = rawText.length
    console.log('[ai-enhance] raw response length:', rawText.length)
    console.log('[ai-enhance] raw response preview:', rawText.slice(0, 200))

    if (!rawText) {
      debug.reason = 'OpenRouter returned empty content'
      return respond([], true, debug)
    }

    // Strip markdown fences
    const json = rawText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const parsed = JSON.parse(json)
    debug.parseSucceeded = true
    console.log('[ai-enhance] parse succeeded, items:', parsed.length)

    if (!Array.isArray(parsed)) throw new Error('not an array')

    const validIds    = new Set(safeItems.map(i => i.id))
    const enhancements = parsed
      .filter(e => e?.id && validIds.has(e.id))
      .map(e => ({
        id: e.id,
        ...(e.enhancedTitle ? { enhancedTitle: String(e.enhancedTitle).trim() } : {}),
        ...(e.microCopy     ? { microCopy:     String(e.microCopy).trim()     } : {}),
      }))

    console.log('[ai-enhance] success, returning', enhancements.length, 'enhancements')
    return respond(enhancements, false, debug)

  } catch (err) {
    debug.parseSucceeded = debug.parseSucceeded ?? false
    debug.reason = err.message
    console.log('[ai-enhance] caught error:', err.message)
    console.log('[ai-enhance] raw text at failure:', rawText.slice(0, 300))
    return respond([], true, debug)
  }
}

function respond(enhancements, fallback, debug) {
  const body = { enhancements }
  if (fallback) body.fallback = true
  body.debug = debug          // always include debug for now — remove after diagnosis
  return {
    statusCode: 200,
    headers:    { 'Content-Type': 'application/json' },
    body:       JSON.stringify(body),
  }
}
