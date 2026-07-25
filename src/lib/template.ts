import { GeneratedContent, Lead } from "./types";

const FOOD_CATEGORIES = ["restaurant", "pizza", "cafe", "coffee", "bakery", "bar", "food"];

function isFoodBusiness(category: string) {
  return FOOD_CATEGORIES.some((k) => category.toLowerCase().includes(k));
}

// Deterministic palette per business (placeholder for real logo-color
// extraction later) so different leads don't all look identical.
const PALETTES = [
  { primary: "#b45309", accent: "#fef3c7", dark: "#1c1917" }, // warm amber
  { primary: "#7c2d12", accent: "#fee2e2", dark: "#1c1917" }, // terracotta
  { primary: "#166534", accent: "#dcfce7", dark: "#052e16" }, // forest
  { primary: "#1e3a8a", accent: "#dbeafe", dark: "#0f172a" }, // navy
  { primary: "#701a75", accent: "#fae8ff", dark: "#1e1b2e" }, // plum
  { primary: "#0f766e", accent: "#ccfbf1", dark: "#082f2b" }, // teal
];

function paletteFor(name: string) {
  const hash = [...name].reduce((s, c) => s + c.charCodeAt(0), 0);
  return PALETTES[hash % PALETTES.length];
}

function waLink(phone: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

export function generateLandingPageHTML(lead: Lead, content: GeneratedContent): string {
  const palette = paletteFor(lead.name);
  const food = isFoodBusiness(lead.category);
  const wa = waLink(lead.phone);
  const stars = "★".repeat(Math.round(lead.rating ?? 0)) + "☆".repeat(5 - Math.round(lead.rating ?? 0));

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(content.seoTitle)}</title>
<meta name="description" content="${escapeHtml(content.metaDescription)}" />
<script src="https://cdn.tailwindcss.com"></script>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  :root { --primary: ${palette.primary}; --accent: ${palette.accent}; --dark: ${palette.dark}; }
</style>
</head>
<body class="text-slate-800">

<!-- Hero -->
<header class="relative" style="background:var(--dark);">
  ${lead.photoUrl ? `<img src="${lead.photoUrl}" alt="${escapeHtml(lead.name)}" class="w-full h-[70vh] object-cover opacity-60" />` : `<div class="w-full h-[50vh]"></div>`}
  <div class="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
    <h1 class="text-white text-4xl sm:text-6xl font-bold tracking-tight">${escapeHtml(lead.name)}</h1>
    <p class="text-white/90 text-lg sm:text-xl mt-4 max-w-xl">${escapeHtml(content.tagline)}</p>
    <div class="mt-8 flex flex-wrap gap-3 justify-center">
      ${lead.phone ? `<a href="tel:${lead.phone}" class="px-6 py-3 rounded-full text-white font-medium" style="background:var(--primary);">Call now</a>` : ""}
      ${wa ? `<a href="${wa}" target="_blank" class="px-6 py-3 rounded-full bg-[#25D366] text-white font-medium">WhatsApp us</a>` : ""}
    </div>
  </div>
</header>

<!-- Reviews strip -->
${lead.rating ? `
<section class="py-4" style="background:var(--accent);">
  <div class="max-w-4xl mx-auto px-6 text-center">
    <span class="text-2xl" style="color:var(--primary);">${stars}</span>
    <span class="ml-2 font-medium">${lead.rating} out of 5</span>
    <span class="text-slate-500"> · ${lead.reviewCount} Google reviews</span>
  </div>
</section>` : ""}

<!-- About -->
<section class="max-w-4xl mx-auto px-6 py-16 text-center">
  <h2 class="text-2xl font-semibold mb-4">About Us</h2>
  <p class="text-slate-600 leading-relaxed">${escapeHtml(content.aboutUs)}</p>
</section>

<!-- Highlights / Menu-ish -->
<section class="py-16" style="background:var(--accent);">
  <div class="max-w-4xl mx-auto px-6">
    <h2 class="text-2xl font-semibold mb-8 text-center">${food ? "What We Offer" : "Our Services"}</h2>
    <div class="grid sm:grid-cols-2 gap-4">
      ${content.highlights.map((h) => `
      <div class="bg-white rounded-xl p-5 shadow-sm">
        <p class="font-medium">${escapeHtml(h)}</p>
      </div>`).join("")}
    </div>
  </div>
</section>

<!-- Contact / Reservation CTA -->
<section class="py-16 text-center text-white" style="background:var(--primary);">
  <h2 class="text-2xl font-semibold mb-3">Get in Touch</h2>
  <p class="mb-6 opacity-90">${food ? "Reserve your table or reach out with any questions." : "Reach out to book or ask a question."}</p>
  <div class="flex flex-wrap gap-3 justify-center">
    ${lead.phone ? `<a href="tel:${lead.phone}" class="px-6 py-3 rounded-full bg-white font-medium" style="color:var(--primary);">Call ${escapeHtml(lead.phone)}</a>` : ""}
    ${wa ? `<a href="${wa}" target="_blank" class="px-6 py-3 rounded-full bg-[#25D366] text-white font-medium">Message on WhatsApp</a>` : ""}
    <a href="${lead.mapsUrl}" target="_blank" class="px-6 py-3 rounded-full border border-white text-white font-medium">Get Directions</a>
  </div>
</section>

<!-- Hours -->
${lead.openingHours.length > 0 ? `
<section class="max-w-2xl mx-auto px-6 py-16">
  <h2 class="text-2xl font-semibold mb-6 text-center">Opening Hours</h2>
  <ul class="space-y-1 text-center text-slate-600">
    ${lead.openingHours.map((h) => `<li>${escapeHtml(h)}</li>`).join("")}
  </ul>
</section>` : ""}

<!-- FAQ -->
<section class="max-w-3xl mx-auto px-6 py-16">
  <h2 class="text-2xl font-semibold mb-8 text-center">Frequently Asked Questions</h2>
  <div class="space-y-4">
    ${content.faq.map((f) => `
    <div class="border-b border-slate-200 pb-4">
      <p class="font-medium">${escapeHtml(f.question)}</p>
      <p class="text-slate-600 mt-1">${escapeHtml(f.answer)}</p>
    </div>`).join("")}
  </div>
</section>

<!-- Footer -->
<footer class="text-white py-10 text-center" style="background:var(--dark);">
  <p class="font-semibold text-lg">${escapeHtml(lead.name)}</p>
  <p class="text-white/70 mt-1">${escapeHtml(lead.address)}</p>
  <div class="mt-4 flex gap-4 justify-center text-white/80 text-sm">
    ${lead.socialLinks?.instagram ? `<a href="${lead.socialLinks.instagram}" target="_blank">Instagram</a>` : ""}
    ${lead.socialLinks?.facebook ? `<a href="${lead.socialLinks.facebook}" target="_blank">Facebook</a>` : ""}
    <a href="${lead.mapsUrl}" target="_blank">Google Maps</a>
  </div>
  <p class="text-white/40 text-xs mt-6">Website mockup generated for demo purposes.</p>
</footer>

</body>
</html>`;
}
