-- MANITA Studio Database Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)

create table if not exists public.manita_gifts (
  id text primary key,
  title text not null default 'MANITA Digital Gift',
  theme text not null default 'scrapbook',
  config jsonb not null,
  view_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.manita_gifts enable row level security;

-- Public read access: Anyone with the gift link/ID can view the personalized gift
create policy "Public read gifts" 
on public.manita_gifts 
for select 
using (true);

-- Public insert access: Any creator can publish their gift
create policy "Public insert gifts" 
on public.manita_gifts 
for insert 
with check (true);

-- Public update access: Allow creators to update gifts or increment view counts
create policy "Public update gifts" 
on public.manita_gifts 
for update 
using (true);
