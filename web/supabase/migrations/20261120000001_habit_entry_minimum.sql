-- Quick "minimum" (two-minute) check-in: the entry still counts as completed,
-- but is distinguishable in history (HAB-8).
alter table public.habit_entries add column is_minimum boolean not null default false;

-- Saving the full day form records a regular (not minimum) completion.
-- Same signature as the goals version (7 args), otherwise PostgREST sees an ambiguous overload.
drop function if exists public.save_day(date, smallint, text, jsonb, uuid[]);
create or replace function public.save_day(
  p_date date,
  p_mood smallint,
  p_notes text,
  p_entries jsonb,
  p_clear uuid[],
  p_goal_entries jsonb default '[]'::jsonb,  -- [{goal_id, value, boolean_value, is_increment}]
  p_goal_clear uuid[] default '{}'
) returns uuid
language plpgsql security invoker set search_path = '' as $$
declare
  v_day uuid;
begin
  insert into public.daily_entries (entry_date, mood, notes)
  values (p_date, p_mood, p_notes)
  on conflict (user_id, entry_date) do update set mood = excluded.mood, notes = excluded.notes
  returning id into v_day;

  delete from public.habit_entries where daily_entry_id = v_day and habit_id = any (p_clear);
  delete from public.goal_entries where daily_entry_id = v_day and goal_id = any (p_goal_clear);

  insert into public.habit_entries (daily_entry_id, habit_id, completed, boolean_value, numeric_value, time_value)
  select v_day,
         (e ->> 'habit_id')::uuid,
         (e ->> 'completed')::boolean,
         (e ->> 'boolean_value')::boolean,
         (e ->> 'numeric_value')::numeric,
         (e ->> 'time_value')::integer
  from jsonb_array_elements(p_entries) e
  on conflict (daily_entry_id, habit_id) do update
    set completed = excluded.completed,
        boolean_value = excluded.boolean_value,
        numeric_value = excluded.numeric_value,
        time_value = excluded.time_value,
        is_minimum = false;

  insert into public.goal_entries (daily_entry_id, goal_id, value, boolean_value, is_increment)
  select v_day,
         (g ->> 'goal_id')::uuid,
         (g ->> 'value')::numeric,
         (g ->> 'boolean_value')::boolean,
         coalesce((g ->> 'is_increment')::boolean, true)
  from jsonb_array_elements(p_goal_entries) g
  on conflict (daily_entry_id, goal_id) do update
    set value = excluded.value,
        boolean_value = excluded.boolean_value,
        is_increment = excluded.is_increment;

  return v_day;
end $$;

revoke execute on function public.save_day(date, smallint, text, jsonb, uuid[], jsonb, uuid[]) from public, anon;
grant execute on function public.save_day(date, smallint, text, jsonb, uuid[], jsonb, uuid[]) to authenticated;
