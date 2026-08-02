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

export async function autoExtractMenuFromWebsite(url: string, apiKey: string): Promise<{ menuText?: string; menuLink?: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LeadScoutBot/1.0)" },
    });
    clearTimeout(timeout);
    
    if (!res.ok) return {};
    const html = await res.text();
    
    const menuLinkMatch = html.match(/href=["']([^"']*(?:menu|carte|card)[^"']*)["']/i);
    let finalLink = url;
    if (menuLinkMatch && menuLinkMatch[1]) {
      try {
        finalLink = new URL(menuLinkMatch[1], res.url || url).toString();
      } catch (_e: unknown) {
        // ignore invalid URL
      }
    }

    const cleanHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
                          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
                          .replace(/<[^>]+>/g, " ")
                          .replace(/\s+/g, " ")
                          .slice(0, 15000);

    const promptText = `Extract all menu items and prices from this text (which is scraped from a restaurant website). Format it as plain text with one item per line like 'Name - $Price', and use '## Category' for section headers. If there is no clear menu data, return nothing.\n\n${cleanHtml}`;
    let text = "";

    if (apiKey.startsWith("xai-")) {
      const grokRes = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-2-latest",
          messages: [{ role: "user", content: promptText }],
        }),
      });

      if (grokRes.ok) {
        const data = await grokRes.json();
        text = data.choices?.[0]?.message?.content || "";
      }
    } else {
      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
        }),
      });

      if (geminiRes.ok) {
        const data = await geminiRes.json();
        text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      }
    }
    
    if (text.length < 20 || text.toLowerCase().includes("no menu items") || text.toLowerCase().includes("cannot extract")) {
      text = "";
    }
    
    return { 
      menuText: text || undefined, 
      menuLink: finalLink !== url ? finalLink : undefined 
    };
  } catch (e: unknown) {
    console.error("Auto menu extraction failed", e);
    return {};
  }
}
