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
  Array.from({ length: 5 }).map((_, i) => `<span style="color:${i < count ? "#C9A227" : "rgba(255,255,255,0.15)"};">★</span>`).join("");

// Generic, hand-drawn glyphs for Instagram / Facebook / TikTok (not
// reproductions of the brands' proprietary logo artwork) used for the
// footer's social row.
const SOCIAL_ICON_PATHS = {
  instagram:
    "M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 2 .3 2.4.5.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1.2.5 2.4.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 2-.5 2.4-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1.2.4-2.4.5-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-2-.3-2.4-.5-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1.2-.5-2.4C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-2 .5-2.4.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1.2-.4 2.4-.5C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.1 0-3.5 0-4.7.1-1 .1-1.6.2-1.9.4-.5.2-.8.4-1.2.8-.4.4-.6.7-.8 1.2-.1.3-.3.9-.4 1.9-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c.1 1 .2 1.6.4 1.9.2.5.4.8.8 1.2.4.4.7.6 1.2.8.3.1.9.3 1.9.4 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1-.1 1.6-.2 1.9-.4.5-.2.8-.4 1.2-.8.4-.4.6-.7.8-1.2.1-.3.3-.9.4-1.9.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-1-.2-1.6-.4-1.9-.2-.5-.4-.8-.8-1.2-.4-.4-.7-.6-1.2-.8-.3-.1-.9-.3-1.9-.4-1.2-.1-1.6-.1-4.7-.1zm0 4.4a5.6 5.6 0 110 11.2 5.6 5.6 0 010-11.2zm0 1.8a3.8 3.8 0 100 7.6 3.8 3.8 0 000-7.6zm5.8-2a1.3 1.3 0 110 2.6 1.3 1.3 0 010-2.6z",
  facebook:
    "M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94z",
  tiktok:
    "M16.6 5.82c-.9-.95-1.4-2.2-1.4-3.52h-3.1v13.44a3.1 3.1 0 11-2.2-2.97V9.65a6.1 6.1 0 105.3 6.05V9.9a8.1 8.1 0 004.8 1.56V8.36a5.6 5.6 0 01-3.4-2.54z",
};

