import { MenuItem, MenuSection } from "./types";

// Parses plain-text menu the business owner/user pastes in directly.
// Supported format (flexible, line by line):
//   ## Starters          <- optional category header (## prefix)
//   Caesar Salad - $12
//   Soup of the Day $8.50
//   Garlic Bread — 6      (em-dash or plain number also work)
// Anything that doesn't look like "name ... price" is kept as a
// description-only line under the previous item, or skipped if it's the
// first line in a section.
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
      // Strip trailing price and any separator (-, —, :, $) before it.
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

    // No price on this line — treat as a description continuing the last item.
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
    
    // Quick heuristic: find any link containing "menu"
    const menuLinkMatch = html.match(/href=["']([^"']*(?:menu|carte|card)[^"']*)["']/i);
    let finalLink = url;
    if (menuLinkMatch && menuLinkMatch[1]) {
      try {
        finalLink = new URL(menuLinkMatch[1], res.url || url).toString();
      } catch (e: unknown) {
        // ignore invalid URL
      }
    }

    // Now send the HTML (up to 15k chars) to Gemini to extract the menu
    const cleanHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
                          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
                          .replace(/<[^>]+>/g, " ")
                          .replace(/\s+/g, " ")
                          .slice(0, 15000);
                          
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `Extract all menu items and prices from this text (which is scraped from a restaurant website). Format it as plain text with one item per line like 'Name - $Price', and use '## Category' for section headers. If there is no clear menu data, return nothing.\n\n${cleanHtml}` }
            ]
          }
        ]
      })
    });
    
    if (!geminiRes.ok) return { menuLink: finalLink };
    
    const data = await geminiRes.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // If Gemini hallucinates or just says "No menu", ignore it
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
