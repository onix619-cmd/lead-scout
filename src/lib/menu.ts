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