function socialIconsHtml(lead: Lead, accentColor: string, dimColor: string): string {
  const platforms: { key: "instagram" | "facebook" | "tiktok"; url?: string }[] = [
    { key: "instagram", url: lead.socialLinks?.instagram },
    { key: "facebook", url: lead.socialLinks?.facebook },
    { key: "tiktok", url: lead.socialLinks?.tiktok },
  ];
  return `
    <div class="flex items-center gap-4">
      ${platforms
        .map(({ key, url }) => {
          const svg = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="${SOCIAL_ICON_PATHS[key]}"/></svg>`;
          return url
            ? `<a href="${url}" target="_blank" rel="noopener" aria-label="${key}" style="color:${accentColor};" class="hover:opacity-75 transition">${svg}</a>`
            : `<span aria-hidden="true" style="color:${dimColor}; opacity:0.4;">${svg}</span>`;
        })
        .join("")}
    </div>`;
}

// A dark-luxury lounge/nightlife template ("lounge") — bold Playfair Display
// headlines, brass-gold accents on near-black, a recurring "glow rule"
// signature motif, dynamic menu tabs, and a WhatsApp-powered reservation
// modal. Content is fully dynamic, driven by the same Lead / GeneratedContent
// / MenuSection data as every other template.
export function generateLoungeHTML(
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
  const aboutImage = galleryImages[1] ?? galleryImages[0] ?? null;
  const contactImage = galleryImages[2] ?? galleryImages[0] ?? null;
  const menuLinkUrl = originalMenuPhotoUrl || lead.website;
  const menuItemCount = countMenuItems(menuSections);
  const neighborhood = lead.address.split(",")[0];

  // Real Google rating/review count, not a fabricated "open nightly"-style
  // claim — accurate, still conveys the "hot spot" energy the badge wants.
  const liveBadgeText =
    lead.rating != null
      ? `${lead.rating}★ Rated${lead.reviewCount ? ` &middot; ${lead.reviewCount}+ Reviews` : ""}`
      : lead.category;

  const heroCtaLabel = wa ? "Order Now" : "Reserve a Table";

  const menuCardHtml = (name: string, price: string | undefined, description: string | undefined, tag?: string) => `
          <article class="card-velvet rounded-sm p-6 hover:border-[#C9A227]/50 transition">
            ${tag ? `<span class="eyebrow text-[10px]">${escapeHtml(tag)}</span>` : ""}
            <div class="flex items-baseline justify-between gap-3 ${tag ? "mt-2" : ""}">
              <h4 class="font-display text-xl" style="color:#F3ECE0;">${escapeHtml(name)}</h4>
              ${price ? `<span class="font-semibold whitespace-nowrap" style="color:#C9A227;">$${escapeHtml(price)}</span>` : ""}
            </div>
            ${description ? `<p class="text-sm mt-2" style="color:#9C8F82;">${escapeHtml(description)}</p>` : ""}
          </article>`;

  // Build menu tabs dynamically from whatever real menu categories exist
  // (scraped or AI-generated) instead of hardcoding Food/Cocktails/Wine —
  // this template can serve a bar, lounge, or restaurant with any category
  // breakdown. Capped at 5 tabs to keep the tab bar usable.
  const menuTabs = menuSections.slice(0, 5).map((section, i) => ({
    key: `tab${i}`,
    label: section.category || `Menu ${i + 1}`,
    items: section.items,
  }));

  const menuTabBarHtml =
    menuTabs.length > 1
      ? `
    <div class="flex flex-wrap items-center justify-center gap-6 md:gap-10 border-b border-white/10 mb-12">
      ${menuTabs
        .map(
          (tab, i) => `
      <button type="button" class="menu-tab ${i === 0 ? "active" : ""} pb-4 text-sm md:text-base tracking-wide uppercase" data-tab="${tab.key}" onclick="switchMenuTab('${tab.key}')">${escapeHtml(tab.label)}</button>`
        )
        .join("")}
    </div>`
      : "";

  const menuPanelsHtml =
    menuTabs.length > 0
      ? menuTabs
          .map(
            (tab, i) => `
    <div id="panel-${tab.key}" class="menu-panel ${i === 0 ? "active" : ""} sm:grid-cols-2 gap-5">
      ${tab.items.map((it) => menuCardHtml(it.name, it.price, it.description)).join("")}
    </div>`
          )
          .join("")
      : `
    <div class="grid sm:grid-cols-2 gap-5">
      ${content.showcaseItems.map((item) => menuCardHtml(item.name, undefined, item.description, item.tag)).join("")}
    </div>
    <p class="text-center text-sm mt-6" style="color:#9C8F82;">Ask us about our full current menu in person or by phone.</p>`;

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
    "@type": "BarOrPub",
    name: lead.name,
    address: lead.address,
    telephone: lead.phone ?? undefined,
    url: lead.mapsUrl,
    aggregateRating: lead.rating != null ? { "@type": "AggregateRating", ratingValue: lead.rating, reviewCount: lead.reviewCount } : undefined,
  })}</script>

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          noir: "#0B0A0D",
          velvet: "#171019",
          velvet2: "#1F1622",
          wine: "#6E1030",
          gold: "#C9A227",
          goldlight: "#E4C55B",
          ivory: "#F3ECE0",
          smoke: "#9C8F82",
        },
        fontFamily: {
          display: ["Playfair Display", "serif"],
          body: ["Inter", "sans-serif"],
        },
      },
    },
  };
</script>

<style>
  html { scroll-behavior: smooth; }
  body { font-family: "Inter", sans-serif; background: #0B0A0D; color: #F3ECE0; }
  .font-display { font-family: "Playfair Display", serif; }

  .glow-rule { position: relative; width: 56px; height: 2px; background: #C9A227; margin: 0 auto; }
  .glow-rule::after {
    content: "";
    position: absolute; inset: -6px -8px;
    background: radial-gradient(ellipse at center, rgba(201,162,39,0.55) 0%, rgba(201,162,39,0) 70%);
    filter: blur(4px);
  }
  .glow-rule.left { margin: 0; }

  .eyebrow { font-family: "Inter", sans-serif; letter-spacing: 0.25em; text-transform: uppercase; font-size: 0.7rem; font-weight: 600; color: #C9A227; }

  .btn-gold { background: linear-gradient(90deg, #C9A227, #E4C55B); color: #0B0A0D; font-weight: 600; transition: transform .25s ease, box-shadow .25s ease; }
  .btn-gold:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(201,162,39,0.25); }

  .btn-outline { border: 1px solid rgba(243,236,224,0.35); color: #F3ECE0; transition: border-color .25s ease, background .25s ease; }
  .btn-outline:hover { border-color: #C9A227; background: rgba(201,162,39,0.08); }

  .card-velvet { background: #171019; border: 1px solid rgba(201,162,39,0.14); }

  .nav-scrolled { background: rgba(11,10,13,0.92); backdrop-filter: blur(10px); box-shadow: 0 8px 24px rgba(0,0,0,0.35); }

  .reveal { opacity: 0; transform: translateY(24px); transition: opacity .7s ease, transform .7s ease; }
  .reveal.show { opacity: 1; transform: translateY(0); }

  @keyframes pulseLive {
    0% { box-shadow: 0 0 0 0 rgba(201,162,39,0.6); }
    70% { box-shadow: 0 0 0 9px rgba(201,162,39,0); }
    100% { box-shadow: 0 0 0 0 rgba(201,162,39,0); }
  }
  .pulse-dot { animation: pulseLive 2s infinite; }

  .menu-tab { color: #9C8F82; border-bottom: 2px solid transparent; transition: color .25s ease, border-color .25s ease; }
  .menu-tab.active { color: #E4C55B; border-color: #C9A227; }
  .menu-panel { display: none; }
  .menu-panel.active { display: grid; }

  #reservation-modal { transition: opacity .3s ease; }
  #reservation-modal.hidden-modal { opacity: 0; pointer-events: none; }
  #reservation-modal:not(.hidden-modal) { opacity: 1; pointer-events: auto; }
  #reservation-modal .modal-panel { transition: transform .3s ease, opacity .3s ease; }
  #reservation-modal.hidden-modal .modal-panel { transform: translateY(16px) scale(0.98); opacity: 0; }

  .float-btn { box-shadow: 0 10px 25px rgba(0,0,0,0.4); transition: transform .2s ease; }
  .float-btn:hover { transform: scale(1.08); }

  @media (prefers-reduced-motion: reduce) {
    .reveal, .pulse-dot, .btn-gold, .btn-outline, #reservation-modal, #reservation-modal .modal-panel { transition: none !important; animation: none !important; }
  }
  ::selection { background: #C9A227; color: #0B0A0D; }
</style>
</head>

<body class="bg-noir text-ivory antialiased">

<header id="site-header" class="fixed top-0 inset-x-0 z-50 transition-colors duration-300">
  <nav class="max-w-7xl mx-auto flex items-center justify-between px-5 md:px-8 py-4">
    <a href="#home" class="font-display text-2xl tracking-wide text-ivory">${escapeHtml(lead.name)}</a>

    <ul class="hidden lg:flex items-center gap-9 text-sm font-medium text-smoke">
      <li><a href="#about" class="hover:text-gold transition">About</a></li>
      <li><a href="#menu" class="hover:text-gold transition">Menu</a></li>
      <li><a href="#events" class="hover:text-gold transition">Experience</a></li>
      ${galleryImages.length > 0 ? `<li><a href="#gallery" class="hover:text-gold transition">Gallery</a></li>` : ""}
      <li><a href="#contact" class="hover:text-gold transition">Contact</a></li>
    </ul>

    <div class="hidden lg:flex items-center gap-5">
      <span class="flex items-center gap-2 text-xs text-smoke">
        <span class="w-1.5 h-1.5 rounded-full bg-gold pulse-dot"></span>
        ${liveBadgeText}
      </span>
      <button type="button" onclick="openReservationModal()" class="btn-gold text-sm px-5 py-2.5 rounded">${heroCtaLabel}</button>
    </div>

    <button id="mobile-menu-btn" class="lg:hidden text-ivory" aria-label="Toggle menu" onclick="toggleMobileMenu()">
      <svg id="menu-icon-open" class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16"/></svg>
      <svg id="menu-icon-close" class="w-7 h-7 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"/></svg>
    </button>
  </nav>

  <div id="mobile-menu" class="hidden lg:hidden bg-noir border-t border-white/10 px-5 pb-6">
    <ul class="flex flex-col gap-1 pt-4 text-base text-smoke">
      <li><a href="#about" class="block py-2.5 hover:text-gold" onclick="toggleMobileMenu()">About</a></li>
      <li><a href="#menu" class="block py-2.5 hover:text-gold" onclick="toggleMobileMenu()">Menu</a></li>
      <li><a href="#events" class="block py-2.5 hover:text-gold" onclick="toggleMobileMenu()">Experience</a></li>
      ${galleryImages.length > 0 ? `<li><a href="#gallery" class="block py-2.5 hover:text-gold" onclick="toggleMobileMenu()">Gallery</a></li>` : ""}
      <li><a href="#contact" class="block py-2.5 hover:text-gold" onclick="toggleMobileMenu()">Contact</a></li>
    </ul>
    <button type="button" onclick="openReservationModal()" class="btn-gold w-full mt-4 py-3 rounded text-sm">${heroCtaLabel}</button>
  </div>
</header>

<main>

<section id="home" class="relative min-h-screen flex items-end bg-cover bg-center" style="${heroImage ? `background-image:url('${heroImage}');` : "background: linear-gradient(135deg, #1F1622, #0B0A0D);"}">
  <div class="absolute inset-0" style="background:linear-gradient(180deg, rgba(11,10,13,0.35) 0%, rgba(11,10,13,0.55) 45%, #0B0A0D 92%);"></div>

  <div class="relative z-10 max-w-5xl mx-auto px-5 md:px-8 pb-24 md:pb-32 pt-40 text-center w-full">
    <p class="eyebrow mb-5">${escapeHtml(lead.category)}${neighborhood ? ` &middot; ${escapeHtml(neighborhood)}` : ""}</p>
    <h1 class="font-display italic text-5xl sm:text-6xl md:text-8xl leading-[1.05] text-ivory mb-6">${escapeHtml(lead.name)}</h1>
    <p class="text-base sm:text-lg text-smoke max-w-xl mx-auto mb-10">${escapeHtml(content.tagline)}</p>
    <div class="flex flex-wrap items-center justify-center gap-4">
      <button type="button" onclick="openReservationModal()" class="btn-gold px-8 py-3.5 rounded text-sm tracking-wide">${heroCtaLabel}</button>
      <a href="#menu" class="btn-outline px-8 py-3.5 rounded text-sm tracking-wide">View Menu</a>
    </div>
  </div>

  <a href="#about" class="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-smoke/70 hover:text-gold transition" aria-label="Scroll down">
    <svg class="w-5 h-8 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 5v14m0 0l-6-6m6 6l6-6"/></svg>
  </a>
</section>

<section id="about" class="py-24 md:py-32 bg-noir reveal">
  <div class="max-w-7xl mx-auto px-5 md:px-8 grid md:grid-cols-2 gap-14 items-center">
    <div class="order-2 md:order-1">
      <p class="eyebrow mb-4">The Concept</p>
      <div class="glow-rule left mb-6"></div>
      <h2 class="font-display text-4xl md:text-5xl leading-tight mb-6">${escapeHtml(content.philosophyHeading)}</h2>
      <p class="text-smoke leading-relaxed mb-5">${escapeHtml(content.aboutUs)}</p>
      <p class="text-smoke leading-relaxed mb-10">${escapeHtml(content.secondaryAbout)}</p>

      <div class="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
        ${lead.rating ? `<div><p class="font-display text-3xl text-gold">${lead.rating}★</p><p class="text-[11px] uppercase tracking-widest text-smoke mt-1">Rating</p></div>` : ""}
        ${lead.reviewCount ? `<div><p class="font-display text-3xl text-gold">${lead.reviewCount}+</p><p class="text-[11px] uppercase tracking-widest text-smoke mt-1">Reviews</p></div>` : ""}
        ${menuItemCount > 0 ? `<div><p class="font-display text-3xl text-gold">${menuItemCount}+</p><p class="text-[11px] uppercase tracking-widest text-smoke mt-1">Menu Items</p></div>` : ""}
      </div>
    </div>

    <div class="order-1 md:order-2 relative">
      ${aboutImage
        ? `<img src="${aboutImage}" alt="${escapeHtml(lead.name)}" class="w-full h-[26rem] md:h-[34rem] object-cover rounded-sm" />`
        : `<div class="w-full h-[26rem] md:h-[34rem] rounded-sm" style="background:linear-gradient(135deg, #1F1622, #0B0A0D);"></div>`}
      <div class="absolute -bottom-6 -left-6 hidden sm:block card-velvet rounded-sm px-6 py-5 max-w-[220px]">
        <p class="font-display italic text-lg text-gold leading-snug">${escapeHtml(content.philosophyText)}</p>
      </div>
    </div>
  </div>
</section>

<section id="menu" class="py-24 md:py-32 bg-velvet reveal">
  <div class="max-w-6xl mx-auto px-5 md:px-8">
    <div class="text-center mb-14">
      <p class="eyebrow mb-4">On the Menu</p>
      <div class="glow-rule mb-6"></div>
      <h2 class="font-display text-4xl md:text-5xl">Food &amp; Mixology</h2>
    </div>
    ${menuTabBarHtml}
    ${menuPanelsHtml}
    ${menuLinkUrl ? `<div class="text-center mt-12"><a href="${menuLinkUrl}" target="_blank" class="btn-outline inline-block px-7 py-3 rounded text-sm tracking-wide">${originalMenuPhotoUrl ? "View Original Menu ↗" : "View Full Menu ↗"}</a></div>` : ""}
  </div>
</section>

<section id="events" class="py-24 md:py-32 bg-noir reveal">
  <div class="max-w-7xl mx-auto px-5 md:px-8">
    <div class="text-center mb-14">
      <p class="eyebrow mb-4">The Experience</p>
      <div class="glow-rule mb-6"></div>
      <h2 class="font-display text-4xl md:text-5xl">What Sets Us Apart</h2>
    </div>

    ${content.highlights.length > 0
      ? `
    <div class="grid md:grid-cols-3 gap-6 mb-16">
      ${content.highlights.slice(0, 3).map((h, i) => {
        const img = galleryImages[i + 3] ?? galleryImages[i % Math.max(galleryImages.length, 1)] ?? null;
        return `
      <article class="relative rounded-sm overflow-hidden h-80 group">
        ${img
          ? `<img src="${img}" class="w-full h-full object-cover group-hover:scale-105 transition duration-700" alt="${escapeHtml(h)}" />`
          : `<div class="w-full h-full" style="background:linear-gradient(135deg, #1F1622, #0B0A0D);"></div>`}
        <div class="absolute inset-0" style="background:linear-gradient(180deg, rgba(11,10,13,0) 30%, rgba(11,10,13,0.92) 100%);"></div>
        <div class="absolute bottom-0 p-6">
          <h3 class="font-display text-2xl">${escapeHtml(h)}</h3>
        </div>
      </article>`;
      }).join("")}
    </div>`
      : ""}

    <div class="rounded-sm p-10 md:p-14 text-center" style="background:linear-gradient(120deg, #6E1030, #1F1622);">
      <p class="eyebrow mb-4">Private Events &amp; VIP</p>
      <h3 class="font-display text-3xl md:text-4xl mb-4">Host Your Next Night Out With Us</h3>
      <p class="max-w-2xl mx-auto mb-8" style="color:rgba(243,236,224,0.8);">
        Celebrations, corporate nights, and private parties — ${escapeHtml(content.finalCtaHeading.toLowerCase())}
      </p>
      ${wa
        ? `<a href="https://wa.me/${waNum}?text=${encodeURIComponent(`Hi ${lead.name}, I'd like to inquire about hosting a private/VIP event.`)}" target="_blank" class="btn-gold inline-block px-8 py-3.5 rounded text-sm tracking-wide">Inquire About VIP &amp; Events</a>`
        : lead.phone
        ? `<a href="tel:${lead.phone}" class="btn-gold inline-block px-8 py-3.5 rounded text-sm tracking-wide">Call to Inquire</a>`
        : ""}
    </div>
  </div>
</section>

${galleryImages.length > 0 ? `
<section id="gallery" class="py-24 md:py-32 bg-velvet reveal">
  <div class="max-w-7xl mx-auto px-5 md:px-8">
    <div class="text-center mb-12">
      <p class="eyebrow mb-4">Follow the Night</p>
      <div class="glow-rule mb-6"></div>
      <h2 class="font-display text-4xl md:text-5xl mb-4">Gallery</h2>
      ${lead.socialLinks?.instagram ? `<a href="${lead.socialLinks.instagram}" target="_blank" class="text-gold text-sm hover:underline">@${escapeHtml(lead.name.replace(/\s+/g, ""))}</a>` : ""}
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      ${galleryImages.slice(0, 8).map((img) => `<img src="${img}" class="w-full h-44 sm:h-56 object-cover rounded-sm hover:opacity-80 transition" alt="${escapeHtml(lead.name)}" />`).join("")}
    </div>
  </div>
