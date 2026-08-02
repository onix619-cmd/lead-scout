import { MenuSection } from "./types";
import { AiProvider } from "./content-writer";

// Groq's vision-capable models are a fast-moving preview lineup — this is
// the current one as of mid-2026. Check console.groq.com/docs if it errors.
const GROQ_VISION_MODEL = "qwen/qwen3.6-27b";
const GEMINI_MODEL = "gemini-flash-latest";
const XAI_MODEL = "grok-4.3";

const VISION_PROMPT = `This image shows a menu (or a photo containing menu
text) from a real business. Read ONLY the text that is actually visible in
the image — item names and prices. Do not invent, guess, or add anything
that isn't legible. If you can't clearly read a price for an item, omit the
price for that item rather than guessing. If this image does not contain a
readable menu at all, return an empty items array.

Respond with ONLY valid JSON, no markdown fences, in this shape:
{
  "sections": [
    { "category": "string or null if no clear category heading is visible",
      "items": [ { "name": "string", "price": "string, digits only, e.g. 12 or 12.50, or null if not legible" } ] }
  ]
}`;

function dataUrlParts(dataUrl: string): { mime: string; base64: string } | null {
  const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!m) return null;
  return { mime: m[1], base64: m[2] };
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

async function visionXai(images: string[]): Promise<string> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) throw new Error("Missing XAI_API_KEY.");
  const content: any[] = [{ type: "text", text: VISION_PROMPT }];
  for (const img of images.slice(0, 3)) {
    content.push({ type: "image_url", image_url: { url: img } });
  }
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: XAI_MODEL,
      messages: [{ role: "user", content }],
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) throw new Error(`Grok vision error (${res.status}): ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

// Extracts real menu items/prices visible in user-supplied photos, via
// whichever AI provider is selected. Best-effort — returns an empty array
// on any failure or when nothing legible is found, so the caller can fall
// back to manual paste or a "View Menu" link instead.
export async function extractMenuFromImages(
  images: string[],
  provider: AiProvider = "xai"
): Promise<MenuSection[]> {
  if (!images || images.length === 0) return [];
  try {
    const text =
      provider === "groq" ? await visionGroq(images) : provider === "gemini" ? await visionGemini(images) : await visionXai(images);

    const parsed = JSON.parse(text);
    const sections: MenuSection[] = (parsed.sections ?? [])
      .map((s: any) => ({
        category: s.category || undefined,
        items: (s.items ?? [])
          .filter((it: any) => it.name)
          .map((it: any) => ({ name: String(it.name), price: it.price ? String(it.price) : undefined })),
      }))
      .filter((s: MenuSection) => s.items.length > 0);

    return sections;
  } catch {
    return [];
  }
}
