-- ============================================================
-- מדמה את הסביבה של Supabase במסד Postgres רגיל, לבדיקות בלבד:
-- התפקידים anon / authenticated והפונקציה auth.jwt().
-- האימייל של "המשתמש המחובר" נקבע עם: set app.email = '...';
-- ============================================================
create schema if not exists auth;
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated; end if;
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon; end if;
end $$;
create or replace function auth.jwt() returns json language sql stable as $$
  select json_build_object('email', current_setting('app.email', true))
$$;
grant usage on schema auth to authenticated, anon;
grant usage on schema public to anon;
-- כמו בפרויקט עם "Automatically expose new tables" כבוי: אין הרשאות ברירת מחדל
revoke all on schema public from public;
