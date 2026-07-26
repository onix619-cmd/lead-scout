import { GeneratedContent, Lead } from "./types";
import { detectThemeKey, getTheme } from "./theme";

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

export function generateLandingPageHTML(lead: Lead, content: GeneratedContent): string {
  const themeKey = detectThemeKey(lead.category, lead.name);
  const theme = getTheme(themeKey, lead.name);
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
      .map((_, i) => `<span style="color:${i < count ? "#facc15" : "#9ca3af"};">★</span>`)
      .join("");

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
    --primary: ${theme.primary}; --accent: ${theme.accent}; --dark: ${theme.dark}; --text: ${theme.text}; --radius: ${theme.radius};
  }
  .btn-primary { background: var(--primary); }
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
  ${theme.playful ? `
  @keyframes floaty { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-14px) rotate(8deg); } }
  .sprinkle { position: absolute; animation: floaty 4s ease-in-out infinite; opacity: 0.7; }
  ` : `
  .parallax { background-attachment: fixed; }
  `}
  html.dark-mode body { background: #0a0a0a; color: #e5e5e5; }
</style>
</head>
<body class="text-slate-800 bg-white">

${theme.playful ? `
<div class="sprinkle text-3xl" style="top:8%; left:6%;">🍨</div>
<div class="sprinkle text-2xl" style="top:14%; right:8%; animation-delay:1s;">🍦</div>
<div class="sprinkle text-2xl" style="top:24%; left:14%; animation-delay:2s;">🍭</div>
` : ""}

<!-- Sticky Nav -->
<nav class="fixed top-0 left-0 right-0 z-50 glass text-white">
  <div class="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
    <a href="#top" class="font-display font-bold text-lg tracking-tight">${escapeHtml(lead.name)}</a>
    <div class="hidden sm:flex items-center gap-6 text-sm">
      <a href="#about" class="hover:opacity-80">About</a>
      <a href="#featured" class="hover:opacity-80">${theme.labels.menu}</a>
      <a href="#gallery" class="hover:opacity-80">Gallery</a>
      <a href="#reviews" class="hover:opacity-80">Reviews</a>
      <a href="#contact" class="hover:opacity-80">Contact</a>
    </div>
    <button onclick="document.documentElement.classList.toggle('dark-mode')" class="hidden sm:inline text-xs border border-white/30 rounded-full px-3 py-1 mr-2">Dark mode</button>
    <a href="#reserve" class="btn-primary text-white text-sm font-medium px-4 py-2 r-card">${theme.labels.reserveCta}</a>
  </div>
</nav>

<!-- Hero -->
<header id="top" class="relative pt-16" style="background:var(--dark);">
  ${heroImage ? `<img src="${heroImage}" alt="${escapeHtml(lead.name)}" class="w-full h-[85vh] object-cover opacity-55 ${theme.playful ? "" : "parallax"}" />` : `<div class="w-full h-[60vh]"></div>`}
  <div class="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pt-16">
    <h1 class="text-white text-4xl sm:text-6xl font-bold tracking-tight drop-shadow font-display">${escapeHtml(lead.name)}</h1>
    <p class="text-white/90 text-lg sm:text-xl mt-4 max-w-xl">${escapeHtml(content.tagline)}</p>
    <p class="text-white/70 text-sm mt-2 uppercase tracking-widest">${escapeHtml(lead.category)}</p>
    ${lead.rating ? `<div class="mt-3 flex items-center gap-1 text-sm">${starsHtml(filledStars)} <span class="text-white/80 ml-1">${lead.rating} (${lead.reviewCount} reviews)</span></div>` : ""}
    <div class="mt-8 flex flex-wrap gap-3 justify-center">
      <a href="#reserve" class="px-6 py-3 r-card text-white font-medium btn-primary hover-scale">${theme.labels.reserveCta}</a>
      <a href="#featured" class="px-6 py-3 r-card bg-white/10 text-white font-medium border border-white/40 hover-scale">View ${theme.labels.menu}</a>
    </div>
    <div class="mt-8 flex flex-wrap gap-4 justify-center text-white/80 text-xs">
      <span>${escapeHtml(lead.address)}</span>
      ${lead.phone ? `<span>·</span><span>${escapeHtml(lead.phone)}</span>` : ""}
    </div>
  </div>
</header>

<!-- About -->
<section id="about" class="max-w-6xl mx-auto px-6 py-20 grid sm:grid-cols-5 gap-10 reveal">
  <div class="sm:col-span-3">
    <p class="text-xs uppercase tracking-widest text-primary font-semibold mb-2">Our Story</p>
    <h2 class="text-3xl font-semibold mb-5 font-display">${escapeHtml(lead.name)}</h2>
    <p class="text-slate-600 leading-relaxed mb-6">${escapeHtml(content.aboutUs)}</p>
    <div class="grid sm:grid-cols-2 gap-3">
      ${content.highlights.map((h) => `
      <div class="flex items-start gap-2">
        <span class="text-primary mt-0.5">✓</span>
        <span class="text-sm text-slate-700">${escapeHtml(h)}</span>
      </div>`).join("")}
    </div>
  </div>
  <div class="sm:col-span-2 bg-accent r-card p-6 h-fit">
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

<!-- Featured / Signature / Flavors -->
<section id="featured" class="bg-accent py-20 reveal">
  <div class="max-w-6xl mx-auto px-6">
    <p class="text-xs uppercase tracking-widest font-semibold mb-2" style="color:var(--primary);">${theme.labels.featured}</p>
    <h2 class="text-3xl font-semibold mb-8 font-display">What We're Known For</h2>
    <div class="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
      ${content.highlights.map((h, i) => `
      <div class="bg-white r-card p-5 shadow-sm hover-scale">
        <div class="text-2xl mb-3">${theme.playful ? ["🍦", "🍨", "🍧", "🍫"][i % 4] : themeKey === "coffee" ? ["☕", "🥐", "🍰", "🫘"][i % 4] : ["🍽️", "🍷", "👨‍🍳", "⭐"][i % 4]}</div>
        <p class="font-medium">${escapeHtml(h)}</p>
      </div>`).join("")}
    </div>
    <p class="text-xs text-slate-500 mt-6">Ask us about our full ${themeKey === "coffee" ? "drink and food" : themeKey === "icecream" ? "flavor" : "current"} menu in person or by phone.</p>
  </div>
</section>

<!-- Gallery -->
${galleryImages.length > 0 ? `
<section id="gallery" class="py-20 reveal">
  <div class="max-w-6xl mx-auto px-6">
    <p class="text-xs uppercase tracking-widest font-semibold mb-2" style="color:var(--primary);">Gallery</p>
    <h2 class="text-3xl font-semibold mb-8 font-display">A Look Inside</h2>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      ${galleryImages.map((img) => `<img src="${img}" class="w-full h-40 sm:h-52 object-cover r-card hover-scale" />`).join("")}
    </div>
  </div>
</section>` : ""}

<!-- Reviews -->
<section id="reviews" class="bg-dark py-20 text-center reveal">
  <p class="text-xs uppercase tracking-widest font-semibold mb-2" style="color:var(--accent);">Reviews</p>
  <h2 class="text-3xl font-semibold mb-4 font-display" style="color:var(--text);">What People Are Saying</h2>
  <div class="text-3xl mb-2">${starsHtml(filledStars)}</div>
  <p style="color:var(--text); opacity:.8;">${lead.rating ?? "—"} out of 5 · ${lead.reviewCount} Google reviews</p>
  <a href="${lead.mapsUrl}" target="_blank" class="inline-block mt-5 text-sm font-medium underline underline-offset-4" style="color:var(--accent);">Read reviews on Google →</a>
</section>

<!-- Reservation / Order -->
<section id="reserve" class="py-20" style="background:var(--accent);">
  <div class="max-w-lg mx-auto px-6">
    <p class="text-xs uppercase tracking-widest font-semibold mb-2" style="color:var(--primary);">${theme.labels.reserveCta}</p>
    <h2 class="text-3xl font-semibold mb-2 font-display">${theme.labels.reserveCta}</h2>
    <p class="text-slate-600 mb-6 text-sm">${wa ? "Sends your request directly via WhatsApp — no account needed." : "Fill in your details and we'll get in touch."}</p>

    <div class="flex gap-2 mb-5">
      <button type="button" id="mode-reservation" onclick="setMode('reservation')" class="flex-1 py-2 r-card text-sm font-medium btn-primary text-white">Reservation</button>
      <button type="button" id="mode-order" onclick="setMode('order')" class="flex-1 py-2 r-card text-sm font-medium bg-white border border-slate-300">Order / Question</button>
    </div>

    <form id="reserve-form" class="space-y-4 bg-white r-card p-6 shadow-sm">
      <div>
        <label class="text-sm text-slate-600 block mb-1">Your name</label>
        <input id="f-name" required class="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm" placeholder="Jane Doe" />
      </div>

      <div id="reservation-fields" class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-sm text-slate-600 block mb-1">Guests</label>
            <select id="f-guests" class="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm">
              ${Array.from({ length: 10 }, (_, i) => i + 1).map((n) => `<option value="${n}" ${n === 2 ? "selected" : ""}>${n} ${n === 1 ? "person" : "people"}</option>`).join("")}
            </select>
          </div>
          <div>
            <label class="text-sm text-slate-600 block mb-1">Time</label>
            <input id="f-time" type="time" value="19:00" class="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label class="text-sm text-slate-600 block mb-1">Date</label>
          <input id="f-date" type="date" class="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label class="text-sm text-slate-600 block mb-1">Note (optional)</label>
        <textarea id="f-note" rows="3" class="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm" placeholder="Allergies, special occasion, seating preference..."></textarea>
      </div>

      <button type="submit" class="w-full btn-primary text-white font-medium py-3 r-card hover-scale">
        ${wa ? "Send via WhatsApp" : "Submit"}
      </button>
      <p class="text-xs text-slate-500 text-center">This mockup sends requests via WhatsApp — no bookings are actually processed by this demo site.</p>
    </form>
  </div>
</section>

<!-- FAQ -->
<section class="max-w-3xl mx-auto px-6 py-20 reveal">
  <p class="text-xs uppercase tracking-widest font-semibold mb-2" style="color:var(--primary);">FAQ</p>
  <h2 class="text-3xl font-semibold mb-8 font-display">Frequently Asked Questions</h2>
  <div class="space-y-4">
    ${content.faq.map((f) => `
    <div class="bg-accent r-card p-4">
      <p class="font-medium">${escapeHtml(f.question)}</p>
      <p class="text-slate-600 mt-1 text-sm">${escapeHtml(f.answer)}</p>
    </div>`).join("")}
  </div>
</section>

<!-- Contact -->
<section id="contact" class="max-w-4xl mx-auto px-6 py-20 text-center reveal">
  <p class="text-xs uppercase tracking-widest font-semibold mb-2" style="color:var(--primary);">Visit Us</p>
  <h2 class="text-3xl font-semibold mb-4 font-display">${escapeHtml(lead.address)}</h2>
  <div class="flex flex-wrap gap-3 justify-center mt-6">
    <a href="${lead.mapsUrl}" target="_blank" class="px-6 py-3 r-card text-white font-medium btn-primary hover-scale">Get Directions</a>
    ${lead.phone ? `<a href="tel:${lead.phone}" class="px-6 py-3 r-card border border-slate-300 font-medium hover-scale">Call ${escapeHtml(lead.phone)}</a>` : ""}
    ${wa ? `<a href="${wa}" target="_blank" class="px-6 py-3 r-card bg-[#25D366] text-white font-medium hover-scale">WhatsApp</a>` : ""}
  </div>
</section>

<!-- Footer -->
<footer class="text-white py-12 text-center" style="background:var(--dark);">
  <p class="font-display font-semibold text-lg">${escapeHtml(lead.name)}</p>
  <p class="text-white/70 mt-1">${escapeHtml(lead.address)}</p>
  ${lead.phone ? `<a href="tel:${lead.phone}" class="block text-white/70 mt-1">${escapeHtml(lead.phone)}</a>` : ""}
  <div class="mt-5 max-w-xs mx-auto">
    <p class="text-xs text-white/50 mb-2">Get updates from us</p>
    <form onsubmit="event.preventDefault(); this.querySelector('.ok').classList.remove('hidden'); this.querySelector('input').value='';" class="flex gap-2">
      <input type="email" required placeholder="you@email.com" class="flex-1 min-w-0 rounded-md px-3 py-1.5 text-sm text-black" />
      <button class="btn-primary text-white text-xs font-medium px-3 rounded-md">Sign up</button>
    </form>
    <p class="ok hidden text-xs text-white/60 mt-1">Thanks — you're on the list.</p>
  </div>
  <div class="mt-5 flex gap-4 justify-center text-white/80 text-sm">
    ${lead.socialLinks?.instagram ? `<a href="${lead.socialLinks.instagram}" target="_blank">Instagram</a>` : ""}
    ${lead.socialLinks?.facebook ? `<a href="${lead.socialLinks.facebook}" target="_blank">Facebook</a>` : ""}
    <a href="${lead.mapsUrl}" target="_blank">Google Maps</a>
    <a href="#top">Back to top ↑</a>
  </div>
  <p class="text-white/40 text-xs mt-6">Website mockup generated for demo purposes.</p>
</footer>

<!-- Floating action buttons -->
<div class="fixed bottom-5 right-5 z-50 flex flex-col gap-3 items-end">
  ${wa ? `<a href="${wa}" target="_blank" class="float-btn bg-[#25D366] text-white rounded-full w-12 h-12 flex items-center justify-center text-xl">💬</a>` : ""}
  ${lead.phone ? `<a href="tel:${lead.phone}" class="float-btn btn-primary text-white rounded-full w-12 h-12 flex items-center justify-center text-lg">📞</a>` : ""}
  <a href="#reserve" class="float-btn bg-white border border-slate-300 text-xs font-medium px-4 py-2.5 rounded-full">${theme.labels.reserveCta}</a>
</div>

<script>
  let mode = 'reservation';
  function setMode(m) {
    mode = m;
    document.getElementById('reservation-fields').style.display = m === 'reservation' ? 'block' : 'none';
    document.getElementById('mode-reservation').className = m === 'reservation'
      ? 'flex-1 py-2 r-card text-sm font-medium btn-primary text-white'
      : 'flex-1 py-2 r-card text-sm font-medium bg-white border border-slate-300';
    document.getElementById('mode-order').className = m === 'order'
      ? 'flex-1 py-2 r-card text-sm font-medium btn-primary text-white'
      : 'flex-1 py-2 r-card text-sm font-medium bg-white border border-slate-300';
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
      msg += 'I would like to reserve for ' + guests + ' people on ' + (date || '[date]') + ' at ' + (time || '[time]') + '. Name: ' + name + '.';
    } else {
      msg += 'I have a question / order request: ' + (note || '[details]') + '. Name: ' + name + '.';
    }
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
