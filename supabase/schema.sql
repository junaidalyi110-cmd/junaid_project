-- Run this file in the Supabase SQL Editor before using the application.
-- Dashboard writes require a signed-in Supabase user.

create extension if not exists pgcrypto;

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 1 and 160),
  video_url text not null check (video_url ~* '^https?://'),
  created_at timestamptz not null default now()
);

create table if not exists public.buttons (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  label text not null check (char_length(trim(label)) between 1 and 80),
  url text not null check (url ~* '^https?://'),
  position integer not null check (position >= 0),
  created_at timestamptz not null default now(),
  unique (video_id, position)
);

create index if not exists buttons_video_id_position_idx
  on public.buttons (video_id, position);

alter table public.videos enable row level security;
alter table public.buttons enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.videos, public.buttons to anon, authenticated;
grant insert, update, delete on public.videos, public.buttons to authenticated;

drop policy if exists "Public can read videos" on public.videos;
drop policy if exists "Anonymous dashboard can manage videos" on public.videos;
drop policy if exists "Admins can manage videos" on public.videos;
drop policy if exists "Public can read buttons" on public.buttons;
drop policy if exists "Anonymous dashboard can manage buttons" on public.buttons;
drop policy if exists "Admins can manage buttons" on public.buttons;

create policy "Public can read videos"
  on public.videos for select to anon, authenticated using (true);

create policy "Authenticated users can manage videos"
  on public.videos for all to authenticated
  using (true)
  with check (true);

create policy "Public can read buttons"
  on public.buttons for select to anon, authenticated using (true);

create policy "Authenticated users can manage buttons"
  on public.buttons for all to authenticated
  using (true)
  with check (true);

-- Create the public bucket used by the player URLs and constrain its file types.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'videos',
  'videos',
  true,
  524288000,
  array['video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anonymous dashboard can upload videos" on storage.objects;
drop policy if exists "Anonymous dashboard can remove videos" on storage.objects;
drop policy if exists "Admins can upload videos" on storage.objects;
drop policy if exists "Admins can remove videos" on storage.objects;

create policy "Admins can upload videos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'videos');

create policy "Admins can remove videos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'videos');
