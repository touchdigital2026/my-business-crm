import { createContext, useContext, useMemo, useState } from 'react'
import {
  initialLeads, initialClients, initialTasks,
  packageById, setupTasksFor, SLA, monthlyValueOf,
} from '../data/mockData.js'

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

    return { client: newClient, tasks: newTasks }
  }

  /* קידום משימה בלוח הקנבן: פתוח ← בביצוע ← הושלם (סעיף 6.3) */
  function updateTaskStatus(taskId, status) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status, completedAt: status === 'done' ? new Date().toISOString() : undefined }
          : t
      )
    )
  }

  /* עדכון שדה ההערות החופשי בכרטיס הלקוח (סעיף 3.2) */
  function updateClientNotes(clientId, notes) {
    setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, notes } : c)))
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

    return {
      activeClients,
      setupClients,
      clientsByPackage: Object.keys(packageById).map((id) => ({
        packageId: id,
        active: activeClients.filter((c) => c.packageId === id).length,
        inSetup: setupClients.filter((c) => c.packageId === id).length,
      })),
      revenue: {
        actual: monthlyValueOf(activeClients),
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
  }, [leads, clients, tasks])

  const value = { leads, clients, tasks, convertLead, updateClientNotes, updateTaskStatus, ...derived }
  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>
}

export function useCrm() {
  const ctx = useContext(CrmContext)
  if (!ctx) throw new Error('useCrm חייב לרוץ בתוך CrmProvider')
  return ctx
}
