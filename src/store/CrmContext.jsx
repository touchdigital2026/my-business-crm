import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  initialLeads, initialClients, initialTasks, initialPayments, initialExpenses,
  initialDocuments, subcontractors as defaultSubs, todayRecurring,
  packageById, setupTasksFor, SLA, monthlyValueOf,
  EXPENSE_CATEGORIES, currentMonthKey, monthLabelOf,
} from '../data/mockData.js'
import { isCloud } from '../lib/supabase.js'
import { persist, fetchAllCloud } from '../lib/persist.js'

/* ------------------------------------------------------------------
   "המחסן" המרכזי של המערכת.

   למה זה קיים: כשממירים ליד ללקוח, השינוי צריך להשפיע על כמה מסכים
   בו-זמנית – רשימת הלידים, רשימת הלקוחות, רשימת המשימות והדשבורד.
   במקום שכל מסך יחזיק עותק משלו, כולם קוראים מכאן.
   ------------------------------------------------------------------ */

const CrmContext = createContext(null)

/* מזהה רץ למשימות ולקוחות שנוצרים תוך כדי עבודה */
let counter = 0
const nextId = (prefix) => `${prefix}${Date.now().toString(36)}${(counter++).toString(36)}`

/* מחשב תאריך יעד למשימה לפי יעד ה-SLA שלה (סעיף 6.3) */
function dueDateFor(slaKey) {
  const minutes = SLA[slaKey].minutes
  return new Date(Date.now() + minutes * 60 * 1000).toISOString()
}

