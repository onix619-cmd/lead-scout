import { GeneratedContent, Lead, MenuSection } from "./types";
import { detectThemeKey, getTheme } from "./theme";
import { countMenuItems } from "./menu";
import { generateCoffeeLandingPageHTML } from "./template-coffee";

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
function schemaTypeFor(themeKey: string) {
  if (themeKey === "restaurant") return "Restaurant";
  if (themeKey === "coffee") return "CafeOrCoffeeShop";
  if (themeKey === "icecream") return "IceCreamShop";
  return "LocalBusiness";
}

export function generateLandingPageHTML(
  lead: Lead,
  content: GeneratedContent,
  menuSections: MenuSection[] = [],
  variant: "A" | "B" = Math.random() < 0.5 ? "A" : "B"
): string {
  const themeKey = detectThemeKey(lead.category, lead.name);

  if (themeKey === "coffee") {
    return generateCoffeeLandingPageHTML(lead, content, menuSections);
  }

  const theme = getTheme(themeKey, lead.name);
  const R = themeKey === "restaurant"; // full dark, elegant/gold variant
  const isB = R && variant === "B"; // second visual variant: sharp corners + accent color
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
  const philosophyImage = galleryImages[1] ?? galleryImages[0] ?? null;
  const finalCtaImage = galleryImages[2] ?? galleryImages[0] ?? null;

  const dining = lead.diningOptions ?? {};
  const diningBadges = [
    dining.dineIn ? "Dine-In" : null,
    dining.takeout ? "Takeout" : null,
    dining.delivery ? "Delivery" : null,
    dining.outdoorSeating ? "Outdoor Seating" : null,
    dining.servesBeer || dining.servesWine ? "Beer & Wine" : null,
  ].filter(Boolean) as string[];

  const menuItemCount = countMenuItems(menuSections);

  const starColor = isB ? "#fe4900" : "#facc15";
  const starsHtml = (count: number) =>
    Array.from({ length: 5 })
      .map((_, i) => `<span style="color:${i < count ? starColor : "#4b5563"};">★</span>`)
      .join("");

  // Conditional style snippets: R = fully dark elegant restaurant theme,
  // other themes keep the lighter alternating-section layout. Variant B
  // uses sharp corners and the accent orange-red instead of gold/yellow.
  const bodyStyle = R ? `background:${theme.dark}; color:${theme.text};` : "";
  const bodyClass = R ? "" : "text-slate-800 bg-white";
  const cardStyle = R ? "background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09);" : "";
  const cardClass = R ? "" : "bg-white shadow-sm";
  const mutedStyle = R ? "color:rgba(255,255,255,0.65);" : "";
  const mutedClass = R ? "" : "text-slate-600";
  const inputClass = R
    ? "bg-black/30 border border-white/15 text-white placeholder-white/30"
    : "bg-white border border-slate-300 text-slate-900";
  const sectionAltStyle = R ? `background:${theme.dark};` : "";
  const sectionAltClass = R ? "" : "bg-accent";
  const dividerStyle = R ? "border-color: rgba(255,255,255,0.08);" : "";
  const radiusOverride = isB ? "0px" : theme.radius;
  const primaryColor = isB ? "#fe4900" : theme.primary;
  const btnGradient = isB
    ? "linear-gradient(90deg, #fe4900, #fdbe03)"
    : "linear-gradient(90deg, #fdbe03, #fe4900)";

  const sectionHeading = (overline: string, title: string, center = true) => `
    <p class="text-xs uppercase tracking-widest font-semibold mb-2 ${center ? "text-center" : ""}" style="color:var(--primary);">${escapeHtml(overline)}</p>
    <h2 class="text-3xl font-semibold mb-3 font-display gradient-text ${center ? "text-center" : ""}">${escapeHtml(title)}</h2>
    ${R ? `<div class="${center ? "mx-auto" : ""} w-12 h-[2px] mb-8" style="background:var(--primary);"></div>` : ""}
  `;

  const navLinks: [string, string][] = [
    ["#top", "Home"],
    ["#about", "About Us"],
    ["#featured", "Menu"],
    ["#contact", "Contact"],
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": schemaTypeFor(themeKey),
    name: lead.name,
    address: lead.address,
    telephone: lead.phone ?? undefined,
    url: lead.mapsUrl,
    aggregateRating:
      lead.rating != null
        ? { "@type": "AggregateRating", ratingValue: lead.rating, reviewCount: lead.reviewCount }
        : undefined,
  };

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
<script type="application/ld+json">${JSON.stringify(schema)}</script>
${theme.googleFontsUrl ? `<link rel="preconnect" href="https://fonts.googleapis.com"><link href="${theme.googleFontsUrl}" rel="stylesheet">` : ""}
<script src="https://cdn.tailwindcss.com"></script>
<style>
  html { scroll-behavior: smooth; }
  body { font-family: ${theme.fontBody}; }
  h1, h2, h3, .font-display { font-family: ${theme.fontHeading}; }
  :root {
    --primary: ${primaryColor}; --accent: ${theme.accent}; --dark: ${theme.dark}; --text: ${theme.text}; --radius: ${radiusOverride};
  }
  .btn-primary { background: ${btnGradient}; ${R ? "color:#0d0c0a;" : "color:#fff;"} }
  .gradient-text {
    background: linear-gradient(90deg, var(--primary), ${R ? theme.text : "#334155"} 140%);
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }
  .text-primary { color: var(--primary); }
  .bg-accent { background: var(--accent); }
  .bg-dark { background: var(--dark); }
  .r-card { border-radius: var(--radius); }
  .reveal { opacity: 0; transform: translateY(24px); transition: opacity .7s ease, transform .7s ease; }
  .reveal.show { opacity: 1; transform: translateY(0); }
  .hover-scale { transition: transform .35s ease; }
  .hover-scale:hover { transform: scale(1.04); }
  .glass { background: rgba(0,0,0,0.35); backdrop-filter: blur(10px); }
  .float-btn { box-shadow: 0 10px 25px rgba(0,0,0,0.25); transition: transform .2s ease; }
  .float-btn:hover { transform: scale(1.08); }
  @keyframes pulseDot {
    0% { box-shadow: 0 0 0 0 rgba(254,73,0,0.6); }
    70% { box-shadow: 0 0 0 8px rgba(254,73,0,0); }
    100% { box-shadow: 0 0 0 0 rgba(254,73,0,0); }
  }
  .pulse-dot { animation: pulseDot 2s infinite; }
  .nav-cta {
    background-image: ${btnGradient};
    background-size: 200% 100%;
    background-position: 0% 0%;
    transition: background-position .4s ease, transform .2s ease;
  }
  .nav-cta:hover {
    background-position: 100% 0%;
    transform: scale(1.04);
  }
  ${theme.playful ? `
  @keyframes floaty { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-14px) rotate(8deg); } }
  .sprinkle { position: absolute; animation: floaty 4s ease-in-out infinite; opacity: 0.7; }
  ` : `
  .parallax { background-attachment: fixed; }
  `}
  .accordion-content { max-height: 0; overflow: hidden; transition: max-height .3s ease; }
  .accordion.open .accordion-content { max-height: 300px; }
  .accordion.open .chevron { transform: rotate(180deg); }
  .chevron { transition: transform .3s ease; }
</style>
</head>
<body class="${bodyClass}" style="${bodyStyle}">

${theme.playful ? `
<div class="sprinkle text-3xl" style="top:8%; left:6%;">🍨</div>
<div class="sprinkle text-2xl" style="top:14%; right:8%; animation-delay:1s;">🍦</div>
<div class="sprinkle text-2xl" style="top:24%; left:14%; animation-delay:2s;">🍭</div>
` : ""}

<!-- Sticky Nav -->
<nav class="fixed top-0 left-0 right-0 z-50 glass text-white">
  <div class="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
    <div>
      <a href="#top" class="font-display font-bold text-lg tracking-tight block">${escapeHtml(lead.name)}</a>
      ${R ? `<span class="text-[10px] uppercase tracking-widest" style="color:var(--primary);">${escapeHtml(lead.category)}</span>` : ""}
    </div>
    <div class="hidden sm:flex items-center gap-6 text-sm">
      ${navLinks.map(([href, label]) => `<a href="${href}" class="hover:opacity-80">${escapeHtml(label)}</a>`).join("")}
    </div>
    <a href="#reserve" class="nav-cta text-sm font-medium px-4 py-2 r-card" style="color:${R ? "#0d0c0a" : "#fff"};">${theme.labels.reserveCta}</a>
  </div>
</nav>

<!-- Hero -->
<header id="top" class="relative pt-16" style="background:var(--dark);">
  ${heroImage
    ? `<img src="${heroImage}" alt="${escapeHtml(lead.name)}" class="w-full h-[85vh] object-cover opacity-45 blur-sm scale-105 ${theme.playful ? "" : "parallax"}" />`
    : `<div class="w-full h-[85vh]" style="background: radial-gradient(circle at 30% 20%, ${theme.primary}33, transparent 55%), radial-gradient(circle at 80% 80%, ${theme.primary}22, transparent 50%), ${theme.dark};"></div>`}
  <div class="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pt-16">
    ${R ? `<span class="inline-flex items-center gap-2.5 border border-white/20 rounded-full px-5 py-2 text-sm sm:text-base uppercase tracking-widest mb-6" style="color:var(--primary);"><span class="w-2 h-2 rounded-full pulse-dot" style="background:var(--primary);"></span>${escapeHtml(lead.category)} · ${escapeHtml(lead.address.split(",")[0])}</span>` : ""}
    <h1 class="text-white text-4xl sm:text-6xl font-bold tracking-tight drop-shadow font-display gradient-text uppercase">${escapeHtml(lead.name)}</h1>
    <p class="text-white/90 text-lg sm:text-xl mt-4 max-w-xl">${escapeHtml(content.tagline)}</p>
    ${!R ? `<p class="text-white/70 text-sm mt-2 uppercase tracking-widest">${escapeHtml(lead.category)}</p>` : ""}
    <div class="mt-8 flex flex-wrap gap-3 justify-center">
      ${wa ? `<a href="https://wa.me/${waNum}?text=${encodeURIComponent(`Hi ${lead.name}, I'd like to place an order for pickup/delivery.`)}" target="_blank" class="px-6 py-3 r-card font-medium btn-primary hover-scale">Order Now</a>` : ""}
      <a href="#reserve" class="px-6 py-3 r-card ${wa ? "bg-white/10 text-white border border-white/40" : "font-medium btn-primary"} hover-scale">Reservation</a>
      ${wa ? `<a href="https://wa.me/${waNum}?text=${encodeURIComponent(`Hi ${lead.name}, I'd like to ask about hosting a private event.`)}" target="_blank" class="px-6 py-3 r-card bg-white/10 text-white font-medium border border-white/40 hover-scale">Private Events</a>` : ""}
    </div>
    ${R ? `<div class="w-16 h-[1px] bg-white/20 my-6"></div>` : ""}
    <div class="flex flex-wrap gap-4 sm:gap-8 justify-center items-center text-white/80 text-xs">
      ${lead.rating ? `<span class="flex items-center gap-1">${starsHtml(filledStars)} <span class="ml-1">${lead.rating} / 5</span></span>` : ""}
      ${lead.reviewCount ? `<span>${lead.reviewCount}+ Google Reviews</span>` : ""}
      ${content.highlights.slice(0, 2).map((h) => `<span>${escapeHtml(h)}</span>`).join("")}
    </div>
  </div>
</header>

${R ? `
<!-- Why Choose Us -->
<section class="max-w-6xl mx-auto px-6 py-20 reveal">
  ${sectionHeading("An Experience Apart", "Why Guests Keep Coming Back")}
  <div class="grid sm:grid-cols-3 gap-6">
    ${content.highlights.slice(0, 3).map((h, i) => `
    <div class="r-card p-6 hover-scale" style="${cardStyle}">
      <div class="w-10 h-10 rounded-lg flex items-center justify-center text-lg mb-4" style="background:rgba(201,162,75,0.15); color:var(--primary);">${["🍽️", "🍷", "🤝"][i % 3]}</div>
      <h3 class="font-semibold text-lg mb-2 font-display">${escapeHtml(h)}</h3>
      <p class="text-sm" style="${mutedStyle}">${["Classic technique, quality ingredients.", "An atmosphere made for lingering.", "Attentive, genuine hospitality."][i % 3]}</p>
    </div>`).join("")}
  </div>
</section>` : ""}

<!-- Our Philosophy -->
${philosophyImage ? `
<section class="max-w-6xl mx-auto px-6 py-20 grid sm:grid-cols-2 gap-10 items-center reveal">
  <img src="${philosophyImage}" class="w-full h-72 sm:h-96 object-cover r-card" alt="${escapeHtml(lead.name)}" />
  <div>
    <p class="text-xs uppercase tracking-widest font-semibold mb-2" style="color:var(--primary);">Our Philosophy</p>
    <h2 class="text-3xl font-semibold mb-4 font-display">${escapeHtml(content.philosophyHeading)}</h2>
    ${R ? `<div class="w-12 h-[2px] mb-5" style="background:var(--primary);"></div>` : ""}
    <p class="leading-relaxed ${mutedClass}" style="${mutedStyle}">${escapeHtml(content.philosophyText)}</p>
  </div>
</section>` : ""}

<!-- About -->
<section id="about" class="max-w-6xl mx-auto px-6 py-20 grid sm:grid-cols-5 gap-10 reveal">
  <div class="sm:col-span-3">
    <p class="text-xs uppercase tracking-widest font-semibold mb-2" style="color:var(--primary);">Our Story</p>
    <h2 class="text-3xl font-semibold mb-3 font-display">${escapeHtml(lead.name)}</h2>
    ${R ? `<div class="w-12 h-[2px] mb-6" style="background:var(--primary);"></div>` : ""}
    <p class="leading-relaxed mb-6 ${mutedClass}" style="${mutedStyle}">${escapeHtml(content.aboutUs)}</p>
    ${!R ? `
    <div class="grid sm:grid-cols-2 gap-3">
      ${content.highlights.map((h) => `
      <div class="flex items-start gap-2">
        <span class="text-primary mt-0.5">✓</span>
        <span class="text-sm text-slate-700">${escapeHtml(h)}</span>
      </div>`).join("")}
    </div>` : `
    <blockquote class="r-card p-6 mt-6" style="${cardStyle}">
      <p class="text-xl mb-2" style="color:var(--primary);">"</p>
      <p class="italic" style="${mutedStyle}">${escapeHtml(content.tagline)}</p>
    </blockquote>`}
  </div>
  <div class="sm:col-span-2 r-card p-6 h-fit" style="${R ? cardStyle : "background:var(--accent);"}">
    <p class="text-xs uppercase tracking-widest font-semibold mb-3" style="color:var(--primary);">Hours</p>
    <table class="w-full text-sm">
      ${lead.openingHours.length > 0
        ? lead.openingHours
            .map((line) => {
              const [day, hours] = splitHoursLine(line);
              return `<tr style="border-bottom:1px solid ${R ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"};"><td class="py-1.5 font-medium">${escapeHtml(day)}</td><td class="py-1.5 text-right" style="${mutedStyle}">${escapeHtml(hours)}</td></tr>`;
            })
            .join("")
        : `<tr><td class="py-1.5" style="${mutedStyle}">Hours not listed — contact us</td></tr>`}
    </table>
    <div class="mt-5 pt-4 text-sm" style="border-top:1px solid ${R ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)"};">
      <p class="font-medium">${escapeHtml(lead.address)}</p>
      ${lead.phone ? `<a href="tel:${lead.phone}" class="block mt-1" style="color:var(--primary);">${escapeHtml(lead.phone)}</a>` : ""}
    </div>
  </div>
</section>

<!-- Digital Menu -->
<section id="featured" class="py-20 reveal ${!R ? "bg-accent" : ""}" style="${sectionAltStyle}">
  <div class="max-w-6xl mx-auto px-6">
    ${sectionHeading(R ? "Flavour & Tradition" : theme.labels.featured, "MENU")}
    ${menuSections.length > 0 ? `
    <div class="space-y-12">
      ${menuSections.map((section) => `
      <div>
        ${section.category ? `<h3 class="text-xl font-semibold mb-5 font-display" style="color:var(--primary);">${escapeHtml(section.category)}</h3>` : ""}
        <div class="grid sm:grid-cols-2 gap-4">
          ${section.items.map((item) => `
          <div class="flex items-baseline justify-between gap-4 r-card p-4" style="${cardStyle}${!R ? "background:#fff;" : ""}">
            <div class="min-w-0">
              <p class="font-medium font-display">${escapeHtml(item.name)}</p>
              ${item.description ? `<p class="text-xs mt-0.5" style="${mutedStyle}">${escapeHtml(item.description)}</p>` : ""}
            </div>
            ${item.price ? `<span class="font-semibold whitespace-nowrap" style="color:var(--primary);">$${escapeHtml(item.price)}</span>` : ""}
          </div>`).join("")}
        </div>
      </div>`).join("")}
    </div>
    <p class="text-xs text-center mt-8" style="${mutedStyle}">Menu current as of your last update — prices and availability may change.</p>
    ` : R ? `
    <div class="flex flex-wrap gap-2 justify-center mb-10">
      ${["Starters", "Mains", "Desserts"].map((tab, i) => `
      <button type="button" onclick="showTab(${i})" id="tab-btn-${i}" class="menu-tab-btn text-xs uppercase tracking-wide px-5 py-2 rounded-full border ${i === 0 ? "font-semibold" : ""}" style="${i === 0 ? "background:var(--primary); color:#0d0c0a; border-color:var(--primary);" : "border-color:rgba(255,255,255,0.2); color:rgba(255,255,255,0.7);"}">${tab}</button>`).join("")}
    </div>
    ${["Starters", "Mains", "Desserts"].map((tab, i) => `
    <div id="tab-${i}" class="menu-tab grid sm:grid-cols-2 gap-5" style="${i === 0 ? "" : "display:none;"}">
      ${content.highlights.slice(0, 4).map((h, j) => (j % 3 === i ? `
      <div class="r-card p-5 flex items-center justify-between" style="${cardStyle}">
        <div>
          <p class="font-semibold font-display">${escapeHtml(h)}</p>
          <p class="text-xs mt-1" style="${mutedStyle}">Ask your server for today's preparation.</p>
        </div>
      </div>` : "")).join("") || `<p class="text-sm sm:col-span-2 text-center" style="${mutedStyle}">Ask us about our ${tab.toLowerCase()} selection.</p>`}
    </div>`).join("")}
    <p class="text-xs text-center mt-8" style="${mutedStyle}">Menu items, availability, and pricing vary — please ask our team for current details.</p>
    ${lead.website ? `<div class="text-center mt-4"><a href="${lead.website}" target="_blank" class="inline-block px-6 py-3 r-card font-medium border" style="border-color:var(--primary); color:var(--primary);">View Full Menu ↗</a></div>` : ""}
    ` : `
    <div class="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
      ${content.highlights.map((h, i) => `
      <div class="${cardClass} r-card p-5 hover-scale" style="${cardStyle}">
        <div class="text-2xl mb-3">${theme.playful ? ["🍦", "🍨", "🍧", "🍫"][i % 4] : ["🍽️", "🍷", "👨‍🍳", "⭐"][i % 4]}</div>
        <p class="font-medium">${escapeHtml(h)}</p>
      </div>`).join("")}
    </div>
    ${lead.website
      ? `<div class="text-center mt-6"><a href="${lead.website}" target="_blank" class="inline-block px-6 py-3 rounded-lg font-medium text-white" style="background:var(--primary);">View Full Menu ↗</a></div>`
      : `<p class="text-xs text-slate-500 mt-6">Ask us about our full current menu in person or by phone.</p>`}
    `}
  </div>
</section>

<!-- Stats -->
<section class="py-16 reveal" style="background:${theme.dark}; color:${theme.text};">
  <div class="max-w-5xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
    ${lead.rating ? `<div><p class="text-3xl font-bold font-display" style="color:var(--primary);">${lead.rating}★</p><p class="text-xs uppercase tracking-widest mt-1" style="opacity:.6;">Google Rating</p></div>` : ""}
    ${lead.reviewCount ? `<div><p class="text-3xl font-bold font-display" style="color:var(--primary);">${lead.reviewCount}+</p><p class="text-xs uppercase tracking-widest mt-1" style="opacity:.6;">Reviews</p></div>` : ""}
    ${menuItemCount > 0 ? `<div><p class="text-3xl font-bold font-display" style="color:var(--primary);">${menuItemCount}+</p><p class="text-xs uppercase tracking-widest mt-1" style="opacity:.6;">Menu Items</p></div>` : ""}
    ${diningBadges.length > 0 ? `<div><p class="text-3xl font-bold font-display" style="color:var(--primary);">${diningBadges.length}</p><p class="text-xs uppercase tracking-widest mt-1" style="opacity:.6;">Dining Options</p></div>` : ""}
  </div>
</section>

<!-- Reviews -->
<section id="reviews" class="py-20 text-center reveal" style="background:${theme.dark};">
  <p class="text-xs uppercase tracking-widest font-semibold mb-2" style="color:var(--primary);">Reviews</p>
  <h2 class="text-3xl font-semibold mb-4 font-display" style="color:${theme.text};">Words from Our Guests</h2>
  <div class="text-3xl mb-2">${starsHtml(filledStars)}</div>
  <p style="color:${theme.text}; opacity:.8;">${lead.rating ?? "—"} out of 5 · ${lead.reviewCount} Google reviews</p>

  ${lead.realReviews && lead.realReviews.length > 0 ? `
  <div class="max-w-5xl mx-auto px-6 mt-10 grid sm:grid-cols-3 gap-5 text-left">
    ${lead.realReviews.map((r) => {
      const snippet = r.text.length > 220 ? r.text.slice(0, 220).trim() + "…" : r.text;
      const initial = (r.authorName || "G").trim().charAt(0).toUpperCase();
      return `
    <div class="r-card p-5" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09);">
      <div class="mb-2 text-sm">${starsHtml(Math.round(r.rating))}</div>
      <p class="text-sm mb-4" style="color:${theme.text}; opacity:.85;">"${escapeHtml(snippet)}"</p>
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold" style="background:var(--primary); color:#0d0c0a;">${escapeHtml(initial)}</div>
        <div>
          <p class="text-xs font-medium" style="color:${theme.text};">${escapeHtml(r.authorName)}</p>
          <p class="text-[11px]" style="color:${theme.text}; opacity:.5;">${escapeHtml(r.relativeTime || "Google review")}</p>
        </div>
      </div>
    </div>`;
    }).join("")}
  </div>
  <p class="text-[11px] mt-4" style="color:${theme.text}; opacity:.4;">Real reviews via Google.</p>
  ` : ""}

  <a href="${lead.mapsUrl}" target="_blank" class="inline-block mt-6 text-sm font-medium underline underline-offset-4" style="color:var(--primary);">Read more reviews on Google →</a>
</section>

<!-- Reservation / Order -->
<section id="reserve" class="py-20 reveal" style="${R ? `background:${theme.dark};` : "background:var(--accent);"}">
  <div class="max-w-5xl mx-auto px-6 grid sm:grid-cols-2 gap-10 items-start">
    <div>
      <p class="text-xs uppercase tracking-widest font-semibold mb-2" style="color:var(--primary);">${theme.labels.reserveCta}</p>
      <h2 class="text-3xl font-semibold mb-3 font-display">A Table Awaits</h2>
      ${R ? `<div class="w-12 h-[2px] mb-5" style="background:var(--primary);"></div>` : ""}
      <p class="mb-6 text-sm" style="${mutedStyle}">${wa ? "Fill in the form to send your request straight to our team via WhatsApp." : "Fill in your details and we'll get in touch."}</p>
      <div class="space-y-4 text-sm">
        <div class="flex items-center gap-3"><span style="color:var(--primary);">📍</span><a href="${lead.mapsUrl}" target="_blank">${escapeHtml(lead.address)}</a></div>
        ${lead.phone ? `<div class="flex items-center gap-3"><span style="color:var(--primary);">📞</span><a href="tel:${lead.phone}">${escapeHtml(lead.phone)}</a></div>` : ""}
        ${lead.openingHours[0] ? `<div class="flex items-center gap-3"><span style="color:var(--primary);">🕒</span><span>${escapeHtml(lead.openingHours[0])}</span></div>` : ""}
      </div>
    </div>
    <div>
      <div class="flex gap-2 mb-5">
        <button type="button" id="mode-reservation" onclick="setMode('reservation')" class="flex-1 py-2 r-card text-sm font-medium btn-primary">Reservation</button>
        <button type="button" id="mode-order" onclick="setMode('order')" class="flex-1 py-2 r-card text-sm font-medium" style="${R ? "background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.15); color:#fff;" : "background:#fff; border:1px solid #cbd5e1;"}">Order / Question</button>
      </div>
      <form id="reserve-form" class="space-y-4 r-card p-6" style="${cardStyle}${!R ? "background:#fff; box-shadow:0 1px 2px rgba(0,0,0,0.05);" : ""}">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-sm block mb-1" style="${mutedStyle}">Full name</label>
            <input id="f-name" required class="w-full rounded-md px-3 py-2 text-sm ${inputClass}" placeholder="Jane Doe" />
          </div>
          <div>
            <label class="text-sm block mb-1" style="${mutedStyle}">Phone</label>
            <input id="f-phone" type="tel" class="w-full rounded-md px-3 py-2 text-sm ${inputClass}" placeholder="(555) 123-4567" />
          </div>
        </div>

        <div id="reservation-fields" class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-sm block mb-1" style="${mutedStyle}">Guests</label>
              <select id="f-guests" class="w-full rounded-md px-3 py-2 text-sm ${inputClass}">
                ${[1, 2, 3, 4, 5].map((n) => `<option value="${n}" ${n === 2 ? "selected" : ""}>${n} Guest${n === 1 ? "" : "s"}</option>`).join("")}
                <option value="6+">6+ Guests (Group)</option>
              </select>
            </div>
            <div>
              <label class="text-sm block mb-1" style="${mutedStyle}">Time</label>
              <input id="f-time" type="time" value="19:00" class="w-full rounded-md px-3 py-2 text-sm ${inputClass}" />
            </div>
          </div>
          <div>
            <label class="text-sm block mb-1" style="${mutedStyle}">Date</label>
            <input id="f-date" type="date" class="w-full rounded-md px-3 py-2 text-sm ${inputClass}" />
          </div>
        </div>

        <div>
          <label class="text-sm block mb-1" style="${mutedStyle}">Special requests / allergies</label>
          <textarea id="f-note" rows="3" class="w-full rounded-md px-3 py-2 text-sm ${inputClass}" placeholder="Allergies, special occasion, seating preference..."></textarea>
        </div>

        <button type="submit" class="w-full btn-primary font-medium py-3 r-card hover-scale">
          ${wa ? "Send via WhatsApp" : "Submit"}
        </button>
        <p class="text-xs text-center" style="${mutedStyle}">This mockup sends requests via WhatsApp — no bookings are actually processed by this demo site.</p>
      </form>
    </div>
  </div>
</section>

<!-- FAQ -->
<section class="max-w-3xl mx-auto px-6 py-20 reveal">
  ${sectionHeading("Useful Info", "Frequently Asked Questions")}
  <div class="space-y-3">
    ${content.faq.map((f, i) => `
    <div class="accordion r-card overflow-hidden" style="${cardStyle}${!R ? "background:var(--accent);" : ""}">
      <button type="button" onclick="this.parentElement.classList.toggle('open')" class="w-full text-left px-5 py-4 flex items-center justify-between">
        <span class="font-medium">${escapeHtml(f.question)}</span>
        <span class="chevron" style="color:var(--primary);">▾</span>
      </button>
      <div class="accordion-content px-5">
        <p class="pb-4 text-sm" style="${mutedStyle}">${escapeHtml(f.answer)}</p>
      </div>
    </div>`).join("")}
  </div>
</section>

<!-- Contact / Map -->
<section id="contact" class="max-w-4xl mx-auto px-6 py-20 text-center reveal">
  <div class="text-3xl mb-3" style="color:var(--primary);">📍</div>
  ${sectionHeading("Find Us", lead.address)}
  <a href="${lead.mapsUrl}" target="_blank" class="inline-block px-6 py-3 r-card font-medium btn-primary hover-scale">Get Directions</a>
</section>

<!-- Final CTA -->
<section class="relative reveal">
  ${finalCtaImage
    ? `<img src="${finalCtaImage}" class="w-full h-[50vh] object-cover opacity-40" alt="${escapeHtml(lead.name)}" style="background:${theme.dark};" />`
    : `<div class="w-full h-[50vh]" style="background:${theme.dark};"></div>`}
  <div class="absolute inset-0 flex flex-col items-center justify-center text-center px-6" style="background:${theme.dark}66;">
    <h2 class="text-3xl sm:text-4xl font-bold font-display" style="color:${theme.text};">${escapeHtml(content.finalCtaHeading)}</h2>
    <a href="#reserve" class="mt-6 inline-block px-8 py-3 r-card font-medium btn-primary hover-scale">Book Your Table</a>
  </div>
</section>

<!-- Footer -->
<footer class="pt-16 pb-8" style="background:${theme.dark}; color:${theme.text};">
  <div class="max-w-6xl mx-auto px-6 grid sm:grid-cols-4 gap-10 text-sm">
    <div>
      <p class="font-display font-bold text-lg mb-3">${escapeHtml(lead.name)}</p>
      <p style="opacity:.7;">${escapeHtml(content.tagline)}</p>
    </div>
    <div>
      <p class="text-xs uppercase tracking-widest font-semibold mb-3" style="color:var(--primary);">Navigation</p>
      <ul class="space-y-2" style="opacity:.8;">
        ${navLinks.map(([href, label]) => `<li><a href="${href}">${escapeHtml(label)}</a></li>`).join("")}
      </ul>
    </div>
    <div>
      <p class="text-xs uppercase tracking-widest font-semibold mb-3" style="color:var(--primary);">Contact</p>
      <p style="opacity:.8;">${escapeHtml(lead.address)}</p>
      ${lead.phone ? `<a href="tel:${lead.phone}" class="block mt-1" style="opacity:.8;">${escapeHtml(lead.phone)}</a>` : ""}
      ${diningBadges.length > 0 ? `
      <div class="flex flex-wrap gap-1.5 mt-3">
        ${diningBadges.map((b) => `<span class="text-[10px] uppercase tracking-wide border rounded-full px-2 py-0.5" style="border-color:rgba(255,255,255,0.2); opacity:.75;">${escapeHtml(b)}</span>`).join("")}
      </div>` : ""}
    </div>
    <div>
      <p class="text-xs uppercase tracking-widest font-semibold mb-3" style="color:var(--primary);">${theme.labels.reserveCta}</p>
      <p class="mb-3" style="opacity:.8;">Reach out directly and we'll take care of the rest.</p>
      ${wa ? `<a href="${wa}" target="_blank" class="inline-flex items-center gap-2 btn-primary text-xs font-medium px-4 py-2 r-card">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.42-1.36a9.9 9.9 0 0 0 4.62 1.13h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2Zm5.79 13.98c-.24.68-1.4 1.3-1.93 1.36-.53.06-1.02.31-3.43-.72-2.9-1.24-4.76-4.17-4.9-4.36-.14-.19-1.16-1.55-1.16-2.96 0-1.4.74-2.09 1-2.38.26-.28.57-.35.76-.35.19 0 .38 0 .55.01.18.01.42-.07.65.5.24.58.81 2 0.88 2.14.07.14.12.31.02.5-.09.19-.14.31-.28.47-.14.16-.29.36-.42.48-.14.14-.28.29-.12.57.16.28.71 1.17 1.52 1.9 1.05.94 1.93 1.23 2.21 1.37.28.14.44.12.61-.07.16-.19.7-.81.89-1.09.19-.28.38-.23.63-.14.26.09 1.63.77 1.91.91.28.14.47.21.54.33.07.12.07.68-.17 1.36Z"/></svg>
        WhatsApp Direct
      </a>` : ""}
    </div>
  </div>
  <div class="max-w-6xl mx-auto px-6 mt-10 pt-6 flex flex-wrap items-center justify-between gap-3 text-xs" style="border-top:1px solid rgba(255,255,255,0.08); opacity:.6;">
    <span>© ${new Date().getFullYear()} ${escapeHtml(lead.name)}. All rights reserved.</span>
    <div class="flex gap-4">
      ${lead.socialLinks?.instagram ? `<a href="${lead.socialLinks.instagram}" target="_blank">Instagram</a>` : ""}
      ${lead.socialLinks?.facebook ? `<a href="${lead.socialLinks.facebook}" target="_blank">Facebook</a>` : ""}
      <a href="#top">Back to top ↑</a>
    </div>
  </div>
  <p class="text-center text-xs mt-6" style="opacity:.4;">Website mockup generated for demo purposes.</p>
</footer>

<!-- Floating action buttons -->
<div class="fixed bottom-5 right-5 z-50 flex flex-col gap-3 items-end">
  ${wa ? `<a href="${wa}" target="_blank" class="float-btn bg-[#25D366] text-white rounded-full w-12 h-12 flex items-center justify-center text-xl">💬</a>` : ""}
  ${lead.phone ? `<a href="tel:${lead.phone}" class="float-btn btn-primary rounded-full w-12 h-12 flex items-center justify-center text-lg">📞</a>` : ""}
</div>

<script>
  let mode = 'reservation';
  function setMode(m) {
    mode = m;
    document.getElementById('reservation-fields').style.display = m === 'reservation' ? 'block' : 'none';
    const activeStyle = 'flex-1 py-2 r-card text-sm font-medium btn-primary';
    const inactiveStyle = 'flex-1 py-2 r-card text-sm font-medium';
    const resBtn = document.getElementById('mode-reservation');
    const ordBtn = document.getElementById('mode-order');
    resBtn.className = m === 'reservation' ? activeStyle : inactiveStyle;
    ordBtn.className = m === 'order' ? activeStyle : inactiveStyle;
    resBtn.style.cssText = m === 'reservation' ? '' : (${JSON.stringify(R
      ? "background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.15); color:#fff;"
      : "background:#fff; border:1px solid #cbd5e1;")});
    ordBtn.style.cssText = m === 'order' ? '' : (${JSON.stringify(R
      ? "background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.15); color:#fff;"
      : "background:#fff; border:1px solid #cbd5e1;")});
  }

  function showTab(i) {
    document.querySelectorAll('.menu-tab').forEach((el, idx) => { el.style.display = idx === i ? 'grid' : 'none'; });
    document.querySelectorAll('.menu-tab-btn').forEach((btn, idx) => {
      if (idx === i) {
        btn.style.background = 'var(--primary)'; btn.style.color = '#0d0c0a'; btn.style.borderColor = 'var(--primary)';
      } else {
        btn.style.background = 'transparent'; btn.style.color = 'rgba(255,255,255,0.7)'; btn.style.borderColor = 'rgba(255,255,255,0.2)';
      }
    });
  }

  document.getElementById('reserve-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('f-name').value.trim();
    const phone = document.getElementById('f-phone').value.trim();
    const note = document.getElementById('f-note').value.trim();
    let msg = 'Hi ${escapeHtml(lead.name).replace(/'/g, "\\'")}, ';
    if (mode === 'reservation') {
      const guests = document.getElementById('f-guests').value;
      const date = document.getElementById('f-date').value;
      const time = document.getElementById('f-time').value;
      msg += 'I would like to reserve for ' + guests + ' on ' + (date || '[date]') + ' at ' + (time || '[time]') + '. Name: ' + name + '.';
    } else {
      msg += 'I have a question / order request: ' + (note || '[details]') + '. Name: ' + name + '.';
    }
    if (phone) msg += ' Phone: ' + phone + '.';
    if (mode === 'reservation' && note) msg += ' Note: ' + note;

    ${wa
      ? `window.open('https://wa.me/${waNum}?text=' + encodeURIComponent(msg), '_blank');`
      : `alert('Thanks ' + name + '! Please call us directly to confirm: ${escapeHtml(lead.phone ?? "see contact section")}');`}
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('show'); });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
</script>

</body>
</html>`;
}
