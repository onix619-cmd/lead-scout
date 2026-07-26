import { GeneratedContent, Lead } from "./types";

const FOOD_CATEGORIES = ["restaurant", "pizza", "cafe", "coffee", "bakery", "bar", "food"];

function isFoodBusiness(category: string) {
  return FOOD_CATEGORIES.some((k) => category.toLowerCase().includes(k));
}

// Deliberately not pulled from a real logo yet — placeholder for that later.
const PALETTES = [
  { primary: "#b45309", accent: "#fef3c7", dark: "#111111" },
  { primary: "#7c2d12", accent: "#fee2e2", dark: "#111111" },
  { primary: "#166534", accent: "#dcfce7", dark: "#0d1712" },
  { primary: "#1e3a8a", accent: "#dbeafe", dark: "#0b0f1a" },
  { primary: "#701a75", accent: "#fae8ff", dark: "#150e1a" },
  { primary: "#0f766e", accent: "#ccfbf1", dark: "#0a1615" },
];

function paletteFor(name: string) {
  const hash = [...name].reduce((s, c) => s + c.charCodeAt(0), 0);
  return PALETTES[hash % PALETTES.length];
}

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

// Splits "Monday: 9:00 AM – 5:00 PM" style strings into [day, hours].
function splitHoursLine(line: string): [string, string] {
  const idx = line.indexOf(":");
  if (idx === -1) return [line, ""];
  return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
}

export function generateLandingPageHTML(lead: Lead, content: GeneratedContent): string {
  const palette = paletteFor(lead.name);
  const food = isFoodBusiness(lead.category);
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

  const starsHtml = (count: number) =>
    Array.from({ length: 5 })
      .map((_, i) => `<span style="color:${i < count ? "#facc15" : "#4b5563"};">★</span>`)
      .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(content.seoTitle)}</title>
