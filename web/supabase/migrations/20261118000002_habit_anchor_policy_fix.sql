-- The anchor check in the habits policy queried public.habits from a policy on public.habits,
-- which Postgres rejects as infinite recursion. Do the lookup in a SECURITY DEFINER helper instead.
create function public.owns_habit(p_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.habits where id = p_id and user_id = (select auth.uid()));
$$;
revoke all on function public.owns_habit(uuid) from public, anon;
grant execute on function public.owns_habit(uuid) to authenticated;

drop policy "own habits" on public.habits;
create policy "own habits" on public.habits for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (category_id is null
         or exists (select 1 from public.categories c
                    where c.id = category_id and c.user_id = (select auth.uid())))
    and (anchor_habit_id is null or public.owns_habit(anchor_habit_id))
  );
