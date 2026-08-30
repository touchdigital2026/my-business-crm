/* ------------------------------------------------------------------
   שכבת השמירה בענן.
   ממירה בין צורת הנתונים של האפליקציה (camelCase) לעמודות
   מסד הנתונים (snake_case), קוראת הכל בטעינה, ושומרת כל שינוי.

   השמירה היא "אופטימית": המסך מתעדכן מיד מהמצב המקומי, והכתיבה
   לענן רצה ברקע. כישלון כתיבה נרשם לקונסול ואינו עוצר את העבודה.
   ------------------------------------------------------------------ */
import { supabase, isCloud } from './supabase.js'

/* קובץ שהועלה בדפדפן מקבל כתובת זמנית (blob:) שלא שורדת רענון –
   לא שומרים אותה בענן. העלאת הקבצים עצמם: שלב האחסון הבא. */
const cleanUrl = (u) => (u && !u.startsWith('blob:') ? u : null)
const cleanReceipt = (r) => (r ? { name: r.name, kind: r.kind, size: r.size || null } : null)

/* ---- ממירים: אפליקציה -> מסד ---- */
const to = {
  lead: (l) => ({
    id: l.id, name: l.name, business: l.business, phone: l.phone, email: l.email,
    source: l.source, stage: l.stage, package_id: l.packageId, value: l.value,
    owner: l.owner, last_contact: l.lastContact, next_follow_up: l.nextFollowUp,
    status: l.status, lost_reason: l.lostReason ?? null, converted_to: l.convertedTo ?? null,
  }),
  client: (c) => ({
    id: c.id, business: c.business, contact: c.contact, industry: c.industry,
    phone: c.phone, email: c.email, address: c.address, package_id: c.packageId,
    status: c.status, owner: c.owner, payment_status: c.paymentStatus,
    overdue_days: c.overdueDays ?? null, overdue_amount: c.overdueAmount ?? null,
    inactive_days: c.inactiveDays ?? null, frozen_reason: c.frozenReason ?? null,
    start_date: c.startDate, renewal_date: c.renewalDate, notes: c.notes || '',
    add_ons: c.addOns || [], source: c.source ?? null, from_lead_id: c.fromLeadId ?? null,
  }),
  task: (t) => ({
    id: t.id, title: t.title, client_id: t.clientId, assignee: t.assignee, type: t.type,
    sla_key: t.slaKey ?? null, priority: t.priority, status: t.status,
    opened_at: t.openedAt, due_at: t.dueAt, recurring: t.recurring ?? null,
    subcontractor_id: t.subcontractorId ?? null, fee: t.fee ?? null,
    fee_paid: Boolean(t.feePaid), fee_paid_at: t.feePaidAt ?? null,
    sla_assumed: Boolean(t.slaAssumed), source: t.source,
  }),
  payment: (p) => ({
    id: p.id, client_id: p.clientId, month_key: p.monthKey, date: p.date, amount: p.amount,
    method: p.method, status: p.status, kind: p.kind, invoice: p.invoice,
    package_id: p.packageId ?? null, add_on_name: p.addOnName ?? null,
    one_off_title: p.oneOffTitle ?? null, paid_at: p.paidAt ?? null,
  }),
  expense: (e) => ({
    id: e.id, month_key: e.monthKey, date: e.date, amount: e.amount,
    category_id: e.categoryId, vendor: e.vendor,
    subcontractor_id: e.subcontractorId ?? null, method: e.method, notes: e.notes || '',
    receipt: cleanReceipt(e.receipt), entered_by: e.enteredBy, recurring: Boolean(e.recurring),
  }),
  category: (c) => ({ id: c.id, name: c.name }),
  document: (d) => ({
    id: d.id, name: d.name, kind: d.kind, size_label: d.sizeLabel, folder_id: d.folderId,
    client_id: d.clientId ?? null, tags: d.tags || [], uploaded_at: d.uploadedAt,
    uploaded_by: d.uploadedBy, visibility: d.visibility || 'מנהלי-על',
    url: cleanUrl(d.url), versions: d.versions || [],
  }),
}

