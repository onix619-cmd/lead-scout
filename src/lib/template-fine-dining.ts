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

const starsHtml = (count: number) =>
  Array.from({ length: 5 }).map((_, i) => `<span style="color:${i < count ? "#E07A5F" : "rgba(255,255,255,0.15)"};">★</span>`).join("");

// The third restaurant style: bold, dark fine-dining ("restaurant-3"), styled
// off the design tokens in src/lib/templates/master_restaurant_template.json
// (Cinzel display serif, dark charcoal surfaces, terracotta-gold accent).
// Content is fully dynamic — driven by the same Lead / GeneratedContent /
// MenuSection data as every other template — the JSON file is a design
// reference only, not literal site content.
export function generateFineDiningHTML(
  lead: Lead,
  content: GeneratedContent,
  menuSections: MenuSection[] = [],
  originalMenuPhotoUrl?: string
): string {
  const wa = waLink(lead.phone);
  const waNum = waDigits(lead.phone);
  const filledStars = Math.round(lead.rating ?? 0);

  const galleryImages =
    lead.uploadedImages && lead.uploadedImages.length > 0
      ? lead.uploadedImages
      : lead.photoUrls && lead.photoUrls.length > 0
      ? lead.photoUrls
      : lead.photoUrl
      ? [lead.photoUrl]
      : [];
  const heroImage = galleryImages[0] ?? null;
  const storyImage = galleryImages[1] ?? galleryImages[0] ?? null;
  const eventsImage = galleryImages[2] ?? galleryImages[0] ?? null;
  const menuLinkUrl = originalMenuPhotoUrl || lead.website;
  const menuItemCount = countMenuItems(menuSections);
  const neighborhood = lead.address.split(",")[0];

  const menuCarouselHtml = `
    <div class="mt-14 relative max-w-3xl mx-auto">
      <h3 class="text-lg font-semibold mb-4 text-center" style="font-family:'Cinzel',serif; color:#FFF8F5;">Gallery</h3>
      <div class="overflow-hidden rounded-lg border" style="border-color:rgba(224,122,95,0.2);">
        <div id="fd-carousel-track" class="flex transition-transform duration-500" style="transform: translateX(0%);">
          ${galleryImages.map((img) => `<img src="${img}" class="w-full shrink-0 h-64 sm:h-96 object-cover" />`).join("")}
        </div>
      </div>
      ${galleryImages.length > 1 ? `
      <button type="button" onclick="fdCarouselMove(-1)" class="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white" style="background:rgba(0,0,0,0.55);">‹</button>
      <button type="button" onclick="fdCarouselMove(1)" class="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white" style="background:rgba(0,0,0,0.55);">›</button>
      <div class="flex justify-center gap-1.5 mt-3">
        ${galleryImages.map((_, i) => `<span class="fd-carousel-dot w-1.5 h-1.5 rounded-full" data-i="${i}" style="background:${i === 0 ? "#E07A5F" : "rgba(255,255,255,0.15)"};"></span>`).join("")}
      </div>` : ""}
    </div>`;

  const menuHtml =
    menuSections.length > 0
      ? menuSections
          .map(
            (section, sIdx) => `
        ${section.category ? `<h3 class="text-2xl font-semibold mb-6 mt-12 first:mt-0 text-center" style="font-family:'Cinzel',serif; color:#E07A5F;">${escapeHtml(section.category)}</h3>` : ""}
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          ${section.items
            .map(
              (it, iIdx) => `
          <article class="rounded-lg p-5 border transition hover:-translate-y-0.5" style="background:#1E1815; border-color:${sIdx === 0 && iIdx === 0 ? "rgba(224,122,95,0.5)" : "rgba(255,255,255,0.08)"};">
            ${sIdx === 0 && iIdx === 0 ? `<span class="text-[10px] uppercase tracking-widest font-semibold" style="color:#E07A5F;">Signature</span>` : ""}
            <div class="flex items-baseline justify-between gap-3 mt-1">
              <h4 class="text-lg font-semibold" style="font-family:'Cinzel',serif; color:#FFF8F5;">${escapeHtml(it.name)}</h4>
              ${it.price ? `<span class="font-bold whitespace-nowrap" style="color:#E07A5F;">$${escapeHtml(it.price)}</span>` : ""}
            </div>
            ${it.description ? `<p class="text-sm mt-2" style="color:#B0A29A;">${escapeHtml(it.description)}</p>` : ""}
          </article>`
            )
            .join("")}
        </div>`
          )
          .join("")
      : `
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          ${content.showcaseItems
            .map(
              (item) => `
          <article class="rounded-lg p-6 border hover:-translate-y-0.5 transition" style="background:#1E1815; border-color:rgba(255,255,255,0.08);">
            ${item.tag ? `<span class="text-[10px] uppercase tracking-widest font-semibold" style="color:#E07A5F;">${escapeHtml(item.tag)}</span>` : ""}
            <h3 class="text-xl font-semibold mb-2 mt-1" style="font-family:'Cinzel',serif; color:#FFF8F5;">${escapeHtml(item.name)}</h3>
            <p class="text-sm" style="color:#B0A29A;">${escapeHtml(item.description)}</p>
          </article>`
            )
            .join("")}
        </div>
        <p class="text-center text-sm mt-6" style="color:#B0A29A;">Ask us about our full current menu in person or by phone.</p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(content.seoTitle)}</title>
  <meta name="description" content="${escapeHtml(content.metaDescription)}" />
  <meta property="og:title" content="${escapeHtml(content.seoTitle)}" />
  <meta property="og:description" content="${escapeHtml(content.metaDescription)}" />
  ${heroImage ? `<meta property="og:image" content="${heroImage}" />` : ""}
  <meta name="twitter:card" content="summary_large_image" />
  <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: lead.name,
    address: lead.address,
    telephone: lead.phone ?? undefined,
    url: lead.mapsUrl,
    aggregateRating: lead.rating != null ? { "@type": "AggregateRating", ratingValue: lead.rating, reviewCount: lead.reviewCount } : undefined,
  })}</script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Open+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    html { scroll-behavior: smooth; }
    body { font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background:#120E0C; color:#FFF8F5; }
    .font-display { font-family: "Cinzel", serif; }
    .btn-gold { background: linear-gradient(90deg, #E07A5F, #C15F45); color: #120E0C; }
    .reveal { opacity: 0; transform: translateY(20px); transition: opacity .6s ease, transform .6s ease; }
    .reveal.show { opacity: 1; transform: translateY(0); }
    .hover-scale { transition: transform .3s ease; }
    .hover-scale:hover { transform: scale(1.04); }
    .float-btn { box-shadow: 0 10px 25px rgba(0,0,0,0.4); transition: transform .2s ease; }
    .float-btn:hover { transform: scale(1.08); }
    @keyframes pulseDot {
      0% { box-shadow: 0 0 0 0 rgba(224,122,95,0.55); }
      70% { box-shadow: 0 0 0 8px rgba(224,122,95,0); }
      100% { box-shadow: 0 0 0 0 rgba(224,122,95,0); }
    }
    .pulse-dot { animation: pulseDot 2s infinite; }
    .accordion-content { max-height: 0; overflow: hidden; transition: max-height .3s ease; }
    .accordion.open .accordion-content { max-height: 300px; }
    .accordion.open .chevron { transform: rotate(180deg); }
    .chevron { transition: transform .3s ease; }
  </style>
</head>

<body class="antialiased">

  <!-- ====================== HEADER / NAV ====================== -->
  <header class="sticky top-0 z-40 backdrop-blur border-b" style="background:rgba(18,14,12,0.9); border-color:rgba(255,255,255,0.08);">
    <nav class="max-w-7xl mx-auto flex items-center justify-between px-4 py-4 md:px-8">
      <a href="#hero" class="text-xl font-semibold tracking-widest font-display" style="color:#FFF8F5;">
        ${escapeHtml(lead.name.toUpperCase())}
      </a>

      <ul class="hidden md:flex items-center space-x-8 text-sm font-medium" style="color:#B0A29A;">
        <li><a href="#menu" class="hover:text-white transition">Menu</a></li>
        <li><a href="#story" class="hover:text-white transition">Our Story</a></li>
        <li><a href="#events" class="hover:text-white transition">Private Events</a></li>
        <li><a href="#location" class="hover:text-white transition">Location &amp; Hours</a></li>
      </ul>

      <div class="hidden md:block">
        <a href="${wa ? "#hero" : "#reserve"}" onclick="${wa ? `window.open('https://wa.me/${waNum}?text=${encodeURIComponent(`Hi ${lead.name}, I'd like to place an order.`)}','_blank'); return false;` : ""}" class="btn-gold text-sm font-semibold px-5 py-2.5 rounded hover-scale tracking-wide">${wa ? "Order Now" : "Reserve Table"}</a>
      </div>

      <button id="mobile-menu-btn" class="md:hidden flex items-center focus:outline-none" aria-label="Toggle menu">
        <svg class="w-6 h-6" style="color:#FFF8F5;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
    </nav>

    <div id="mobile-menu" class="hidden md:hidden border-t" style="background:#120E0C; border-color:rgba(255,255,255,0.08);">
      <ul class="flex flex-col space-y-1 p-4 text-base font-medium" style="color:#B0A29A;">
        <li><a href="#menu" class="block py-1.5 hover:text-white">Menu</a></li>
        <li><a href="#story" class="block py-1.5 hover:text-white">Our Story</a></li>
        <li><a href="#events" class="block py-1.5 hover:text-white">Private Events</a></li>
        <li><a href="#location" class="block py-1.5 hover:text-white">Location &amp; Hours</a></li>
      </ul>
    </div>
  </header>

  <!-- ====================== HERO ====================== -->
  <section id="hero" class="relative bg-cover bg-center bg-no-repeat" style="${heroImage ? `background-image: url('${heroImage}');` : "background: linear-gradient(135deg, #1E1815, #120E0C);"}">
    <div class="absolute inset-0" style="background: linear-gradient(180deg, rgba(18,14,12,0.65), rgba(18,14,12,0.55) 45%, rgba(18,14,12,0.85));"></div>
    <div class="max-w-3xl mx-auto text-center px-4 py-32 sm:py-44 relative z-10">
      <span class="inline-flex items-center gap-2 border rounded-full px-4 py-1.5 text-xs sm:text-sm uppercase tracking-[0.2em] mb-8" style="border-color:rgba(224,122,95,0.4); color:#E07A5F; background:rgba(224,122,95,0.08);">
        <span class="w-1.5 h-1.5 rounded-full pulse-dot" style="background:#E07A5F;"></span>
        ${escapeHtml(lead.category)}${neighborhood ? ` &middot; ${escapeHtml(neighborhood)}` : ""}
      </span>
      <h1 class="text-4xl md:text-6xl font-bold mb-6 leading-tight font-display tracking-wide" style="color:#FFF8F5;">
        ${escapeHtml(lead.name.toUpperCase())}
      </h1>
      <p class="text-lg md:text-xl mb-8 max-w-xl mx-auto" style="color:#E8DED8;">
        ${escapeHtml(content.tagline)}
      </p>
      ${lead.rating ? `<div class="flex items-center justify-center gap-2 mb-10 text-sm" style="color:#B0A29A;">
        <span class="text-lg">${starsHtml(filledStars)}</span>
        <span>${lead.rating} / 5${lead.reviewCount ? ` &middot; ${lead.reviewCount}+ reviews` : ""}</span>
      </div>` : ""}
      <div class="flex flex-wrap gap-4 justify-center">
        ${wa ? `<a href="https://wa.me/${waNum}?text=${encodeURIComponent(`Hi ${lead.name}, I'd like to place an order.`)}" target="_blank" class="btn-gold font-semibold py-3 px-7 rounded hover-scale tracking-wide">Order Now</a>` : ""}
        <a href="#reserve" class="${wa ? "inline-block border" : "btn-gold"} font-semibold py-3 px-7 rounded hover-scale tracking-wide" style="${wa ? "border-color:rgba(224,122,95,0.5); color:#E07A5F;" : ""}">Reserve Table</a>
        <a href="#menu" class="inline-block border font-semibold py-3 px-7 rounded hover:bg-white/5 transition tracking-wide" style="border-color:rgba(255,255,255,0.3); color:#FFF8F5;">
          View Menu
        </a>
      </div>
    </div>
  </section>

  ${wa ? `
  <!-- ====================== QUICK ORDER ====================== -->
  <section id="order-now" class="py-12 border-b reveal" style="background:#1E1815; border-color:rgba(255,255,255,0.08);">
    <div class="max-w-md mx-auto px-4 text-center">
      <p class="text-xs uppercase tracking-[0.2em] font-semibold mb-2" style="color:#E07A5F;">Order Now</p>
      <h2 class="text-2xl font-semibold mb-4 font-display" style="color:#FFF8F5;">Skip the Wait, Order Ahead</h2>
      <div class="flex flex-col gap-3">
        <textarea id="quick-order-text" rows="3" placeholder="What would you like to order? (e.g. 2x Ribeye, 1x Seafood Tower...)" class="w-full rounded px-4 py-3 text-sm border resize-y" style="background:#120E0C; border-color:rgba(255,255,255,0.12); color:#FFF8F5;"></textarea>
        <button type="button" onclick="sendQuickOrder()" class="btn-gold font-medium py-3.5 rounded w-full hover-scale uppercase tracking-wider text-sm">Send Order ↗</button>
      </div>
      <p class="text-xs mt-2" style="color:#8A7D75;">Opens WhatsApp with your order typed in — just hit send.</p>
    </div>
  </section>` : ""}

  <!-- ====================== STORY ====================== -->
  <section id="story" class="py-20 sm:py-28 reveal" style="background:#1E1815;">
    <div class="max-w-6xl mx-auto px-4 md:px-8 grid sm:grid-cols-2 gap-12 items-center">
      ${storyImage ? `<img src="${storyImage}" class="w-full h-80 sm:h-[28rem] object-cover rounded-lg" style="border:1px solid rgba(224,122,95,0.2);" alt="${escapeHtml(lead.name)}" />` : `<div></div>`}
      <div>
        <p class="text-xs uppercase tracking-[0.2em] font-semibold mb-3" style="color:#E07A5F;">Our Philosophy</p>
        <h2 class="text-3xl sm:text-4xl font-bold mb-6 font-display" style="color:#FFF8F5;">${escapeHtml(content.philosophyHeading)}</h2>
        <p class="text-lg leading-relaxed mb-4" style="color:#E8DED8;">${escapeHtml(content.aboutUs)}</p>
        <p class="leading-relaxed mb-8" style="color:#B0A29A;">${escapeHtml(content.secondaryAbout)}</p>
        <div class="grid grid-cols-3 gap-4 pt-6 border-t" style="border-color:rgba(255,255,255,0.08);">
          ${lead.rating ? `<div><p class="text-2xl sm:text-3xl font-bold font-display" style="color:#E07A5F;">${lead.rating}★</p><p class="text-[10px] uppercase tracking-widest mt-1" style="color:#B0A29A;">Rating</p></div>` : ""}
          ${lead.reviewCount ? `<div><p class="text-2xl sm:text-3xl font-bold font-display" style="color:#E07A5F;">${lead.reviewCount}+</p><p class="text-[10px] uppercase tracking-widest mt-1" style="color:#B0A29A;">Reviews</p></div>` : ""}
          ${menuItemCount > 0 ? `<div><p class="text-2xl sm:text-3xl font-bold font-display" style="color:#E07A5F;">${menuItemCount}+</p><p class="text-[10px] uppercase tracking-widest mt-1" style="color:#B0A29A;">Menu Items</p></div>` : ""}
        </div>
      </div>
    </div>
  </section>

  <!-- ====================== MENU ====================== -->
  <section id="menu" class="py-20 sm:py-28 reveal" style="background:#120E0C;">
    <div class="max-w-7xl mx-auto px-4 md:px-8">
      <p class="text-xs uppercase tracking-[0.2em] font-semibold mb-3 text-center" style="color:#E07A5F;">The Menu</p>
      <h2 class="text-3xl sm:text-4xl font-bold text-center mb-14 font-display" style="color:#FFF8F5;">
        Dinner Menu
      </h2>
      ${menuHtml}
      ${menuLinkUrl ? `<div class="text-center mt-12"><a href="${menuLinkUrl}" target="_blank" class="inline-block border-2 font-semibold py-2.5 px-7 rounded transition tracking-wide" style="border-color:#E07A5F; color:#E07A5F;" onmouseover="this.style.background='#E07A5F';this.style.color='#120E0C';" onmouseout="this.style.background='transparent';this.style.color='#E07A5F';">${originalMenuPhotoUrl ? "View Original Menu ↗" : "View Full Menu ↗"}</a></div>` : ""}
      ${galleryImages.length > 0 ? menuCarouselHtml : ""}
    </div>
  </section>

  <!-- ====================== PRIVATE EVENTS ====================== -->
  <section id="events" class="py-20 sm:py-28 reveal" style="background:#1E1815;">
    <div class="max-w-6xl mx-auto px-4 md:px-8 grid sm:grid-cols-2 gap-12 items-center">
      <div class="order-2 sm:order-1">
        <p class="text-xs uppercase tracking-[0.2em] font-semibold mb-3" style="color:#E07A5F;">Private Dining</p>
        <h2 class="text-3xl font-bold mb-5 font-display" style="color:#FFF8F5;">Private Dining &amp; Events</h2>
        <p class="text-lg leading-relaxed mb-6" style="color:#E8DED8;">
          Host your next celebration, corporate dinner, or private gathering with us — ${escapeHtml(content.finalCtaHeading.toLowerCase())}
        </p>
        ${wa
          ? `<a href="https://wa.me/${waNum}?text=${encodeURIComponent(`Hi ${lead.name}, I'd like to inquire about hosting a private event.`)}" target="_blank" class="inline-block btn-gold font-semibold px-6 py-3 rounded hover-scale tracking-wide">Inquire About Events</a>`
          : lead.phone
          ? `<a href="tel:${lead.phone}" class="inline-block btn-gold font-semibold px-6 py-3 rounded hover-scale tracking-wide">Call to Inquire</a>`
          : ""}
      </div>
      ${eventsImage ? `<img src="${eventsImage}" class="w-full h-80 object-cover rounded-lg order-1 sm:order-2" style="border:1px solid rgba(224,122,95,0.2);" alt="Private dining" />` : `<div class="order-1 sm:order-2"></div>`}
    </div>
  </section>

  <!-- ====================== TESTIMONIALS ====================== -->
  <section id="reviews" class="py-20 sm:py-28 text-center reveal" style="background:#120E0C;">
    <div class="max-w-5xl mx-auto px-4 md:px-8">
      <p class="text-xs uppercase tracking-[0.2em] font-semibold mb-3" style="color:#E07A5F;">Guest Reviews</p>
      <h2 class="text-3xl font-bold mb-4 font-display" style="color:#FFF8F5;">What Our Guests Say</h2>
      <div class="text-2xl mb-2">${starsHtml(filledStars)}</div>
      <p class="mb-12" style="color:#B0A29A;">${lead.rating ?? "—"} out of 5 &middot; ${lead.reviewCount} Google reviews</p>

      ${lead.realReviews && lead.realReviews.length > 0 ? `
      <div class="grid sm:grid-cols-3 gap-5 text-left">
        ${lead.realReviews.map((r) => {
          const snippet = r.text.length > 220 ? r.text.slice(0, 220).trim() + "…" : r.text;
          const initial = (r.authorName || "G").trim().charAt(0).toUpperCase();
          return `
        <div class="rounded-lg p-5 border" style="background:#1E1815; border-color:rgba(255,255,255,0.08);">
          <div class="mb-2 text-sm">${starsHtml(Math.round(r.rating))}</div>
          <p class="text-sm mb-4" style="color:#E8DED8;">"${escapeHtml(snippet)}"</p>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold" style="background:#E07A5F; color:#120E0C;">${escapeHtml(initial)}</div>
            <div>
              <p class="text-xs font-medium" style="color:#FFF8F5;">${escapeHtml(r.authorName)}</p>
              <p class="text-[11px]" style="color:#8A7D75;">${escapeHtml(r.relativeTime || "Google review")}</p>
            </div>
          </div>
        </div>`;
        }).join("")}
      </div>
      ` : ""}

      <a href="${lead.mapsUrl}" target="_blank" class="inline-block mt-10 text-sm font-medium underline underline-offset-4" style="color:#E07A5F;">Read more reviews on Google →</a>
    </div>
  </section>

  <!-- ====================== FAQ ====================== -->
  ${content.faq.length > 0 ? `
  <section class="max-w-3xl mx-auto px-4 md:px-8 py-20 sm:py-28 reveal">
    <p class="text-xs uppercase tracking-[0.2em] font-semibold mb-3 text-center" style="color:#E07A5F;">Good to Know</p>
    <h2 class="text-3xl font-bold text-center mb-12 font-display" style="color:#FFF8F5;">Frequently Asked Questions</h2>
    <div class="space-y-3">
      ${content.faq.map((f) => `
      <div class="accordion rounded-lg overflow-hidden border" style="background:#1E1815; border-color:rgba(255,255,255,0.08);">
        <button type="button" onclick="this.parentElement.classList.toggle('open')" class="w-full text-left px-5 py-4 flex items-center justify-between">
          <span class="font-medium" style="color:#FFF8F5;">${escapeHtml(f.question)}</span>
          <span class="chevron" style="color:#E07A5F;">▾</span>
        </button>
        <div class="accordion-content px-5">
          <p class="pb-4 text-sm" style="color:#B0A29A;">${escapeHtml(f.answer)}</p>
        </div>
      </div>`).join("")}
    </div>
  </section>` : ""}

  <!-- ====================== RESERVE / LOCATION ====================== -->
  <section id="location" class="py-20 sm:py-28 reveal" style="background:#1E1815;">
    <div class="max-w-4xl mx-auto px-4 md:px-8">
      <p class="text-xs uppercase tracking-[0.2em] font-semibold mb-3 text-center" style="color:#E07A5F;">Location &amp; Hours</p>
      <h2 class="text-3xl font-bold text-center mb-14 font-display" style="color:#FFF8F5;">Visit Us</h2>

      <div class="grid md:grid-cols-2 gap-8">
        <!-- Contact details -->
        <div class="space-y-4">
          <p class="flex items-center" style="color:#E8DED8;">
            <svg class="w-5 h-5 mr-2 shrink-0" style="color:#E07A5F;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <a href="${lead.mapsUrl}" target="_blank" class="hover:underline">${escapeHtml(lead.address)}</a>
          </p>
          ${lead.phone ? `
          <p class="flex items-center" style="color:#E8DED8;">
            <svg class="w-5 h-5 mr-2 shrink-0" style="color:#E07A5F;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
            </svg>
            <a href="tel:${lead.phone}" class="hover:underline">${escapeHtml(lead.phone)}</a>
          </p>` : ""}
          ${lead.openingHours.length > 0 ? `
          <div class="flex items-start" style="color:#E8DED8;">
            <svg class="w-5 h-5 mr-2 mt-0.5 shrink-0" style="color:#E07A5F;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div class="text-sm">
              ${lead.openingHours
                .map((l) => {
                  const [d, h] = splitHoursLine(l);
                  return `<p>${escapeHtml(d)}: ${escapeHtml(h)}</p>`;
                })
                .join("")}
            </div>
          </div>` : ""}
          <div class="flex gap-4 pt-2 text-sm">
            ${lead.socialLinks?.instagram ? `<a href="${lead.socialLinks.instagram}" target="_blank" class="hover:underline" style="color:#E07A5F;">Instagram</a>` : ""}
            ${lead.socialLinks?.facebook ? `<a href="${lead.socialLinks.facebook}" target="_blank" class="hover:underline" style="color:#E07A5F;">Facebook</a>` : ""}
          </div>
        </div>

        <!-- Reservation / Order form -->
        <div id="reserve" class="rounded-lg p-6 border" style="background:#120E0C; border-color:rgba(255,255,255,0.08);">
          <h3 class="text-lg font-semibold mb-4 font-display" style="color:#FFF8F5;">Reserve or Order</h3>
          <div class="flex gap-2 mb-5">
            <button type="button" id="mode-reservation" onclick="setReserveMode('reservation')" class="flex-1 py-2 rounded text-sm font-medium btn-gold">Reservation</button>
            <button type="button" id="mode-order" onclick="setReserveMode('order')" class="flex-1 py-2 rounded text-sm font-medium border" style="background:#1E1815; border-color:rgba(255,255,255,0.12); color:#B0A29A;">Order / Question</button>
          </div>
          <form id="reserve-form" class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs block mb-1" style="color:#8A7D75;">Full name</label>
                <input id="f-name" required class="w-full rounded px-3 py-2 text-sm border" style="background:#1E1815; border-color:rgba(255,255,255,0.12); color:#FFF8F5;" placeholder="Jane Doe" />
              </div>
              <div>
                <label class="text-xs block mb-1" style="color:#8A7D75;">Phone</label>
                <input id="f-phone" type="tel" class="w-full rounded px-3 py-2 text-sm border" style="background:#1E1815; border-color:rgba(255,255,255,0.12); color:#FFF8F5;" placeholder="(555) 123-4567" />
              </div>
            </div>
            <div id="reservation-fields" class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-xs block mb-1" style="color:#8A7D75;">Guests</label>
                  <select id="f-guests" class="w-full rounded px-3 py-2 text-sm border" style="background:#1E1815; border-color:rgba(255,255,255,0.12); color:#FFF8F5;">
                    ${[2, 3, 4, 5, 6].map((n) => `<option value="${n}" ${n === 2 ? "selected" : ""}>${n} Guests</option>`).join("")}
                    <option value="7+">7+ Guests (Group)</option>
                  </select>
                </div>
                <div>
                  <label class="text-xs block mb-1" style="color:#8A7D75;">Time</label>
                  <input id="f-time" type="time" value="19:00" class="w-full rounded px-3 py-2 text-sm border" style="background:#1E1815; border-color:rgba(255,255,255,0.12); color:#FFF8F5;" />
                </div>
              </div>
              <div>
                <label class="text-xs block mb-1" style="color:#8A7D75;">Date</label>
                <input id="f-date" type="date" required onclick="this.showPicker && this.showPicker()" class="w-full rounded px-3 py-2 text-sm border cursor-pointer" style="background:#1E1815; border-color:rgba(255,255,255,0.12); color:#FFF8F5;" />
              </div>
            </div>
            <div>
              <label class="text-xs block mb-1" style="color:#8A7D75;" id="f-note-label">Special requests / allergies</label>
              <textarea id="f-note" rows="3" class="w-full rounded px-3 py-2 text-sm border" style="background:#1E1815; border-color:rgba(255,255,255,0.12); color:#FFF8F5;" placeholder="Allergies, special occasion, seating preference..."></textarea>
            </div>
            <button type="submit" class="w-full btn-gold font-semibold py-3 rounded hover-scale tracking-wide">
              ${wa ? "Send via WhatsApp" : "Submit"}
            </button>
            <p class="text-xs text-center" style="color:#8A7D75;">${wa ? "This mockup sends requests via WhatsApp — no bookings are actually processed by this demo site." : "Give us a call to reserve your table."}</p>
          </form>
        </div>
      </div>
    </div>
  </section>

  <footer class="pt-14 pb-8" style="background:#120E0C; color:#8A7D75;">
    <div class="max-w-6xl mx-auto px-4 md:px-8 grid sm:grid-cols-3 gap-8 text-sm">
      <div>
        <p class="font-semibold text-lg mb-2 font-display tracking-widest" style="color:#FFF8F5;">${escapeHtml(lead.name.toUpperCase())}</p>
        <p style="color:#8A7D75;">${escapeHtml(content.tagline)}</p>
      </div>
      <div>
        <p class="text-xs uppercase tracking-[0.2em] font-semibold mb-3" style="color:#E07A5F;">Navigation</p>
        <ul class="space-y-1.5">
          <li><a href="#menu" class="hover:text-white">Menu</a></li>
          <li><a href="#story" class="hover:text-white">Our Story</a></li>
          <li><a href="#events" class="hover:text-white">Private Events</a></li>
          <li><a href="#location" class="hover:text-white">Location &amp; Hours</a></li>
        </ul>
      </div>
      <div>
        <p class="text-xs uppercase tracking-[0.2em] font-semibold mb-3" style="color:#E07A5F;">Contact</p>
        <p>${escapeHtml(lead.address)}</p>
        ${lead.phone ? `<a href="tel:${lead.phone}" class="block mt-1 hover:text-white">${escapeHtml(lead.phone)}</a>` : ""}
      </div>
    </div>
    <div class="max-w-6xl mx-auto px-4 md:px-8 mt-10 pt-6 border-t flex flex-wrap items-center justify-between gap-3 text-xs" style="border-color:rgba(255,255,255,0.08); color:#6B605A;">
      <span>© ${new Date().getFullYear()} ${escapeHtml(lead.name)}. All rights reserved.</span>
      <a href="#hero" class="hover:text-white">Back to top ↑</a>
    </div>
    <p class="text-center text-xs mt-6" style="color:#4A423D;">Website mockup generated for demo purposes.</p>
  </footer>

  <!-- Floating action buttons -->
  <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-3 items-end">
    ${wa ? `<a href="${wa}" target="_blank" class="float-btn bg-[#25D366] text-white rounded-full w-12 h-12 flex items-center justify-center text-xl">💬</a>` : ""}
    ${lead.phone ? `<a href="tel:${lead.phone}" class="float-btn btn-gold rounded-full w-12 h-12 flex items-center justify-center text-lg">📞</a>` : ""}
  </div>

  <script>
    document.getElementById('mobile-menu-btn').addEventListener('click', function () {
      document.getElementById('mobile-menu').classList.toggle('hidden');
    });

    let fdCarouselIndex = 0;
    function fdCarouselMove(dir) {
      const track = document.getElementById('fd-carousel-track');
      if (!track) return;
      const slides = track.children.length;
      fdCarouselIndex = (fdCarouselIndex + dir + slides) % slides;
      track.style.transform = 'translateX(' + (-fdCarouselIndex * 100) + '%)';
      document.querySelectorAll('.fd-carousel-dot').forEach((dot, i) => {
        dot.style.background = i === fdCarouselIndex ? '#E07A5F' : 'rgba(255,255,255,0.15)';
      });
    }

    let fdReserveMode = 'reservation';
    function setReserveMode(m) {
      fdReserveMode = m;
      document.getElementById('reservation-fields').style.display = m === 'reservation' ? 'block' : 'none';
      document.getElementById('f-note-label').textContent = m === 'reservation' ? 'Special requests / allergies' : 'What would you like to order or ask?';
      const activeStyle = 'flex-1 py-2 rounded text-sm font-medium btn-gold';
      const inactiveStyle = 'flex-1 py-2 rounded text-sm font-medium border';
      const modeReservationBtn = document.getElementById('mode-reservation');
      const modeOrderBtn = document.getElementById('mode-order');
      modeReservationBtn.className = m === 'reservation' ? activeStyle : inactiveStyle;
      modeOrderBtn.className = m === 'order' ? activeStyle : inactiveStyle;
      if (m === 'order') {
        modeOrderBtn.style.background = '';
        modeReservationBtn.style.background = '#1E1815';
        modeReservationBtn.style.borderColor = 'rgba(255,255,255,0.12)';
        modeReservationBtn.style.color = '#B0A29A';
      } else {
        modeReservationBtn.style.background = '';
        modeOrderBtn.style.background = '#1E1815';
        modeOrderBtn.style.borderColor = 'rgba(255,255,255,0.12)';
        modeOrderBtn.style.color = '#B0A29A';
      }
    }

    document.getElementById('reserve-form').addEventListener('submit', function (e) {
      e.preventDefault();
      const name = document.getElementById('f-name').value.trim();
      const phone = document.getElementById('f-phone').value.trim();
      const note = document.getElementById('f-note').value.trim();
      let msg = 'Hi ${escapeHtml(lead.name).replace(/'/g, "\\'")}, ';
      if (fdReserveMode === 'reservation') {
        const guests = document.getElementById('f-guests').value;
        const date = document.getElementById('f-date').value;
        const time = document.getElementById('f-time').value;
        msg += 'I would like to reserve for ' + guests + ' on ' + (date || '[date]') + ' at ' + (time || '[time]') + '. Name: ' + name + '.';
        if (note) msg += ' Note: ' + note;
      } else {
        msg += 'I have a question / order request: ' + (note || '[details]') + '. Name: ' + name + '.';
      }
      if (phone) msg += ' Phone: ' + phone + '.';

      ${wa
        ? `window.open('https://wa.me/${waNum}?text=' + encodeURIComponent(msg), '_blank');`
        : `alert('Thanks ' + name + '! Please call us directly to confirm: ${escapeHtml(lead.phone ?? "see contact section")}');`}
    });

    function sendQuickOrder() {
      const input = document.getElementById('quick-order-text');
      const text = input ? input.value.trim() : '';
      const msg = 'Hi ${escapeHtml(lead.name).replace(/'/g, "\\'")}, I would like to order: ' + (text || '[details]') + '.';
      window.open('https://wa.me/${waNum}?text=' + encodeURIComponent(msg), '_blank');
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('show'); });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  </script>

</body>
</html>`;
}
