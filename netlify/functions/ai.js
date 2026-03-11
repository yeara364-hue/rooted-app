exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing OPENROUTER_API_KEY" }),
      };
    }

    const { message } = JSON.parse(event.body || "{}");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8888",
        "X-Title": "Rooted",
      },
      body: JSON.stringify({
        model: "openrouter/free",
        max_tokens: 150,
        messages: [
          {
            role: "system",
            content: "You are a calm mindfulness assistant helping users relax.",
          },
          {
            role: "user",
            content: message || "Give me a short breathing exercise",
          },
        ],
      }),
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("AI function error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || "Unknown server error",
      }),
    };
  }
};