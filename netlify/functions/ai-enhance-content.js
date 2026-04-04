/**
 * ai-enhance-content
 * Minimal working version — confirms the route is live.
 * AI logic will be layered on once the route is verified.
 */
exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, message: 'ai-enhance-content is live' }),
  }
}
