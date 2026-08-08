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
  Array.from({ length: 5 }).map((_, i) => `<span style="color:${i < count ? "#E8A33D" : "#e5ded4"};">★</span>`).join("");

// A third, distinct restaurant style: light and warm (tan/charcoal) rather
// than the dark elegant Style 1/2. Selected via the "Restaurant — Style 3
// (Classic)" option in the template dropdown.
//
// Upgraded to match the polish of the dark "elegant" template: urgency/rating
// badge in the hero, a best-seller spotlight, feature cards, a stats + story
// section, real testimonials, an FAQ accordion, a WhatsApp quick-order flow,
// and floating action buttons — while keeping its own light, warm identity.
export function generateClassicRestaurantHTML(
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
  const menuLinkUrl = originalMenuPhotoUrl || lead.website;

  const menuCarouselHtml = `
    <div class="mt-12 relative max-w-3xl mx-auto">
      <h3 class="text-lg font-semibold mb-3 text-center font-display text-secondary">Photos</h3>
      <div class="overflow-hidden rounded-xl shadow-sm border border-black/5">
        <div id="menu-carousel-track" class="flex transition-transform duration-500" style="transform: translateX(0%);">
          ${galleryImages.map((img) => `<img src="${img}" class="w-full shrink-0 h-64 sm:h-80 object-cover" />`).join("")}
        </div>
      </div>
      ${galleryImages.length > 1 ? `
      <button type="button" onclick="menuCarouselMove(-1)" class="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white" style="background:rgba(0,0,0,0.5);">‹</button>
      <button type="button" onclick="menuCarouselMove(1)" class="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white" style="background:rgba(0,0,0,0.5);">›</button>
      <div class="flex justify-center gap-1.5 mt-3">
        ${galleryImages.map((_, i) => `<span class="menu-carousel-dot w-1.5 h-1.5 rounded-full" data-i="${i}" style="background:${i === 0 ? "var(--primary)" : "rgba(0,0,0,0.15)"};"></span>`).join("")}
      </div>` : ""}
    </div>`;
  const menuItemCount = countMenuItems(menuSections);
  const neighborhood = lead.address.split(",")[0];

  const bestSeller = content.showcaseItems?.[0];

  const dining = lead.diningOptions ?? {};
  const diningBadges = [
    dining.dineIn ? "Dine-In" : null,
    dining.takeout ? "Takeout" : null,
    dining.delivery ? "Delivery" : null,
    dining.outdoorSeating ? "Outdoor Seating" : null,
    dining.servesBeer || dining.servesWine ? "Beer & Wine" : null,
  ].filter(Boolean) as string[];

  const menuHtml =
    menuSections.length > 0
      ? menuSections
          .map(
            (section) => `
        ${section.category ? `<h3 class="text-xl font-semibold text-secondary mb-4 mt-10 first:mt-0">${escapeHtml(section.category)}</h3>` : ""}
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          ${section.items
            .map(
              (it) => `
          <article class="bg-white rounded-xl shadow-sm border border-black/5 p-5 hover:shadow-md hover:-translate-y-0.5 transition">
            <div class="flex items-baseline justify-between gap-3">
              <h4 class="text-lg font-semibold text-secondary">${escapeHtml(it.name)}</h4>
              ${it.price ? `<span class="text-primary font-bold whitespace-nowrap">$${escapeHtml(it.price)}</span>` : ""}
            </div>
            ${it.description ? `<p class="text-gray-600 text-sm mt-2">${escapeHtml(it.description)}</p>` : ""}
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
          <article class="bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition p-6">
            ${item.tag ? `<span class="text-xs uppercase tracking-wide font-semibold text-primary">${escapeHtml(item.tag)}</span>` : ""}
            <h3 class="text-xl font-semibold text-secondary mb-2 mt-1">${escapeHtml(item.name)}</h3>
            <p class="text-gray-600 text-sm">${escapeHtml(item.description)}</p>
          </article>`
            )
            .join("")}
        </div>
        <p class="text-center text-sm text-gray-500 mt-6">Ask us about our full current menu in person or by phone.</p>`;

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
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    html { scroll-behavior: smooth; }
    body { font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    h1, h2, h3, .font-display { font-family: "Fraunces", Georgia, serif; }
    :root { --primary: #C9722D; --primary-dark: #A85A1F; --secondary: #2C2C2C; --cream: #FBF7F1; }
    .text-primary { color: var(--primary); }
    .text-secondary { color: var(--secondary); }
    .bg-primary { background: var(--primary); }
    .bg-secondary { background: var(--secondary); }
    .bg-cream { background: var(--cream); }
    .border-primary { border-color: var(--primary); }
    .btn-primary { background: linear-gradient(90deg, var(--primary), var(--primary-dark)); color: #fff; }
    .reveal { opacity: 0; transform: translateY(20px); transition: opacity .6s ease, transform .6s ease; }
    .reveal.show { opacity: 1; transform: translateY(0); }
    .hover-scale { transition: transform .3s ease; }
    .hover-scale:hover { transform: scale(1.04); }
    .float-btn { box-shadow: 0 10px 25px rgba(0,0,0,0.2); transition: transform .2s ease; }
    .float-btn:hover { transform: scale(1.08); }
    @keyframes pulseDot {
      0% { box-shadow: 0 0 0 0 rgba(201,114,45,0.55); }
      70% { box-shadow: 0 0 0 8px rgba(201,114,45,0); }
      100% { box-shadow: 0 0 0 0 rgba(201,114,45,0); }
    }
    .pulse-dot { animation: pulseDot 2s infinite; }
    .accordion-content { max-height: 0; overflow: hidden; transition: max-height .3s ease; }
    .accordion.open .accordion-content { max-height: 300px; }
    .accordion.open .chevron { transform: rotate(180deg); }
    .chevron { transition: transform .3s ease; }
  </style>
</head>

<body class="bg-cream text-gray-900 antialiased">

  <!-- ====================== HEADER / NAV ====================== -->
  <header class="sticky top-0 z-40 bg-cream/90 backdrop-blur border-b border-black/5">
    <nav class="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:px-8">
      <a href="#hero" class="text-xl font-semibold text-secondary font-display">
        ${escapeHtml(lead.name)}
      </a>

      <ul class="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-700">
        <li><a href="#hero" class="hover:text-primary transition">Home</a></li>
        <li><a href="#menu" class="hover:text-primary transition">Menu</a></li>
        <li><a href="#about" class="hover:text-primary transition">About</a></li>
        <li><a href="#reviews" class="hover:text-primary transition">Reviews</a></li>
        <li><a href="#contact" class="hover:text-primary transition">Contact</a></li>
      </ul>

      <div class="hidden md:block">
        <a href="#contact" class="btn-primary text-sm font-medium px-4 py-2 rounded-lg hover-scale">${wa ? "Order Now" : "Contact Us"}</a>
      </div>

      <button id="mobile-menu-btn" class="md:hidden flex items-center focus:outline-none" aria-label="Toggle menu">
        <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
    </nav>

    <div id="mobile-menu" class="hidden md:hidden bg-cream border-t border-black/5">
      <ul class="flex flex-col space-y-1 p-4 text-base font-medium text-gray-700">
        <li><a href="#hero" class="block py-1.5 hover:text-primary">Home</a></li>
        <li><a href="#menu" class="block py-1.5 hover:text-primary">Menu</a></li>
        <li><a href="#about" class="block py-1.5 hover:text-primary">About</a></li>
        <li><a href="#reviews" class="block py-1.5 hover:text-primary">Reviews</a></li>
        <li><a href="#contact" class="block py-1.5 hover:text-primary">Contact</a></li>
      </ul>
    </div>
  </header>

  <!-- ====================== HERO ====================== -->
  <section id="hero" class="relative bg-cover bg-center bg-no-repeat" style="${heroImage ? `background-image: url('${heroImage}');` : "background: linear-gradient(135deg, #C9722D, #2C2C2C);"}">
    <div class="absolute inset-0" style="background: linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.6));"></div>
    <div class="max-w-3xl mx-auto text-center px-4 py-28 sm:py-36 relative z-10">
      <span class="inline-flex items-center gap-2 bg-white/10 border border-white/25 text-white rounded-full px-4 py-1.5 text-xs sm:text-sm uppercase tracking-widest mb-6 backdrop-blur-sm">
        <span class="w-1.5 h-1.5 rounded-full pulse-dot" style="background:var(--primary);"></span>
        ${escapeHtml(lead.category)}${neighborhood ? ` · ${escapeHtml(neighborhood)}` : ""}
      </span>
      <h1 class="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg leading-tight">
        ${escapeHtml(lead.name)}
      </h1>
      <p class="text-lg md:text-xl text-white/90 mb-6 drop-shadow-md max-w-xl mx-auto">
        ${escapeHtml(content.tagline)}
      </p>
      ${lead.rating ? `<div class="flex items-center justify-center gap-2 mb-8 text-white/90 text-sm">
        <span class="text-lg">${starsHtml(filledStars)}</span>
        <span>${lead.rating} / 5${lead.reviewCount ? ` &middot; ${lead.reviewCount}+ reviews` : ""}</span>
      </div>` : ""}
      <div class="flex flex-wrap gap-3 justify-center">
        ${wa ? `<a href="#order-grab" class="btn-primary font-semibold py-3 px-6 rounded-lg hover-scale">Order Now</a>` : ""}
        <a href="#menu" class="inline-block bg-white/10 border border-white/40 text-white font-semibold py-3 px-6 rounded-lg hover:bg-white/20 transition">
          View Menu
        </a>
      </div>
    </div>
  </section>

  ${wa ? `
  <!-- ====================== QUICK ORDER ====================== -->
  <section id="order-grab" class="py-12 bg-white border-b border-black/5 reveal">
    <div class="max-w-md mx-auto px-4 text-center">
      <p class="text-xs uppercase tracking-widest font-semibold mb-2 text-primary">Quick Order</p>
      <h2 class="text-2xl font-semibold mb-4 font-display text-secondary">Order &amp; Grab</h2>
      <div class="flex flex-col gap-3">
        <textarea id="grab-order-text" rows="3" placeholder="What would you like to order? (e.g. 2x Burgers, 1x Fries...)" class="w-full rounded-lg px-4 py-3 text-sm bg-cream border border-black/10 resize-y"></textarea>
        <button type="button" onclick="sendGrabOrder()" class="btn-primary font-medium py-3.5 rounded-lg w-full hover-scale uppercase tracking-wider text-sm">Send Order ↗</button>
      </div>
      <p class="text-xs mt-2 text-gray-500">Opens WhatsApp with your order typed in — just hit send.</p>
    </div>
  </section>` : ""}

  ${bestSeller ? `
  <!-- ====================== BEST SELLER SPOTLIGHT ====================== -->
  <section class="py-16 bg-secondary reveal">
    <div class="max-w-4xl mx-auto px-4 md:px-8 grid sm:grid-cols-5 gap-8 items-center">
      <div class="sm:col-span-3">
        <span class="text-xs uppercase tracking-widest font-semibold text-primary">${escapeHtml(bestSeller.tag || "Best Seller")}</span>
        <h2 class="text-2xl sm:text-3xl font-semibold mt-2 mb-3 text-white font-display">${escapeHtml(bestSeller.name)}</h2>
        <p class="text-white/70 leading-relaxed">${escapeHtml(bestSeller.description)}</p>
        ${wa ? `<a href="https://wa.me/${waNum}?text=${encodeURIComponent(`Hi ${lead.name}, I'd like to order the ${bestSeller.name}.`)}" target="_blank" class="inline-block mt-5 btn-primary font-medium px-5 py-2.5 rounded-lg hover-scale text-sm">Order This</a>` : ""}
      </div>
      <div class="sm:col-span-2 flex flex-wrap gap-2">
        ${content.highlights.slice(0, 3).map((h) => `<span class="text-xs border border-white/20 text-white/80 rounded-full px-3 py-1.5">${escapeHtml(h)}</span>`).join("")}
      </div>
    </div>
  </section>` : ""}

  <!-- ====================== FEATURES ====================== -->
  ${content.highlights.length > 0 ? `
  <section class="py-16 bg-cream reveal">
    <div class="max-w-6xl mx-auto px-4 md:px-8">
      <h2 class="text-3xl font-bold text-center mb-3 text-secondary font-display">Why Guests Keep Coming Back</h2>
      <p class="text-center text-gray-500 mb-10 max-w-xl mx-auto">${escapeHtml(content.philosophyHeading)}</p>
      <div class="grid sm:grid-cols-3 gap-6">
        ${content.highlights.slice(0, 3).map((h, i) => `
        <div class="bg-white rounded-xl border border-black/5 shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center text-primary font-semibold mb-4" style="background:rgba(201,114,45,0.12);">${["01", "02", "03"][i % 3]}</div>
          <h3 class="font-semibold text-lg mb-2 font-display text-secondary">${escapeHtml(h)}</h3>
          <p class="text-sm text-gray-600">${escapeHtml(content.philosophyText)}</p>
        </div>`).join("")}
      </div>
    </div>
  </section>` : ""}

  <!-- ====================== MENU ====================== -->
  <section id="menu" class="py-16 sm:py-20 bg-white reveal">
    <div class="max-w-7xl mx-auto px-4 md:px-8">
      <p class="text-xs uppercase tracking-widest font-semibold mb-2 text-center text-primary">On the Menu</p>
      <h2 class="text-3xl font-bold text-center mb-10 text-secondary font-display">
        Our Menu
      </h2>
      ${menuHtml}
      ${menuLinkUrl ? `<div class="text-center mt-10"><a href="${menuLinkUrl}" target="_blank" class="inline-block border-2 border-primary text-primary font-semibold py-2.5 px-6 rounded-lg hover:bg-primary hover:text-white transition">${originalMenuPhotoUrl ? "View Original Menu ↗" : "View Full Menu ↗"}</a></div>` : ""}
      ${galleryImages.length > 0 ? menuCarouselHtml : ""}
    </div>
  </section>

  <!-- ====================== STATS ====================== -->
  <section class="py-14 bg-secondary reveal">
    <div class="max-w-5xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
      ${lead.rating ? `<div><p class="text-3xl font-bold font-display text-primary">${lead.rating}★</p><p class="text-xs uppercase tracking-widest mt-1 text-white/60">Google Rating</p></div>` : ""}
      ${lead.reviewCount ? `<div><p class="text-3xl font-bold font-display text-primary">${lead.reviewCount}+</p><p class="text-xs uppercase tracking-widest mt-1 text-white/60">Reviews</p></div>` : ""}
      ${menuItemCount > 0 ? `<div><p class="text-3xl font-bold font-display text-primary">${menuItemCount}+</p><p class="text-xs uppercase tracking-widest mt-1 text-white/60">Menu Items</p></div>` : ""}
      ${diningBadges.length > 0 ? `<div><p class="text-3xl font-bold font-display text-primary">${diningBadges.length}</p><p class="text-xs uppercase tracking-widest mt-1 text-white/60">Dining Options</p></div>` : ""}
    </div>
  </section>

  <!-- ====================== ABOUT / STORY ====================== -->
  <section id="about" class="py-20 bg-cream reveal">
    <div class="max-w-6xl mx-auto px-4 md:px-8 grid sm:grid-cols-2 gap-10 items-center">
      ${storyImage ? `<img src="${storyImage}" class="w-full h-72 sm:h-96 object-cover rounded-xl shadow-sm order-2 sm:order-1" alt="${escapeHtml(lead.name)}" />` : `<div class="order-2 sm:order-1"></div>`}
      <div class="order-1 sm:order-2">
        <p class="text-xs uppercase tracking-widest font-semibold mb-2 text-primary">Our Story</p>
        <h2 class="text-3xl font-bold text-secondary mb-5 font-display">${escapeHtml(lead.name)}</h2>
        <p class="text-lg text-gray-700 leading-relaxed mb-4">
          ${escapeHtml(content.aboutUs)}
        </p>
        <p class="text-gray-600 leading-relaxed mb-6">
          ${escapeHtml(content.secondaryAbout)}
        </p>
        <blockquote class="bg-white rounded-xl border border-black/5 shadow-sm p-5">
          <p class="text-2xl leading-none text-primary mb-1">&ldquo;</p>
          <p class="italic text-gray-700">${escapeHtml(content.philosophyText)}</p>
        </blockquote>
      </div>
    </div>
  </section>

  <!-- ====================== TESTIMONIALS ====================== -->
  <section id="reviews" class="py-20 bg-white text-center reveal">
    <div class="max-w-5xl mx-auto px-4 md:px-8">
      <p class="text-xs uppercase tracking-widest font-semibold mb-2 text-primary">Reviews</p>
      <h2 class="text-3xl font-bold mb-4 text-secondary font-display">What Our Guests Say</h2>
      <div class="text-2xl mb-2">${starsHtml(filledStars)}</div>
      <p class="text-gray-600 mb-10">${lead.rating ?? "—"} out of 5 &middot; ${lead.reviewCount} Google reviews</p>

      ${lead.realReviews && lead.realReviews.length > 0 ? `
      <div class="grid sm:grid-cols-3 gap-5 text-left">
        ${lead.realReviews.map((r) => {
          const snippet = r.text.length > 220 ? r.text.slice(0, 220).trim() + "…" : r.text;
          const initial = (r.authorName || "G").trim().charAt(0).toUpperCase();
          return `
        <div class="bg-cream rounded-xl border border-black/5 p-5">
          <div class="mb-2 text-sm">${starsHtml(Math.round(r.rating))}</div>
          <p class="text-sm mb-4 text-gray-700">"${escapeHtml(snippet)}"</p>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white bg-primary">${escapeHtml(initial)}</div>
            <div>
              <p class="text-xs font-medium text-secondary">${escapeHtml(r.authorName)}</p>
              <p class="text-[11px] text-gray-400">${escapeHtml(r.relativeTime || "Google review")}</p>
            </div>
          </div>
        </div>`;
        }).join("")}
      </div>
      <p class="text-[11px] mt-4 text-gray-400">Real reviews via Google.</p>
      ` : ""}

      <a href="${lead.mapsUrl}" target="_blank" class="inline-block mt-8 text-sm font-medium underline underline-offset-4 text-primary">Read more reviews on Google →</a>
    </div>
  </section>

  <!-- ====================== FAQ ====================== -->
  ${content.faq.length > 0 ? `
  <section class="max-w-3xl mx-auto px-4 md:px-8 py-20 reveal">
    <p class="text-xs uppercase tracking-widest font-semibold mb-2 text-center text-primary">Useful Info</p>
    <h2 class="text-3xl font-bold text-center mb-10 text-secondary font-display">Frequently Asked Questions</h2>
    <div class="space-y-3">
      ${content.faq.map((f) => `
      <div class="accordion bg-white rounded-xl border border-black/5 overflow-hidden">
        <button type="button" onclick="this.parentElement.classList.toggle('open')" class="w-full text-left px-5 py-4 flex items-center justify-between">
          <span class="font-medium text-secondary">${escapeHtml(f.question)}</span>
          <span class="chevron text-primary">▾</span>
        </button>
        <div class="accordion-content px-5">
          <p class="pb-4 text-sm text-gray-600">${escapeHtml(f.answer)}</p>
        </div>
      </div>`).join("")}
    </div>
  </section>` : ""}

  <!-- ====================== CONTACT / ORDER ====================== -->
  <section id="contact" class="py-20 bg-cream reveal">
    <div class="max-w-4xl mx-auto px-4 md:px-8">
      <p class="text-xs uppercase tracking-widest font-semibold mb-2 text-center text-primary">Find Us</p>
      <h2 class="text-3xl font-bold text-center text-secondary mb-10 font-display">Contact Us</h2>

      <div class="grid md:grid-cols-2 gap-8">
        <!-- Contact details -->
        <div class="space-y-4">
          <p class="flex items-center text-gray-800">
            <svg class="w-5 h-5 mr-2 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <a href="${lead.mapsUrl}" target="_blank" class="hover:text-primary">${escapeHtml(lead.address)}</a>
          </p>
          ${lead.phone ? `
          <p class="flex items-center text-gray-800">
            <svg class="w-5 h-5 mr-2 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
            </svg>
            <a href="tel:${lead.phone}" class="hover:text-primary">${escapeHtml(lead.phone)}</a>
          </p>` : ""}
          ${lead.openingHours.length > 0 ? `
          <div class="flex items-start text-gray-800">
            <svg class="w-5 h-5 mr-2 text-primary mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
          ${diningBadges.length > 0 ? `
          <div class="flex flex-wrap gap-1.5 pt-1">
            ${diningBadges.map((b) => `<span class="text-[10px] uppercase tracking-wide border border-black/10 text-gray-500 rounded-full px-2.5 py-1">${escapeHtml(b)}</span>`).join("")}
          </div>` : ""}
          <div class="flex gap-4 pt-2 text-sm">
            ${lead.socialLinks?.instagram ? `<a href="${lead.socialLinks.instagram}" target="_blank" class="text-primary hover:underline">Instagram</a>` : ""}
            ${lead.socialLinks?.facebook ? `<a href="${lead.socialLinks.facebook}" target="_blank" class="text-primary hover:underline">Facebook</a>` : ""}
          </div>
        </div>

        <!-- Reservation / Order CTA -->
        <div class="bg-white rounded-xl border border-black/5 shadow-sm p-6">
          <div class="flex gap-2 mb-5">
            <button type="button" id="mode-reservation" onclick="setMode('reservation')" class="flex-1 py-2 rounded-lg text-sm font-medium btn-primary">Reservation</button>
            <button type="button" id="mode-order" onclick="setMode('order')" class="flex-1 py-2 rounded-lg text-sm font-medium bg-cream border border-black/10 text-secondary">Order / Question</button>
          </div>
          <form id="reserve-form" class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs block mb-1 text-gray-500">Full name</label>
                <input id="f-name" required class="w-full rounded-lg px-3 py-2 text-sm bg-cream border border-black/10" placeholder="Jane Doe" />
              </div>
              <div>
                <label class="text-xs block mb-1 text-gray-500">Phone</label>
                <input id="f-phone" type="tel" class="w-full rounded-lg px-3 py-2 text-sm bg-cream border border-black/10" placeholder="(555) 123-4567" />
              </div>
            </div>

            <div id="reservation-fields" class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-xs block mb-1 text-gray-500">Guests</label>
                  <select id="f-guests" class="w-full rounded-lg px-3 py-2 text-sm bg-cream border border-black/10">
                    ${[1, 2, 3, 4, 5].map((n) => `<option value="${n}" ${n === 2 ? "selected" : ""}>${n} Guest${n === 1 ? "" : "s"}</option>`).join("")}
                    <option value="6+">6+ Guests (Group)</option>
                  </select>
                </div>
                <div>
                  <label class="text-xs block mb-1 text-gray-500">Time</label>
                  <input id="f-time" type="time" value="19:00" class="w-full rounded-lg px-3 py-2 text-sm bg-cream border border-black/10" />
                </div>
              </div>
              <div>
                <label class="text-xs block mb-1 text-gray-500">Date</label>
                <input id="f-date" type="date" required onclick="this.showPicker && this.showPicker()" class="w-full rounded-lg px-3 py-2 text-sm bg-cream border border-black/10 cursor-pointer" />
              </div>
            </div>

            <div>
              <label class="text-xs block mb-1 text-gray-500">Special requests / allergies</label>
              <textarea id="f-note" rows="3" class="w-full rounded-lg px-3 py-2 text-sm bg-cream border border-black/10" placeholder="Allergies, special occasion, seating preference..."></textarea>
            </div>

            <button type="submit" class="w-full btn-primary font-semibold py-3 rounded-lg hover-scale">
              ${wa ? "Send via WhatsApp" : "Submit"}
            </button>
            <p class="text-xs text-center text-gray-400">${wa ? "This mockup sends requests via WhatsApp — no bookings are actually processed by this demo site." : "Give us a call to reserve your table."}</p>
          </form>
        </div>
      </div>
    </div>
  </section>

  <footer class="bg-secondary text-white/70 pt-12 pb-8">
    <div class="max-w-6xl mx-auto px-4 md:px-8 grid sm:grid-cols-3 gap-8 text-sm">
      <div>
        <p class="text-white font-semibold text-lg mb-2 font-display">${escapeHtml(lead.name)}</p>
        <p class="text-white/60">${escapeHtml(content.tagline)}</p>
      </div>
      <div>
        <p class="text-xs uppercase tracking-widest font-semibold mb-3 text-primary">Navigation</p>
        <ul class="space-y-1.5 text-white/70">
          <li><a href="#hero" class="hover:text-white">Home</a></li>
          <li><a href="#menu" class="hover:text-white">Menu</a></li>
          <li><a href="#about" class="hover:text-white">About</a></li>
          <li><a href="#contact" class="hover:text-white">Contact</a></li>
        </ul>
      </div>
      <div>
        <p class="text-xs uppercase tracking-widest font-semibold mb-3 text-primary">Contact</p>
        <p class="text-white/70">${escapeHtml(lead.address)}</p>
        ${lead.phone ? `<a href="tel:${lead.phone}" class="block mt-1 text-white/70 hover:text-white">${escapeHtml(lead.phone)}</a>` : ""}
      </div>
    </div>
    <div class="max-w-6xl mx-auto px-4 md:px-8 mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-white/50">
      <span>© ${new Date().getFullYear()} ${escapeHtml(lead.name)}. All rights reserved.</span>
      <a href="#hero" class="hover:text-white">Back to top ↑</a>
    </div>
    <p class="text-center text-xs mt-6 text-white/30">Website mockup generated for demo purposes.</p>
  </footer>

  <!-- Floating action buttons -->
  <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-3 items-end">
    ${wa ? `<a href="${wa}" target="_blank" class="float-btn bg-[#25D366] text-white rounded-full w-12 h-12 flex items-center justify-center text-xl">💬</a>` : ""}
    ${lead.phone ? `<a href="tel:${lead.phone}" class="float-btn btn-primary rounded-full w-12 h-12 flex items-center justify-center text-lg">📞</a>` : ""}
  </div>

  <script>
    document.getElementById('mobile-menu-btn').addEventListener('click', function () {
      document.getElementById('mobile-menu').classList.toggle('hidden');
    });

    let menuCarouselIndex = 0;
    function menuCarouselMove(dir) {
      const track = document.getElementById('menu-carousel-track');
      if (!track) return;
      const slides = track.children.length;
      menuCarouselIndex = (menuCarouselIndex + dir + slides) % slides;
      track.style.transform = 'translateX(' + (-menuCarouselIndex * 100) + '%)';
      document.querySelectorAll('.menu-carousel-dot').forEach((dot, i) => {
        dot.style.background = i === menuCarouselIndex ? 'var(--primary)' : 'rgba(0,0,0,0.15)';
      });
    }

    let mode = 'reservation';
    function setMode(m) {
      mode = m;
      document.getElementById('reservation-fields').style.display = m === 'reservation' ? 'block' : 'none';
      const activeStyle = 'flex-1 py-2 rounded-lg text-sm font-medium btn-primary';
      const inactiveStyle = 'flex-1 py-2 rounded-lg text-sm font-medium bg-cream border border-black/10 text-secondary';
      document.getElementById('mode-reservation').className = m === 'reservation' ? activeStyle : inactiveStyle;
      document.getElementById('mode-order').className = m === 'order' ? activeStyle : inactiveStyle;
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

    function sendGrabOrder() {
      const input = document.getElementById('grab-order-text');
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
