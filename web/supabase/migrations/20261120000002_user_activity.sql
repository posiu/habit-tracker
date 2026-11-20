-- Admin panel: when each account last did anything, and how much it did in the last 7 days.
-- An action is a write to the user's own data (days, habit and goal entries, habits, goals, categories).
-- SECURITY DEFINER and callable by the service role only: regular users must never read other accounts' activity.
create function public.user_activity()
returns table (user_id uuid, last_activity timestamptz, actions_7d bigint)
language sql stable security definer set search_path = '' as $$
  with ev as (
    select user_id, updated_at as ts from public.daily_entries
    union all select d.user_id, h.updated_at from public.habit_entries h join public.daily_entries d on d.id = h.daily_entry_id
    union all select d.user_id, g.updated_at from public.goal_entries g join public.daily_entries d on d.id = g.daily_entry_id
    union all select user_id, updated_at from public.habits
    union all select user_id, updated_at from public.goals
    union all select user_id, updated_at from public.categories
  )
  select ev.user_id, max(ev.ts), count(*) filter (where ev.ts >= now() - interval '7 days')
  from ev group by ev.user_id
$$;

revoke execute on function public.user_activity() from public, anon, authenticated;
grant execute on function public.user_activity() to service_role;
