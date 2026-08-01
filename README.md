# Lead Scout — Phase 1 + 2

This is a small web app. Once it's live, you use it like any website — no
terminal needed day-to-day. It does:

1. **Finds businesses** in a city/category using Google Places (Agent 1).
2. **Scores their websites** on 12 concrete signals — HTTPS, mobile-friendly,
   speed, WhatsApp button, reservations, reviews embedded, etc. — and flags
   businesses with no website as "high priority" (Agent 2).
3. **Generates a landing page** for any lead — hero, about, services/menu,
   reviews, WhatsApp + call buttons, hours, FAQ, footer — with AI-written
   copy (Agent 3 + Agent 4).
4. **Auto-deploys it to Vercel** and hands you back a live URL (Agent 5) —
   click "Generate Website" (or "Generate Better Website") on any lead.

You can click **Save to CRM** on any lead once Supabase is connected (step 4
below) — that's the groundwork for the CRM table from your original plan.
The full CRM view and AI outreach emails (Agent 6) aren't built yet — next
phase.

## What you need

- A Google Cloud project with **Places API (New)** enabled, and an API key.
  You said you already have Google Cloud set up — just confirm this specific
  API is enabled: console.cloud.google.com → "APIs & Services" → search
  "Places API (New)" → Enable → then "Credentials" → create an API key.
- **New:** also enable **Geocoding API** on the same project (same page:
  "APIs & Services" → Library → search "Geocoding API" → Enable). This
  powers the "search by address + radius" feature — your existing
  `GOOGLE_PLACES_API_KEY` works for it too, nothing new to copy.
- Address autocomplete (suggestions as you type) uses the same Places API
  (New) you already enabled — no extra setup needed.
- An xAI Grok API key (no Google billing link needed — separate provider
  from the free-tier hassle Gemini had):
  1. Go to **console.x.ai** and sign in / sign up.
  2. Go to **API Keys** → **Create API Key**.
  3. Copy the key immediately.
- A **free** Vercel API token so the app can deploy generated sites for you:
  1. Go to **vercel.com/account/tokens**.
  2. Click **Create Token**, give it any name, no expiration (or pick one),
     scope = your personal account → **Create**.
  3. Copy the token immediately — Vercel only shows it once.
- A GitHub account (you have this) — only used for Phase 1's own deployment,
  not for the generated business sites (those deploy directly, no repo).
- A Vercel account (you have this).
- (Optional, can do later) A free Supabase project — only needed for the
  "Save to CRM" button and for storing each lead's generated site URL.

## Step 1 — Get the code onto GitHub

1. Go to github.com → New repository → name it e.g. `lead-scout` → Create.
2. On your own computer (or GitHub's "upload files" in the browser), upload
   everything in this project folder to that new repository.
   - Easiest no-terminal way: on the new repo's page, click
     "uploading an existing file" and drag in all the files/folders.

## Step 2 — Deploy to Vercel

1. Go to vercel.com → **Add New… → Project**.
2. Import the `lead-scout` GitHub repo you just created.
3. Before clicking Deploy, open **Environment Variables** and add all of:
   - `GOOGLE_PLACES_API_KEY` = your Google Places API key
   - `XAI_API_KEY` = your xAI Grok API key
   - `VERCEL_API_TOKEN` = your Vercel token
4. Click **Deploy**. In ~1 minute you'll get a URL like
   `https://lead-scout-yourname.vercel.app` — that's your dashboard.

**Important:** generated business sites deploy under the *same Vercel
account* as this dashboard. That's expected and fine — they'll show up as
separate projects in your Vercel dashboard, each with their own URL like
`https://joes-pizza-ab12cd34.vercel.app`.

## Step 4 — (Optional now) Connect Supabase so "Save to CRM" and generated URLs persist

1. Go to supabase.com → New project (free tier is fine).
2. Once it's created, go to **SQL Editor → New query**, paste in the
   contents of `supabase-schema.sql` from this project, and run it. This
   creates the `leads` table.
3. In Supabase, go to **Project Settings → API** and copy:
   - Project URL → in Vercel, add env var `NEXT_PUBLIC_SUPABASE_URL`
   - `service_role` secret key → in Vercel, add env var
     `SUPABASE_SERVICE_ROLE_KEY`
4. In Vercel, go to your project → Deployments → redeploy (or just push any
   change to GitHub) so the new env vars take effect.

## Using it

Open your Vercel URL, pick a category and city (e.g. "Restaurants" /
"Montreal"), set a minimum rating, and hit Search. Each result shows:

- **No website** → automatically flagged high priority.
- **Website score X/100** → click "Show details" to see exactly what's
  missing (mobile-friendly, WhatsApp, reservations, etc.) — this is the same
  list you'd use in an outreach email.

## A note on search size (up to 100 results)

Google's Places API hard-caps a single search at 60 results — that's a
fixed platform limit, not something any setting or paid tier raises. To
reach up to 100, address+radius searches now run the same query from
several overlapping points within your radius and merge the unique
businesses found. This means noticeably more Google API calls per search
than before (roughly 3-5x) — worth knowing if you're watching usage or
cost on your Google Cloud project. Whole-province searches still cap at 60,
since there's no sensible way to subdivide "the whole province" the same
way.

## A note on Google's data rules

Google's Places API terms restrict how you can store/display/reuse this
data (e.g. you generally can't cache place data long-term without limits, or
show it disconnected from a Google Map in some contexts). Before you start
storing large volumes of leads or building outreach at scale, it's worth
reading Google's Places API Policies page and adjusting storage (the
`leads` table above only stores what you need for CRM tracking, not full
Places data, but double check as this grows).

