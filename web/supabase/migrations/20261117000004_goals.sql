-- Goals: atomic save of a goal with its targets, and goal entries in save_day.

-- Creates or updates a goal and its single goal_metrics row in one transaction.
-- SECURITY INVOKER: RLS applies (own rows only, own category only).
create function public.save_goal(
  p_id uuid,                 -- null = create
  p_name text,
  p_goal_type public.goal_type,
  p_unit text,
  p_category_id uuid,
  p_start_date date,
  p_target_date date,
  p_target_value numeric,
  p_days_target integer
) returns uuid
language plpgsql security invoker set search_path = '' as $$
declare
  v_id uuid;
begin
  if p_id is null then
    insert into public.goals (name, goal_type, unit, category_id, start_date, target_date)
    values (p_name, p_goal_type, p_unit, p_category_id, p_start_date, p_target_date)
    returning id into v_id;
  else
    update public.goals
       set name = p_name, goal_type = p_goal_type, unit = p_unit, category_id = p_category_id,
           start_date = p_start_date, target_date = p_target_date
     where id = p_id
    returning id into v_id;
    if v_id is null then
      raise exception 'goal not found' using errcode = 'P0002';
    end if;
  end if;

  -- goal_metrics row exists (trigger on insert); keep only the targets relevant for the type.
  update public.goal_metrics
     set target_date = p_target_date,
         target_value = case when p_goal_type = 'target_value' then p_target_value end,
         days_doing_target = case when p_goal_type = 'days_doing' then p_days_target end,
         days_without_target = case when p_goal_type = 'days_without' then p_days_target end
   where goal_id = v_id;

  return v_id;
end $$;

revoke execute on function public.save_goal(uuid, text, public.goal_type, text, uuid, date, date, numeric, integer) from public, anon;
grant execute on function public.save_goal(uuid, text, public.goal_type, text, uuid, date, date, numeric, integer) to authenticated;

-- save_day now also stores goal entries. New params have defaults, so older callers keep working.
drop function public.save_day(date, smallint, text, jsonb, uuid[]);

create function public.save_day(
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
        time_value = excluded.time_value;

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
