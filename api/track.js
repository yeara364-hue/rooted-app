
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      event_name,
      mood = null,
      source = null,
      url = null,
      session_id = null,
      meta = {},
    } = req.body || {};

    if (!event_name) {
      return res.status(400).json({ error: "event_name is required" });
    }

    const user_agent = req.headers["user-agent"] || null;

    const { error } = await supabase.from("events").insert([
      { event_name, mood, source, url, session_id, user_agent, meta },
    ]);

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
}
