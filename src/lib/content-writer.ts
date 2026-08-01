import { GeneratedContent, Lead } from "./types";
import { detectTemplateType } from "./template-type";

// Uses xAI's Grok API (OpenAI-compatible chat completions endpoint).
// Get a key at console.x.ai. Env var name follows xAI's own convention.
const MODEL = "grok-4.3";

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
    case "coffee":
      return `"showcaseItems" should be 4-5 standard coffee-shop drink/food
CATEGORIES (e.g. "Espresso Drinks", "Cold Brew", "Pastries", "Seasonal
Specials") — universal categories, not invented proprietary recipes or
prices. Each item: {"name": category name, "description": 1 short sensory
sentence, "tag": "Signature" | "Popular" | "New" | "" }`;
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
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing XAI_API_KEY. Add it to your environment variables.");
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

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
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
    throw new Error(`Grok API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Grok returned an empty response.");

  try {
    return JSON.parse(text) as GeneratedContent;
  } catch {
    throw new Error("Grok returned content that wasn't valid JSON — try again.");
  }
}
