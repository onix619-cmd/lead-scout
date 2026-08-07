import { GeneratedContent, Lead, MenuSection } from "./types";

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
  Array.from({ length: 5 }).map((_, i) => `<span style="color:${i < count ? "#facc15" : "#e5e7eb"};">★</span>`).join("");

// A third, distinct restaurant style: light and warm (tan/charcoal) rather
// than the dark elegant Style 1/2. Selected via the "Restaurant — Style 3
// (Classic)" option in the template dropdown.
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
      : lead.photoUrl
      ? [lead.photoUrl]
      : [];
  const heroImage = galleryImages[0] ?? null;
  const menuLinkUrl = originalMenuPhotoUrl || lead.website;

  const menuHtml =
    menuSections.length > 0
      ? menuSections
          .map(
            (section) => `
        ${section.category ? `<h3 class="text-xl font-semibold text-secondary mb-4 mt-8 first:mt-0">${escapeHtml(section.category)}</h3>` : ""}
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          ${section.items
            .map(
              (it) => `
          <article class="bg-gray-50 rounded-lg shadow-sm p-5 hover:shadow-md transition">
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
        <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          ${content.showcaseItems
            .map(
              (item) => `
          <article class="bg-gray-50 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition p-6">
            ${item.tag ? `<span class="text-xs uppercase tracking-wide font-semibold text-primary">${escapeHtml(item.tag)}</span>` : ""}
            <h3 class="text-xl font-semibold text-secondary mb-2 mt-1">${escapeHtml(item.name)}</h3>
            <p class="text-gray-600">${escapeHtml(item.description)}</p>
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
  <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: lead.name,
    address: lead.address,
    telephone: lead.phone ?? undefined,
    url: lead.mapsUrl,
    aggregateRating: lead.rating != null ? { "@type": "AggregateRating", ratingValue: lead.rating, reviewCount: lead.reviewCount } : undefined,
  })}</script>

  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    html { scroll-behavior: smooth; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    :root { --primary: #D4A373; --secondary: #2C2C2C; }
    .text-primary { color: var(--primary); }
    .text-secondary { color: var(--secondary); }
    .bg-primary { background: var(--primary); }
    .bg-secondary { background: var(--secondary); }
    .border-primary { border-color: var(--primary); }
    .reveal { opacity: 0; transform: translateY(20px); transition: opacity .6s ease, transform .6s ease; }
    .reveal.show { opacity: 1; transform: translateY(0); }
  </style>
</head>

<body class="bg-gray-50 text-gray-900 antialiased font-sans">

  <!-- ====================== HEADER / NAV ====================== -->
  <header class="sticky top-0 z-30 bg-white shadow-sm">
    <nav class="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:px-8">
      <a href="#hero" class="text-2xl font-bold text-primary">
        ${escapeHtml(lead.name)}
      </a>

      <ul class="hidden md:flex space-x-8 text-base font-medium">
        <li><a href="#hero" class="hover:text-primary transition">Home</a></li>
        <li><a href="#menu" class="hover:text-primary transition">Menu</a></li>
        <li><a href="#about" class="hover:text-primary transition">About</a></li>
        <li><a href="#contact" class="hover:text-primary transition">Contact</a></li>
      </ul>

      <button id="mobile-menu-btn" class="md:hidden flex items-center focus:outline-none" aria-label="Toggle menu">
        <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
    </nav>

    <div id="mobile-menu" class="hidden md:hidden bg-white border-t border-gray-200">
      <ul class="flex flex-col space-y-2 p-4 text-lg font-medium">
        <li><a href="#hero" class="block hover:text-primary">Home</a></li>
        <li><a href="#menu" class="block hover:text-primary">Menu</a></li>
        <li><a href="#about" class="block hover:text-primary">About</a></li>
        <li><a href="#contact" class="block hover:text-primary">Contact</a></li>
      </ul>
    </div>
  </header>

  <!-- ====================== HERO ====================== -->
  <section id="hero" class="relative bg-cover bg-center bg-no-repeat" style="${heroImage ? `background-image: url('${heroImage}');` : "background: linear-gradient(135deg, #D4A373, #2C2C2C);"}">
    <div class="absolute inset-0 bg-black/40"></div>
    <div class="max-w-4xl mx-auto text-center px-4 py-32 relative z-10">
      <h1 class="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
        ${escapeHtml(lead.name)}
      </h1>
      <p class="text-lg md:text-xl text-gray-200 mb-4 drop-shadow-md">
        ${escapeHtml(content.tagline)}
      </p>
      ${lead.rating ? `<div class="flex items-center justify-center gap-1 mb-8 text-white/90 text-sm"><span class="text-lg">${starsHtml(filledStars)}</span><span>${lead.rating} (${lead.reviewCount} reviews)</span></div>` : ""}
      <a href="#contact" class="inline-block bg-primary text-white font-semibold py-3 px-6 rounded-md hover:opacity-90 transition">
        Reserve a Table
      </a>
    </div>
  </section>

  <!-- ====================== MENU ====================== -->
  <section id="menu" class="py-16 bg-white reveal">
    <div class="max-w-7xl mx-auto px-4 md:px-8">
      <h2 class="text-3xl font-bold text-center mb-4 text-secondary">
        Our Menu
      </h2>
      ${menuHtml}
      ${menuLinkUrl ? `<div class="text-center mt-8"><a href="${menuLinkUrl}" target="_blank" class="inline-block border-2 border-primary text-primary font-semibold py-2.5 px-6 rounded-md hover:bg-primary hover:text-white transition">${originalMenuPhotoUrl ? "View Original Menu ↗" : "View Full Menu ↗"}</a></div>` : ""}
    </div>
  </section>

  <!-- ====================== ABOUT ====================== -->
  <section id="about" class="py-20 bg-gray-100 reveal">
    <div class="max-w-3xl mx-auto px-4 md:px-8 text-center">
      <h2 class="text-3xl font-bold text-secondary mb-6">Our Story</h2>
      <p class="text-lg text-gray-700 leading-relaxed">
        ${escapeHtml(content.aboutUs)}
      </p>
      ${content.highlights.length > 0 ? `
      <div class="flex flex-wrap gap-3 justify-center mt-8">
        ${content.highlights.map((h) => `<span class="text-sm font-medium border border-primary text-primary rounded-full px-4 py-1.5">${escapeHtml(h)}</span>`).join("")}
      </div>` : ""}
    </div>
  </section>

  <!-- ====================== CONTACT / FOOTER ====================== -->
  <section id="contact" class="py-20 bg-white reveal">
    <div class="max-w-4xl mx-auto px-4 md:px-8">
      <h2 class="text-3xl font-bold text-center text-secondary mb-8">Contact Us</h2>

      <div class="grid md:grid-cols-2 gap-8">
        <!-- Contact details -->
        <div class="space-y-4">
          <p class="flex items-center text-gray-800">
            <svg class="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <a href="${lead.mapsUrl}" target="_blank" class="hover:text-primary">${escapeHtml(lead.address)}</a>
          </p>
          ${lead.phone ? `
          <p class="flex items-center text-gray-800">
            <svg class="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
          <div class="flex gap-4 pt-2 text-sm">
            ${lead.socialLinks?.instagram ? `<a href="${lead.socialLinks.instagram}" target="_blank" class="text-primary hover:underline">Instagram</a>` : ""}
            ${lead.socialLinks?.facebook ? `<a href="${lead.socialLinks.facebook}" target="_blank" class="text-primary hover:underline">Facebook</a>` : ""}
          </div>
        </div>

        <!-- Reservation CTA -->
        <div class="bg-gray-50 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-secondary mb-2">Reserve a Table</h3>
          <p class="text-sm text-gray-600 mb-4">${wa ? "Send us your reservation request directly on WhatsApp." : "Give us a call to reserve your table."}</p>
          <div class="flex flex-col gap-3">
            ${wa ? `<a href="https://wa.me/${waNum}?text=${encodeURIComponent(`Hi ${lead.name}, I'd like to reserve a table.`)}" target="_blank" class="inline-block text-center bg-[#25D366] text-white font-semibold py-3 px-6 rounded-md hover:opacity-90 transition">Reserve via WhatsApp</a>` : ""}
            ${lead.phone ? `<a href="tel:${lead.phone}" class="inline-block text-center bg-secondary text-white font-semibold py-3 px-6 rounded-md hover:opacity-90 transition">Call ${escapeHtml(lead.phone)}</a>` : ""}
          </div>
        </div>
      </div>
    </div>
  </section>

  <footer class="bg-secondary text-white/70 py-8 text-center text-sm">
    <p class="text-white font-semibold text-base mb-1">${escapeHtml(lead.name)}</p>
    <p>${escapeHtml(lead.address)}</p>
    <p class="text-white/40 text-xs mt-4">Website mockup generated for demo purposes.</p>
  </footer>

  <script>
    document.getElementById('mobile-menu-btn').addEventListener('click', function () {
      document.getElementById('mobile-menu').classList.toggle('hidden');
    });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('show'); });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  </script>

</body>
</html>`;
}