## Coffee shops now get their own distinct template

Coffee shops are no longer folded into the dark restaurant template — they
get a separate light, airy design (cream background, coffee-brown accents,
Fraunces + Poppins typography) with its own section flow: hero, story +
amenity chips (real dine-in/takeout/delivery/outdoor-seating data), a
specialties grid, a numbered menu preview, gallery, real reviews, and a
visit/footer section. Restaurants, pizza places, bakeries, bars, and fast
food still share the dark elegant template from before; ice cream keeps its
playful theme; everything else keeps the general template.

## Auto menu extraction (best-effort)

When you click Generate and haven't pasted a menu, the app now tries to
auto-detect one from the business's own real website (if they have one) by
scanning its visible text for "item ... $price" patterns. This only works
when a site's menu is actual readable text — most restaurant sites show
their menu as an image or PDF, which this can't read, so it'll often come
up empty and fall back to the general highlight cards, same as before.

Worth knowing: there's no official Google API that hands over structured
menu + pricing data for arbitrary businesses. Google's Business Profile
"Food Menus" API does support real structured menus, but only the
business's own authenticated owner account can access it for their own
listing — not a third-party tool like this one looking up other
businesses. So pasting the real menu yourself remains the most reliable way
to get accurate prices on the generated site.

## A note on the generated landing pages

The Reviews section now pulls up to 3 real Google reviews for the business
(via the Places API's own review data) and shows them with the reviewer's
name and star rating, alongside the aggregate rating — these are genuine
reviewer text, not AI-generated, shown with attribution as Google's API
terms require. If a business has no reviews with text, the section just
shows the aggregate rating and a link to Google.

The template auto-detects the business type from its Google category (and
name) and picks one of three visual themes:

- **Restaurant** — elegant/luxury: warm dark palette, Playfair Display +
  Inter typography, parallax hero.
- **Coffee shop** — cozy: coffee-brown/cream/charcoal palette, Fraunces +
  Poppins typography.
- **Ice cream shop** — playful: pastel pink palette, rounded shapes, Baloo 2
  typography, floating sprinkle animations.
- Anything else falls back to the general professional template from
  before.

All themes share: sticky glass nav, scroll-reveal animations, hover-scale
cards, floating Reserve/Call/WhatsApp buttons, dark-mode toggle, a
schema.org listing + Open Graph tags for SEO, hours table, photo gallery,
reviews summary, the WhatsApp reservation/order form, FAQ, contact section,
and a footer with a (non-functional, visual-only) newsletter signup.

**Deliberately left out**, because building them accurately would mean
either inventing facts about the business or wiring up a paid third-party
integration this app doesn't have accounts for:
- Specific menu items with real prices, dietary tags, or calories — the
  "Featured" section shows the AI-generated highlights as icons/cards
  instead, with a line pointing people to ask about the full menu in person.
- Chef bio/awards, and a real events calendar — no real data source for these.
- Delivery partner logos (Uber Eats, DoorDash, etc.) — would need real
  partner accounts.
- Google Calendar booking integration — needs OAuth setup per business.
- Multi-language switcher — no translated copy to switch to.
- Loyalty program / gift cards — needs real payment processing.

Colors are currently assigned per-business from a small fixed palette (not
pulled from an actual logo yet) — a nice upgrade for later once you want it.
The AI is instructed not to invent specific menu items or prices it doesn't
know, so highlights/FAQ stay general rather than fabricated — good enough
for a "here's what this could look like" pitch, not meant to be the
business's final real site.

The template includes a sticky nav, hero, hours table, photo gallery,
reviews summary, and a reservation/order section. The reservation form
doesn't book anything itself — submitting it opens WhatsApp with a
pre-filled message to the business's number (or shows a "please call us"
message if no phone/WhatsApp number is available).

**Uploading photos:** click "Upload photos" on any lead before generating —
these get embedded directly into the generated site's gallery and hero
instead of relying on the single photo Google Places returns. Keep it to a
handful of reasonably sized images (a few hundred KB each) — very large or
many images can hit Vercel's request size limit on the free plan and cause
the generation to fail.

**Regenerating with feedback:** once a site is generated, a comment box
appears under it. Typing feedback (e.g. "make it feel more upscale", "add a
line about our brunch menu") and clicking "Regenerate with feedback" asks
the AI to rewrite the copy accordingly and redeploys — it updates the same
live URL rather than creating a new one.

## What's next (later phase)

- Agent 6: a proper CRM table view (status, contacted, filters) instead of
  just the search results list, plus AI-generated outreach emails per lead.

We'll build that the same way — one working piece at a time.