<meta name="description" content="${escapeHtml(content.metaDescription)}" />
<script src="https://cdn.tailwindcss.com"></script>
<style>
  html { scroll-behavior: smooth; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  :root { --primary: ${palette.primary}; --accent: ${palette.accent}; --dark: ${palette.dark}; }
  .btn-primary { background: var(--primary); }
  .text-primary { color: var(--primary); }
  .bg-accent { background: var(--accent); }
  .bg-dark { background: var(--dark); }
</style>
</head>
<body class="text-slate-800 bg-white">

<!-- Sticky Nav -->
<nav class="fixed top-0 left-0 right-0 z-50 bg-dark/90 backdrop-blur text-white">
  <div class="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
    <a href="#top" class="font-bold text-lg tracking-tight">${escapeHtml(lead.name)}</a>
    <div class="hidden sm:flex items-center gap-6 text-sm">
      <a href="#about" class="hover:text-primary" style="--tw-text-opacity:1;">About</a>
      <a href="#gallery" class="hover:opacity-80">Gallery</a>
      <a href="#reviews" class="hover:opacity-80">Reviews</a>
      <a href="#reserve" class="hover:opacity-80">${food ? "Reserve" : "Book"}</a>
      <a href="#contact" class="hover:opacity-80">Contact</a>
    </div>
    <a href="#reserve" class="btn-primary text-white text-sm font-medium px-4 py-2 rounded-md">
      ${food ? "Reserve a Table" : "Book Now"}
    </a>
  </div>
</nav>

<!-- Hero -->
<header id="top" class="relative pt-16" style="background:var(--dark);">
  ${heroImage ? `<img src="${heroImage}" alt="${escapeHtml(lead.name)}" class="w-full h-[80vh] object-cover opacity-50" />` : `<div class="w-full h-[60vh]"></div>`}
  <div class="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pt-16">
    <h1 class="text-white text-4xl sm:text-6xl font-bold tracking-tight drop-shadow">${escapeHtml(lead.name)}</h1>
    <p class="text-white/90 text-lg sm:text-xl mt-4 max-w-xl">${escapeHtml(content.tagline)}</p>
    <div class="mt-3 flex items-center gap-1 text-sm">${starsHtml(filledStars)} <span class="text-white/80 ml-1">${lead.rating ?? "—"} (${lead.reviewCount} reviews)</span></div>
    <div class="mt-8 flex flex-wrap gap-3 justify-center">
      <a href="#reserve" class="px-6 py-3 rounded-md text-white font-medium btn-primary">${food ? "Reserve a Table" : "Book Now"}</a>
      ${lead.phone ? `<a href="tel:${lead.phone}" class="px-6 py-3 rounded-md bg-white/10 text-white font-medium border border-white/40">Call ${escapeHtml(lead.phone)}</a>` : ""}
      ${wa ? `<a href="${wa}" target="_blank" class="px-6 py-3 rounded-md bg-[#25D366] text-white font-medium">WhatsApp</a>` : ""}
    </div>
  </div>
</header>

<!-- About -->
<section id="about" class="max-w-6xl mx-auto px-6 py-20 grid sm:grid-cols-5 gap-10">
  <div class="sm:col-span-3">
    <p class="text-xs uppercase tracking-widest text-primary font-semibold mb-2">About</p>
    <h2 class="text-3xl font-semibold mb-5">${escapeHtml(lead.name)}</h2>
    <p class="text-slate-600 leading-relaxed mb-6">${escapeHtml(content.aboutUs)}</p>
    <div class="grid sm:grid-cols-2 gap-3">
      ${content.highlights.map((h) => `
      <div class="flex items-start gap-2">
        <span class="text-primary mt-0.5">✓</span>
        <span class="text-sm text-slate-700">${escapeHtml(h)}</span>
      </div>`).join("")}
    </div>
  </div>
  <div class="sm:col-span-2 bg-accent rounded-xl p-6 h-fit">
    <p class="text-xs uppercase tracking-widest font-semibold mb-3" style="color:var(--primary);">Hours</p>
    <table class="w-full text-sm">
      ${lead.openingHours.length > 0
        ? lead.openingHours
            .map((line) => {
              const [day, hours] = splitHoursLine(line);
              return `<tr class="border-b border-black/5"><td class="py-1.5 font-medium">${escapeHtml(day)}</td><td class="py-1.5 text-right text-slate-600">${escapeHtml(hours)}</td></tr>`;
            })
            .join("")
        : `<tr><td class="py-1.5 text-slate-500">Hours not listed — contact us</td></tr>`}
    </table>
    <div class="mt-5 pt-4 border-t border-black/10 text-sm">
      <p class="font-medium">${escapeHtml(lead.address)}</p>
      ${lead.phone ? `<a href="tel:${lead.phone}" class="block mt-1 text-primary">${escapeHtml(lead.phone)}</a>` : ""}
    </div>
  </div>
</section>

<!-- Gallery -->
${galleryImages.length > 0 ? `
<section id="gallery" class="bg-accent py-20">
  <div class="max-w-6xl mx-auto px-6">
    <p class="text-xs uppercase tracking-widest font-semibold mb-2" style="color:var(--primary);">Gallery</p>
    <h2 class="text-3xl font-semibold mb-8">A Look Inside</h2>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      ${galleryImages.map((img) => `<img src="${img}" class="w-full h-40 sm:h-52 object-cover rounded-lg" />`).join("")}
    </div>
  </div>
</section>` : ""}

<!-- Reviews -->
<section id="reviews" class="max-w-4xl mx-auto px-6 py-20 text-center">
  <p class="text-xs uppercase tracking-widest font-semibold mb-2" style="color:var(--primary);">Reviews</p>
  <h2 class="text-3xl font-semibold mb-4">What People Are Saying</h2>
  <div class="text-3xl mb-2">${starsHtml(filledStars)}</div>
  <p class="text-slate-600">${lead.rating ?? "—"} out of 5 · ${lead.reviewCount} Google reviews</p>
  <a href="${lead.mapsUrl}" target="_blank" class="inline-block mt-5 text-sm font-medium text-primary underline underline-offset-4">Read reviews on Google →</a>
</section>

<!-- Reservation / Order -->
<section id="reserve" class="py-20 text-white" style="background:var(--dark);">
  <div class="max-w-lg mx-auto px-6">
    <p class="text-xs uppercase tracking-widest font-semibold mb-2" style="color:${palette.accent};">${food ? "Reserve" : "Book"}</p>
    <h2 class="text-3xl font-semibold mb-2">${food ? "Reserve Your Table" : "Book / Order"}</h2>
    <p class="text-white/70 mb-6 text-sm">${wa ? "Sends your request directly via WhatsApp — no account needed." : "Fill in your details and we'll get in touch."}</p>

    <div class="flex gap-2 mb-5">
      <button type="button" id="mode-reservation" onclick="setMode('reservation')" class="flex-1 py-2 rounded-md text-sm font-medium btn-primary">Reservation</button>
      <button type="button" id="mode-order" onclick="setMode('order')" class="flex-1 py-2 rounded-md text-sm font-medium bg-white/10 border border-white/20">Order / Question</button>
    </div>

    <form id="reserve-form" class="space-y-4 bg-white/5 border border-white/10 rounded-xl p-6">
      <div>
        <label class="text-sm text-white/80 block mb-1">Your name</label>
        <input id="f-name" required class="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-sm text-white placeholder-white/40" placeholder="Jane Doe" />
      </div>

      <div id="reservation-fields" class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-sm text-white/80 block mb-1">Guests</label>
            <select id="f-guests" class="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-sm text-white">
              ${Array.from({ length: 10 }, (_, i) => i + 1).map((n) => `<option value="${n}" ${n === 2 ? "selected" : ""}>${n} ${n === 1 ? "person" : "people"}</option>`).join("")}
            </select>
          </div>
          <div>
            <label class="text-sm text-white/80 block mb-1">Time</label>
            <input id="f-time" type="time" value="19:00" class="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-sm text-white" />
          </div>
        </div>
        <div>
          <label class="text-sm text-white/80 block mb-1">Date</label>
          <input id="f-date" type="date" class="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-sm text-white" />
        </div>
      </div>

      <div>
        <label class="text-sm text-white/80 block mb-1">Note (optional)</label>
        <textarea id="f-note" rows="3" class="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-sm text-white placeholder-white/40" placeholder="${food ? "Allergies, special occasion, seating preference..." : "What do you need?"}"></textarea>
      </div>

      <button type="submit" class="w-full btn-primary text-white font-medium py-3 rounded-md">
        ${wa ? "Send via WhatsApp" : "Submit"}
      </button>
      <p class="text-xs text-white/50 text-center">This mockup sends requests via WhatsApp — no bookings are actually processed by this demo site.</p>
    </form>
  </div>
</section>

<!-- Contact -->
<section id="contact" class="max-w-4xl mx-auto px-6 py-20 text-center">
  <p class="text-xs uppercase tracking-widest font-semibold mb-2" style="color:var(--primary);">Visit Us</p>
  <h2 class="text-3xl font-semibold mb-4">${escapeHtml(lead.address)}</h2>
  <div class="flex flex-wrap gap-3 justify-center mt-6">
    <a href="${lead.mapsUrl}" target="_blank" class="px-6 py-3 rounded-md text-white font-medium btn-primary">Get Directions</a>
    ${lead.phone ? `<a href="tel:${lead.phone}" class="px-6 py-3 rounded-md border border-slate-300 font-medium">Call ${escapeHtml(lead.phone)}</a>` : ""}
    ${wa ? `<a href="${wa}" target="_blank" class="px-6 py-3 rounded-md bg-[#25D366] text-white font-medium">WhatsApp</a>` : ""}
  </div>
</section>

<!-- FAQ -->
<section class="bg-accent py-20">
  <div class="max-w-3xl mx-auto px-6">
    <p class="text-xs uppercase tracking-widest font-semibold mb-2" style="color:var(--primary);">FAQ</p>
    <h2 class="text-3xl font-semibold mb-8">Frequently Asked Questions</h2>
    <div class="space-y-4">
      ${content.faq.map((f) => `
      <div class="bg-white rounded-lg p-4">
        <p class="font-medium">${escapeHtml(f.question)}</p>
        <p class="text-slate-600 mt-1 text-sm">${escapeHtml(f.answer)}</p>
      </div>`).join("")}
    </div>
  </div>
</section>

<!-- Footer -->
<footer class="text-white py-12 text-center" style="background:var(--dark);">
  <p class="font-semibold text-lg">${escapeHtml(lead.name)}</p>
  <p class="text-white/70 mt-1">${escapeHtml(lead.address)}</p>
  ${lead.phone ? `<a href="tel:${lead.phone}" class="block text-white/70 mt-1">${escapeHtml(lead.phone)}</a>` : ""}
  <div class="mt-4 flex gap-4 justify-center text-white/80 text-sm">
    ${lead.socialLinks?.instagram ? `<a href="${lead.socialLinks.instagram}" target="_blank">Instagram</a>` : ""}
    ${lead.socialLinks?.facebook ? `<a href="${lead.socialLinks.facebook}" target="_blank">Facebook</a>` : ""}
    <a href="${lead.mapsUrl}" target="_blank">Google Maps</a>
  </div>
  <p class="text-white/40 text-xs mt-6">Website mockup generated for demo purposes.</p>
</footer>

<script>
  let mode = 'reservation';
  function setMode(m) {
    mode = m;
    document.getElementById('reservation-fields').style.display = m === 'reservation' ? 'block' : 'none';
    document.getElementById('mode-reservation').className = m === 'reservation'
      ? 'flex-1 py-2 rounded-md text-sm font-medium btn-primary'
      : 'flex-1 py-2 rounded-md text-sm font-medium bg-white/10 border border-white/20';
    document.getElementById('mode-order').className = m === 'order'
      ? 'flex-1 py-2 rounded-md text-sm font-medium btn-primary'
      : 'flex-1 py-2 rounded-md text-sm font-medium bg-white/10 border border-white/20';
  }

  document.getElementById('reserve-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('f-name').value.trim();
    const note = document.getElementById('f-note').value.trim();
    let msg = 'Hi ${escapeHtml(lead.name).replace(/'/g, "\\'")}, ';
    if (mode === 'reservation') {
      const guests = document.getElementById('f-guests').value;
      const date = document.getElementById('f-date').value;
      const time = document.getElementById('f-time').value;
      msg += 'I would like to reserve a table for ' + guests + ' people on ' + (date || '[date]') + ' at ' + (time || '[time]') + '. Name: ' + name + '.';
    } else {
      msg += 'I have a question / order request: ' + (note || '[details]') + '. Name: ' + name + '.';
    }
    if (mode === 'reservation' && note) msg += ' Note: ' + note;

    ${wa
      ? `window.open('https://wa.me/${waNum}?text=' + encodeURIComponent(msg), '_blank');`
      : `alert('Thanks ' + name + '! Please call us directly to confirm: ${escapeHtml(lead.phone ?? "see contact section")}');`}
  });
</script>

</body>
</html>`;
}
