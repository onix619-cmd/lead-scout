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

// Best-effort auto-extraction: fetches the business's own real website and
// looks for plain-text "item ... $price" patterns, reusing the same parser
// as the manual-paste flow. This only works when a site's menu is real
// visible text (not an image or PDF, which is common) — when it can't find
// enough matches, it returns an empty result and the manual-paste option
// remains the reliable fallback. There is no official Google API that
// returns structured menu+price data for arbitrary businesses (the
// Google Business Profile "Food Menus" API exists, but only the business
// owner's own authenticated account can access their own listing's menu —
// it's not available to third-party tools like this one for other
// businesses), so this website-text approach is the most honest "auto"
// option available without fabricating anything.
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
    // Guard against false positives (random prices on a non-menu page) —
    // only return results if we found a reasonable number of plausible items.
    const total = countMenuItems(sections);
    if (total < 4) return [];
    return sections;
  } catch {
    return [];
  }
}
