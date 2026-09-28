-- ============================================================
-- בדיקות אבטחה (סעיפים 2 + 15). כל כשל עוצר את ההרצה עם הודעה.
-- מריצים אחרי schema.sql ו-seed.sql, על מסד בדיקות ריק.
-- ============================================================
\set ON_ERROR_STOP on
\pset tuples_only on

create or replace function pg_temp.check(ok boolean, what text) returns void language plpgsql as $$
begin
  if not coalesce(ok, false) then raise exception 'FAILED: %', what; end if;
  raise notice 'ok: %', what;
end $$;

set role authenticated;

-- 1. הכניסה הראשונה למערכת הופכת את המשתמש למנהל-על
set app.email = 'owner@business.co.il';
select pg_temp.check((crm_login() ->> 'role') = 'super_admin', 'first login becomes super admin');
select pg_temp.check((select count(*) from leads) > 0, 'super admin reads leads');
select pg_temp.check((select count(*) from expenses) > 0, 'super admin reads expenses');
select pg_temp.check((select count(*) from team_members) > 1, 'super admin sees the whole team');

-- 2. משתמש שאינו בצוות – לא נכנס ולא רואה כלום (גם אם נרשם בעצמו)
set app.email = 'stranger@evil.com';
select pg_temp.check(crm_login() is null, 'stranger cannot log in');
select pg_temp.check((select count(*) from leads) = 0, 'stranger sees no leads');
select pg_temp.check((select count(*) from team_members) = 0, 'stranger sees no team');

-- 3. צוות: רואה את המודולים שלו, לא כספים, ולא יכול לקדם את עצמו
set app.email = 'YAEL@crm.co.il';
select pg_temp.check((crm_login() ->> 'role') = 'staff', 'staff login (email case-insensitive)');
select pg_temp.check((select count(*) from leads) > 0, 'staff reads leads');
select pg_temp.check((select count(*) from tasks) > 0, 'staff reads tasks');
select pg_temp.check((select count(*) from payments) = 0, 'staff cannot read payments');
select pg_temp.check((select count(*) from expenses) = 0, 'staff cannot read expenses');
select pg_temp.check((select count(*) from team_members) = 1, 'staff sees only own team record');
update team_members set role = 'super_admin' where lower(email) = 'yael@crm.co.il';
update role_permissions set modules = modules || array['payments', 'expenses'] where role = 'staff';
select pg_temp.check((select crm_role()) = 'staff', 'staff cannot promote themselves');
select pg_temp.check((select count(*) from payments) = 0, 'staff cannot open payments for themselves');

-- 4. קבלן משנה: רק המשימות שלו, בלי לקוחות ולידים
set app.email = 'alon.social@gmail.com';
select pg_temp.check((crm_login() ->> 'role') = 'subcontractor', 'subcontractor login');
select pg_temp.check((select count(*) from tasks) > 0, 'subcontractor sees own tasks');
select pg_temp.check((select bool_and(subcontractor_id = 1) from tasks), 'subcontractor sees only own tasks');
select pg_temp.check((select count(*) from clients) = 0, 'subcontractor sees no clients');
select pg_temp.check((select count(*) from leads) = 0, 'subcontractor sees no leads');
do $$ begin
  insert into tasks (id, title, assignee, due_at, subcontractor_id) values ('X-TEST', 'x', 'x', now(), 2);
  raise exception 'FAILED: subcontractor inserted a task for someone else';
exception when insufficient_privilege then
  raise notice 'ok: subcontractor cannot create tasks for others';
end $$;

-- 5. משתמש שהוזמן הופך לפעיל בכניסה הראשונה
set app.email = 'maya.video@gmail.com';
select pg_temp.check((crm_login() ->> 'status') = 'active', 'invited user becomes active on first login');

-- 6. משתמש מושבת – נחסם מיד
set app.email = 'owner@business.co.il';
update team_members set status = 'disabled' where lower(email) = 'ori@crm.co.il';
set app.email = 'ori@crm.co.il';
select pg_temp.check(crm_login() is null, 'disabled user cannot log in');
select pg_temp.check((select count(*) from leads) = 0, 'disabled user sees nothing');

-- 7. מבקר אנונימי (בלי התחברות) – לא מקבל גישה לשום טבלה
reset role;
set role anon;
do $$ begin
  perform count(*) from leads;
  raise exception 'FAILED: anonymous visitor read leads';
exception when insufficient_privilege then
  raise notice 'ok: anonymous visitor blocked';
end $$;

reset role;
\echo 'ALL SECURITY CHECKS PASSED'
