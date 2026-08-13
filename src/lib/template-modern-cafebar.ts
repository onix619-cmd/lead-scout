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
  Array.from({ length: 5 }).map((_, i) => `<span style="color:${i < count ? "#FF5C35" : "#E4E1DA"};">★</span>`).join("");

const SOCIAL_ICON_PATHS = {
  instagram:
    "M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 2 .3 2.4.5.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1.2.5 2.4.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 2-.5 2.4-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1.2.4-2.4.5-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-2-.3-2.4-.5-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1.2-.5-2.4C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-2 .5-2.4.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1.2-.4 2.4-.5C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.1 0-3.5 0-4.7.1-1 .1-1.6.2-1.9.4-.5.2-.8.4-1.2.8-.4.4-.6.7-.8 1.2-.1.3-.3.9-.4 1.9-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c.1 1 .2 1.6.4 1.9.2.5.4.8.8 1.2.4.4.7.6 1.2.8.3.1.9.3 1.9.4 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1-.1 1.6-.2 1.9-.4.5-.2.8-.4 1.2-.8.4-.4.6-.7.8-1.2.1-.3.3-.9.4-1.9.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-1-.2-1.6-.4-1.9-.2-.5-.4-.8-.8-1.2-.4-.4-.7-.6-1.2-.8-.3-.1-.9-.3-1.9-.4-1.2-.1-1.6-.1-4.7-.1zm0 4.4a5.6 5.6 0 110 11.2 5.6 5.6 0 010-11.2zm0 1.8a3.8 3.8 0 100 7.6 3.8 3.8 0 000-7.6zm5.8-2a1.3 1.3 0 110 2.6 1.3 1.3 0 010-2.6z",
  facebook:
    "M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94z",
  tiktok:
    "M16.6 5.82c-.9-.95-1.4-2.2-1.4-3.52h-3.1v13.44a3.1 3.1 0 11-2.2-2.97V9.65a6.1 6.1 0 105.3 6.05V9.9a8.1 8.1 0 004.8 1.56V8.36a5.6 5.6 0 01-3.4-2.54z",
};
function socialIconsHtml(lead: Lead, accentColor: string, dimColor: string): string {
  const FALLBACK_URLS: Record<"instagram" | "facebook" | "tiktok", string> = {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    tiktok: "https://tiktok.com",
  };
  const platforms: { key: "instagram" | "facebook" | "tiktok"; url?: string }[] = [
    { key: "instagram", url: lead.socialLinks?.instagram },
    { key: "facebook", url: lead.socialLinks?.facebook },
    { key: "tiktok", url: lead.socialLinks?.tiktok },
  ];
  return `
    <div class="flex items-center gap-5">
      ${platforms
        .map(({ key, url }) => {
          const svg = `<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="${SOCIAL_ICON_PATHS[key]}"/></svg>`;
          const href = url || FALLBACK_URLS[key];
          const color = url ? accentColor : dimColor;
          return `<a href="${href}" target="_blank" rel="noopener" aria-label="${key}" style="color:${color};" class="hover:opacity-75 transition">${svg}</a>`;
        })
        .join("")}
    </div>`;
}

