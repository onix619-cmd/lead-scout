# Lead Scout — Phase 1: Business Finder + Website Scorer

This is a small web app. Once it's live, you use it like any website — no
terminal needed day-to-day. It does two things:

1. **Finds businesses** in a city/category using Google Places (Agent 1).
2. **Scores their websites** on 12 concrete signals — HTTPS, mobile-friendly,
   speed, WhatsApp button, reservations, reviews embedded, etc. — and flags
   businesses with no website as "high priority" (Agent 2).

You can click **Save to CRM** on any lead once Supabase is connected (step 3
below) — that's the groundwork for the CRM table from your original plan.

Website generation, AI copywriting, and auto-deploy (Agents 3–6) are **not**
in this phase — we're building those next, once this part is working for you.

## What you need

- A Google Cloud project with **Places API (New)** enabled, and an API key.
  You said you already have Google Cloud set up — just confirm this specific
  API is enabled: console.cloud.google.com → "APIs & Services" → search
  "Places API (New)" → Enable → then "Credentials" → create an API key.
- A GitHub account (you have this).
- A Vercel account (you have this).
- (Optional, can do later) A free Supabase project — only needed for the
  "Save to CRM" button to actually persist leads between sessions.

## Step 1 — Get the code onto GitHub

1. Go to github.com → New repository → name it e.g. `lead-scout` → Create.
2. On your own computer (or GitHub's "upload files" in the browser), upload
   everything in this project folder to that new repository.
   - Easiest no-terminal way: on the new repo's page, click
     "uploading an existing file" and drag in all the files/folders.

## Step 2 — Deploy to Vercel

1. Go to vercel.com → **Add New… → Project**.
2. Import the `lead-scout` GitHub repo you just created.
3. Before clicking Deploy, open **Environment Variables** and add:
   - `GOOGLE_PLACES_API_KEY` = your Google Places API key
4. Click **Deploy**. In ~1 minute you'll get a URL like
   `https://lead-scout-yourname.vercel.app` — that's your dashboard.

## Step 3 — (Optional now) Connect Supabase so "Save to CRM" works

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

## A note on Google's data rules

Google's Places API terms restrict how you can store/display/reuse this
data (e.g. you generally can't cache place data long-term without limits, or
show it disconnected from a Google Map in some contexts). Before you start
storing large volumes of leads or building outreach at scale, it's worth
reading Google's Places API Policies page and adjusting storage (the
`leads` table above only stores what you need for CRM tracking, not full
Places data, but double check as this grows).

## What's next (later phases)

- Agent 3: turn a saved lead into an actual generated landing page.
- Agent 4: AI-written copy (About Us, SEO title, menu descriptions).
- Agent 5: auto-push that generated site to GitHub + Vercel and store the URL.
- Agent 6: full CRM view (table with status/contacted) + AI outreach emails.

We'll build each of those the same way — one working piece at a time.
