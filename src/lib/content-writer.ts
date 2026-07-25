import { GeneratedContent, Lead } from "./types";

// Uses Groq's free API (OpenAI-compatible) — genuinely free tier, no credit
// card required. Get a key at console.groq.com/keys.
const MODEL = "llama-3.3-70b-versatile";

export async function generateContent(lead: Lead): Promise<GeneratedContent> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY. Add it to your environment variables.");
  }

  const prompt = `You are a marketing copywriter creating landing page content for a local business.

Business name: ${lead.name}
Category: ${lead.category}
Address: ${lead.address}
Google rating: ${lead.rating ?? "unknown"} (${lead.reviewCount} reviews)

Write short, concrete, non-generic marketing copy for this business. Do not
invent specific menu items, prices, or facts you don't know — keep
highlights about the type of experience/service, not fabricated specifics.

Respond with ONLY valid JSON, no markdown fences, matching exactly this shape:
{
  "tagline": "string, under 10 words",
  "aboutUs": "string, 2-3 sentences",
  "seoTitle": "string, under 60 characters, include the business name and city",
  "metaDescription": "string, under 155 characters",
  "highlights": ["3 to 4 short phrases, each under 8 words"],
  "faq": [{"question": "string", "answer": "string, 1-2 sentences"}, ... 3 items],
  "googleBusinessDescription": "string, under 750 characters"
}`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq returned an empty response.");

  try {
    return JSON.parse(text) as GeneratedContent;
  } catch {
    throw new Error("Groq returned content that wasn't valid JSON — try again.");
  }
}