// A modern, editorial-minimalist template for coffee shops and bars
// ("modern") — deliberately different in structure and texture from the
// warm-cafe (template-coffee.ts) and dark-lounge (template-lounge.ts)
// templates: split-screen hero instead of full-bleed, a bento-style about
// grid, a plain list-style menu instead of boxed cards, an offset gallery,
// and a rotating single-quote review spotlight instead of a review grid.
// Space Grotesk + Inter typography and a coral-orange accent keep it
// neutral enough to suit either a coffee shop or a bar.
export function generateModernCafeBarHTML(
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
  const heroImg1 = galleryImages[0] ?? null;
  const heroImg2 = galleryImages[1] ?? null;
  const aboutImage = galleryImages[2] ?? galleryImages[0] ?? null;
  const menuLinkUrl = originalMenuPhotoUrl || lead.website;
  const menuItemCount = countMenuItems(menuSections);
  const neighborhood = lead.address.split(",")[0];
  const ctaLabel = wa ? "Order Now" : "Get in Touch";

  const menuTabs = menuSections.slice(0, 6).map((section, i) => ({
    key: `tab${i}`,
    label: section.category || `Menu ${i + 1}`,
    items: section.items,
  }));

  const menuRow = (name: string, price: string | undefined, description: string | undefined) => `
        <div class="flex items-start justify-between gap-4 py-5 border-b border-[#EAE6DD] group">
          <div class="min-w-0">
            <h4 class="text-lg font-semibold tracking-tight" style="color:#14120F;">${escapeHtml(name)}</h4>
            ${description ? `<p class="text-sm mt-1" style="color:#6B675F;">${escapeHtml(description)}</p>` : ""}
          </div>
          ${price ? `<span class="shrink-0 text-lg font-bold whitespace-nowrap" style="color:#FF5C35;">$${escapeHtml(price)}</span>` : ""}
        </div>`;

  const menuTabBarHtml =
    menuTabs.length > 1
      ? `
    <div class="flex flex-wrap gap-2 mb-10">
      ${menuTabs
        .map(
          (tab, i) => `
      <button type="button" class="menu-tab ${i === 0 ? "active" : ""} text-xs uppercase tracking-widest font-semibold px-4 py-2 rounded-full" data-tab="${tab.key}" onclick="switchMenuTab('${tab.key}')">${escapeHtml(tab.label)}</button>`
        )
        .join("")}
    </div>`
      : "";

  const menuPanelsHtml =
    menuTabs.length > 0
      ? menuTabs
          .map(
            (tab, i) => `
    <div id="panel-${tab.key}" class="menu-panel ${i === 0 ? "active" : ""}">
      ${tab.items.map((it) => menuRow(it.name, it.price, it.description)).join("")}
    </div>`
          )
          .join("")
      : `
    <div class="menu-panel active">
      ${content.showcaseItems.map((item) => menuRow(item.name, undefined, item.description)).join("")}
    </div>
    <p class="text-sm mt-6" style="color:#6B675F;">Ask us about our full current menu in person or by phone.</p>`;

  const galleryHtml =
    galleryImages.length > 0
      ? `
<section id="gallery" class="py-24 md:py-32" style="background:#FAF9F6;">
  <div class="max-w-6xl mx-auto px-5 md:px-8">
    <div class="flex items-end justify-between mb-10 gap-4 flex-wrap">
      <h2 class="text-4xl md:text-5xl font-bold tracking-tight" style="color:#14120F;">Gallery</h2>
      ${lead.socialLinks?.instagram ? `<a href="${lead.socialLinks.instagram}" target="_blank" class="text-sm font-semibold" style="color:#FF5C35;">Follow along →</a>` : ""}
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      ${galleryImages
        .slice(0, 8)
        .map(
          (img, i) => `<img src="${img}" class="w-full object-cover rounded-2xl ${i % 5 === 0 ? "sm:row-span-2 h-48 sm:h-full" : "h-40 sm:h-56"}" alt="${escapeHtml(lead.name)}" />`
        )
        .join("")}
    </div>
  </div>
</section>`
      : "";

  const reviewQuotesHtml =
    lead.realReviews && lead.realReviews.length > 0
      ? lead.realReviews
          .slice(0, 5)
          .map(
            (r, i) => `
        <div class="quote-slide ${i === 0 ? "active" : ""}">
          <div class="text-2xl mb-4">${starsHtml(Math.round(r.rating))}</div>
          <p class="text-2xl md:text-3xl font-medium leading-snug mb-6" style="color:#14120F;">"${escapeHtml(r.text.length > 200 ? r.text.slice(0, 200).trim() + "…" : r.text)}"</p>
          <p class="text-sm font-semibold" style="color:#6B675F;">${escapeHtml(r.authorName)} &middot; ${escapeHtml(r.relativeTime || "Google review")}</p>
        </div>`
          )
          .join("")
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(content.seoTitle)}</title>
<meta name="description" content="${escapeHtml(content.metaDescription)}" />
<meta property="og:title" content="${escapeHtml(content.seoTitle)}" />
<meta property="og:description" content="${escapeHtml(content.metaDescription)}" />
${heroImg1 ? `<meta property="og:image" content="${heroImg1}" />` : ""}
<meta name="twitter:card" content="summary_large_image" />
<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: lead.name,
    address: lead.address,
    telephone: lead.phone ?? undefined,
    url: lead.mapsUrl,
    aggregateRating: lead.rating != null ? { "@type": "AggregateRating", ratingValue: lead.rating, reviewCount: lead.reviewCount } : undefined,
  })}</script>

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
<script src="https://cdn.tailwindcss.com"></script>
<style>
  html { scroll-behavior: smooth; }
  body { font-family: "Inter", sans-serif; background: #FAF9F6; color: #14120F; }
  .font-display { font-family: "Space Grotesk", sans-serif; }
  h1, h2, h3, h4 { font-family: "Space Grotesk", sans-serif; }

  .btn-accent { background: #FF5C35; color: #FFFFFF; font-weight: 600; transition: transform .2s ease, box-shadow .2s ease; }
  .btn-accent:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(255,92,53,0.28); }
  .btn-ink { border: 1.5px solid #14120F; color: #14120F; font-weight: 600; transition: background .2s ease, color .2s ease; }
  .btn-ink:hover { background: #14120F; color: #FAF9F6; }

  .card-soft { background: #FFFFFF; border: 1px solid #EAE6DD; box-shadow: 0 4px 18px rgba(20,18,15,0.04); }

  .nav-scrolled { background: rgba(250,249,246,0.9); backdrop-filter: blur(10px); box-shadow: 0 1px 0 #EAE6DD; }

  .reveal { opacity: 0; transform: translateY(20px); transition: opacity .6s ease, transform .6s ease; }
  .reveal.show { opacity: 1; transform: translateY(0); }

  .menu-tab { background: #F1EEE6; color: #6B675F; transition: background .2s ease, color .2s ease; }
  .menu-tab.active { background: #14120F; color: #FAF9F6; }
  .menu-panel { display: none; }
  .menu-panel.active { display: block; }

  .quote-slide { display: none; }
  .quote-slide.active { display: block; }

  .float-btn { box-shadow: 0 10px 25px rgba(20,18,15,0.25); transition: transform .2s ease; }
  .float-btn:hover { transform: scale(1.08); }

  @media (prefers-reduced-motion: reduce) {
    .reveal, .btn-accent, .btn-ink { transition: none !important; }
  }
</style>
</head>

<body class="antialiased">

<header id="site-header" class="fixed top-0 inset-x-0 z-50 transition-colors duration-300">
  <nav class="max-w-7xl mx-auto flex items-center justify-between px-5 md:px-8 py-4">
    <a href="#home" class="font-display text-xl font-bold tracking-tight">${escapeHtml(lead.name)}</a>
    <ul class="hidden lg:flex items-center gap-9 text-sm font-medium" style="color:#6B675F;">
      <li><a href="#about" class="hover:text-[#14120F] transition">About</a></li>
      <li><a href="#menu" class="hover:text-[#14120F] transition">Menu</a></li>
      ${galleryImages.length > 0 ? `<li><a href="#gallery" class="hover:text-[#14120F] transition">Gallery</a></li>` : ""}
      <li><a href="#contact" class="hover:text-[#14120F] transition">Contact</a></li>
    </ul>
    <div class="hidden lg:block">
      <button type="button" onclick="openReservationModal()" class="btn-accent text-sm px-5 py-2.5 rounded-full">${ctaLabel}</button>
    </div>
    <button id="mobile-menu-btn" class="lg:hidden" aria-label="Toggle menu" onclick="toggleMobileMenu()">
      <svg id="menu-icon-open" class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16"/></svg>
      <svg id="menu-icon-close" class="w-7 h-7 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"/></svg>
    </button>
  </nav>
  <div id="mobile-menu" class="hidden lg:hidden border-t px-5 pb-6" style="background:#FAF9F6; border-color:#EAE6DD;">
    <ul class="flex flex-col gap-1 pt-4 text-base" style="color:#6B675F;">
      <li><a href="#about" class="block py-2.5" onclick="toggleMobileMenu()">About</a></li>
      <li><a href="#menu" class="block py-2.5" onclick="toggleMobileMenu()">Menu</a></li>
      ${galleryImages.length > 0 ? `<li><a href="#gallery" class="block py-2.5" onclick="toggleMobileMenu()">Gallery</a></li>` : ""}
      <li><a href="#contact" class="block py-2.5" onclick="toggleMobileMenu()">Contact</a></li>
    </ul>
    <button type="button" onclick="openReservationModal()" class="btn-accent w-full mt-4 py-3 rounded-full text-sm">${ctaLabel}</button>
  </div>
</header>

<!-- Split hero: copy left, image collage right — deliberately not a full-bleed background hero -->
<section id="home" class="pt-32 pb-16 md:pt-44 md:pb-24">
  <div class="max-w-7xl mx-auto px-5 md:px-8 grid md:grid-cols-2 gap-12 items-center">
    <div>
      <p class="inline-block text-xs uppercase tracking-widest font-semibold px-3 py-1.5 rounded-full mb-6" style="background:#F1EEE6; color:#6B675F;">
        ${escapeHtml(lead.category)}${neighborhood ? ` &middot; ${escapeHtml(neighborhood)}` : ""}
      </p>
      <h1 class="font-display text-5xl md:text-6xl font-bold tracking-tight leading-[1.05] mb-6">${escapeHtml(lead.name)}</h1>
      <p class="text-lg mb-8 max-w-md" style="color:#6B675F;">${escapeHtml(content.tagline)}</p>
      ${lead.rating ? `<div class="flex items-center gap-2 mb-8 text-sm" style="color:#6B675F;">
        <span class="text-lg">${starsHtml(filledStars)}</span>
        <span>${lead.rating} / 5${lead.reviewCount ? ` &middot; ${lead.reviewCount}+ reviews` : ""}</span>
      </div>` : ""}
      <div class="flex flex-wrap gap-3">
        <button type="button" onclick="openReservationModal()" class="btn-accent px-7 py-3.5 rounded-full text-sm">${ctaLabel}</button>
        <a href="#menu" class="btn-ink px-7 py-3.5 rounded-full text-sm">View Menu</a>
      </div>
    </div>

    <div class="relative h-80 sm:h-[26rem]">
      ${heroImg1 ? `<img src="${heroImg1}" class="absolute top-0 right-0 w-[72%] h-[80%] object-cover rounded-3xl shadow-xl" alt="${escapeHtml(lead.name)}" />` : `<div class="absolute top-0 right-0 w-[72%] h-[80%] rounded-3xl" style="background:#F1EEE6;"></div>`}
      ${heroImg2 ? `<img src="${heroImg2}" class="absolute bottom-0 left-0 w-[48%] h-[52%] object-cover rounded-3xl shadow-xl border-4 border-[#FAF9F6]" alt="${escapeHtml(lead.name)}" />` : ""}
      <div class="absolute bottom-4 right-4 card-soft rounded-2xl px-5 py-4 max-w-[190px]">
        <p class="font-display text-2xl font-bold" style="color:#FF5C35;">${menuItemCount > 0 ? `${menuItemCount}+` : (lead.rating ?? "—")}</p>
        <p class="text-[11px] uppercase tracking-widest mt-1" style="color:#6B675F;">${menuItemCount > 0 ? "Menu Items" : "Rating"}</p>
      </div>
    </div>
  </div>
</section>

<!-- About: bento-style asymmetric grid -->
<section id="about" class="py-20 md:py-28 reveal">
  <div class="max-w-7xl mx-auto px-5 md:px-8">
    <div class="grid md:grid-cols-3 gap-4 md:gap-5">
      <div class="md:col-span-2 card-soft rounded-3xl p-8 md:p-10">
        <p class="text-xs uppercase tracking-widest font-semibold mb-3" style="color:#FF5C35;">Our Story</p>
        <h2 class="font-display text-3xl md:text-4xl font-bold tracking-tight mb-5">${escapeHtml(content.philosophyHeading)}</h2>
        <p class="leading-relaxed mb-4" style="color:#6B675F;">${escapeHtml(content.aboutUs)}</p>
        <p class="leading-relaxed" style="color:#6B675F;">${escapeHtml(content.secondaryAbout)}</p>
      </div>
      <div class="rounded-3xl overflow-hidden min-h-[14rem]">
        ${aboutImage ? `<img src="${aboutImage}" class="w-full h-full object-cover" alt="${escapeHtml(lead.name)}" />` : `<div class="w-full h-full" style="background:#F1EEE6;"></div>`}
      </div>

      <div class="card-soft rounded-3xl p-6 flex flex-col justify-center">
        <p class="font-display text-3xl font-bold" style="color:#FF5C35;">${lead.rating ?? "—"}★</p>
        <p class="text-xs uppercase tracking-widest mt-1" style="color:#6B675F;">Google Rating</p>
      </div>
      <div class="md:col-span-2 rounded-3xl p-8 flex items-center" style="background:#14120F;">
        <p class="font-display italic text-xl md:text-2xl font-medium" style="color:#FAF9F6;">"${escapeHtml(content.philosophyText)}"</p>
      </div>
    </div>
  </div>
</section>

<!-- Menu: plain list rows instead of boxed cards -->
<section id="menu" class="py-20 md:py-28 reveal" style="background:#F1EEE6;">
  <div class="max-w-4xl mx-auto px-5 md:px-8">
    <h2 class="font-display text-4xl md:text-5xl font-bold tracking-tight mb-10">Menu</h2>
    ${menuTabBarHtml}
    <div class="card-soft rounded-3xl px-6 md:px-8 pt-2 pb-4">
      ${menuPanelsHtml}
    </div>
    ${menuLinkUrl ? `<div class="mt-8"><a href="${menuLinkUrl}" target="_blank" class="btn-ink inline-block px-7 py-3 rounded-full text-sm">${originalMenuPhotoUrl ? "View Original Menu ↗" : "View Full Menu ↗"}</a></div>` : ""}
  </div>
</section>

${galleryHtml}

<!-- Reviews: single rotating quote spotlight instead of a grid -->
${reviewQuotesHtml ? `
<section id="reviews" class="py-24 md:py-32 reveal">
  <div class="max-w-3xl mx-auto px-5 md:px-8 text-center">
    <p class="text-xs uppercase tracking-widest font-semibold mb-6" style="color:#FF5C35;">What People Say</p>
    <div id="quote-carousel">${reviewQuotesHtml}</div>
    <div class="flex justify-center gap-2 mt-8">
      ${(lead.realReviews ?? []).slice(0, 5).map((_, i) => `<button type="button" onclick="setQuote(${i})" class="quote-dot w-2 h-2 rounded-full transition" data-i="${i}" style="background:${i === 0 ? "#FF5C35" : "#EAE6DD"};"></button>`).join("")}
    </div>
  </div>
</section>` : ""}

<!-- Contact -->
<section id="contact" class="py-20 md:py-28 reveal" style="background:#14120F;">
  <div class="max-w-7xl mx-auto px-5 md:px-8">
    <div class="grid md:grid-cols-2 gap-10 items-start">
      <div>
        <p class="text-xs uppercase tracking-widest font-semibold mb-4" style="color:#FF5C35;">Visit Us</p>
        <h2 class="font-display text-4xl md:text-5xl font-bold tracking-tight mb-8" style="color:#FAF9F6;">Come Say Hi</h2>
        <ul class="space-y-4" style="color:#C9C4B8;">
          <li class="flex items-start gap-3">
            <svg class="w-5 h-5 shrink-0 mt-0.5" style="color:#FF5C35;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <a href="${lead.mapsUrl}" target="_blank" class="hover:text-white">${escapeHtml(lead.address)}</a>
          </li>
          ${lead.phone ? `
          <li class="flex items-center gap-3">
            <svg class="w-5 h-5 shrink-0" style="color:#FF5C35;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
            <a href="tel:${lead.phone}" class="hover:text-white">${escapeHtml(lead.phone)}</a>
          </li>` : ""}
          ${lead.openingHours.length > 0 ? `
          <li class="flex items-start gap-3">
            <svg class="w-5 h-5 shrink-0 mt-0.5" style="color:#FF5C35;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <div class="text-sm">${lead.openingHours.map((l) => { const [d, h] = splitHoursLine(l); return `<p>${escapeHtml(d)}: ${escapeHtml(h)}</p>`; }).join("")}</div>
          </li>` : ""}
        </ul>
        <div class="mt-8 pt-6 border-t" style="border-color:rgba(255,255,255,0.1);">${socialIconsHtml(lead, "#FF5C35", "#6B675F")}</div>
      </div>

      <div class="card-soft rounded-3xl p-7 md:p-9">
        <h3 class="font-display text-2xl font-bold mb-5">${ctaLabel}</h3>
        <form id="reservation-form" class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs block mb-1" style="color:#6B675F;">Full name</label>
              <input id="f-name" required class="w-full rounded-xl px-3 py-2.5 text-sm border" style="background:#F1EEE6; border-color:#EAE6DD;" placeholder="Jane Doe" />
            </div>
            <div>
              <label class="text-xs block mb-1" style="color:#6B675F;">Phone</label>
              <input id="f-phone" type="tel" class="w-full rounded-xl px-3 py-2.5 text-sm border" style="background:#F1EEE6; border-color:#EAE6DD;" placeholder="(555) 123-4567" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs block mb-1" style="color:#6B675F;">Date</label>
              <input id="f-date" type="date" onclick="this.showPicker && this.showPicker()" class="w-full rounded-xl px-3 py-2.5 text-sm border cursor-pointer" style="background:#F1EEE6; border-color:#EAE6DD;" />
            </div>
            <div>
              <label class="text-xs block mb-1" style="color:#6B675F;">Time</label>
              <input id="f-time" type="time" class="w-full rounded-xl px-3 py-2.5 text-sm border" style="background:#F1EEE6; border-color:#EAE6DD;" />
            </div>
          </div>
          <div>
            <label class="text-xs block mb-1" style="color:#6B675F;">Message</label>
            <textarea id="f-note" rows="3" class="w-full rounded-xl px-3 py-2.5 text-sm border resize-none" style="background:#F1EEE6; border-color:#EAE6DD;" placeholder="What can we help with?"></textarea>
          </div>
          <button type="submit" class="btn-accent w-full py-3.5 rounded-full text-sm">${wa ? "Send via WhatsApp" : "Submit"}</button>
          <p class="text-xs text-center" style="color:#6B675F;">${wa ? "This mockup sends requests via WhatsApp — no bookings are actually processed by this demo site." : "Give us a call to get in touch."}</p>
        </form>
      </div>
    </div>
  </div>
</section>

<footer class="pt-14 pb-8" style="background:#14120F; color:#8A8578;">
  <div class="max-w-7xl mx-auto px-5 md:px-8 flex flex-wrap items-center justify-between gap-4 pb-8 border-b" style="border-color:rgba(255,255,255,0.08);">
    <p class="font-display text-xl font-bold" style="color:#FAF9F6;">${escapeHtml(lead.name)}</p>
    ${socialIconsHtml(lead, "#FF5C35", "#6B675F")}
  </div>
  <div class="max-w-7xl mx-auto px-5 md:px-8 pt-6 flex flex-wrap items-center justify-between gap-3 text-xs">
    <span>&copy; ${new Date().getFullYear()} ${escapeHtml(lead.name)}. All rights reserved.</span>
    <a href="#home" class="hover:text-white">Back to top ↑</a>
  </div>
  <p class="text-center text-xs mt-6" style="color:#4A473E;">Website mockup generated for demo purposes.</p>
</footer>

<div class="fixed bottom-5 right-5 z-50 flex flex-col gap-3 items-end">
  ${wa ? `<a href="${wa}" target="_blank" class="float-btn bg-[#25D366] text-white rounded-full w-12 h-12 flex items-center justify-center text-xl">💬</a>` : ""}
  ${lead.phone ? `<a href="tel:${lead.phone}" class="float-btn btn-accent rounded-full w-12 h-12 flex items-center justify-center text-lg">📞</a>` : ""}
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

  let quoteIndex = 0;
  function setQuote(i) {
    const slides = document.querySelectorAll('.quote-slide');
    if (!slides.length) return;
    quoteIndex = i;
    slides.forEach(function (s, idx) { s.classList.toggle('active', idx === i); });
    document.querySelectorAll('.quote-dot').forEach(function (d, idx) {
      d.style.background = idx === i ? '#FF5C35' : '#EAE6DD';
    });
  }
  (function () {
    const slides = document.querySelectorAll('.quote-slide');
    if (slides.length > 1) {
      setInterval(function () { setQuote((quoteIndex + 1) % slides.length); }, 6000);
    }
  })();

  function openReservationModal() {
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    setTimeout(function () {
      const el = document.getElementById('f-name');
      if (el) el.focus();
    }, 500);
  }

  document.getElementById('reservation-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('f-name').value.trim();
    const phone = document.getElementById('f-phone').value.trim();
    const date = document.getElementById('f-date').value;
    const time = document.getElementById('f-time').value;
    const note = document.getElementById('f-note').value.trim();
    let msg = 'Hi ${escapeHtml(lead.name).replace(/'/g, "\\'")}, ';
    msg += date || time ? ('I would like to book for ' + (date || '[date]') + ' at ' + (time || '[time]') + '. ') : 'I have a question: ';
    if (note) msg += note + '. ';
    msg += 'Name: ' + name + '.';
    if (phone) msg += ' Phone: ' + phone + '.';

    ${wa
      ? `window.open('https://wa.me/${waNum}?text=' + encodeURIComponent(msg), '_blank');`
      : `alert('Thanks ' + name + '! Please call us directly to confirm: ${escapeHtml(lead.phone ?? "see contact section")}');`}
    e.target.reset();
  });

  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) { if (entry.isIntersecting) entry.target.classList.add('show'); });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el) { revealObserver.observe(el); });
</script>

</body>
</html>`;
}
