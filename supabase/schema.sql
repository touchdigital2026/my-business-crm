-- ============================================================
-- סכמת מסד הנתונים של מערכת ה-CRM
-- מריצים פעם אחת ב-Supabase: SQL Editor ← New query ← הדבקה ← Run
-- ============================================================

-- קבלני משנה (סעיף 7)
create table if not exists subcontractors (
  id             int primary key,
  name           text not null,
  field          text not null,
  phone          text,
  email          text,
  rate_type      text not null default 'perTask',   -- hourly | perTask | monthly
  rate           numeric not null default 0,
  rev_share_pct  numeric,                            -- עמלה מאתרי חנויות
  avg_hours      numeric default 0,
  sla_rate       numeric default 100,
  completed      int default 0,
  created_at     timestamptz not null default now()
);

-- קטגוריות הוצאה (סעיף 9.1 – ניתן להוסיף חדשות מהממשק)
create table if not exists expense_categories (
  id         text primary key,
  name       text not null,
  created_at timestamptz not null default now()
);

-- לידים (סעיף 4)
create table if not exists leads (
  id             text primary key,
  name           text not null,              -- איש הקשר
  business       text not null,
  phone          text,
  email          text,
  source         text not null,              -- referral | word | inbound | other
  stage          text not null,              -- new | contacted | quoted | meeting | negotiation
  package_id     text not null,              -- standard | mid | premium
  value          numeric not null default 0,
  owner          text not null,
  last_contact   text,
  next_follow_up text,
  status         text not null default 'active',   -- active | won | lost
  lost_reason    text,
  converted_to   text,                       -- מזהה הלקוח שנוצר בהמרה
  created_at     timestamptz not null default now()
);

-- לקוחות (סעיף 3)
create table if not exists clients (
  id             text primary key,
  business       text not null,
  contact        text not null,
  industry       text,
  phone          text,
  email          text,
  address        text,
  package_id     text not null,
  status         text not null default 'setup',    -- setup | active | frozen (סעיף 3.1)
  owner          text not null,
  payment_status text not null default 'paid',     -- paid | overdue
  overdue_days   int,
  overdue_amount numeric,
  inactive_days  int,
  frozen_reason  text,
  start_date     timestamptz not null default now(),
  renewal_date   timestamptz,
  notes          text not null default '',
  add_ons        jsonb not null default '[]'::jsonb,   -- תוספות בתשלום (סעיף 8)
  source         text,
  from_lead_id   text references leads (id) on delete set null,
  created_at     timestamptz not null default now()
);

-- משימות ו-SLA (סעיף 6)
create table if not exists tasks (
  id               text primary key,
  title            text not null,
  client_id        text references clients (id) on delete set null,
  assignee         text not null,
  type             text not null default 'maintenance',  -- setup | maintenance
  sla_key          text,
  priority         text not null default 'normal',
  status           text not null default 'open',         -- open | inprogress | done
  opened_at        timestamptz not null default now(),
  due_at           timestamptz not null,
  recurring        text,                                  -- יומי | שבועי
  subcontractor_id int references subcontractors (id) on delete set null,
  fee              numeric,                               -- תשלום לקבלן על המשימה (סעיף 7)
  fee_paid         boolean not null default false,
  fee_paid_at      timestamptz,
  sla_assumed      boolean not null default false,
  source           text not null default 'manual',
  created_at       timestamptz not null default now()
);
create index if not exists tasks_client_idx on tasks (client_id);
create index if not exists tasks_assignee_idx on tasks (assignee);

-- תשלומים וחשבוניות – הכנסות (סעיף 8)
create table if not exists payments (
  id            text primary key,
  client_id     text references clients (id) on delete cascade,
  month_key     text not null,                -- '2026-08'
  date          timestamptz not null,
  amount        numeric not null,
  method        text,
  status        text not null default 'paid', -- paid | pending | overdue
  kind          text not null default 'monthly', -- monthly | addon | oneoff
  invoice       text,
  package_id    text,
  add_on_name   text,
  one_off_title text,
  paid_at       timestamptz,
  created_at    timestamptz not null default now()
);
create index if not exists payments_month_idx on payments (month_key);
create index if not exists payments_client_idx on payments (client_id);

-- הוצאות וקבלות (סעיף 9)
create table if not exists expenses (
  id               text primary key,
  month_key        text not null,
  date             timestamptz not null,
  amount           numeric not null,
  category_id      text references expense_categories (id) on delete set null,
  vendor           text not null,
  subcontractor_id int references subcontractors (id) on delete set null,
  method           text,
  notes            text not null default '',
  receipt          jsonb,                       -- {name, kind, size} – הקובץ עצמו: שלב האחסון הבא
  entered_by       text not null,
  recurring        boolean not null default false,
  created_at       timestamptz not null default now()
);
create index if not exists expenses_month_idx on expenses (month_key);

-- מאגר המסמכים (סעיף 10)
create table if not exists documents (
  id          text primary key,
  name        text not null,
  kind        text not null default 'קובץ',
  size_label  text,
  folder_id   text not null,                   -- contracts | receipts | invoices | branding | legal
  client_id   text references clients (id) on delete set null,
  tags        text[] not null default '{}',
  uploaded_at timestamptz not null default now(),
  uploaded_by text not null,
  visibility  text not null default 'מנהלי-על',
  url         text,
  versions    jsonb not null default '[]'::jsonb,   -- היסטוריית גרסאות (סעיף 10)
  created_at  timestamptz not null default now()
);
create index if not exists documents_client_idx on documents (client_id);
create index if not exists documents_folder_idx on documents (folder_id);

-- ============================================================
-- אבטחה (סעיף 15): גישה רק למשתמש מחובר.
-- כל טבלה נעולה, ורק מי שהתחבר עם המשתמש שיצרת רשאי לקרוא ולכתוב.
-- ============================================================
do $$
declare t text;
begin
  foreach t in array array['subcontractors','expense_categories','leads','clients','tasks','payments','expenses','documents']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "authenticated full access" on %I', t);
    execute format('create policy "authenticated full access" on %I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;
