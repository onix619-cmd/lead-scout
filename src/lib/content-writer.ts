import { GeneratedContent, Lead } from "./types";
import { detectTemplateType } from "./template-type";

// Uses Google's Gemini API. Note: as of Google's Dec 2025 policy change, the
// free tier requires a billing account linked to your Google Cloud project
// (with a spend cap) to get usable quota — see README for the one-time setup.
// Uses the "-latest" alias (rather than a pinned version like
// gemini-2.5-flash) because Google periodically restricts older model
// versions to new API keys/projects, which breaks a hardcoded name. Google
// keeps this alias pointed at their current recommended flash model.
const MODEL = "gemini-flash-latest";

function showcaseInstructions(type: ReturnType<typeof detectTemplateType>) {
  switch (type) {
    case "restaurant":
      return `"showcaseItems" should be 4-5 example MENU CATEGORIES appropriate
to this specific business's type (e.g. a pizzeria: "Wood-Fired Pizzas",
"Fresh Salads"; a bakery: "Fresh Breads", "Pastries"; a coffee shop:
"Espresso Drinks", "Cold Brew"; a bar: "Craft Cocktails", "Small Plates") —
general categories, NOT specific invented dish names, prices, or ingredients
you don't actually know. Each item: {"name": short category name,
"description": 1 sentence about the style/experience, "tag": one of
"Chef's Pick" | "Popular" | "" }`;
    case "icecream":
      return `"showcaseItems" should be 4-5 playful ice cream flavor
CATEGORIES (e.g. "Classic Chocolate", "Fruity Sorbet", "Premium Small-Batch",
"Seasonal Special") — categories, not invented specific flavor names. Each
item: {"name": category name, "description": 1 fun short sentence, "tag":
"New" | "" }`;
    default:
      return `"showcaseItems" should be 3-4 short service/offering highlights
relevant to this type of business. Each item: {"name": short title,
"description": 1 sentence, "tag": "" }`;
  }
}

export async function generateContent(
  lead: Lead,
  revisionComment?: string
): Promise<GeneratedContent> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY. Add it to your environment variables.");
  }

  const type = detectTemplateType(lead.category);

  const prompt = `You are a marketing copywriter creating landing page content for a local business.

Business name: ${lead.name}
Category: ${lead.category}
Address: ${lead.address}
Google rating: ${lead.rating ?? "unknown"} (${lead.reviewCount} reviews)

Write short, concrete, non-generic marketing copy for this business. Do not
invent specific menu items, prices, dietary claims (vegan/gluten-free etc.),
or amenity facts (WiFi, pet-friendly, parking) you don't actually know.
Keep copy about the type of experience, not fabricated specifics.
${revisionComment ? `\nThe business owner reviewed a previous draft and left this feedback — apply it: "${revisionComment}"\n` : ""}
Respond with ONLY valid JSON, no markdown fences, matching exactly this shape:
{
  "tagline": "string, under 10 words",
  "aboutUs": "string, 2-3 sentences, the business's story/mission",
  "secondaryAbout": "string, 2-3 sentences, a warmer detail (e.g. what the team/owner cares about) — do not invent named people",
  "philosophyHeading": "string, under 8 words, an evocative short phrase capturing this business's approach to their craft (fresh wording each time, not a cliché copy-pasted line)",
  "philosophyText": "string, 2 sentences expanding on the philosophy heading",
  "finalCtaHeading": "string, under 8 words, an inviting closing headline (e.g. an invitation to visit/book)",
  "seoTitle": "string, under 60 characters, include the business name and city",
  "metaDescription": "string, under 155 characters",
  "highlights": ["3 to 4 short phrases, each under 8 words"],
  ${showcaseInstructions(type)}
  "faq": [{"question": "string", "answer": "string, 1-2 sentences"}, ... 3 items],
  "googleBusinessDescription": "string, under 750 characters"
}
"showcaseItems" must be a JSON array matching the field described above.`;

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
