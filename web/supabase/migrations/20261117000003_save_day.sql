-- Polish default time zone ("today" is computed in the user's zone).
alter table public.profiles alter column time_zone set default 'Europe/Warsaw';

-- Saves a whole day atomically: the daily entry plus all habit entries.
-- SECURITY INVOKER: RLS policies apply, so users can only write their own rows.
create function public.save_day(
  p_date date,
  p_mood smallint,
  p_notes text,
  p_entries jsonb,   -- [{habit_id, completed, boolean_value, numeric_value, time_value}]
  p_clear uuid[]     -- habits whose entry for this day must be removed
) returns uuid
language plpgsql security invoker set search_path = '' as $$
declare
  v_day uuid;
begin
  insert into public.daily_entries (entry_date, mood, notes)
  values (p_date, p_mood, p_notes)
  on conflict (user_id, entry_date) do update set mood = excluded.mood, notes = excluded.notes
  returning id into v_day;

  delete from public.habit_entries
  where daily_entry_id = v_day and habit_id = any (p_clear);

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

  return v_day;
end $$;

revoke execute on function public.save_day(date, smallint, text, jsonb, uuid[]) from public, anon;
grant execute on function public.save_day(date, smallint, text, jsonb, uuid[]) to authenticated;
