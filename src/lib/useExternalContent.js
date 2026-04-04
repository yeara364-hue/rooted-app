/**
 * useExternalContent — signal-driven external content hook
 *
 * Orchestrates the two-step retrieval → curation pipeline:
 *   1. POST /fetch-content   → YouTube + Spotify items (normalized)
 *   2. POST /curate-content  → AI assigns to sections, ranks, adds microCopy
 *
 * Returns per-section arrays ready to be merged into the Home feed.
 * Never blocks rendering — all work happens async after mount.
 * Falls back silently to null on any failure.
 *
 * Usage in Home.jsx:
 *
 *   const { externalSections, externalLoading } = useExternalContent(currentMood)
 *
 *   // Merge: external items lead each section, local items fill the rest
 *   const sectionMove = mergeSection(externalSections?.move, localSectionMove)
 *
 * Behaviour:
 *   - Fires on mount and whenever mood changes
 *   - Cancels in-flight requests if mood changes before they complete
 *   - If external items arrive, they are prepended to local sections
 *   - If anything fails, externalSections stays null → local content unchanged
 *   - A 10s total deadline ensures the UI is never held hostage
 */

import { useState, useEffect, useRef } from 'react'
import { buildSignals } from './contentSchema'

const TOTAL_DEADLINE_MS = 10_000

export function useExternalContent(mood) {
  const [externalSections, setExternalSections] = useState(null)
  const [externalLoading, setExternalLoading]   = useState(false)
  // Track the last mood we successfully fetched to avoid duplicate fetches
  const lastFetchedMood = useRef(null)

  useEffect(() => {
    if (!mood || mood === 'neutral') {
      // Don't hit the API for the default neutral state — local content is fine
      return
    }

    if (lastFetchedMood.current === mood) {
      // Same mood — don't re-fetch
      return
    }

    let cancelled = false
    setExternalLoading(true)

    const signals = buildSignals(mood)
    const deadline = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Total deadline exceeded')), TOTAL_DEADLINE_MS)
    )

    async function run() {
      // ── Step 1: Fetch external content ──────────────────────────────────
      const fetchResp = await fetch('/.netlify/functions/fetch-content', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ signals }),
      })

      if (!fetchResp.ok) throw new Error(`fetch-content HTTP ${fetchResp.status}`)
      const { items } = await fetchResp.json()

      if (!items?.length) {
        console.log('useExternalContent: no external items returned, staying with local content')
        return null
      }

      if (cancelled) return null
      console.log(`useExternalContent: ${items.length} items fetched for mood "${mood}"`)

      // ── Step 2: Curate with AI ───────────────────────────────────────────
      const curateResp = await fetch('/.netlify/functions/curate-content', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ items, signals }),
      })

      if (!curateResp.ok) throw new Error(`curate-content HTTP ${curateResp.status}`)
      const { sections } = await curateResp.json()

      if (cancelled) return null

      const totalItems = Object.values(sections || {}).reduce((n, arr) => n + (arr?.length || 0), 0)
      console.log(`useExternalContent: ${totalItems} curated items across 4 sections`)

      return sections
    }

    Promise.race([run(), deadline])
      .then(sections => {
        if (cancelled) return
        if (sections) {
          lastFetchedMood.current = mood
          setExternalSections(sections)
        }
      })
      .catch(err => {
        if (cancelled) return
        console.warn('useExternalContent: pipeline failed —', err.message)
        // externalSections stays null — Home.jsx uses pure local content
      })
      .finally(() => {
        if (!cancelled) setExternalLoading(false)
      })

    return () => { cancelled = true }
  }, [mood])

  return { externalSections, externalLoading }
}

/**
 * mergeSection — combine external + local content arrays into one section.
 *
 * External items (from API/AI) lead the section.
 * Local items fill the remaining slots.
 * Deduplicates by both namespaced ID (`yt:x`) and original bare ID (`s1`).
 * Never returns more than `limit` items.
 *
 * @param {object[]|null} external  Items from useExternalContent
 * @param {object[]}      local     Items from local content arrays (sectionMove etc.)
 * @param {number}        limit     Max items per section (default 6)
 */
export function mergeSection(external, local, limit = 6) {
  const seen   = new Set()
  const result = []

  const addItem = (item) => {
    if (result.length >= limit) return
    // Track both the namespaced ID and any bare original ID
    const bareId = item.id?.replace(/^local:/, '')
    if (seen.has(item.id) || (bareId && seen.has(bareId))) return
    seen.add(item.id)
    if (bareId) seen.add(bareId)
    result.push(item)
  }

  for (const item of (external || [])) addItem(item)
  for (const item of (local    || [])) addItem(item)

  return result
}