/* ---- ממירים: מסד -> אפליקציה ---- */
const from = {
  lead: (r) => ({
    id: r.id, name: r.name, business: r.business, phone: r.phone, email: r.email,
    source: r.source, stage: r.stage, packageId: r.package_id, value: Number(r.value),
    owner: r.owner, lastContact: r.last_contact, nextFollowUp: r.next_follow_up,
    status: r.status, lostReason: r.lost_reason ?? undefined, convertedTo: r.converted_to ?? undefined,
  }),
  client: (r) => ({
    id: r.id, business: r.business, contact: r.contact, industry: r.industry,
    phone: r.phone, email: r.email, address: r.address, packageId: r.package_id,
    status: r.status, owner: r.owner, paymentStatus: r.payment_status,
    overdueDays: r.overdue_days ?? undefined, overdueAmount: r.overdue_amount != null ? Number(r.overdue_amount) : undefined,
    inactiveDays: r.inactive_days ?? undefined, frozenReason: r.frozen_reason ?? undefined,
    startDate: r.start_date, renewalDate: r.renewal_date, notes: r.notes || '',
    addOns: r.add_ons || [], source: r.source ?? undefined, fromLeadId: r.from_lead_id ?? undefined,
  }),
  task: (r) => ({
    id: r.id, title: r.title, clientId: r.client_id, assignee: r.assignee, type: r.type,
    slaKey: r.sla_key, priority: r.priority, status: r.status,
    openedAt: r.opened_at, dueAt: r.due_at, recurring: r.recurring,
    subcontractorId: r.subcontractor_id, fee: r.fee != null ? Number(r.fee) : null,
    feePaid: r.fee_paid, feePaidAt: r.fee_paid_at ?? undefined,
    slaAssumed: r.sla_assumed, source: r.source,
  }),
  payment: (r) => ({
    id: r.id, clientId: r.client_id, monthKey: r.month_key, date: r.date,
    amount: Number(r.amount), method: r.method, status: r.status, kind: r.kind,
    invoice: r.invoice, packageId: r.package_id ?? undefined,
    addOnName: r.add_on_name ?? undefined, oneOffTitle: r.one_off_title ?? undefined,
    paidAt: r.paid_at ?? undefined,
  }),
  expense: (r) => ({
    id: r.id, monthKey: r.month_key, date: r.date, amount: Number(r.amount),
    categoryId: r.category_id, vendor: r.vendor,
    subcontractorId: r.subcontractor_id ?? undefined, method: r.method, notes: r.notes || '',
    receipt: r.receipt, enteredBy: r.entered_by, recurring: r.recurring,
  }),
  category: (r) => ({ id: r.id, name: r.name }),
  document: (r) => ({
    id: r.id, name: r.name, kind: r.kind, sizeLabel: r.size_label, folderId: r.folder_id,
    clientId: r.client_id, tags: r.tags || [], uploadedAt: r.uploaded_at,
    uploadedBy: r.uploaded_by, visibility: r.visibility, url: r.url ?? undefined,
    versions: r.versions || [],
  }),
  sub: (r) => ({
    id: r.id, name: r.name, field: r.field, phone: r.phone, email: r.email,
    rateType: r.rate_type, rate: Number(r.rate),
    revSharePct: r.rev_share_pct != null ? Number(r.rev_share_pct) : undefined,
    avgHours: Number(r.avg_hours), slaRate: Number(r.sla_rate), completed: r.completed,
  }),
}

/* שמירה ברקע – לא חוסמת את הממשק */
function save(table, mapper, record, label) {
  if (!isCloud) return
  supabase
    .from(table)
    .upsert(mapper(record))
    .then(({ error }) => {
      if (error) console.warn(`שמירה לענן נכשלה (${label}):`, error.message)
    })
}

export const persist = {
  lead: (r) => save('leads', to.lead, r, 'ליד'),
  client: (r) => save('clients', to.client, r, 'לקוח'),
  task: (r) => save('tasks', to.task, r, 'משימה'),
  tasks: (list) => list.forEach((t) => save('tasks', to.task, t, 'משימה')),
  payment: (r) => save('payments', to.payment, r, 'תשלום'),
  expense: (r) => save('expenses', to.expense, r, 'הוצאה'),
  category: (r) => save('expense_categories', to.category, r, 'קטגוריה'),
  document: (r) => save('documents', to.document, r, 'מסמך'),
}

/* טעינת כל הנתונים מהענן בכניסה למערכת */
export async function fetchAllCloud() {
  const tables = [
    ['leads', from.lead], ['clients', from.client], ['tasks', from.task],
    ['payments', from.payment], ['expenses', from.expense],
    ['expense_categories', from.category], ['documents', from.document],
    ['subcontractors', from.sub],
  ]
  const results = await Promise.all(
    tables.map(async ([table, mapper]) => {
      const { data, error } = await supabase.from(table).select('*')
      if (error) throw new Error(`${table}: ${error.message}`)
      return data.map(mapper)
    })
  )
  return {
    leads: results[0], clients: results[1], tasks: results[2], payments: results[3],
    expenses: results[4], categories: results[5], documents: results[6], subs: results[7],
  }
}
