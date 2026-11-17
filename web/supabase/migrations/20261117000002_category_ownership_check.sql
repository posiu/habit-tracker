-- A foreign key check bypasses RLS, so without this a user could point their habit/goal
-- at another user's category by guessing its UUID. Require the category to be the user's own.

drop policy "own habits" on public.habits;
create policy "own habits" on public.habits for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (category_id is null
         or exists (select 1 from public.categories c
                    where c.id = category_id and c.user_id = (select auth.uid())))
  );

drop policy "own goals" on public.goals;
create policy "own goals" on public.goals for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (category_id is null
         or exists (select 1 from public.categories c
                    where c.id = category_id and c.user_id = (select auth.uid())))
  );
