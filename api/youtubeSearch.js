export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'YouTube API key not configured' })
  }

  const { query, maxResults = 8, safeSearch = 'strict', relevanceLanguage = 'en' } = req.body

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'query is required' })
  }

  try {
    // Step 1: Search for videos
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search')
    searchUrl.searchParams.set('key', apiKey)
    searchUrl.searchParams.set('part', 'snippet')
    searchUrl.searchParams.set('type', 'video')
    searchUrl.searchParams.set('videoEmbeddable', 'true')
    searchUrl.searchParams.set('safeSearch', safeSearch)
    searchUrl.searchParams.set('maxResults', String(maxResults))
    searchUrl.searchParams.set('q', query)
    searchUrl.searchParams.set('relevanceLanguage', relevanceLanguage)

    const searchRes = await fetch(searchUrl.toString())
    const searchData = await searchRes.json()

    if (!searchData.items || searchData.items.length === 0) {
      return res.status(200).json([])
    }

    const videoIds = searchData.items.map(item => item.id.videoId).filter(Boolean).join(',')
    if (!videoIds) {
      return res.status(200).json([])
    }

    // Step 2: Get duration for each video
    const videosUrl = new URL('https://www.googleapis.com/youtube/v3/videos')
    videosUrl.searchParams.set('key', apiKey)
    videosUrl.searchParams.set('part', 'contentDetails')
    videosUrl.searchParams.set('id', videoIds)

    const videosRes = await fetch(videosUrl.toString())
    const videosData = await videosRes.json()

    // Build a map of videoId → duration in seconds
    const durationMap = {}
    for (const video of (videosData.items || [])) {
      durationMap[video.id] = parseDuration(video.contentDetails.duration)
    }

    // Combine search results with duration info
    const results = searchData.items
      .filter(item => item.id?.videoId)
      .map(item => {
        const videoId = item.id.videoId
        return {
          videoId,
          title: item.snippet.title,
          channelTitle: item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
          durationSeconds: durationMap[videoId] || 0,
          duration: formatDuration(durationMap[videoId] || 0)
        }
      })

    return res.status(200).json(results)
  } catch (error) {
    console.error('youtubeSearch error:', error)
    return res.status(500).json({ error: 'Failed to fetch YouTube results' })
  }
}

function parseDuration(iso) {
  if (!iso) return 0
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  const h = parseInt(match[1] || 0)
  const m = parseInt(match[2] || 0)
  const s = parseInt(match[3] || 0)
  return h * 3600 + m * 60 + s
}

function formatDuration(seconds) {
  if (!seconds) return 'Unknown'
  const m = Math.floor(seconds / 60)
  return `${m} min`
}
