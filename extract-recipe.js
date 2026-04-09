const Anthropic = require("@anthropic-ai/sdk");
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { url } = JSON.parse(event.body || "{}");
  if (!url) {
    return { statusCode: 400, body: JSON.stringify({ error: "URL required" }) };
  }

  try {
    const fetchRes = await fetch(url);
    const html = await fetchRes.text();
    console.log("Fetch status:", fetchRes.status, "HTML length:", html.length);

    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .slice(0, 15000);

    const prompt = `You are extracting a recipe from web page content. Return ONLY valid JSON, no markdown, no explanation.
Extract this recipe and return JSON with these exact fields:
{
  "name": "Recipe name",
  "description": "1-2 sentence description",
  "ingredients": "Each ingredient on its own line, with quantity. No bullets.",
  "steps": "Each step numbered and on its own line. e.g. 1. Preheat oven...",
  "prepTime": "e.g. 25 minutes",
  "servings": "e.g. 4 servings",
  "imageUrl": "direct image URL if you can find one in the content, otherwise empty string",
  "suggestedTags": ["array", "of", "tags"],
  "notes": "Any useful tips or notes from the recipe, or empty string"
}
For suggestedTags, only use tags from this list:
Breakfast, Lunch, Dinner, Snack, Dessert, Under 30 Minutes, One Pan, Sheet Pan, Slow Cooker, Make Ahead, Freezer Friendly, Kid Friendly, Vegetarian, Favorites
Page content:
${text}`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response.content[0].text.trim();
    console.log("Claude raw response:", raw.slice(0, 500));

    const recipe = JSON.parse(raw);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(recipe),
    };
  } catch (err) {
    console.error("EXTRACT ERROR:", err.message, err.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to extract recipe", detail: err.message }),
    };
  }
};
