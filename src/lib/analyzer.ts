import { WebsiteScore } from "./types";
import { looksLikeParkedOrPlaceholderPage } from "./menu";

// Rule-based website quality scoring. Deliberately avoids needing an OpenAI
// key for this phase — it fetches the site's HTML and checks for concrete
// signals. Swap/extend this later with an LLM pass if you want richer
// "modern/outdated" judgment calls.
export async function analyzeWebsite(url: string): Promise<WebsiteScore> {
  const checks: WebsiteScore["checks"] = [];
  const suggestions: string[] = [];

  let html = "";
  let finalUrl = url;
  let loadTimeMs = 0;

  try {
    const started = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LeadScoutBot/1.0)" },
    });
    clearTimeout(timeout);
    loadTimeMs = Date.now() - started;
    finalUrl = res.url || url;
    html = await res.text();
  } catch (err: any) {
    return {
      score: 0,
      hasWebsite: true,
      checks: [{ label: "Website reachable", passed: false, weight: 100 }],
      suggestions: ["Website did not respond — treat as high priority lead."],
      error: err?.message ?? "Failed to fetch website",
    };
  }

  // The listed domain is registered but never actually built out — it
  // resolves to a registrar/hosting parked-domain page instead of a real
  // site. Treat this exactly like "no website": don't score it, don't
  // surface it as a link, and flag it clearly for the person reviewing leads.
  if (looksLikeParkedOrPlaceholderPage(html)) {
    return {
      score: 0,
      hasWebsite: false,
      checks: [{ label: "Website reachable", passed: false, weight: 100 }],
      suggestions: ["This domain is parked / unclaimed — treat as no website."],
      error: "Domain resolves to a parked/placeholder page, not a real website.",
    };
  }

  const lower = html.toLowerCase();
  const add = (label: string, passed: boolean, weight: number, tip?: string) => {
    checks.push({ label, passed, weight });
    if (!passed && tip) suggestions.push(tip);
  };

  add("HTTPS / SSL", finalUrl.startsWith("https://"), 12, "Move the site to HTTPS.");
  add(
    "Mobile viewport tag",
    /<meta[^>]+name=["']viewport["']/i.test(html),
    14,
    "Add a mobile viewport meta tag / responsive layout."
  );
  add(
    "Page title present",
    /<title>[^<]{5,}<\/title>/i.test(html),
    8,
    "Add a descriptive page title for SEO."
  );
  add(
    "Meta description",
    /<meta[^>]+name=["']description["']/i.test(html),
    8,
    "Add a meta description for SEO."
  );
  add(
    "Fast load time (<2.5s)",
    loadTimeMs < 2500,
    12,
    "Speed up the site — it took over 2.5s to load."
  );
  add(
    "WhatsApp contact link",
    /wa\.me|whatsapp/i.test(lower),
    10,
    "Add a WhatsApp click-to-chat button."
  );
  add(
    "Instagram link",
    /instagram\.com/i.test(lower),
    6,
    "Link to the business's Instagram."
  );
  add(
    "Facebook link",
    /facebook\.com/i.test(lower),
    6,
    "Link to the business's Facebook page."
  );
  add(
    "Online reservation / ordering",
    /reservat|book\s?a\s?table|order\s?online|opentable|resy/i.test(lower),
    12,
    "Add online reservations or ordering."
  );
  add(
    "Menu present",
    /menu/i.test(lower),
    8,
    "Add a clear, easy-to-find menu section."
  );
  add(
    "Embedded Google Reviews",
    /g\.page|google\.com\/maps\/embed|elfsight|reviews?/i.test(lower),
    6,
    "Embed Google Reviews to build trust."
  );
  add(
    "Structured data (schema.org)",
    /application\/ld\+json/i.test(html),
    4,
    "Add schema.org structured data for richer search results."
  );

  const totalWeight = checks.reduce((s, c) => s + c.weight, 0);
  const earned = checks.reduce((s, c) => s + (c.passed ? c.weight : 0), 0);
  const score = Math.round((earned / totalWeight) * 100);

  return { score, hasWebsite: true, checks, suggestions, socialLinks: extractSocialLinks(html) };
}

export function extractSocialLinks(html: string): { instagram?: string; facebook?: string; tiktok?: string } {
  const instaMatch = html.match(/https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.\/?=&%-]*/i);
  const fbMatch = html.match(/https?:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9_.\/?=&%-]*/i);
  const tiktokMatch = html.match(/https?:\/\/(www\.)?tiktok\.com\/[a-zA-Z0-9_.\/?=&%@-]*/i);
  return {
    instagram: instaMatch?.[0],
    facebook: fbMatch?.[0],
    tiktok: tiktokMatch?.[0],
  };
}

export function priorityFromScore(hasWebsite: boolean, score: number): "high" | "medium" | "low" {
  if (!hasWebsite) return "high";
  if (score < 50) return "high";
  if (score < 75) return "medium";
  return "low";
}