export function CrmProvider({ children }) {
  const [leads, setLeads] = useState(initialLeads)
  const [clients, setClients] = useState(initialClients)
  const [tasks, setTasks] = useState(initialTasks)
  const [payments, setPayments] = useState(initialPayments)
  const [expenses, setExpenses] = useState(initialExpenses)
  const [expenseCategories, setExpenseCategories] = useState(EXPENSE_CATEGORIES)
  const [documents, setDocuments] = useState(initialDocuments)
  const [subs, setSubs] = useState(defaultSubs)
  /* off = מצב דמו | loading/on/error = מצב ענן */
  const [cloudStatus, setCloudStatus] = useState(isCloud ? 'loading' : 'off')

  /* ----------------------------------------------------------------
     בכניסה במצב ענן: טוענים את כל הנתונים מ-Supabase במקום הדמו.
     בנוסף, משלימים את משימות התחזוקה החוזרות של היום אם טרם נפתחו
     (סעיף 6.3) – עד שהתזמון יעבור לצד השרת.
     ---------------------------------------------------------------- */
  useEffect(() => {
    if (!isCloud) return
    let alive = true
    fetchAllCloud()
      .then((data) => {
        if (!alive) return
        setLeads(data.leads)
        setClients(data.clients)
        setPayments(data.payments)
        setExpenses(data.expenses)
        setDocuments(data.documents)
        if (data.subs.length) setSubs(data.subs)
        setExpenseCategories(
          data.categories.length ? data.categories : EXPENSE_CATEGORIES
        )
        const existing = new Set(data.tasks.map((t) => t.id))
        const missingRecurring = todayRecurring.filter((t) => !existing.has(t.id))
        setTasks([...missingRecurring, ...data.tasks])
        if (missingRecurring.length) persist.tasks(missingRecurring)
        setCloudStatus('on')
      })
      .catch((err) => {
        console.warn('טעינת הנתונים מהענן נכשלה – ממשיכים במצב דמו:', err.message)
        if (alive) setCloudStatus('error')
      })
    return () => { alive = false }
  }, [])

  /* ----------------------------------------------------------------
     המרת ליד ללקוח – סעיף 4.3 באפיון.
     בלחיצה אחת:
       1. הליד מסומן כ"נסגר"
       2. נוצר כרטיס לקוח חדש בסטטוס "בהקמה"
       3. נפתחות אוטומטית משימות ההקמה של החבילה שנרכשה,
          כל אחת עם תאריך יעד שמחושב מיעד ה-SLA שלה
     ---------------------------------------------------------------- */
  function convertLead(leadId) {
    const lead = leads.find((l) => l.id === leadId)
    if (!lead || lead.status !== 'active') return null

    const clientId = nextId('C')

    const startDate = new Date()
    const renewalDate = new Date(startDate)
    renewalDate.setFullYear(renewalDate.getFullYear() + 1)

    const newClient = {
      id: clientId,
      business: lead.business,
      contact: lead.name,
      phone: lead.phone,
      email: lead.email,
      industry: 'טרם הוגדר',        // מקורו בליד, שאינו כולל תחום עיסוק (סעיף 4.2)
      address: 'טרם הוגדר',
      packageId: lead.packageId,
      status: 'setup',              // "בהקמה" לפי מחזור החיים בסעיף 3.1
      owner: lead.owner,
      paymentStatus: 'paid',
      startDate: startDate.toISOString(),
      renewalDate: renewalDate.toISOString(),
      notes: '',
      source: lead.source,
      fromLeadId: lead.id,
    }

    const newTasks = setupTasksFor(lead.packageId).map((template) => ({
      id: nextId('T'),
      title: template.title,
      clientId,
      assignee: lead.owner,
      type: 'setup',
      priority: 'normal',
      openedAt: new Date().toISOString(),
      dueAt: dueDateFor(template.sla),
      slaKey: template.sla,
      slaAssumed: Boolean(template.slaAssumed),
      status: 'open',
      recurring: null,
      source: 'setup',              // נוצרה אוטומטית בהמרה
    }))

    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: 'won', convertedTo: clientId } : l))
    )
    setClients((prev) => [newClient, ...prev])
    setTasks((prev) => [...newTasks, ...prev])
    persist.lead({ ...lead, status: 'won', convertedTo: clientId })
    persist.client(newClient)
    persist.tasks(newTasks)
    /* מסמך ההסכם נפתח אוטומטית בתיקיית החוזים ומשויך ללקוח (סעיף 10) */
    setDocuments((prev) => [{
      id: nextId('D'),
      name: `הסכם התקשרות – ${lead.business}.pdf`,
      kind: 'PDF',
      sizeLabel: '180KB',
      folderId: 'contracts',
      clientId,
      tags: ['הסכם'],
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'מנהל המערכת',
      visibility: 'מנהלי-על',
      versions: [],
    }, ...prev])
    setDocuments((prev) => { persist.document(prev[0]); return prev })

    return { client: newClient, tasks: newTasks }
  }

  /* קידום משימה בלוח הקנבן: פתוח ← בביצוע ← הושלם (סעיף 6.3) */
  function updateTaskStatus(taskId, status) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t
        const next = { ...t, status, completedAt: status === 'done' ? new Date().toISOString() : undefined }
        persist.task(next)
        return next
      })
    )
  }

  /* ----------------------------------------------------------------
     סימון תשלום כשולם (סעיף 8).
     אם ללקוח לא נותרו תשלומים באיחור – הוא יורד אוטומטית
     מרשימת "לקוחות בסיכון תשלום" שבדשבורד.
     ---------------------------------------------------------------- */
  function markPaymentPaid(paymentId) {
    setPayments((prev) => {
      const next = prev.map((p) =>
        p.id === paymentId ? { ...p, status: 'paid', paidAt: new Date().toISOString() } : p
      )
      const payment = prev.find((p) => p.id === paymentId)
      if (payment) {
        persist.payment(next.find((p) => p.id === paymentId))
        const stillOverdue = next.some(
          (p) => p.clientId === payment.clientId && p.status === 'overdue'
        )
        if (!stillOverdue) {
          setClients((cs) =>
            cs.map((c) => {
              if (c.id !== payment.clientId) return c
              const cleared = { ...c, paymentStatus: 'paid', overdueDays: undefined, overdueAmount: undefined }
              persist.client(cleared)
              return cleared
            })
          )
        }
      }
      return next
    })
  }

  /* ----------------------------------------------------------------
     רישום הוצאה חדשה (סעיף 9.1) */
  function addExpense(record) {
    const entry = {
      id: nextId('E'),
      monthKey: currentMonthKey(),
      date: record.date || new Date().toISOString(),
      notes: '',
      receipt: null,
      ...record,
    }
    setExpenses((prev) => [entry, ...prev])
    persist.expense(entry)
    return entry
  }

  /* הוספת קטגוריית הוצאה חדשה דרך הממשק (סעיף 9.1) */
  function addExpenseCategory(name) {
    const id = 'custom-' + nextId('cat')
    setExpenseCategories((prev) => [...prev, { id, name }])
    persist.category({ id, name })
    return id
  }

  /* צירוף קובץ קבלה/חשבונית לרשומת הוצאה (סעיף 9.2) */
  function attachReceipt(expenseId, fileMeta) {
    setExpenses((prev) =>
      prev.map((e) => {
        if (e.id !== expenseId) return e
        const next = { ...e, receipt: fileMeta }
        persist.expense(next)
        return next
      })
    )
  }

  /* ----------------------------------------------------------------
     הקצאת משימה לקבלן משנה (סעיף 7).
     המשימה נכנסת ללוח הקנבן הרגיל, משויכת לקבלן ולתעריף שסוכם.
     ---------------------------------------------------------------- */
  function assignTask({ title, clientId, assignee, subcontractorId, fee, dueAt, priority = 'normal' }) {
    const task = {
      id: nextId('T'),
      title,
      clientId,
      assignee,
      subcontractorId,
      type: 'maintenance',
      slaKey: null,
      priority,
      status: 'open',
      openedAt: new Date().toISOString(),
      dueAt,
      fee: fee || null,
      feePaid: false,
      recurring: null,
      source: 'assigned',
    }
    setTasks((prev) => [task, ...prev])
    persist.task(task)
    return task
  }

  /* ----------------------------------------------------------------
     תשלום לקבלן על משימה שהושלמה (סעיף 7).
     התשלום נרשם אוטומטית כהוצאה בקטגוריית "תשלום לקבלן משנה"
     (סעיף 9), ולכן מתעדכן מיד גם ברווח והפסד ובדשבורד.
     ---------------------------------------------------------------- */
  function paySubTask(taskId, enteredBy = 'מנהל המערכת') {
    const task = tasks.find((t) => t.id === taskId)
    if (!task || !task.fee || task.feePaid) return
    const paidTask = { ...task, feePaid: true, feePaidAt: new Date().toISOString() }
    setTasks((prev) => prev.map((t) => (t.id === taskId ? paidTask : t)))
    persist.task(paidTask)
    addExpense({
      amount: task.fee,
      categoryId: 'subcontractor',
      vendor: task.assignee,
      subcontractorId: task.subcontractorId,
      method: 'העברה בנקאית',
      notes: `תשלום עבור משימה: ${task.title}`,
      enteredBy,
    })
  }

  /* העלאת מסמך חדש למאגר (סעיף 10) */
  function addDocument(meta) {
    const doc = {
      id: nextId('D'),
      uploadedAt: new Date().toISOString(),
      clientId: null,
      tags: [],
      visibility: 'מנהלי-על',
      versions: [],
      ...meta,
    }
    setDocuments((prev) => [doc, ...prev])
    persist.document(doc)
    return doc
  }

  /* החלפת קובץ בגרסה חדשה – הגרסה הקודמת נשמרת ולא נמחקת (סעיף 10) */
  function replaceDocument(docId, fileMeta, uploadedBy) {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== docId) return doc
        const previous = {
          name: doc.name,
          sizeLabel: doc.sizeLabel,
          uploadedAt: doc.uploadedAt,
          uploadedBy: doc.uploadedBy,
        }
        const next = {
          ...doc,
          ...fileMeta,
          uploadedAt: new Date().toISOString(),
          uploadedBy,
          versions: [previous, ...doc.versions],
        }
        persist.document(next)
        return next
      })
    )
  }

  /* עדכון שדה ההערות החופשי בכרטיס הלקוח (סעיף 3.2) */
  function updateClientNotes(clientId, notes) {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c
        const next = { ...c, notes }
        persist.client(next)
        return next
      })
    )
  }

  /* ----------------------------------------------------------------
     נתונים נגזרים – מחושבים מחדש אוטומטית בכל שינוי,
     כך שהדשבורד תמיד משקף את המצב האמיתי.
     ---------------------------------------------------------------- */
  const derived = useMemo(() => {
    const nowMs = Date.now()

    const activeClients = clients.filter((c) => c.status === 'active')
    const setupClients = clients.filter((c) => c.status === 'setup')

    const openTasks = tasks.filter((t) => t.status !== 'done')
    const isOverdue = (t) => new Date(t.dueAt).getTime() < nowMs
    const overdueTasks = openTasks.filter(isOverdue)

    const byAssignee = {}
    for (const task of openTasks) {
      const row = (byAssignee[task.assignee] ||= { name: task.assignee, open: 0, overdue: 0 })
      row.open += 1
      if (isOverdue(task)) row.overdue += 1
    }

    const activeLeads = leads.filter((l) => l.status === 'active')

    /* ---- פיננסים נגזרים מספר התשלומים (סעיף 8) ---- */
    const curKey = currentMonthKey()
    const monthKeys = [...new Set(payments.map((p) => p.monthKey))].sort()
    const expenseByMonth = {}
    for (const e of expenses) expenseByMonth[e.monthKey] = (expenseByMonth[e.monthKey] || 0) + e.amount
    const financeSeries = monthKeys.map((key) => ({
      monthKey: key,
      month: monthLabelOf(key).split(' ')[0],   // שם החודש בלבד
      income: payments.filter((p) => p.monthKey === key).reduce((sum, p) => sum + p.amount, 0),
      expense: expenseByMonth[key] || 0,
    }))

    const thisMonth = payments.filter((p) => p.monthKey === curKey)
    const sumOf = (list) => list.reduce((sum, p) => sum + p.amount, 0)
    const overduePayments = thisMonth
      .filter((p) => p.status === 'overdue')
      .map((p) => ({
        ...p,
        daysLate: Math.max(1, Math.floor((nowMs - new Date(p.date).getTime()) / (24 * 60 * 60 * 1000))),
      }))
      .sort((a, b) => b.daysLate - a.daysLate)
    const pendingPayments = thisMonth.filter((p) => p.status === 'pending')

    const billedThisMonth = sumOf(thisMonth)
    const prevKey = monthKeys[monthKeys.length - 2]
    const billedPrevMonth = sumOf(payments.filter((p) => p.monthKey === prevKey))
    const pct = (cur, prev) => (prev ? Math.round(((cur - prev) / prev) * 1000) / 10 : 0)

    return {
      payments,
      financeSeries,
      paymentStats: {
        billed: billedThisMonth,
        collected: billedThisMonth - sumOf(overduePayments) - sumOf(pendingPayments),
        overdueTotal: sumOf(overduePayments),
        pendingTotal: sumOf(pendingPayments),
        overduePayments,
        pendingPayments,
      },
      revenueDelta: pct(billedThisMonth, billedPrevMonth),
      profitDelta: pct(
        billedThisMonth - (expenseByMonth[curKey] || 0),
        billedPrevMonth - (expenseByMonth[prevKey] || 0)
      ),
      /* ---- מסמכים (סעיף 10): המאגר + קבלות ההוצאות שנגזרות אליו ---- */
      allDocuments: [
        ...documents,
        ...expenses
          .filter((e) => e.receipt)
          .map((e) => ({
            id: `DOC-${e.id}`,
            name: e.receipt.name,
            kind: e.receipt.kind,
            sizeLabel: e.receipt.size || '—',
            folderId: 'receipts',
            clientId: null,
            tags: [
              (EXPENSE_CATEGORIES.find((c) => c.id === e.categoryId) ||
                expenseCategories.find((c) => c.id === e.categoryId))?.name || 'הוצאה',
              e.vendor,
            ],
            uploadedAt: e.date,
            uploadedBy: e.enteredBy,
            visibility: 'מנהלי-על',
            url: e.receipt.url,
            versions: [],
            derived: true,           // מנוהל דרך מודול ההוצאות
          })),
      ].sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)),

      /* ---- הוצאות (סעיף 9) ---- */
      expensesThisMonth: expenseByMonth[curKey] || 0,
      expenseStats: {
        total: expenseByMonth[curKey] || 0,
        recurringTotal: expenses
          .filter((e) => e.monthKey === curKey && e.recurring)
          .reduce((sum, e) => sum + e.amount, 0),
        recurringCount: expenses.filter((e) => e.monthKey === curKey && e.recurring).length,
        missingReceipts: expenses.filter((e) => e.monthKey === curKey && !e.receipt).length,
        byCategory: expenseCategories
          .map((cat) => ({
            ...cat,
            amount: expenses
              .filter((e) => e.monthKey === curKey && e.categoryId === cat.id)
              .reduce((sum, e) => sum + e.amount, 0),
          }))
          .filter((cat) => cat.amount > 0)
          .sort((a, b) => b.amount - a.amount),
      },
      activeClients,
      setupClients,
      clientsByPackage: Object.keys(packageById).map((id) => ({
        packageId: id,
        active: activeClients.filter((c) => c.packageId === id).length,
        inSetup: setupClients.filter((c) => c.packageId === id).length,
      })),
      revenue: {
        actual: billedThisMonth,
        forecast: monthlyValueOf(setupClients),
      },
      openTasks,
      overdueTasks,
      tasksByAssignee: Object.values(byAssignee).sort((a, b) => b.open - a.open),
      dueTodayCount: openTasks.filter((t) => {
        const due = new Date(t.dueAt)
        return !isOverdue(t) && due.toDateString() === new Date().toDateString()
      }).length,
      activeLeads,
      wonLeads: leads.filter((l) => l.status === 'won'),
      lostLeads: leads.filter((l) => l.status === 'lost'),
      isOverdue,
      /* "מתקרבת ליעד" (סעיף 6.3): נותר פחות מרבע מיעד ה-SLA,
         ולפחות שעתיים – כדי שגם משימות ארוכות יקבלו התראה בזמן */
      isDueSoon: (t) => {
        if (t.status === 'done' || isOverdue(t)) return false
        const remainingMs = new Date(t.dueAt).getTime() - nowMs
        const slaMinutes = t.slaKey ? SLA[t.slaKey].minutes : 24 * 60
        const thresholdMs = Math.max(slaMinutes * 0.25, 120) * 60 * 1000
        return remainingMs < thresholdMs
      },
    }
  }, [leads, clients, tasks, payments, expenses, expenseCategories, documents])

  const value = {
    leads, clients, tasks, expenses, expenseCategories, subs, cloudStatus,
    convertLead, updateClientNotes, updateTaskStatus, markPaymentPaid,
    addExpense, addExpenseCategory, attachReceipt,
    addDocument, replaceDocument,
    assignTask, paySubTask,
    ...derived,
  }
  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>
}

export function useCrm() {
  const ctx = useContext(CrmContext)
  if (!ctx) throw new Error('useCrm חייב לרוץ בתוך CrmProvider')
  return ctx
}
