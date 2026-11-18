-- Atomic Habits fields (HAB-7, HAB-8, HAB-9): plan "when and where", anchor habit,
-- two-minute version and identity. All optional.
alter table public.habits
  add column identity text check (char_length(identity) <= 200),
  add column plan_text text check (char_length(plan_text) <= 300),
  add column minimum_text text check (char_length(minimum_text) <= 200),
  add column anchor_habit_id uuid references public.habits(id) on delete set null,
  add constraint habits_anchor_not_self check (anchor_habit_id is null or anchor_habit_id <> id);

-- A foreign key check bypasses RLS: require the anchor to be the user's own habit.
drop policy "own habits" on public.habits;
create policy "own habits" on public.habits for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (category_id is null
         or exists (select 1 from public.categories c
                    where c.id = category_id and c.user_id = (select auth.uid())))
    and (anchor_habit_id is null
         or exists (select 1 from public.habits a
                    where a.id = anchor_habit_id and a.user_id = (select auth.uid())))
  );
