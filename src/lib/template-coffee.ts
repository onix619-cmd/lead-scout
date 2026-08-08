import { GeneratedContent, Lead, MenuSection } from "./types";
import { getTheme } from "./theme";
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

export function generateCoffeeLandingPageHTML(
  lead: Lead,
  content: GeneratedContent,
  menuSections: MenuSection[] = [],
  originalMenuPhotoUrl?: string
): string {
  const theme = getTheme("coffee", lead.name);
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

  const dining = lead.diningOptions ?? {};
  const amenityChips = [
    dining.outdoorSeating ? "Outdoor Seating" : null,
    dining.dineIn ? "Dine-In" : null,
    dining.takeout ? "Takeout" : null,
    dining.delivery ? "Delivery" : null,
  ].filter(Boolean) as string[];

  const starsHtml = (count: number) =>
    Array.from({ length: 5 })
      .map((_, i) => `<span style="color:${i < count ? "#c9a24b" : "#d6ccbf"};">★</span>`)
      .join("");

  const activeMenuSections = menuSections.length > 0 ? menuSections : [
    {
      category: "Espresso & Coffee Drinks",
      items: [
        { name: "Signature Double Espresso", description: "Bold, rich flavor with caramel undertones", price: "3.50" },
        { name: "Classic Cappuccino", description: "Espresso with steamed microfoam and cocoa dust", price: "5.00" },
        { name: "Caramel Latte", description: "Espresso, steamed milk, and sweet caramel drizzle", price: "6.50" },
        { name: "Cold Brew Reserve", description: "Steeped 24 hours for exceptional smoothness", price: "5.50" }
      ]
    },
    {
      category: "Bakery & Fresh Bites",
      items: [
        { name: "Buttery Croissant", description: "Flaky and golden-brown, baked fresh daily", price: "4.00" },
        { name: "Avocado Toast", description: "Smashed avocado, sea salt, and chilli flakes on sourdough", price: "12.00" },
        { name: "Blueberry Muffin", description: "Packed with juicy blueberries and sweet crumb topping", price: "4.50" },
        { name: "Breakfast Sandwich", description: "Egg, cheese, and artisan bacon on a warm brioche", price: "8.50" }
      ]
    }
  ];

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
<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    name: lead.name,
    address: lead.address,
    telephone: lead.phone ?? undefined,
    url: lead.mapsUrl,
    aggregateRating:
      lead.rating != null
        ? { "@type": "AggregateRating", ratingValue: lead.rating, reviewCount: lead.reviewCount }
        : undefined,
  })}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${theme.googleFontsUrl}" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<style>
  html { scroll-behavior: smooth; }
  body { font-family: ${theme.fontBody}; background-color: #fbf9f5; color: #2b2118; }
  h1, h2, h3, .font-display { font-family: ${theme.fontHeading}; }
  .accent-italic { font-family: 'Playfair Display', serif; font-style: italic; }
  .hover-scale { transition: transform 0.35s ease; }
  .hover-scale:hover { transform: scale(1.03); }
</style>
</head>
<body class="min-h-screen flex flex-col antialiased">

<!-- Navbar -->
<nav class="fixed top-0 left-0 right-0 z-50 bg-[#fbf9f5]/90 backdrop-blur-md border-b border-[#e6dbc8]">
  <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
    <a href="#" class="text-2xl font-bold tracking-tight font-display" style="color:#6f4e37;">${escapeHtml(lead.name)}</a>
    <div class="hidden md:flex items-center space-x-8 text-sm font-medium text-[#5a4c3c]">
      <a href="#about" class="hover:text-[#2b2118] transition-colors">About</a>
      <a href="#menu" class="hover:text-[#2b2118] transition-colors">Menu</a>
      <a href="#order-grab" class="hover:text-[#2b2118] transition-colors">Order</a>
    </div>
    <a href="#order-grab" class="px-5 py-2.5 rounded-full text-sm font-medium shadow-sm hover:opacity-90" style="background:#c9a24b; color:#241c15;">Order Now</a>
  </div>
</nav>

<!-- Hero -->
<header class="relative min-h-screen flex items-center justify-center bg-cover bg-center pt-20" style="${heroImage ? `background-image: linear-gradient(rgba(36,28,21,0.5), rgba(36,28,21,0.7)), url('${heroImage}');` : "background:#241c15;"}">
  <div class="max-w-4xl mx-auto px-6 text-center space-y-6">
    <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight text-white font-display">${escapeHtml(content.tagline)}</h1>
    <p class="text-lg md:text-xl text-[#f3e6d3] max-w-2xl mx-auto font-light">${escapeHtml(lead.category)} in ${escapeHtml(lead.address)}</p>
    <div class="flex flex-wrap justify-center gap-4 pt-4">
      <a href="#order-grab" class="px-8 py-3.5 rounded-full text-base font-semibold shadow-lg hover:scale-105 transition-transform" style="background:#c9a24b; color:#241c15;">Order Online</a>
      <a href="#menu" class="px-8 py-3.5 rounded-full text-base font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition-transform">View Menu</a>
    </div>
  </div>
</header>

<!-- Quick Order -->
${wa ? `
<section id="order-grab" class="py-14" style="background:#f3e6d3;">
  <div class="max-w-md mx-auto px-6 text-center">
    <p class="text-xs uppercase tracking-widest font-semibold mb-2" style="color:#6f4e37;">Quick Order</p>
    <h2 class="text-2xl font-semibold mb-4 font-display">Order &amp; Grab</h2>
    <div class="flex flex-col gap-3">
      <textarea id="grab-order-text" rows="3" placeholder="What would you like to order? (e.g. 2x Cappuccino, 1x Croissant...)" class="w-full rounded-md px-4 py-3 text-sm bg-white border border-[#d9c7a8] text-[#2b2118] resize-y shadow-inner"></textarea>
      <button type="button" onclick="sendGrabOrder()" class="font-medium px-6 py-3.5 rounded-md w-full hover-scale uppercase tracking-wider text-sm shadow-md" style="background:#c9a24b; color:#241c15;">Send Order to WhatsApp ↗</button>
    </div>
    <p class="text-xs text-[#5a4c3c] mt-2">Opens WhatsApp with your order typed in — just hit send to chat &amp; order.</p>
  </div>
</section>` : ""}

<!-- About -->
<section id="about" class="max-w-6xl mx-auto px-6 py-20 grid sm:grid-cols-2 gap-12 items-center">
  <div>
    <p class="text-xs uppercase tracking-widest font-semibold mb-2" style="color:#c9a24b;">Our Story</p>
    <h2 class="text-3xl font-semibold mb-5 font-display">A café, <span class="accent-italic">${escapeHtml(content.philosophyHeading.toLowerCase())}</span></h2>
    <p class="leading-relaxed text-[#4a3d2f] mb-6">${escapeHtml(content.aboutUs)}</p>
    <p class="leading-relaxed text-[#4a3d2f] mb-6">${escapeHtml(content.secondaryAbout)}</p>
    ${amenityChips.length > 0 ? `
    <div class="flex flex-wrap gap-2">
      ${amenityChips.map((c) => `<span class="text-xs uppercase tracking-wide px-3 py-1.5 rounded-full border" style="border-color:#c9a24b; color:#6f4e37;">${escapeHtml(c)}</span>`).join("")}
    </div>` : ""}
  </div>
  ${aboutImage ? `<img src="${aboutImage}" class="w-full h-80 object-cover rounded-2xl shadow-lg" alt="${escapeHtml(lead.name)}" />` : ""}
</section>

<!-- Menu & Photo Carousel -->
<section id="menu" class="py-20 bg-white border-t border-[#e6dbc8]">
  <div class="max-w-6xl mx-auto px-6">
    <p class="text-xs uppercase tracking-widest font-semibold mb-2 text-center" style="color:#6f4e37;">Morning to Afternoon</p>
    <h2 class="text-3xl font-semibold mb-3 text-center font-display">Our <span class="accent-italic">Menu</span></h2>
    <p class="text-center text-[#5a4c3c] max-w-xl mx-auto mb-12">Browse our fresh selections and authentic flavors.</p>
    
    <div class="space-y-12 max-w-4xl mx-auto mb-12">
      ${activeMenuSections.map((section) => `
      <div>
        ${section.category ? `<h3 class="text-xl font-semibold mb-5 font-display" style="color:#6f4e37;">${escapeHtml(section.category)}</h3>` : ""}
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          ${section.items.map((item) => `
          <article class="p-5 rounded-xl border border-[#e6dbc8] bg-[#fbf9f5] hover-scale">
            <div class="flex items-baseline justify-between gap-3">
              <h4 class="font-medium font-display text-[#2b2118]">${escapeHtml(item.name)}</h4>
              ${item.price ? `<span class="font-semibold whitespace-nowrap" style="color:#6f4e37;">$${escapeHtml(item.price)}</span>` : ""}
            </div>
            ${item.description ? `<p class="text-xs text-[#6f4e37] mt-2">${escapeHtml(item.description)}</p>` : ""}
          </article>`).join("")}
        </div>
      </div>`).join("")}
    </div>

    ${originalMenuPhotoUrl || lead.website ? `<div class="text-center mb-10"><a href="${originalMenuPhotoUrl || lead.website}" target="_blank" class="inline-block px-6 py-3 rounded-full font-medium shadow-sm hover:opacity-90" style="background:#c9a24b; color:#241c15;">View Full Menu Link ↗</a></div>` : ""}

    ${galleryImages.length > 0 ? `
    <div class="mt-12 relative max-w-3xl mx-auto">
      <h3 class="text-lg font-semibold mb-3 text-center font-display" style="color:#6f4e37;">Google Maps Menu &amp; Meal Photos</h3>
      <div class="overflow-hidden rounded-2xl shadow-2xl border border-[#e6dbc8]">
        <div id="menu-carousel-track" class="flex transition-transform duration-500" style="transform: translateX(0%);">
          ${galleryImages.map((img) => `<img src="${img}" class="w-full shrink-0 h-72 sm:h-96 object-cover" />`).join("")}
        </div>
      </div>
      ${galleryImages.length > 1 ? `
      <button type="button" onclick="menuCarouselMove(-1)" class="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center text-white text-2xl shadow-xl transition-transform hover:scale-110" style="background:rgba(36,28,21,0.75);">‹</button>
      <button type="button" onclick="menuCarouselMove(1)" class="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center text-white text-2xl shadow-xl transition-transform hover:scale-110" style="background:rgba(36,28,21,0.75);">›</button>
      <div class="flex justify-center gap-2 mt-4">
        ${galleryImages.map((_, i) => `<span class="menu-carousel-dot w-2.5 h-2.5 rounded-full transition-colors" data-i="${i}" style="background:${i === 0 ? "#c9a24b" : "rgba(36,28,21,0.2)"};"></span>`).join("")}
      </div>` : ""}
    </div>` : ""}
  </div>
</section>

<!-- Footer -->
<footer class="bg-[#241c15] text-[#fbf9f5] py-12 text-sm mt-auto">
  <div class="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
    <p>&copy; ${new Date().getFullYear()} ${escapeHtml(lead.name)}. All rights reserved.</p>
    <a href="#top">Back to top ↑</a>
  </div>
</footer>

<script>
  let menuCarouselIndex = 0;
  function menuCarouselMove(dir) {
    const track = document.getElementById('menu-carousel-track');
    if (!track) return;
    const slides = track.children.length;
    menuCarouselIndex = (menuCarouselIndex + dir + slides) % slides;
    track.style.transform = 'translateX(' + (-menuCarouselIndex * 100) + '%)';
  }

  function sendGrabOrder() {
    const input = document.getElementById('grab-order-text');
    const text = input ? input.value.trim() : '';
    const msg = 'Hi ${escapeHtml(lead.name).replace(/'/g, "\\'")}, I would like to order: ' + (text || '[details]') + '.';
    window.open('https://wa.me/${waNum}?text=' + encodeURIComponent(msg), '_blank');
  }
</script>

</body>
</html>`;
}
