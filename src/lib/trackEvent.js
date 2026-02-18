import { supabase } from './supabaseClient'

export async function trackEvent({ event_name, mood, meta }) {
  const payload = { event_name, mood, meta }
  console.log('trackEvent payload:', payload)

  const { data, error } = await supabase
    .from('events')
    .insert([payload])
    .select()

  if (error) {
    console.error('trackEvent error:', error)
  } else {
    console.log('trackEvent success:', data)
  }
}
