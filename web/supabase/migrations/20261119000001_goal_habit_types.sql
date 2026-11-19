-- GOAL-2: goals counted from a habit. New enum values live in their own migration because
-- a new enum value cannot be used in the transaction that adds it.
alter type public.goal_type add value if not exists 'habit_days';
alter type public.goal_type add value if not exists 'habit_streak';
