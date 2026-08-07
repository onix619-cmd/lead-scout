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

export function generateCreativeRestaurantHTML(
  lead: Lead,
  content: GeneratedContent,
  menuSections: MenuSection[] = [],
  originalMenuPhotoUrl?: string
): string {
  const theme = getTheme("restaurant", lead.name);
  const wa = waLink(lead.phone);
  const waNum = waDigits(lead.phone);

  const galleryImages =
    lead.uploadedImages && lead.uploadedImages.length > 0
      ? lead.uploadedImages
      : lead.photoUrls && lead.photoUrls.length > 0
      ? lead.photoUrls
      : lead.photoUrl
      ? [lead.photoUrl]
      : [];
  const heroImage = galleryImages[0] ?? null;

  const menuCarouselHtml = galleryImages.length > 0 ? `
    <div class="mt-12 relative max-w-3xl mx-auto">
      <h3 class="text-xl font-semibold mb-4 text-center font-display" style="color:#e05a47;">Gallery &amp; Food Showcase</h3>
      <div class="overflow-hidden rounded-3xl shadow-2xl border border-[#e05a47]/30">
        <div id="menu-carousel-track" class="flex transition-transform duration-500" style="transform: translateX(0%);">
          ${galleryImages.map((img) => `<img src="${img}" class="w-full shrink-0 h-80 sm:h-[420px] object-cover" />`).join("")}
        </div>
      </div>
      ${galleryImages.length > 1 ? `
      <button type="button" onclick="menuCarouselMove(-1)" class="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl shadow-xl transition-transform hover:scale-110" style="background:#e05a47;">‹</button>
      <button type="button" onclick="menuCarouselMove(1)" class="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl shadow-xl transition-transform hover:scale-110" style="background:#e05a47;">›</button>
      <div class="flex justify-center gap-2 mt-4">
        ${galleryImages.map((_, i) => `<span class="menu-carousel-dot w-2.5 h-2.5 rounded-full transition-colors" data-i="${i}" style="background:${i === 0 ? "#e05a47" : "rgba(224,90,71,0.3)"};"></span>`).join("")}
      </div>` : ""}
    </div>` : "";

  const activeMenuSections = menuSections.length > 0 ? menuSections : [
    {
      category: "Chef's Starters",
      items: [
        { name: "Wood-Fired Focaccia", description: "Rosemary, sea salt, garlic-infused olive oil", price: "7.50" },
        { name: "Burrata & Heirloom Tomato", description: "Balsamic glaze, fresh basil leaves, cracked pepper", price: "13.00" },
        { name: "Crispy Calamari", description: "Lightly dusted wild squid with house citrus aioli", price: "14.50" }
      ]
    },
    {
      category: "Signature Mains",
      items: [
        { name: "Handmade Truffle Gnocchi", description: "Potato gnocchi, black truffle cream, aged parmesan", price: "22.00" },
        { name: "Pan-Seared Ribeye Steak", description: "Herb butter, roasted garlic potatoes, grilled asparagus", price: "32.00" },
        { name: "Mediterranean Sea Bass", description: "Lemon caper sauce, wild greens, cherry tomatoes", price: "28.50" }
      ]
    },
    {
      category: "Desserts & Wine",
      items: [
        { name: "Classic Tiramisu", description: "Espresso-soaked ladyfingers, rich mascarpone cream", price: "9.50" },
        { name: "Panna Cotta al Limone", description: "Silky vanilla panna cotta with zesty lemon curd", price: "8.50" },
        { name: "Vintage Chianti Red Wine", description: "Full-bodied notes of cherry and spice (Glass)", price: "11.00" }
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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<style>
  html { scroll-behavior: smooth; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #faf8f5; color: #1a1816; }
  h1, h2, h3, .font-display { font-family: 'Syne', sans-serif; }
  .btn-creative { background: linear-gradient(135deg, #e05a47, #f4a261); color: #fff; font-weight: 700; transition: transform 0.2s ease, box-shadow 0.2s ease; }
  .btn-creative:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(224,90,71,0.3); }
</style>
</head>
<body class="min-h-screen flex flex-col antialiased">

<!-- Navbar -->
<nav class="fixed top-0 left-0 right-0 z-50 bg-[#faf8f5]/90 backdrop-blur-md border-b border-[#ebdcd3]">
  <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
    <a href="#" class="text-2xl font-extrabold tracking-tight font-display" style="color:#e05a47;">${escapeHtml(lead.name)}</a>
    <div class="hidden md:flex items-center space-x-8 text-sm font-semibold text-[#5c534e]">
      <a href="#about" class="hover:text-[#e05a47] transition-colors">Story</a>
      <a href="#menu" class="hover:text-[#e05a47] transition-colors">Menu</a>
      <a href="#reserve" class="hover:text-[#e05a47] transition-colors">Table Booking</a>
    </div>
    <a href="#reserve" class="btn-creative px-6 py-2.5 rounded-full text-sm">Reserve Table</a>
  </div>
</nav>

<!-- Hero -->
<header class="relative min-h-[90vh] flex items-center justify-center bg-cover bg-center pt-20" style="${heroImage ? `background-image: linear-gradient(rgba(26,24,22,0.65), rgba(26,24,22,0.75)), url('${heroImage}');` : "background:#1a1816;"}">
  <div class="max-w-4xl mx-auto px-6 text-center space-y-6 text-white">
    <span class="inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-[#e05a47] text-white">${escapeHtml(lead.category)}</span>
    <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight font-display">${escapeHtml(content.tagline)}</h1>
    <p class="text-lg md:text-xl text-[#f0e6e0] max-w-2xl mx-auto font-light">${escapeHtml(lead.address)}</p>
    <div class="flex flex-wrap justify-center gap-4 pt-4">
      <a href="#reserve" class="btn-creative px-8 py-4 rounded-full text-base">Book Your Experience</a>
      <a href="#menu" class="px-8 py-4 rounded-full text-base font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md transition-all">Explore Menu</a>
    </div>
  </div>
</header>

<!-- Quick Order -->
${wa ? `
<section id="order-grab" class="py-16 bg-[#ebdcd3]/40">
  <div class="max-w-md mx-auto px-6 text-center">
    <p class="text-xs uppercase tracking-widest font-bold mb-2" style="color:#e05a47;">Express Takeout</p>
    <h2 class="text-3xl font-bold mb-4 font-display">Order &amp; Grab</h2>
    <div class="flex flex-col gap-3">
      <textarea id="grab-order-text" rows="3" placeholder="What would you like to order? (e.g. 2x Truffle Gnocchi, 1x Focaccia...)" class="w-full rounded-2xl px-4 py-3 text-sm bg-white border border-[#d9c5bc] text-[#1a1816] resize-y shadow-sm"></textarea>
      <button type="button" onclick="sendGrabOrder()" class="btn-creative py-4 rounded-2xl w-full text-sm uppercase tracking-wider">Send Order to WhatsApp ↗</button>
    </div>
    <p class="text-xs text-[#736862] mt-2">Opens WhatsApp instantly with your order pre-filled.</p>
  </div>
</section>` : ""}

<!-- About -->
<section id="about" class="max-w-6xl mx-auto px-6 py-24 grid sm:grid-cols-2 gap-12 items-center">
  <div class="space-y-6">
    <span class="text-xs font-bold uppercase tracking-widest" style="color:#e05a47;">The Culinary Vision</span>
    <h2 class="text-4xl font-bold font-display">${escapeHtml(content.philosophyHeading)}</h2>
    <p class="text-[#5c534e] leading-relaxed">${escapeHtml(content.aboutUs)}</p>
    <p class="text-[#736862] leading-relaxed text-sm">${escapeHtml(content.secondaryAbout)}</p>
  </div>
  <div class="bg-white p-8 rounded-3xl border border-[#ebdcd3] shadow-xl space-y-4">
    <h3 class="text-xl font-bold font-display text-[#1a1816]">Hours of Operation</h3>
    <table class="w-full text-sm">
      ${lead.openingHours.length > 0
        ? lead.openingHours
            .map((line) => {
              const [day, hours] = splitHoursLine(line);
              return `<tr class="border-b border-[#f0e6e0]"><td class="py-2 font-medium text-[#1a1816]">${escapeHtml(day)}</td><td class="py-2 text-right text-[#736862]">${escapeHtml(hours)}</td></tr>`;
            })
            .join("")
        : `<tr><td class="py-2 text-[#736862]">Hours not listed</td></tr>`}
    </table>
    <div class="pt-4 border-t border-[#f0e6e0] text-sm font-medium text-[#1a1816]">
      <p>${escapeHtml(lead.address)}</p>
      ${lead.phone ? `<p class="mt-1" style="color:#e05a47;">${escapeHtml(lead.phone)}</p>` : ""}
    </div>
  </div>
</section>

<!-- Menu -->
<section id="menu" class="py-24 bg-white border-t border-[#ebdcd3]">
  <div class="max-w-6xl mx-auto px-6">
    <div class="text-center space-y-3 mb-16">
      <span class="text-xs font-bold uppercase tracking-widest" style="color:#e05a47;">Gastronomy</span>
      <h2 class="text-4xl font-bold font-display">Creative Menu Selections</h2>
    </div>

    <div class="space-y-16 max-w-4xl mx-auto mb-16">
      ${activeMenuSections.map((section) => `
      <div>
        ${section.category ? `<h3 class="text-2xl font-bold mb-6 font-display" style="color:#e05a47;">${escapeHtml(section.category)}</h3>` : ""}
        <div class="grid sm:grid-cols-2 gap-6">
          ${section.items.map((item) => `
          <div class="p-5 rounded-2xl border border-[#ebdcd3] bg-[#faf8f5] shadow-sm flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-baseline gap-4 mb-1">
                <h4 class="font-bold text-[#1a1816] font-display text-lg">${escapeHtml(item.name)}</h4>
                ${item.price ? `<span class="font-bold text-lg" style="color:#e05a47;">$${escapeHtml(item.price)}</span>` : ""}
              </div>
              ${item.description ? `<p class="text-xs text-[#736862]">${escapeHtml(item.description)}</p>` : ""}
            </div>
          </div>`).join("")}
        </div>
      </div>`).join("")}
    </div>

    ${originalMenuPhotoUrl || lead.website ? `<div class="text-center mb-12"><a href="${originalMenuPhotoUrl || lead.website}" target="_blank" class="inline-block px-8 py-4 rounded-full font-bold text-white shadow-lg btn-creative">View Official Menu ↗</a></div>` : ""}

    ${menuCarouselHtml}
  </div>
</section>

<!-- Reservation with Calendar -->
<section id="reserve" class="py-24 bg-[#1a1816] text-white">
  <div class="max-w-3xl mx-auto px-6">
    <div class="text-center space-y-3 mb-12">
      <span class="text-xs font-bold uppercase tracking-widest" style="color:#e05a47;">Secure Your Table</span>
      <h2 class="text-4xl font-bold font-display">Table Reservation</h2>
    </div>
    <form id="reserve-form" class="space-y-5 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-md">
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label class="text-xs uppercase tracking-widest font-semibold block mb-2 text-[#f0e6e0]">Full Name</label>
          <input id="f-name" required class="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#e05a47]" placeholder="Jane Doe" />
        </div>
        <div>
          <label class="text-xs uppercase tracking-widest font-semibold block mb-2 text-[#f0e6e0]">Phone Number</label>
          <input id="f-phone" type="tel" class="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#e05a47]" placeholder="(555) 123-4567" />
        </div>
      </div>
      <div class="grid sm:grid-cols-3 gap-4">
        <div>
          <label class="text-xs uppercase tracking-widest font-semibold block mb-2 text-[#f0e6e0]">Guests</label>
          <select id="f-guests" class="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#e05a47]">
            <option value="2">2 Guests</option>
            <option value="4">4 Guests</option>
            <option value="6+">6+ Guests</option>
          </select>
        </div>
        <div>
          <label class="text-xs uppercase tracking-widest font-semibold block mb-2 text-[#f0e6e0]">Time</label>
          <input id="f-time" type="time" value="19:00" class="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#e05a47]" />
        </div>
        <div>
          <label class="text-xs uppercase tracking-widest font-semibold block mb-2 text-[#f0e6e0]">Date</label>
          <input id="f-date" type="date" required onclick="this.showPicker && this.showPicker()" class="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#e05a47] cursor-pointer" />
        </div>
      </div>
      <div>
        <label class="text-xs uppercase tracking-widest font-semibold block mb-2 text-[#f0e6e0]">Special Requests</label>
        <textarea id="f-note" rows="3" class="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#e05a47]" placeholder="Allergies, dietary preferences, special occasion..."></textarea>
      </div>
      <button type="submit" class="w-full btn-creative py-4 rounded-xl text-center font-bold text-base tracking-wide">Confirm Reservation via WhatsApp</button>
    </form>
  </div>
</section>

<!-- Footer -->
<footer class="bg-black text-white/70 py-12 text-sm border-t border-white/10 mt-auto">
  <div class="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
    <p>&copy; ${new Date().getFullYear()} ${escapeHtml(lead.name)}. All rights reserved.</p>
    <a href="#top" class="hover:text-white">Back to top ↑</a>
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

  document.getElementById('reserve-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('f-name').value.trim();
    const phone = document.getElementById('f-phone').value.trim();
    const guests = document.getElementById('f-guests').value;
    const date = document.getElementById('f-date').value;
    const time = document.getElementById('f-time').value;
    const note = document.getElementById('f-note').value.trim();
    let msg = 'Hi ${escapeHtml(lead.name).replace(/'/g, "\\'")}, I would like to reserve a table for ' + guests + ' on ' + (date || '[date]') + ' at ' + (time || '[time]') + '. Name: ' + name + '.';
    if (phone) msg += ' Phone: ' + phone + '.';
    if (note) msg += ' Note: ' + note;
    window.open('https://wa.me/${waNum}?text=' + encodeURIComponent(msg), '_blank');
  });

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
