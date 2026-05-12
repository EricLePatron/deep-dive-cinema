create table if not exists public.film_content_stats (
  tmdb_id bigint primary key,
  video_count integer not null default 0,
  podcast_count integer not null default 0,
  book_count integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.film_content_stats enable row level security;

create policy "stats readable by everyone"
on public.film_content_stats for select
using (true);

create policy "stats insertable by anyone"
on public.film_content_stats for insert
with check (true);

create policy "stats updatable by anyone"
on public.film_content_stats for update
using (true) with check (true);

create index if not exists idx_film_content_stats_updated on public.film_content_stats(updated_at desc);