import { GeneratedContent, Lead, MenuSection } from "./types";
import { countMenuItems } from "./menu";

function waLink(phone: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}`;
}
function waDigits(phone: string | null) {
  return phone ? phone.replace(/[^\d]/g, "") : "";
}
function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
function splitHoursLine(line: string): [string, string] {
  const idx = line.indexOf(":");
  if (idx === -1) return [line, ""];
  return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
}

const PALETTES = [
  { primary: "#e63946", accent: "#ffb703", dark: "#1d1d1d" }, // red/yellow diner
  { primary: "#fb5607", accent: "#ffbe0b", dark: "#1a1a1a" }, // orange/gold
  { primary: "#d62828", accent: "#f77f00", dark: "#161616" }, // deep red/orange
];
function paletteFor(name: string) {
  const hash = [...name].reduce((s, c) => s + c.charCodeAt(0), 0);
  return PALETTES[hash % PALETTES.length];
}

export function generateQuickServiceLandingPageHTML(
  lead: Lead,
  content: GeneratedContent,
  menuSections: MenuSection[] = [],
  originalMenuPhotoUrl?: string
): string {
  const palette = paletteFor(lead.name);
  const wa = waLink(lead.phone);
  const waNum = waDigits(lead.phone);
  const filledStars = Math.round(lead.rating ?? 0);

  const galleryImages =
    lead.uploadedImages && lead.uploadedImages.length > 0
      ? lead.uploadedImages
      : lead.photoUrl
      ? [lead.photoUrl]
      : [];
  const heroImage = galleryImages[0] ?? null;
  const menuItemCount = countMenuItems(menuSections);

  const dining = lead.diningOptions ?? {};
  const diningBadges = [
    dining.takeout ? "Takeout" : null,
    dining.delivery ? "Delivery" : null,
    dining.dineIn ? "Dine-In" : null,
  ].filter(Boolean) as string[];

  const starsHtml = (count: number) =>
    Array.from({ length: 5 }).map((_, i) => `<span style="color:${i < count ? "#ffbe0b" : "#4b4b4b"};">★</span>`).join("");

  const menuLinkUrl = originalMenuPhotoUrl || lead.website;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(content.seoTitle)}</title>
