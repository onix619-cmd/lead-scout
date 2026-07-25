-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query)
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  place_id text unique not null,
  name text not null,
  category text,
  address text,
  phone text,
  website text,
  rating numeric,
  review_count integer default 0,
  maps_url text,
  website_score integer,
  has_website boolean default false,
  priority text, -- 'high' | 'medium' | 'low'
  status text default 'ready', -- 'ready' | 'ignore' | 'contacted' etc
  contacted boolean default false,
  created_at timestamptz default now()
);

-- Lets the dashboard read/write leads. Tighten this later if you add
-- user accounts.
alter table leads enable row level security;
create policy "Allow all for now" on leads for all using (true) with check (true);
