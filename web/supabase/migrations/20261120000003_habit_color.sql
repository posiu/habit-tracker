-- Optional per-habit color: a palette key (h1..h6) from the theme; null = default look.
alter table public.habits
  add column color text check (color is null or color in ('h1','h2','h3','h4','h5','h6'));