<meta name="description" content="${escapeHtml(content.metaDescription)}" />
<meta property="og:title" content="${escapeHtml(content.seoTitle)}" />
${heroImage ? `<meta property="og:image" content="${heroImage}" />` : ""}
<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FastFoodRestaurant",
    name: lead.name,
    address: lead.address,
    telephone: lead.phone ?? undefined,
    url: lead.mapsUrl,
    aggregateRating: lead.rating != null ? { "@type": "AggregateRating", ratingValue: lead.rating, reviewCount: lead.reviewCount } : undefined,
  })}</script>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Anton&family=Nunito:wght@400;700;900&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<style>
  html { scroll-behavior: smooth; }
  body { font-family: 'Nunito', sans-serif; background:#111; color:#fff; }
  h1, h2, h3, .font-display { font-family: 'Anton', sans-serif; letter-spacing: 0.5px; }
  :root { --primary: ${palette.primary}; --accent: ${palette.accent}; --dark: ${palette.dark}; }
  .btn-primary { background: var(--primary); }
  .btn-accent { background: var(--accent); color: #1a1a1a; }
  .text-primary { color: var(--primary); }
  .diag { clip-path: polygon(0 0, 100% 0, 100% 92%, 0 100%); }
  .reveal { opacity: 0; transform: translateY(20px); transition: opacity .5s ease, transform .5s ease; }
  .reveal.show { opacity: 1; transform: translateY(0); }
  .hover-pop { transition: transform .2s ease; }
  .hover-pop:hover { transform: scale(1.06) rotate(-1deg); }
  .stripe { background: repeating-linear-gradient(45deg, var(--accent), var(--accent) 12px, var(--primary) 12px, var(--primary) 24px); }
</style>
</head>
<body>

<!-- Nav -->
<nav class="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur">
  <div class="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
    <a href="#top" class="font-display text-xl uppercase" style="color:var(--accent);">${escapeHtml(lead.name)}</a>
    <div class="hidden sm:flex items-center gap-6 text-sm font-bold uppercase">
      <a href="#menu">Menu</a>
      <a href="#about">About</a>
      <a href="#reviews">Reviews</a>
      <a href="#contact">Find Us</a>
    </div>
    <a href="#order" class="btn-primary text-white text-sm font-black uppercase px-5 py-2">Order Now</a>
  </div>
</nav>

<!-- Hero -->
<header id="top" class="relative pt-16 diag" style="background:var(--dark);">
  ${heroImage ? `<img src="${heroImage}" class="w-full h-[80vh] object-cover opacity-50" alt="${escapeHtml(lead.name)}" />` : `<div class="w-full h-[60vh]" style="background:linear-gradient(135deg, var(--primary), var(--dark));"></div>`}
  <div class="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
    <h1 class="text-white text-5xl sm:text-7xl uppercase font-display drop-shadow-lg">${escapeHtml(lead.name)}</h1>
    <p class="text-white/90 text-lg mt-4 max-w-lg font-bold">${escapeHtml(content.tagline)}</p>
    ${lead.rating ? `<div class="mt-3 flex items-center gap-1">${starsHtml(filledStars)} <span class="text-white/80 ml-1 text-sm">${lead.rating} (${lead.reviewCount})</span></div>` : ""}
    <div class="mt-8 flex flex-wrap gap-3 justify-center">
      ${wa ? `<a href="https://wa.me/${waNum}?text=${encodeURIComponent(`Hi ${lead.name}, I'd like to place an order.`)}" target="_blank" class="btn-primary text-white font-black uppercase px-8 py-4 hover-pop">Order Now</a>` : ""}
      <a href="#menu" class="btn-accent font-black uppercase px-8 py-4 hover-pop">See Menu</a>
    </div>
  </div>
</header>

<div class="h-3 stripe"></div>

<!-- About -->
<section id="about" class="max-w-5xl mx-auto px-6 py-16 text-center reveal">
  <p class="uppercase text-xs font-black tracking-widest mb-2" style="color:var(--accent);">Our Story</p>
  <h2 class="text-3xl font-display uppercase mb-4">${escapeHtml(lead.name)}</h2>
  <p class="text-white/80 max-w-2xl mx-auto">${escapeHtml(content.aboutUs)}</p>
  <div class="flex flex-wrap gap-3 justify-center mt-6">
    ${content.highlights.map((h) => `<span class="text-xs font-black uppercase border-2 rounded-full px-4 py-1.5" style="border-color:var(--primary);">${escapeHtml(h)}</span>`).join("")}
  </div>
</section>

<!-- Menu -->
<section id="menu" class="py-16" style="background:var(--dark);">
  <div class="max-w-5xl mx-auto px-6 reveal">
    <p class="uppercase text-xs font-black tracking-widest mb-2 text-center" style="color:var(--accent);">Dig In</p>
    <h2 class="text-4xl font-display uppercase mb-10 text-center">The Menu</h2>
    ${menuSections.length > 0 ? `
    <div class="space-y-10">
      ${menuSections.map((section) => `
      <div>
        ${section.category ? `<h3 class="text-xl font-display uppercase mb-4" style="color:var(--accent);">${escapeHtml(section.category)}</h3>` : ""}
        <div class="grid sm:grid-cols-2 gap-3">
          ${section.items.map((it) => `
          <div class="flex items-baseline justify-between gap-4 bg-white/5 border-2 border-white/10 px-4 py-3">
            <span class="font-bold">${escapeHtml(it.name)}</span>
            ${it.price ? `<span class="font-black" style="color:var(--accent);">$${escapeHtml(it.price)}</span>` : ""}
          </div>`).join("")}
        </div>
      </div>`).join("")}
    </div>` : `
    <div class="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
      ${content.showcaseItems.map((item) => `
      <div class="bg-white/5 border-2 border-white/10 p-5 hover-pop">
        ${item.tag ? `<span class="text-[10px] font-black uppercase" style="color:var(--accent);">${escapeHtml(item.tag)}</span>` : ""}
        <h3 class="font-display uppercase text-lg mt-1">${escapeHtml(item.name)}</h3>
        <p class="text-sm text-white/70 mt-1">${escapeHtml(item.description)}</p>
      </div>`).join("")}
    </div>`}
    ${menuLinkUrl ? `<div class="text-center mt-8"><a href="${menuLinkUrl}" target="_blank" class="inline-block btn-accent font-black uppercase px-6 py-3 hover-pop">${originalMenuPhotoUrl ? "View Original Menu ↗" : "View Full Menu ↗"}</a></div>` : ""}
  </div>
</section>

<!-- Order / Reservation -->
<section id="order" class="py-16">
  <div class="max-w-lg mx-auto px-6 text-center reveal">
    <p class="uppercase text-xs font-black tracking-widest mb-2" style="color:var(--accent);">Hungry?</p>
    <h2 class="text-3xl font-display uppercase mb-6">Order or Ask a Question</h2>
    <form id="order-form" class="space-y-4 bg-white/5 border-2 border-white/10 p-6 text-left">
      <div>
        <label class="text-xs font-bold uppercase block mb-1 text-white/70">Your name</label>
        <input id="f-name" required class="w-full bg-black border-2 border-white/20 px-3 py-2 text-white" placeholder="Jane Doe" />
      </div>
      <div>
        <label class="text-xs font-bold uppercase block mb-1 text-white/70">What do you want?</label>
        <textarea id="f-note" rows="3" class="w-full bg-black border-2 border-white/20 px-3 py-2 text-white" placeholder="2x large pizza, extra cheese..."></textarea>
      </div>
      <button type="submit" class="w-full btn-primary text-white font-black uppercase py-3 hover-pop">${wa ? "Send via WhatsApp" : "Submit"}</button>
    </form>
  </div>
</section>

<!-- Reviews -->
<section id="reviews" class="py-16 text-center" style="background:var(--dark);">
  <div class="reveal">
    <p class="uppercase text-xs font-black tracking-widest mb-2" style="color:var(--accent);">Reviews</p>
    <h2 class="text-3xl font-display uppercase mb-4">What People Say</h2>
    <div class="text-3xl mb-2">${starsHtml(filledStars)}</div>
    <p class="text-white/70">${lead.rating ?? "—"} out of 5 · ${lead.reviewCount} Google reviews</p>
    ${lead.realReviews && lead.realReviews.length > 0 ? `
    <div class="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto mt-8 text-left">
      ${lead.realReviews.slice(0, 2).map((r) => `
      <div class="bg-white/5 border-2 border-white/10 p-5">
        <div class="text-sm mb-2">${starsHtml(Math.round(r.rating))}</div>
        <p class="text-sm text-white/80">"${escapeHtml(r.text.length > 180 ? r.text.slice(0, 180).trim() + "…" : r.text)}"</p>
        <p class="text-xs text-white/50 mt-3">${escapeHtml(r.authorName)} · ${escapeHtml(r.relativeTime)}</p>
      </div>`).join("")}
    </div>` : ""}
    <a href="${lead.mapsUrl}" target="_blank" class="inline-block mt-6 text-sm font-bold uppercase underline" style="color:var(--accent);">Read more on Google →</a>
  </div>
</section>

<!-- Contact -->
<section id="contact" class="py-16 text-center reveal">
  <p class="uppercase text-xs font-black tracking-widest mb-2" style="color:var(--accent);">Find Us</p>
  <h2 class="text-3xl font-display uppercase mb-4">${escapeHtml(lead.address)}</h2>
  ${diningBadges.length > 0 ? `<div class="flex flex-wrap gap-2 justify-center mb-6">${diningBadges.map((b) => `<span class="text-xs font-black uppercase border-2 rounded-full px-4 py-1.5" style="border-color:var(--accent); color:var(--accent);">${escapeHtml(b)}</span>`).join("")}</div>` : ""}
  <div class="flex flex-wrap gap-3 justify-center">
    <a href="${lead.mapsUrl}" target="_blank" class="btn-primary text-white font-black uppercase px-6 py-3 hover-pop">Get Directions</a>
    ${lead.phone ? `<a href="tel:${lead.phone}" class="btn-accent font-black uppercase px-6 py-3 hover-pop">Call ${escapeHtml(lead.phone)}</a>` : ""}
  </div>
</section>

<!-- Footer -->
<footer class="py-10 text-center" style="background:var(--dark);">
  <p class="font-display uppercase text-lg" style="color:var(--accent);">${escapeHtml(lead.name)}</p>
  <p class="text-white/60 text-sm mt-1">${escapeHtml(lead.address)}</p>
  ${lead.openingHours.length > 0 ? `<div class="text-xs text-white/50 mt-4 max-w-xs mx-auto">${lead.openingHours.slice(0, 3).map((l) => { const [d, h] = splitHoursLine(l); return `<p>${escapeHtml(d)}: ${escapeHtml(h)}</p>`; }).join("")}</div>` : ""}
  <div class="mt-4 flex gap-4 justify-center text-white/70 text-sm">
    ${lead.socialLinks?.instagram ? `<a href="${lead.socialLinks.instagram}" target="_blank">Instagram</a>` : ""}
    ${lead.socialLinks?.facebook ? `<a href="${lead.socialLinks.facebook}" target="_blank">Facebook</a>` : ""}
    <a href="${lead.mapsUrl}" target="_blank">Google Maps</a>
  </div>
  <p class="text-white/30 text-xs mt-6">Website mockup generated for demo purposes.</p>
</footer>

<div class="fixed bottom-5 right-5 z-50 flex flex-col gap-3 items-end">
  ${wa ? `<a href="${wa}" target="_blank" class="bg-[#25D366] text-white rounded-full w-12 h-12 flex items-center justify-center text-xl shadow-lg hover-pop">💬</a>` : ""}
  ${lead.phone ? `<a href="tel:${lead.phone}" class="btn-primary text-white rounded-full w-12 h-12 flex items-center justify-center text-lg shadow-lg hover-pop">📞</a>` : ""}
</div>

<script>
  document.getElementById('order-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('f-name').value.trim();
    const note = document.getElementById('f-note').value.trim();
    const msg = 'Hi ${escapeHtml(lead.name).replace(/'/g, "\\'")}, I would like to order: ' + (note || '[details]') + '. Name: ' + name + '.';
    ${wa
      ? `window.open('https://wa.me/${waNum}?text=' + encodeURIComponent(msg), '_blank');`
      : `alert('Thanks ' + name + '! Please call us to confirm: ${escapeHtml(lead.phone ?? "see contact section")}');`}
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('show'); });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
</script>

</body>
</html>`;
}
