import { GeneratedContent, Lead } from "./types";

// Uses Google's Gemini API. Note: as of Google's Dec 2025 policy change, the
// free tier requires a billing account linked to your Google Cloud project
// (with a spend cap) to get usable quota — see README for the one-time setup.
// Uses the "-latest" alias (rather than a pinned version like
// gemini-2.5-flash) because Google periodically restricts older model
// versions to new API keys/projects, which breaks a hardcoded name. Google
// keeps this alias pointed at their current recommended flash model.
const MODEL = "gemini-flash-latest";

export async function generateContent(lead: Lead): Promise<GeneratedContent> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY. Add it to your environment variables.");
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

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, responseMimeType: "application/json" },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned an empty response.");

  try {
    return JSON.parse(text) as GeneratedContent;
  } catch {
    throw new Error("Gemini returned content that wasn't valid JSON — try again.");
  }
}
