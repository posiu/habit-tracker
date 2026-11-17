-- Habit Tracker: initial schema for Supabase (Postgres) with Row Level Security.
-- Replaces Rails/Devise/Pundit. Users live in auth.users (Supabase Auth).

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text check (char_length(first_name) <= 100),
  last_name text check (char_length(last_name) <= 100),
  time_zone text not null default 'UTC',
  locale text not null default 'pl',
  email_notifications_enabled boolean not null default true,
  reminder_time time,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) <= 100),
  color text check (char_length(color) <= 7),
  icon text check (char_length(icon) <= 50),
  description text,
  position integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create type public.habit_type as enum ('boolean', 'numeric', 'time', 'count');
create type public.goal_type as enum ('days_doing', 'days_without', 'target_value', 'target_date', 'custom');

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null check (char_length(name) <= 200),
  habit_type public.habit_type not null default 'boolean',
  unit text check (char_length(unit) <= 50),
  target_value numeric(10,2) check (target_value is null or target_value > 0),
  is_active boolean not null default true,
  start_date date not null default current_date,
  end_date date,
  reminder_enabled boolean not null default false,
  reminder_days smallint[] not null default '{}',
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint habits_end_date_after_start_date check (end_date is null or end_date >= start_date)
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null check (char_length(name) <= 200),
  goal_type public.goal_type not null default 'target_value',
  unit text check (char_length(unit) <= 50),
  start_date date not null default current_date,
  target_date date,
  is_active boolean not null default true,
  completed_at timestamptz,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint goals_target_date_after_start_date check (target_date is null or target_date >= start_date)
);

create table public.goal_metrics (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null unique references public.goals(id) on delete cascade,
  days_doing_target integer,
  days_without_target integer,
  target_value numeric(12,4),
  target_date date,
  current_value numeric(12,4) not null default 0,
  current_days_doing integer not null default 0,
  current_days_without integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.daily_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  entry_date date not null,
  notes text,
  mood smallint check (mood between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

create table public.habit_entries (
  id uuid primary key default gen_random_uuid(),
  daily_entry_id uuid not null references public.daily_entries(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  boolean_value boolean,
  numeric_value numeric(12,4),
  time_value integer,
  completed boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (daily_entry_id, habit_id)
);

create table public.goal_entries (
  id uuid primary key default gen_random_uuid(),
  daily_entry_id uuid not null references public.daily_entries(id) on delete cascade,
  goal_id uuid not null references public.goals(id) on delete cascade,
  value numeric(12,4),
  boolean_value boolean,
  is_increment boolean default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (daily_entry_id, goal_id)
);

create index on public.categories (user_id);
create index on public.habits (user_id, is_active);
create index on public.habits (category_id);
create index on public.goals (user_id, is_active);
create index on public.goals (category_id);
create index on public.daily_entries (user_id, entry_date desc);
create index on public.habit_entries (habit_id);
create index on public.goal_entries (goal_id);

-- updated_at trigger
create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;

do $$
declare t text;
begin
  foreach t in array array['profiles','categories','habits','goals','goal_metrics','daily_entries','habit_entries','goal_entries']
  loop
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- Auto-create profile on sign-up
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-create goal_metrics row for each goal (Rails: after_create)
create function public.handle_new_goal() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.goal_metrics (goal_id, target_date) values (new.id, new.target_date);
  return new;
end $$;

create trigger on_goal_created after insert on public.goals
  for each row execute function public.handle_new_goal();

-- Row Level Security (replaces Pundit)
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.habits enable row level security;
alter table public.goals enable row level security;
alter table public.goal_metrics enable row level security;
alter table public.daily_entries enable row level security;
alter table public.habit_entries enable row level security;
alter table public.goal_entries enable row level security;

create policy "own profile" on public.profiles for all to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "own categories" on public.categories for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own habits" on public.habits for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own goals" on public.goals for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own daily entries" on public.daily_entries for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "own goal metrics" on public.goal_metrics for all to authenticated
  using (exists (select 1 from public.goals g where g.id = goal_id and g.user_id = (select auth.uid())))
  with check (exists (select 1 from public.goals g where g.id = goal_id and g.user_id = (select auth.uid())));

create policy "own habit entries" on public.habit_entries for all to authenticated
  using (exists (select 1 from public.daily_entries d where d.id = daily_entry_id and d.user_id = (select auth.uid())))
  with check (
    exists (select 1 from public.daily_entries d where d.id = daily_entry_id and d.user_id = (select auth.uid()))
    and exists (select 1 from public.habits h where h.id = habit_id and h.user_id = (select auth.uid()))
  );

create policy "own goal entries" on public.goal_entries for all to authenticated
  using (exists (select 1 from public.daily_entries d where d.id = daily_entry_id and d.user_id = (select auth.uid())))
  with check (
    exists (select 1 from public.daily_entries d where d.id = daily_entry_id and d.user_id = (select auth.uid()))
    and exists (select 1 from public.goals g where g.id = goal_id and g.user_id = (select auth.uid()))
  );

-- Heatmap: one row per day with activity level, computed in SQL (replaces the N+1 Ruby service).
create function public.heatmap(from_date date default current_date - 365, to_date date default current_date)
returns table (entry_date date, count integer, level smallint)
language sql stable security invoker set search_path = '' as $$
  with per_day as (
    select d.entry_date,
      (select count(*) from public.habit_entries h where h.daily_entry_id = d.id and h.completed)
      + (select count(*) from public.goal_entries g where g.daily_entry_id = d.id) as cnt
    from public.daily_entries d
    where d.entry_date between from_date and to_date
  )
  select entry_date, cnt::integer,
    case when cnt = 0 then 0 when cnt <= 2 then 1 when cnt <= 5 then 2 when cnt <= 10 then 3 else 4 end::smallint
  from per_day order by entry_date;
$$;
