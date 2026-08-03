import { MenuItem, MenuSection } from "./types";

export function parseMenuText(raw: string): MenuSection[] {
  if (!raw || !raw.trim()) return [];

  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const sections: MenuSection[] = [];
  let current: MenuSection = { items: [] };
  let lastItem: MenuItem | null = null;

  const priceRe = /[\$\€\£]?\s*(\d+(?:[.,]\d{1,2})?)\s*[\$\€\£]?\s*$/;

  for (const line of lines) {
    if (line.startsWith("##")) {
      if (current.items.length > 0) sections.push(current);
      current = { category: line.replace(/^##\s*/, "").trim(), items: [] };
      lastItem = null;
      continue;
    }

    const match = line.match(priceRe);
    if (match) {
      const namePart = line
        .slice(0, match.index)
        .replace(/[-–—:\$\€\£]\s*$/, "")
        .trim();
      if (namePart) {
        const item: MenuItem = { name: namePart, price: match[1] };
        current.items.push(item);
        lastItem = item;
        continue;
      }
    }

    if (lastItem && !lastItem.description) {
      lastItem.description = line;
    } else if (line.length > 0) {
      current.items.push({ name: line });
      lastItem = current.items[current.items.length - 1];
    }
  }
  if (current.items.length > 0) sections.push(current);

  return sections;
}

export function countMenuItems(sections: MenuSection[]): number {
  return sections.reduce((sum, s) => sum + s.items.length, 0);
}

export async function autoExtractMenuFromImages(photoUrls: string[], apiKey: string): Promise<string> {
  if (!apiKey || !photoUrls || photoUrls.length === 0) return "";

  for (const url of photoUrls.slice(0, 3)) {
    try {
      let base64Data = "";
      if (url.startsWith("data:")) {
        base64Data = url.split(",")[1];
      } else {
        const r = await fetch(url);
        const buf = await r.arrayBuffer();
        base64Data = Buffer.from(buf).toString("base64");
      }

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "You are an expert menu OCR parser. Examine this image. If this image is a menu, extract all menu categories, dish names, prices, and descriptions cleanly. Ignore decorative background graphics, logos, and phone numbers. Format the output strictly as:\n## Category Name\nDish Name - $Price\nOptional short description\n\nIf this image is NOT a menu, return nothing."
                },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: base64Data
                  }
                }
              ]
            }
          ]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 10) {
          return text;
        }
      }
    } catch {
      // continue to next photo
    }
  }
  return "";
}

export async function extractMenuFromWebsite(url: string): Promise<MenuSection[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LeadScoutBot/1.0)" },
    });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const html = await res.text();

    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<\/(p|div|li|tr|h[1-6]|br)>/gi, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&nbsp;/g, " ")
      .replace(/&#39;|&rsquo;/g, "'")
      .replace(/[ \t]+/g, " ")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .join("\n");

    const sections = parseMenuText(text);
    const total = countMenuItems(sections);
    if (total < 4) return [];
    return sections;
  } catch {
    return [];
  }
}
