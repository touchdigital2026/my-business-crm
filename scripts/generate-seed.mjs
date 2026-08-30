/* מחולל seed.sql – ממיר את נתוני הדמו של האפליקציה לפקודות SQL.
   הרצה: node scripts/generate-seed.mjs > supabase/seed.sql */
import {
  initialLeads, initialClients, initialTasks, initialPayments,
  initialExpenses, initialDocuments, subcontractors, EXPENSE_CATEGORIES,
} from '../src/data/mockData.js'

const q = (v) => {
  if (v === null || v === undefined || v === '') return v === '' ? "''" : 'null'
  if (typeof v === 'number') return String(v)
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  return "'" + String(v).replace(/'/g, "''") + "'"
}
const json = (v) => "'" + JSON.stringify(v ?? null).replace(/'/g, "''") + "'::jsonb"
const arr = (v) => "array[" + (v || []).map(q).join(',') + "]::text[]"

function insert(table, cols, rows) {
  if (!rows.length) return ''
  const lines = rows.map((r) => '  (' + cols.map((c) => r[c]).join(', ') + ')')
  return `insert into ${table} (${cols.map((c) => c.replace(/"/g, '')).join(', ')}) values\n${lines.join(',\n')}\non conflict (id) do nothing;\n\n`
}

let out = '-- seed.sql – נתוני הדמו של המערכת. נוצר אוטומטית ע"י scripts/generate-seed.mjs\n'
out += `-- נוצר בתאריך: ${new Date().toISOString().slice(0, 10)}\n\n`

out += insert('subcontractors',
  ['id','name','field','phone','email','rate_type','rate','rev_share_pct','avg_hours','sla_rate','completed'],
  subcontractors.map((s) => ({
    id: q(s.id), name: q(s.name), field: q(s.field), phone: q(s.phone), email: q(s.email),
    rate_type: q(s.rateType), rate: q(s.rate), rev_share_pct: q(s.revSharePct ?? null),
    avg_hours: q(s.avgHours), sla_rate: q(s.slaRate), completed: q(s.completed),
  })))

out += insert('expense_categories', ['id','name'],
  EXPENSE_CATEGORIES.map((c) => ({ id: q(c.id), name: q(c.name) })))

out += insert('leads',
  ['id','name','business','phone','email','source','stage','package_id','value','owner','last_contact','next_follow_up','status','lost_reason'],
  initialLeads.map((l) => ({
    id: q(l.id), name: q(l.name), business: q(l.business), phone: q(l.phone), email: q(l.email),
    source: q(l.source), stage: q(l.stage), package_id: q(l.packageId), value: q(l.value),
    owner: q(l.owner), last_contact: q(l.lastContact), next_follow_up: q(l.nextFollowUp),
    status: q(l.status), lost_reason: q(l.lostReason ?? null),
  })))

out += insert('clients',
  ['id','business','contact','industry','phone','email','address','package_id','status','owner','payment_status','overdue_days','overdue_amount','inactive_days','frozen_reason','start_date','renewal_date','notes','add_ons'],
  initialClients.map((c) => ({
    id: q(c.id), business: q(c.business), contact: q(c.contact), industry: q(c.industry),
    phone: q(c.phone), email: q(c.email), address: q(c.address), package_id: q(c.packageId),
    status: q(c.status), owner: q(c.owner), payment_status: q(c.paymentStatus),
    overdue_days: q(c.overdueDays ?? null), overdue_amount: q(c.overdueAmount ?? null),
    inactive_days: q(c.inactiveDays ?? null), frozen_reason: q(c.frozenReason ?? null),
    start_date: q(c.startDate), renewal_date: q(c.renewalDate), notes: q(c.notes || ''),
    add_ons: json(c.addOns || []),
  })))

out += insert('tasks',
  ['id','title','client_id','assignee','type','sla_key','priority','status','opened_at','due_at','recurring','subcontractor_id','fee','fee_paid','sla_assumed','source'],
  initialTasks.map((t) => ({
    id: q(t.id), title: q(t.title), client_id: q(t.clientId), assignee: q(t.assignee),
    type: q(t.type), sla_key: q(t.slaKey ?? null), priority: q(t.priority), status: q(t.status),
    opened_at: q(t.openedAt), due_at: q(t.dueAt), recurring: q(t.recurring ?? null),
    subcontractor_id: q(t.subcontractorId ?? null), fee: q(t.fee ?? null),
    fee_paid: q(Boolean(t.feePaid)), sla_assumed: q(Boolean(t.slaAssumed)), source: q(t.source),
  })))

out += insert('payments',
  ['id','client_id','month_key','date','amount','method','status','kind','invoice','package_id','add_on_name','one_off_title'],
  initialPayments.map((p) => ({
    id: q(p.id), client_id: q(p.clientId), month_key: q(p.monthKey), date: q(p.date),
    amount: q(p.amount), method: q(p.method), status: q(p.status), kind: q(p.kind),
    invoice: q(p.invoice), package_id: q(p.packageId ?? null),
    add_on_name: q(p.addOnName ?? null), one_off_title: q(p.oneOffTitle ?? null),
  })))

out += insert('expenses',
  ['id','month_key','date','amount','category_id','vendor','subcontractor_id','method','notes','receipt','entered_by','recurring'],
  initialExpenses.map((e) => ({
    id: q(e.id), month_key: q(e.monthKey), date: q(e.date), amount: q(e.amount),
    category_id: q(e.categoryId), vendor: q(e.vendor),
    subcontractor_id: q(e.subcontractorId ?? null), method: q(e.method), notes: q(e.notes || ''),
    receipt: e.receipt ? json(e.receipt) : 'null', entered_by: q(e.enteredBy),
    recurring: q(Boolean(e.recurring)),
  })))

out += insert('documents',
  ['id','name','kind','size_label','folder_id','client_id','tags','uploaded_at','uploaded_by','visibility','versions'],
  initialDocuments.map((d) => ({
    id: q(d.id), name: q(d.name), kind: q(d.kind), size_label: q(d.sizeLabel),
    folder_id: q(d.folderId), client_id: q(d.clientId ?? null), tags: arr(d.tags),
    uploaded_at: q(d.uploadedAt), uploaded_by: q(d.uploadedBy),
    visibility: q(d.visibility || 'מנהלי-על'), versions: json(d.versions || []),
  })))

process.stdout.write(out)