</section>` : ""}

<section id="reviews" class="py-24 md:py-32 bg-noir text-center reveal">
  <div class="max-w-5xl mx-auto px-5 md:px-8">
    <p class="eyebrow mb-4">Guest Reviews</p>
    <div class="glow-rule mb-6"></div>
    <h2 class="font-display text-4xl md:text-5xl mb-4">What People Are Saying</h2>
    <div class="text-2xl mb-2">${starsHtml(filledStars)}</div>
    <p class="mb-12" style="color:#9C8F82;">${lead.rating ?? "—"} out of 5 &middot; ${lead.reviewCount} Google reviews</p>

    ${lead.realReviews && lead.realReviews.length > 0 ? `
    <div class="grid sm:grid-cols-3 gap-5 text-left">
      ${lead.realReviews.slice(0, 6).map((r) => {
        const snippet = r.text.length > 220 ? r.text.slice(0, 220).trim() + "…" : r.text;
        const initial = (r.authorName || "G").trim().charAt(0).toUpperCase();
        return `
      <div class="card-velvet rounded-sm p-5">
        <div class="mb-2 text-sm">${starsHtml(Math.round(r.rating))}</div>
        <p class="text-sm mb-4" style="color:#D8CFC4;">"${escapeHtml(snippet)}"</p>
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold" style="background:#C9A227; color:#0B0A0D;">${escapeHtml(initial)}</div>
          <div>
            <p class="text-xs font-medium" style="color:#F3ECE0;">${escapeHtml(r.authorName)}</p>
            <p class="text-[11px]" style="color:#6B605A;">${escapeHtml(r.relativeTime || "Google review")}</p>
          </div>
        </div>
      </div>`;
      }).join("")}
    </div>` : ""}

    <a href="${lead.mapsUrl}" target="_blank" class="inline-block mt-10 text-sm font-medium underline underline-offset-4 text-gold">Read more reviews on Google →</a>
  </div>
</section>

<section id="contact" class="py-24 md:py-32 bg-velvet reveal">
  <div class="max-w-7xl mx-auto px-5 md:px-8">
    <div class="text-center mb-14">
      <p class="eyebrow mb-4">Find Us</p>
      <div class="glow-rule mb-6"></div>
      <h2 class="font-display text-4xl md:text-5xl">Visit Tonight</h2>
    </div>

    <div class="grid md:grid-cols-2 gap-10">
      <div class="card-velvet rounded-sm p-8 md:p-10">
        <h3 class="font-display text-2xl mb-6">Contact &amp; Hours</h3>
        <ul class="space-y-4 text-smoke">
          <li class="flex items-start gap-3">
            <svg class="w-5 h-5 text-gold shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <a href="${lead.mapsUrl}" target="_blank" class="hover:text-gold">${escapeHtml(lead.address)}</a>
          </li>
          ${lead.phone ? `
          <li class="flex items-center gap-3">
            <svg class="w-5 h-5 text-gold shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
            <a href="tel:${lead.phone}" class="hover:text-gold">${escapeHtml(lead.phone)}</a>
          </li>` : ""}
          ${lead.openingHours.length > 0 ? `
          <li class="flex items-start gap-3">
            <svg class="w-5 h-5 text-gold shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <div class="text-sm">
              ${lead.openingHours.map((l) => { const [d, h] = splitHoursLine(l); return `<p>${escapeHtml(d)}: ${escapeHtml(h)}</p>`; }).join("")}
            </div>
          </li>` : ""}
        </ul>

        <div class="flex gap-5 mt-8 pt-6 border-t border-white/10 text-sm">
          ${lead.socialLinks?.instagram ? `<a href="${lead.socialLinks.instagram}" target="_blank" class="text-gold hover:underline">Instagram</a>` : ""}
          ${lead.socialLinks?.facebook ? `<a href="${lead.socialLinks.facebook}" target="_blank" class="text-gold hover:underline">Facebook</a>` : ""}
        </div>

        <button type="button" onclick="openReservationModal()" class="btn-gold w-full mt-8 py-3.5 rounded text-sm tracking-wide">${heroCtaLabel}</button>
      </div>

      <div class="rounded-sm overflow-hidden h-full min-h-[24rem]">
        ${contactImage
          ? `<img src="${contactImage}" class="w-full h-full min-h-[24rem] object-cover" alt="${escapeHtml(lead.name)}" />`
          : `<div class="w-full h-full min-h-[24rem]" style="background:linear-gradient(135deg, #1F1622, #0B0A0D);"></div>`}
      </div>
    </div>
  </div>
</section>

</main>

<footer class="bg-velvet pt-16 pb-8 border-t border-white/10">
  <div class="max-w-7xl mx-auto px-5 md:px-8 grid sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
    <div class="md:col-span-2">
      <p class="font-display text-2xl mb-3">${escapeHtml(lead.name)}</p>
      <p class="text-smoke text-sm max-w-sm">${escapeHtml(content.tagline)}</p>
    </div>
    <div>
      <p class="eyebrow mb-4">Navigation</p>
      <ul class="space-y-2 text-sm text-smoke">
        <li><a href="#about" class="hover:text-gold">About</a></li>
        <li><a href="#menu" class="hover:text-gold">Menu</a></li>
        <li><a href="#events" class="hover:text-gold">Experience</a></li>
        ${galleryImages.length > 0 ? `<li><a href="#gallery" class="hover:text-gold">Gallery</a></li>` : ""}
      </ul>
    </div>
    <div>
      <p class="eyebrow mb-4">Contact</p>
      <ul class="space-y-2 text-sm text-smoke">
        <li>${escapeHtml(lead.address)}</li>
        ${lead.phone ? `<li><a href="tel:${lead.phone}" class="hover:text-gold">${escapeHtml(lead.phone)}</a></li>` : ""}
      </ul>
      <div class="mt-4">${socialIconsHtml(lead, "#C9A227", "#6B605A")}</div>
    </div>
  </div>
  <div class="max-w-7xl mx-auto px-5 md:px-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-smoke">
    <span>&copy; ${new Date().getFullYear()} ${escapeHtml(lead.name)}. All rights reserved.</span>
    <a href="#home" class="hover:text-gold">Back to top ↑</a>
  </div>
  <p class="text-center text-xs mt-6" style="color:#4A423D;">Website mockup generated for demo purposes.</p>
</footer>

<div id="reservation-modal" class="hidden-modal fixed inset-0 z-[100] flex items-center justify-center p-4" style="background:rgba(11,10,13,0.8); backdrop-filter: blur(4px);">
  <div class="modal-panel card-velvet rounded-sm w-full max-w-md p-7 md:p-9 relative">
    <button type="button" onclick="closeReservationModal()" aria-label="Close" class="absolute top-4 right-4 text-smoke hover:text-gold">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"/></svg>
    </button>

    <p class="eyebrow mb-2">Reserve Your Night</p>
    <h3 class="font-display text-3xl mb-6">${heroCtaLabel}</h3>

    <form id="reservation-form" class="space-y-4">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-xs text-smoke block mb-1">Full name</label>
          <input id="f-name" required type="text" class="w-full bg-noir border border-white/15 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-gold" placeholder="Jane Doe" />
        </div>
        <div>
          <label class="text-xs text-smoke block mb-1">Phone</label>
          <input id="f-phone" type="tel" class="w-full bg-noir border border-white/15 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-gold" placeholder="(555) 123-4567" />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-xs text-smoke block mb-1">Date</label>
          <input id="f-date" required type="date" onclick="this.showPicker && this.showPicker()" class="w-full bg-noir border border-white/15 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-gold cursor-pointer" />
        </div>
        <div>
          <label class="text-xs text-smoke block mb-1">Time</label>
          <input id="f-time" type="time" value="21:00" class="w-full bg-noir border border-white/15 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-gold" />
        </div>
      </div>
      <div>
        <label class="text-xs text-smoke block mb-1">Party size</label>
        <select id="f-party" class="w-full bg-noir border border-white/15 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-gold">
          ${[2, 3, 4, 5, 6].map((n) => `<option value="${n}" ${n === 2 ? "selected" : ""}>${n} Guests</option>`).join("")}
          <option value="7+">7+ Guests (VIP / Group)</option>
        </select>
      </div>
      <div>
        <label class="text-xs text-smoke block mb-1">Notes</label>
        <textarea id="f-note" rows="2" class="w-full bg-noir border border-white/15 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-gold resize-none" placeholder="Special requests, occasion, VIP table..."></textarea>
      </div>
      <button type="submit" class="btn-gold w-full py-3.5 rounded text-sm tracking-wide mt-2">
        ${wa ? "Send via WhatsApp" : "Submit"}
      </button>
      <p class="text-xs text-center" style="color:#6B605A;">${wa ? "This mockup sends requests via WhatsApp — no bookings are actually processed by this demo site." : "Give us a call to reserve."}</p>
    </form>
  </div>
</div>

<div class="fixed bottom-5 right-5 z-50 flex flex-col gap-3 items-end">
  ${wa ? `<a href="${wa}" target="_blank" class="float-btn bg-[#25D366] text-white rounded-full w-12 h-12 flex items-center justify-center text-xl">💬</a>` : ""}
  ${lead.phone ? `<a href="tel:${lead.phone}" class="float-btn btn-gold rounded-full w-12 h-12 flex items-center justify-center text-lg">📞</a>` : ""}
</div>

<script>
  const header = document.getElementById('site-header');
  function updateHeaderOnScroll() {
    if (window.scrollY > 40) header.classList.add('nav-scrolled');
    else header.classList.remove('nav-scrolled');
  }
  window.addEventListener('scroll', updateHeaderOnScroll);
  updateHeaderOnScroll();

  function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const iconOpen = document.getElementById('menu-icon-open');
    const iconClose = document.getElementById('menu-icon-close');
    const isHidden = menu.classList.contains('hidden');
    menu.classList.toggle('hidden');
    iconOpen.classList.toggle('hidden', isHidden);
    iconClose.classList.toggle('hidden', !isHidden);
  }

  function switchMenuTab(tab) {
    document.querySelectorAll('.menu-tab').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
    });
    document.querySelectorAll('.menu-panel').forEach(function (panel) {
      panel.classList.toggle('active', panel.id === 'panel-' + tab);
    });
  }

  function openReservationModal() {
    document.getElementById('reservation-modal').classList.remove('hidden-modal');
    document.body.style.overflow = 'hidden';
  }
  function closeReservationModal() {
    document.getElementById('reservation-modal').classList.add('hidden-modal');
    document.body.style.overflow = '';
  }
  document.getElementById('reservation-modal').addEventListener('click', function (e) {
    if (e.target === this) closeReservationModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeReservationModal();
  });

  document.getElementById('reservation-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('f-name').value.trim();
    const phone = document.getElementById('f-phone').value.trim();
    const date = document.getElementById('f-date').value;
    const time = document.getElementById('f-time').value;
    const party = document.getElementById('f-party').value;
    const note = document.getElementById('f-note').value.trim();
    let msg = 'Hi ${escapeHtml(lead.name).replace(/'/g, "\\'")}, I would like to reserve for ' + party + ' on ' + (date || '[date]') + ' at ' + (time || '[time]') + '. Name: ' + name + '.';
    if (phone) msg += ' Phone: ' + phone + '.';
    if (note) msg += ' Note: ' + note;

    ${wa
      ? `window.open('https://wa.me/${waNum}?text=' + encodeURIComponent(msg), '_blank');
    closeReservationModal();`
      : `alert('Thanks ' + name + '! Please call us directly to confirm: ${escapeHtml(lead.phone ?? "see contact section")}');
    closeReservationModal();`}
  });

  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) { if (entry.isIntersecting) entry.target.classList.add('show'); });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el) { revealObserver.observe(el); });
</script>

</body>
</html>`;
}
