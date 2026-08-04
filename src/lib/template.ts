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

export function generateLandingPageHTML(
  lead: Lead,
  content: GeneratedContent,
  menuSections: MenuSection[] = [],
  originalMenuPhotoUrl?: string
): string {
  const theme = getTheme("restaurant", lead.name);
  const wa = waLink(lead.phone);
  const waNum = waDigits(lead.phone);
  const R = true;

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
      <h3 class="text-xl font-semibold mb-4 text-center font-display" style="color:var(--primary);">Menu &amp; Meal Photos (Google Maps)</h3>
      <div class="overflow-hidden r-card border border-white/15 shadow-2xl">
        <div id="menu-carousel-track" class="flex transition-transform duration-500" style="transform: translateX(0%);">
          ${galleryImages.map((img) => `<img src="${img}" class="w-full shrink-0 h-72 sm:h-96 object-cover" />`).join("")}
        </div>
      </div>
      ${galleryImages.length > 1 ? `
      <button type="button" onclick="menuCarouselMove(-1)" class="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center text-white text-2xl shadow-xl transition-transform hover:scale-110" style="background:rgba(0,0,0,0.75);">‹</button>
      <button type="button" onclick="menuCarouselMove(1)" class="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center text-white text-2xl shadow-xl transition-transform hover:scale-110" style="background:rgba(0,0,0,0.75);">›</button>
      <div class="flex justify-center gap-2 mt-4">
        ${galleryImages.map((_, i) => `<span class="menu-carousel-dot w-2.5 h-2.5 rounded-full transition-colors" data-i="${i}" style="background:${i === 0 ? "var(--primary)" : "rgba(255,255,255,0.3)"};"></span>`).join("")}
      </div>` : ""}
    </div>` : "";

  const activeMenuSections = menuSections.length > 0 ? menuSections : [
    {
      category: "Starters",
      items: [
        { name: "Crispy Garlic Bruschetta", description: "Vine-ripened tomatoes, fresh basil, extra virgin olive oil", price: "7.50" },
        { name: "Classic Caesar Salad", description: "Crisp romaine hearts, shaved parmesan, garlic croutons", price: "10.50" },
        { name: "Soup of the Day", description: "Chef's daily warm comforting specialty soup", price: "6.50" },
        { name: "Garlic Cheese Bread", description: "Artisan baguette, melted mozzarella, herb butter", price: "8.00" }
      ]
    },
    {
      category: "Mains",
      items: [
        { name: "Wood-Fired Margherita Pizza", description: "San Marzano tomatoes, fresh mozzarella di bufala, basil", price: "16.50" },
        { name: "Signature Bistro Burger", description: "Prime beef patty, aged cheddar, lettuce, tomato, crispy fries", price: "18.00" },
        { name: "Grilled Atlantic Salmon", description: "Fresh salmon filet served with seasonal roasted vegetables", price: "21.00" },
        { name: "Truffle Mushroom Pasta", description: "Handmade pasta in a rich creamy truffle sauce", price: "19.50" }
      ]
    },
    {
      category: "Desserts",
      items: [
        { name: "Warm Chocolate Brownie", description: "Rich chocolate brownie served with vanilla bean ice cream", price: "9.00" },
        { name: "New York Style Cheesecake", description: "Creamy classic cheesecake with berry compote", price: "8.50" },
        { name: "Tiramisu Italiano", description: "Layers of espresso-soaked ladyfingers and mascarpone cream", price: "9.50" },
        { name: "Artisanal Iced Coffee", description: "Refreshing house-brewed specialty blend", price: "4.50" }
      ]
    }
  ];

  const menuItemCount = countMenuItems(activeMenuSections);
  const cardStyle = "background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09);";
  const mutedStyle = "color:#a3a3a3;";
  const inputClass = "bg-black/30 border border-white/15 text-white placeholder-white/30 font-sans";

  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(content.seoTitle)}</title>
<meta name="description" content="${escapeHtml(content.metaDescription)}" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<style>
  :root {
    --primary: ${theme.primary};
    --accent: ${theme.accent};
  }
  body { background-color: #0f0f0f; color: #f5f5f5; font-family: 'Inter', sans-serif; }
  h1, h2, h3, h4, h5, h6, .font-display { font-family: 'Playfair Display', serif; }
  .btn-primary { background: linear-gradient(90deg, #fdbe03, #fe4900); color: #fff; font-weight: 600; transition: transform 0.2s ease, opacity 0.2s ease; }
  .btn-primary:hover { transform: translateY(-2px); opacity: 0.95; }
  .r-card { border-radius: 1rem; }
  .hover-scale { transition: transform 0.35s ease; }
  .hover-scale:hover { transform: scale(1.03); }
</style>
</head>
<body class="min-h-screen flex flex-col antialiased">

<!-- Navbar -->
<nav class="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
  <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
    <a href="#" class="text-2xl font-bold tracking-tight font-display" style="color:var(--primary);">${escapeHtml(lead.name)}</a>
    <div class="hidden md:flex items-center space-x-8 text-sm font-medium text-neutral-300">
      <a href="#about" class="hover:text-white transition-colors">About</a>
      <a href="#featured" class="hover:text-white transition-colors">Menu</a>
      <a href="#reserve" class="hover:text-white transition-colors">Reservation</a>
    </div>
    <a href="#reserve" class="btn-primary px-5 py-2.5 rounded-full text-sm">Book a Table</a>
  </div>
</nav>

<!-- Hero -->
<header class="relative min-h-screen flex items-center justify-center bg-cover bg-center pt-20" style="${heroImage ? `background-image: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url('${heroImage}');` : "background:#111;"}">
  <div class="max-w-4xl mx-auto px-6 text-center space-y-6">
    <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight text-white font-display">${escapeHtml(content.tagline)}</h1>
    <p class="text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto">${escapeHtml(lead.category)} in ${escapeHtml(lead.address)}</p>
    <div class="flex flex-wrap justify-center gap-4 pt-4">
      <a href="#reserve" class="btn-primary px-8 py-3.5 rounded-full text-base font-semibold">Reserve a Table</a>
      <a href="#featured" class="px-8 py-3.5 rounded-full text-base font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm">View Menu</a>
    </div>
  </div>
</header>

<!-- Quick Order -->
${wa ? `
<section id="order-grab" class="py-14" style="background:var(--accent);">
  <div class="max-w-md mx-auto px-6 text-center">
    <p class="text-xs uppercase tracking-widest font-semibold mb-2" style="color:var(--primary);">Quick Order</p>
    <h2 class="text-2xl font-semibold mb-4 font-display">Order &amp; Grab</h2>
    <div class="flex flex-col gap-3">
      <textarea id="grab-order-text" rows="3" placeholder="What would you like to order? (e.g. 2x Burgers, 1x Fries...)" class="w-full rounded-md px-4 py-3 text-sm bg-black/30 border border-white/15 text-white placeholder-white/40 resize-y shadow-inner"></textarea>
      <button type="button" onclick="sendGrabOrder()" class="btn-primary font-medium px-6 py-3.5 r-card w-full hover-scale uppercase tracking-wider text-sm">Send Order to WhatsApp ↗</button>
    </div>
    <p class="text-xs mt-2" style="${mutedStyle}">Opens WhatsApp with your order typed in — just hit send to chat &amp; order.</p>
  </div>
</section>` : ""}

<!-- About & Hours -->
<section id="about" class="max-w-6xl mx-auto px-6 py-20 grid sm:grid-cols-5 gap-10 items-center">
  <div class="sm:col-span-3 space-y-6">
    <span class="text-xs font-bold uppercase tracking-widest" style="color:var(--primary);">Our Story</span>
    <h2 class="text-3xl md:text-4xl font-bold text-white font-display">${escapeHtml(content.philosophyHeading)}</h2>
    <p class="text-neutral-300 leading-relaxed">${escapeHtml(content.aboutUs)}</p>
    <p class="text-neutral-400 leading-relaxed text-sm">${escapeHtml(content.secondaryAbout)}</p>
  </div>
  <div class="sm:col-span-2 r-card p-6" style="${cardStyle}">
    <p class="text-xs uppercase tracking-widest font-semibold mb-3 font-display" style="color:var(--primary);">Hours</p>
    <table class="w-full text-sm">
      ${lead.openingHours.length > 0
        ? lead.openingHours
            .map((line) => {
              const [day, hours] = splitHoursLine(line);
              return `<tr style="border-bottom:1px solid rgba(255,255,255,0.08);"><td class="py-1.5 font-medium">${escapeHtml(day)}</td><td class="py-1.5 text-right" style="${mutedStyle}">${escapeHtml(hours)}</td></tr>`;
            })
            .join("")
        : `<tr><td class="py-1.5" style="${mutedStyle}">Hours not listed — contact us</td></tr>`}
    </table>
  </div>
</section>

<!-- Menu -->
<section id="featured" class="py-20" style="background:#141414;">
  <div class="max-w-6xl mx-auto px-6">
    <div class="text-center space-y-3 mb-12">
      <span class="text-xs font-bold uppercase tracking-widest" style="color:var(--primary);">Menu &amp; Selection</span>
      <h2 class="text-4xl font-bold text-white font-display">Our Menu</h2>
    </div>
    <div class="space-y-12 max-w-4xl mx-auto">
      ${activeMenuSections.map((section) => `
      <div>
        ${section.category ? `<h3 class="text-xl font-semibold mb-5 font-display" style="color:var(--primary);">${escapeHtml(section.category)}</h3>` : ""}
        <div class="grid sm:grid-cols-2 gap-4">
          ${section.items.map((item) => `
          <div class="flex items-baseline justify-between gap-4 r-card p-4" style="${cardStyle}">
            <div class="min-w-0">
              <p class="font-medium text-white font-display">${escapeHtml(item.name)}</p>
              ${item.description ? `<p class="text-xs mt-0.5" style="${mutedStyle}">${escapeHtml(item.description)}</p>` : ""}
            </div>
            ${item.price ? `<span class="font-semibold whitespace-nowrap" style="color:var(--primary);">$${escapeHtml(item.price)}</span>` : ""}
          </div>`).join("")}
        </div>
      </div>`).join("")}
    </div>
    <p class="text-xs text-center mt-8" style="${mutedStyle}">Prices range from $3.50 to $21.00. Availability and prices may vary.</p>
    
    ${originalMenuPhotoUrl || lead.website ? `<div class="text-center mt-8"><a href="${originalMenuPhotoUrl || lead.website}" target="_blank" class="inline-block px-6 py-3 r-card font-medium border font-display" style="border-color:var(--primary); color:var(--primary);">View Official Menu Link ↗</a></div>` : ""}
    ${menuCarouselHtml}
  </div>
</section>

<!-- Reservation Form -->
<section id="reserve" class="py-24 border-t border-white/10">
  <div class="max-w-3xl mx-auto px-6">
    <div class="text-center space-y-3 mb-12">
      <span class="text-xs font-bold uppercase tracking-widest" style="color:var(--primary);">Book Your Table</span>
      <h2 class="text-4xl font-bold text-white font-display">Reservation</h2>
    </div>
    <form id="reserve-form" class="space-y-4 r-card p-8" style="${cardStyle}">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-sm block mb-1" style="${mutedStyle}">Full Name</label>
          <input id="f-name" required class="w-full rounded-md px-3 py-2 text-sm ${inputClass}" placeholder="Jane Doe" />
        </div>
        <div>
          <label class="text-sm block mb-1" style="${mutedStyle}">Phone</label>
          <input id="f-phone" type="tel" class="w-full rounded-md px-3 py-2 text-sm ${inputClass}" placeholder="(555) 123-4567" />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-sm block mb-1" style="${mutedStyle}">Guests</label>
          <select id="f-guests" class="w-full rounded-md px-3 py-2 text-sm ${inputClass}">
            <option value="2">2 Guests</option>
            <option value="4">4 Guests</option>
            <option value="6+">6+ Guests</option>
          </select>
        </div>
        <div>
          <label class="text-sm block mb-1" style="${mutedStyle}">Time</label>
          <input id="f-time" type="time" value="19:00" class="w-full rounded-md px-3 py-2 text-sm ${inputClass}" />
        </div>
      </div>
      <div>
        <label class="text-sm block mb-1" style="${mutedStyle}">Date (Click to Open Calendar)</label>
        <input id="f-date" type="date" required onclick="this.showPicker && this.showPicker()" class="w-full rounded-md px-3 py-2 text-sm ${inputClass} cursor-pointer" />
      </div>
      <div>
        <label class="text-sm block mb-1" style="${mutedStyle}">Special Requests</label>
        <textarea id="f-note" rows="3" class="w-full rounded-md px-3 py-2 text-sm ${inputClass}" placeholder="Allergies, special occasion..."></textarea>
      </div>
      <button type="submit" class="w-full btn-primary font-medium py-3.5 r-card">Send Reservation via WhatsApp</button>
    </form>
  </div>
</section>

<!-- Footer -->
<footer class="bg-black py-12 text-sm text-neutral-400 border-t border-white/10">
  <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
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
