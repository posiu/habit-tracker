-- HAB-3: schedule with history. A habit's schedule on a given day is the row with the latest
-- effective_from <= that day; no rows means every day. Changes apply from the day they are made.
create table public.habit_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  effective_from date not null,
  days smallint[] not null
    check (cardinality(days) between 1 and 7 and days <@ array[0,1,2,3,4,5,6]::smallint[]),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (habit_id, effective_from)
);
create index on public.habit_schedules (habit_id);

alter table public.habit_schedules enable row level security;
create policy "own schedules" on public.habit_schedules for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and public.owns_habit(habit_id));

create trigger set_updated_at before update on public.habit_schedules
  for each row execute function public.set_updated_at();

-- HAB-6: reminders are out of scope for v1.
alter table public.habits drop column reminder_enabled, drop column reminder_days;
