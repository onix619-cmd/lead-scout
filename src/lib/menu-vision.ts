import { MenuSection } from "./types";
import { AiProvider } from "./content-writer";

// Groq's vision-capable models are a fast-moving preview lineup — this is
// the current one as of mid-2026. Check console.groq.com/docs if it errors.
const GROQ_VISION_MODEL = "qwen/qwen3.6-27b";
const GEMINI_MODEL = "gemini-flash-latest";
const CLAUDE_MODEL = "claude-sonnet-5";

const VISION_PROMPT = `This image shows a menu (or a photo containing menu
text) from a real business. Extract ONLY real, legible text — item names
and prices actually printed/displayed in the image.

Ignore anything that isn't text: logos, icons, decorative borders, food
photography, illustrations, background patterns, watermarks. Do not
describe or interpret images/graphics on the menu — skip them entirely and
extract only readable words and numbers.

Do not invent, guess, or add anything that isn't legible. If you can't
clearly read a price for an item, omit the price for that item rather than
guessing. If this image does not contain a readable menu at all (e.g. it's
just food photography, the storefront, or decor with no menu text), return
an empty items array.

Respond with ONLY valid JSON, no markdown fences, in this shape:
{
  "sections": [
    { "category": "string or null if no clear category heading is visible",
      "items": [ { "name": "string", "price": "string, digits only, e.g. 12 or 12.50, or null if not legible" } ] }
  ]
}`;

const CLASSIFY_PROMPT = `Look at this photo from a business's Google Maps
listing. Answer only: does this image contain readable menu text — item
names and/or prices (a printed/digital menu board, menu page, chalkboard
price list, etc.)? A photo of food, the storefront, decor, or people does
NOT count, even if appetizing — only real text counts. Respond with ONLY
valid JSON, no markdown fences: {"isMenu": true or false}`;

function dataUrlParts(dataUrl: string): { mime: string; base64: string } | null {
  const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!m) return null;
  return { mime: m[1], base64: m[2] };
}

function imageBlock(img: string) {
  if (img.startsWith("data:")) {
    const p = dataUrlParts(img);
    if (!p) return null;
    return { type: "image", source: { type: "base64", media_type: p.mime, data: p.base64 } };
  }
  return { type: "image", source: { type: "url", url: img } };
}

async function callClaude(prompt: string, images: string[], maxTokens = 1500): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY.");
  const content: any[] = images.map(imageBlock).filter(Boolean);
  content.push({ type: "text", text: prompt });

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      messages: [{ role: "user", content }],
    }),
  });
  if (!res.ok) throw new Error(`Claude vision error (${res.status}): ${await res.text()}`);
  const data = await res.json();
  const text = data.content?.find((b: any) => b.type === "text")?.text;
  return text ?? "";
}

async function classifyGroq(url: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Missing GROQ_API_KEY.");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: GROQ_VISION_MODEL,
      messages: [{ role: "user", content: [{ type: "text", text: CLASSIFY_PROMPT }, { type: "image_url", image_url: { url } }] }],
      temperature: 0,
      max_tokens: 100,
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) throw new Error(`Groq classify error (${res.status}): ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function extractGroq(url: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Missing GROQ_API_KEY.");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: GROQ_VISION_MODEL,
      messages: [{ role: "user", content: [{ type: "text", text: VISION_PROMPT }, { type: "image_url", image_url: { url } }] }],
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) throw new Error(`Groq extract error (${res.status}): ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function classifyClaude(url: string): Promise<string> {
  return callClaude(CLASSIFY_PROMPT, [url], 100);
}

async function extractClaude(url: string): Promise<string> {
  return callClaude(VISION_PROMPT, [url]);
}

function parseJsonLoose(text: string): any {
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(cleaned);
}

async function visionGroq(images: string[]): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Missing GROQ_API_KEY.");
  const content: any[] = [{ type: "text", text: VISION_PROMPT }];
  for (const img of images.slice(0, 3)) {
    content.push({ type: "image_url", image_url: { url: img } });
  }
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: GROQ_VISION_MODEL,
      messages: [{ role: "user", content }],
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) throw new Error(`Groq vision error (${res.status}): ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function visionGemini(images: string[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY.");
  const parts: any[] = [{ text: VISION_PROMPT }];
  for (const img of images.slice(0, 3)) {
    const p = dataUrlParts(img);
    if (p) parts.push({ inline_data: { mime_type: p.mime, data: p.base64 } });
  }
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini vision error (${res.status}): ${await res.text()}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

async function visionClaude(images: string[]): Promise<string> {
  return callClaude(VISION_PROMPT, images.slice(0, 3));
}

function toMenuSections(parsed: any): MenuSection[] {
  return (parsed.sections ?? [])
    .map((s: any) => ({
      category: s.category || undefined,
      items: (s.items ?? [])
        .filter((it: any) => it.name)
        .map((it: any) => ({ name: String(it.name), price: it.price ? String(it.price) : undefined })),
    }))
    .filter((s: MenuSection) => s.items.length > 0);
}

// Extracts real menu items/prices visible in user-supplied photos, via
// whichever AI provider is selected. Best-effort — returns an empty array
// on any failure or when nothing legible is found, so the caller can fall
// back to manual paste or a "View Menu" link instead.
export async function extractMenuFromImages(
  images: string[],
  provider: AiProvider = "claude"
): Promise<MenuSection[]> {
  if (!images || images.length === 0) return [];
  try {
    const text =
      provider === "groq"
        ? await visionGroq(images)
        : provider === "gemini"
        ? await visionGemini(images)
        : await visionClaude(images);

    return toMenuSections(parseJsonLoose(text));
  } catch {
    return [];
  }
}

// The full "Detect Menu Photos" pipeline: scans a business's real Google
// Maps photos (no manual upload needed), classifies each as menu/not-menu,
// then extracts structured items from whichever ones are menus. Capped at
// a handful of photos to keep cost/latency reasonable — checking every
// photo on a large listing isn't worth it. Returns the merged menu plus
// the URL of the first photo identified as the menu, for the "View
// Original Menu" button. Uses whichever provider is selected — Groq or
// Claude both support fetching a real Google Photos URL directly, so
// neither needs a manual download step.
export async function detectMenuFromGooglePhotos(
  photoUrls: string[],
  provider: AiProvider = "claude"
): Promise<{ sections: MenuSection[]; sourcePhotoUrl?: string }> {
  const usesGroq = provider === "groq";
  const apiKey = usesGroq ? process.env.GROQ_API_KEY : process.env.ANTHROPIC_API_KEY;
  if (!apiKey || !photoUrls || photoUrls.length === 0) {
    return { sections: [] };
  }

  const classify = usesGroq ? classifyGroq : classifyClaude;
  const extract = usesGroq ? extractGroq : extractClaude;

  const candidates = photoUrls.slice(0, 6);
  let sourcePhotoUrl: string | undefined;
  const allSections: MenuSection[] = [];

  for (const url of candidates) {
    try {
      const classifyText = await classify(url);
      const { isMenu } = parseJsonLoose(classifyText);
      if (!isMenu) continue;

      if (!sourcePhotoUrl) sourcePhotoUrl = url;
      const extractText = await extract(url);
      const sections = toMenuSections(parseJsonLoose(extractText));
      allSections.push(...sections);
    } catch {
      // skip this photo, keep checking the rest
    }
  }

  return { sections: allSections, sourcePhotoUrl };
}
