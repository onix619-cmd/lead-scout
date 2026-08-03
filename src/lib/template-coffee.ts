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

  const numberedCategories =
    menuSections.length > 0
      ? menuSections
      : [{ category: content.showcaseItems.length ? "On the Menu" : undefined, items: content.showcaseItems.map((s) => ({ name: s.name, description: s.description, price: undefined as string | undefined })) }];

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
      lead.rating != null ? { "@type": "AggregateRating", ratingValue: lead.rating, reviewCount: lead.reviewCount } : undefined,
  })}</script>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="${theme.googleFontsUrl}" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<style>
  html { scroll-behavior: smooth; }
  body { font-family: 'Poppins', sans-serif; background: #fbf6ee; color: #2b2118; }
  h1, h2, h3, .font-display { font-family: 'Fraunces', serif; }
  .accent-italic { font-style: italic; color: #6f4e37; }
  .reveal { opacity: 0; transform: translateY(24px); transition: opacity .7s ease, transform .7s ease; }
  .reveal.show { opacity: 1; transform: translateY(0); }
  .hover-scale { transition: transform .35s ease; }
  .hover-scale:hover { transform: scale(1.03); }
  .glass { background: rgba(36,28,21,0.85); backdrop-filter: blur(10px); }
</style>
</head>
<body>

<!-- Nav -->
<nav class="fixed top-0 left-0 right-0 z-50 glass text-white">
  <div class="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
    <a href="#top" class="font-display font-bold text-lg uppercase tracking-tight">${escapeHtml(lead.name)}</a>
    <div class="hidden sm:flex items-center gap-6 text-sm">
      <a href="#about" class="hover:opacity-80">About</a>
      <a href="#specialties" class="hover:opacity-80">Specialties</a>
      <a href="#menu" class="hover:opacity-80">Menu</a>
      <a href="#visit" class="hover:opacity-80">Visit</a>
    </div>
    <a href="#menu" class="text-sm font-medium px-4 py-2 rounded-full" style="background:#c9a24b; color:#241c15;">View Menu</a>
  </div>
</nav>

<!-- Hero -->
<header id="top" class="relative pt-16">
  ${heroImage ? `<img src="${heroImage}" class="w-full h-[75vh] object-cover" alt="${escapeHtml(lead.name)}" />` : `<div class="w-full h-[60vh]" style="background:linear-gradient(135deg, #f3e6d3, #e4d2b5);"></div>`}
  <div class="absolute inset-0 flex flex-col items-center justify-center text-center px-6" style="background:rgba(36,28,21,0.35);">
    <p class="text-white text-xs uppercase tracking-widest mb-3">${escapeHtml(lead.category)} · Pause &amp; Relax</p>
    <h1 class="text-white text-4xl sm:text-6xl font-bold uppercase drop-shadow">${escapeHtml(lead.name)}</h1>
    <p class="text-white/90 text-lg mt-4 max-w-lg">${escapeHtml(content.tagline)}</p>
    <div class="mt-8 flex flex-wrap gap-3 justify-center">
      ${wa ? `<a href="#order-grab" class="px-6 py-3 rounded-full font-medium hover-scale" style="background:#c9a24b; color:#241c15;">Order / Grab</a>` : `<a href="#menu" class="px-6 py-3 rounded-full font-medium hover-scale" style="background:#c9a24b; color:#241c15;">Discover the Menu</a>`}
      <a href="#visit" class="px-6 py-3 rounded-full font-medium border border-white/60 text-white hover-scale">Visit Us</a>
    </div>
  </div>
</header>

${wa ? `
<!-- Order / Grab quick widget -->
<section id="order-grab" class="py-14" style="background:#f3e6d3;">
  <div class="max-w-md mx-auto px-6 text-center">
    <p class="text-xs uppercase tracking-widest font-semibold mb-2" style="color:#6f4e37;">Quick Order</p>
    <h2 class="text-2xl font-semibold mb-4 font-display">Order &amp; Grab</h2>
    <div class="flex flex-col sm:flex-row gap-2">
      <input id="grab-order-text" type="text" placeholder="What would you like to order?" class="flex-1 min-w-0 rounded-md px-4 py-3 text-sm bg-white border border-[#d9c7a8] text-[#2b2118]" />
      <button type="button" onclick="sendGrabOrder()" class="font-medium px-5 py-3 rounded-md whitespace-nowrap hover-scale" style="background:#c9a24b; color:#241c15;">Send Order ↗</button>
    </div>
    <p class="text-xs text-[#5a4c3c] mt-2">Opens WhatsApp with your order typed in — just hit send.</p>
  </div>
</section>` : ""}

<!-- About -->
<section id="about" class="max-w-6xl mx-auto px-6 py-20 grid sm:grid-cols-2 gap-12 items-center reveal">
  <div>
    <p class="text-xs uppercase tracking-widest font-semibold mb-2" style="color:#c9a24b;">Our Story</p>
    <h2 class="text-3xl font-semibold mb-5">A café, <span class="accent-italic">${escapeHtml(content.philosophyHeading.toLowerCase())}</span></h2>
    <p class="leading-relaxed text-[#4a3d2f] mb-6">${escapeHtml(content.aboutUs)}</p>
    <p class="leading-relaxed text-[#4a3d2f] mb-6">${escapeHtml(content.secondaryAbout)}</p>
    ${amenityChips.length > 0 ? `
    <div class="flex flex-wrap gap-2">
      ${amenityChips.map((c) => `<span class="text-xs uppercase tracking-wide px-3 py-1.5 rounded-full border" style="border-color:#c9a24b; color:#6f4e37;">${escapeHtml(c)}</span>`).join("")}
    </div>` : ""}
  </div>
  ${aboutImage ? `<img src="${aboutImage}" class="w-full h-80 object-cover rounded-2xl" alt="${escapeHtml(lead.name)}" />` : ""}
</section>

<!-- Specialties -->
<section id="specialties" class="py-20" style="background:#f3e6d3;">
  <div class="max-w-6xl mx-auto px-6 reveal">
    <p class="text-xs uppercase tracking-widest font-semibold mb-2 text-center" style="color:#6f4e37;">The Chef's Selection</p>
    <h2 class="text-3xl font-semibold mb-3 text-center">Our <span class="accent-italic">specialties</span></h2>
    <p class="text-center text-[#5a4c3c] max-w-xl mx-auto mb-10">${escapeHtml(content.highlights[0] ?? "")}</p>
    <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
      ${content.showcaseItems.map((item) => `
      <div class="bg-white rounded-2xl p-6 hover-scale shadow-sm">
        ${item.tag ? `<span class="text-[10px] uppercase tracking-wide font-semibold" style="color:#c9a24b;">${escapeHtml(item.tag)}</span>` : ""}
        <h3 class="text-lg font-semibold font-display mt-1">${escapeHtml(item.name)}</h3>
        <p class="text-sm text-[#5a4c3c] mt-2">${escapeHtml(item.description)}</p>
      </div>`).join("")}
    </div>
  </div>
</section>

<!-- Menu preview -->
<section id="menu" class="max-w-6xl mx-auto px-6 py-20 reveal">
  <p class="text-xs uppercase tracking-widest font-semibold mb-2 text-center" style="color:#c9a24b;">Morning to Afternoon</p>
  <h2 class="text-3xl font-semibold mb-3 text-center">A glimpse of the <span class="accent-italic">menu</span></h2>
  <p class="text-center text-[#5a4c3c] max-w-xl mx-auto mb-12">${menuSections.length > 0 ? "Ask about seasonal specials not listed here." : "Ask our team about our full menu in person or by phone."}</p>
  ${originalMenuPhotoUrl || lead.website ? `<div class="text-center -mt-8 mb-10"><a href="${originalMenuPhotoUrl || lead.website}" target="_blank" class="inline-block px-6 py-3 rounded-full font-medium" style="background:#c9a24b; color:#241c15;">${originalMenuPhotoUrl ? "View Original Menu ↗" : "View Full Menu ↗"}</a></div>` : ""}
  <div class="grid sm:grid-cols-2 gap-x-12 gap-y-10">
    ${numberedCategories.slice(0, 4).map((section, i) => `
    <div>
      <p class="text-3xl font-display font-semibold" style="color:#e4d2b5;">${String(i + 1).padStart(2, "0")}</p>
      ${section.category ? `<h3 class="text-lg font-semibold font-display mb-3 -mt-6 ml-10">${escapeHtml(section.category)}</h3>` : `<div class="mb-3"></div>`}
      <ul class="space-y-2">
        ${section.items.slice(0, 5).map((it) => `
        <li class="flex items-baseline justify-between text-sm border-b border-dashed border-[#e4d2b5] pb-1.5">
          <span>${escapeHtml(it.name)}</span>
          ${it.price ? `<span class="font-medium" style="color:#c9a24b;">$${escapeHtml(it.price)}</span>` : ""}
        </li>`).join("")}
      </ul>
    </div>`).join("")}
  </div>
  ${galleryImages.length > 0 ? `
  <div class="mt-14 relative max-w-2xl mx-auto">
    <div class="overflow-hidden rounded-2xl">
      <div id="menu-carousel-track" class="flex transition-transform duration-500" style="transform: translateX(0%);">
        ${galleryImages.map((img) => `<img src="${img}" class="w-full shrink-0 h-64 sm:h-80 object-cover" />`).join("")}
      </div>
    </div>
    ${galleryImages.length > 1 ? `
    <button type="button" onclick="menuCarouselMove(-1)" class="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white" style="background:rgba(36,28,21,0.6);">‹</button>
    <button type="button" onclick="menuCarouselMove(1)" class="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white" style="background:rgba(36,28,21,0.6);">›</button>
    <div class="flex justify-center gap-1.5 mt-3">
      ${galleryImages.map((_, i) => `<span class="menu-carousel-dot w-1.5 h-1.5 rounded-full" data-i="${i}" style="background:${i === 0 ? "#c9a24b" : "rgba(36,28,21,0.2)"};"></span>`).join("")}
    </div>` : ""}
  </div>` : ""}
</section>

<!-- Gallery -->
${galleryImages.length > 1 ? `
<section class="py-20" style="background:#f3e6d3;">
  <div class="max-w-6xl mx-auto px-6 reveal">
    <p class="text-xs uppercase tracking-widest font-semibold mb-2 text-center" style="color:#6f4e37;">The Space</p>
    <h2 class="text-3xl font-semibold mb-10 text-center">A <span class="accent-italic">look inside</span></h2>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      ${galleryImages.map((img) => `<img src="${img}" class="w-full h-36 sm:h-48 object-cover rounded-xl hover-scale" />`).join("")}
    </div>
  </div>
</section>` : ""}

<!-- Reviews -->
<section class="max-w-3xl mx-auto px-6 py-20 text-center reveal">
  <p class="text-xs uppercase tracking-widest font-semibold mb-2" style="color:#c9a24b;">Reviews</p>
  <h2 class="text-3xl font-semibold mb-4">Words from our <span class="accent-italic">guests</span></h2>
  <div class="text-2xl mb-2">${starsHtml(filledStars)}</div>
  <p class="text-[#5a4c3c] mb-6">${lead.rating ?? "—"} out of 5 · ${lead.reviewCount} Google reviews</p>
  ${lead.realReviews && lead.realReviews.length > 0 ? `
  <div class="grid sm:grid-cols-2 gap-4 text-left mt-8">
    ${lead.realReviews.slice(0, 2).map((r) => `
    <div class="bg-white rounded-2xl p-5 shadow-sm">
      <div class="text-sm mb-2">${starsHtml(Math.round(r.rating))}</div>
      <p class="text-sm text-[#4a3d2f]">"${escapeHtml(r.text.length > 180 ? r.text.slice(0, 180).trim() + "…" : r.text)}"</p>
      <p class="text-xs text-[#8a7c6b] mt-3">${escapeHtml(r.authorName)} · ${escapeHtml(r.relativeTime)}</p>
    </div>`).join("")}
  </div>` : ""}
  <a href="${lead.mapsUrl}" target="_blank" class="inline-block mt-6 text-sm font-medium underline underline-offset-4" style="color:#6f4e37;">Read more on Google →</a>
</section>

<!-- Visit -->
<section id="visit" class="py-20 text-white" style="background:#241c15;">
  <div class="max-w-4xl mx-auto px-6 text-center reveal">
    <p class="text-xs uppercase tracking-widest font-semibold mb-2" style="color:#c9a24b;">Come By</p>
    <h2 class="text-3xl font-semibold mb-3">Pass by and <span class="accent-italic" style="color:#e4d2b5;">visit us</span></h2>
    <p class="text-white/70 mb-10">${escapeHtml(content.finalCtaHeading)}</p>
    <div class="grid sm:grid-cols-3 gap-6 text-left max-w-2xl mx-auto mb-10">
      <div>
        <p class="text-xs uppercase tracking-wide mb-1" style="color:#c9a24b;">Address</p>
        <p class="text-sm text-white/80">${escapeHtml(lead.address)}</p>
      </div>
      ${lead.phone ? `<div>
        <p class="text-xs uppercase tracking-wide mb-1" style="color:#c9a24b;">Phone</p>
        <a href="tel:${lead.phone}" class="text-sm text-white/80">${escapeHtml(lead.phone)}</a>
      </div>` : ""}
      <div>
        <p class="text-xs uppercase tracking-wide mb-1" style="color:#c9a24b;">Hours</p>
        ${lead.openingHours.slice(0, 2).map((l) => {
          const [d, h] = splitHoursLine(l);
          return `<p class="text-sm text-white/80">${escapeHtml(d)}: ${escapeHtml(h)}</p>`;
        }).join("") || `<p class="text-sm text-white/80">Contact us for hours</p>`}
      </div>
    </div>
    <div class="flex flex-wrap gap-3 justify-center">
      <a href="${lead.mapsUrl}" target="_blank" class="px-6 py-3 rounded-full font-medium hover-scale" style="background:#c9a24b; color:#241c15;">Get Directions</a>
      ${lead.phone ? `<a href="tel:${lead.phone}" class="px-6 py-3 rounded-full font-medium border border-white/40 text-white hover-scale">Call Us</a>` : ""}
      ${wa ? `<a href="${wa}" target="_blank" class="px-6 py-3 rounded-full font-medium bg-[#25D366] text-white hover-scale">WhatsApp</a>` : ""}
    </div>
  </div>
</section>

<!-- Footer -->
<footer class="py-10 text-center text-white" style="background:#1a140e;">
  <p class="font-display font-semibold text-lg uppercase">${escapeHtml(lead.name)}</p>
  <p class="text-white/60 text-sm mt-1">${escapeHtml(lead.address)}</p>
  <div class="mt-4 flex gap-4 justify-center text-white/70 text-sm">
    ${lead.socialLinks?.instagram ? `<a href="${lead.socialLinks.instagram}" target="_blank">Instagram</a>` : ""}
    ${lead.socialLinks?.facebook ? `<a href="${lead.socialLinks.facebook}" target="_blank">Facebook</a>` : ""}
    <a href="${lead.mapsUrl}" target="_blank">Google Maps</a>
  </div>
  <p class="text-white/30 text-xs mt-6">© ${new Date().getFullYear()} ${escapeHtml(lead.name)}. Website mockup generated for demo purposes.</p>
</footer>

<script>
  let menuCarouselIndex = 0;
  function menuCarouselMove(dir) {
    const track = document.getElementById('menu-carousel-track');
    if (!track) return;
    const slides = track.children.length;
    menuCarouselIndex = (menuCarouselIndex + dir + slides) % slides;
    track.style.transform = 'translateX(' + (-menuCarouselIndex * 100) + '%)';
    document.querySelectorAll('.menu-carousel-dot').forEach((dot, i) => {
      dot.style.background = i === menuCarouselIndex ? '#c9a24b' : 'rgba(36,28,21,0.2)';
    });
  }

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
