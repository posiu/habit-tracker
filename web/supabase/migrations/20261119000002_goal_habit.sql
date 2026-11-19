-- GOAL-2: a goal can follow a habit. habit_days = completed days since the goal's start,
-- habit_streak = best streak since the goal's start. Progress is computed in the app from
-- the habit's entries; the target (days) is stored in goal_metrics.days_doing_target.
alter table public.goals
  add column habit_id uuid references public.habits(id) on delete set null;
create index on public.goals (habit_id);

-- The foreign key check bypasses RLS: the habit must be the user's own.
drop policy "own goals" on public.goals;
create policy "own goals" on public.goals for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (category_id is null
         or exists (select 1 from public.categories c
                    where c.id = category_id and c.user_id = (select auth.uid())))
    and (habit_id is null or public.owns_habit(habit_id))
  );

drop function public.save_goal(uuid, text, public.goal_type, text, uuid, date, date, numeric, integer);

create function public.save_goal(
  p_id uuid,
  p_name text,
  p_goal_type public.goal_type,
  p_unit text,
  p_category_id uuid,
  p_start_date date,
  p_target_date date,
  p_target_value numeric,
  p_days_target integer,
  p_habit_id uuid default null
) returns uuid
language plpgsql security invoker set search_path = '' as $$
declare
  v_id uuid;
  v_habit uuid := case when p_goal_type in ('habit_days', 'habit_streak') then p_habit_id end;
begin
  if p_id is null then
    insert into public.goals (name, goal_type, unit, category_id, start_date, target_date, habit_id)
    values (p_name, p_goal_type, p_unit, p_category_id, p_start_date, p_target_date, v_habit)
    returning id into v_id;
  else
    update public.goals
       set name = p_name, goal_type = p_goal_type, unit = p_unit, category_id = p_category_id,
           start_date = p_start_date, target_date = p_target_date, habit_id = v_habit
     where id = p_id
    returning id into v_id;
    if v_id is null then
      raise exception 'goal not found' using errcode = 'P0002';
    end if;
  end if;

  update public.goal_metrics
     set target_date = p_target_date,
         target_value = case when p_goal_type = 'target_value' then p_target_value end,
         days_doing_target = case when p_goal_type in ('days_doing', 'habit_days', 'habit_streak') then p_days_target end,
         days_without_target = case when p_goal_type = 'days_without' then p_days_target end
   where goal_id = v_id;

  return v_id;
end $$;

revoke execute on function public.save_goal(uuid, text, public.goal_type, text, uuid, date, date, numeric, integer, uuid) from public, anon;
grant execute on function public.save_goal(uuid, text, public.goal_type, text, uuid, date, date, numeric, integer, uuid) to authenticated;
