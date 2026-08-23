import { useMemo, useState } from 'react'
import { useCrm } from '../store/CrmContext.jsx'
import { IconSearch } from '../components/icons.jsx'
import { slaLabelOf } from '../data/mockData.js'

/* ------------------------------------------------------------------
   לוח המשימות (Kanban) – סעיף 6 באפיון.
   שלוש עמודות סטטוס, תצוגה כללית למנהלים או לוח לכל אחראי,
   וסימון אוטומטי של איחור וקרבה ליעד ה-SLA.
   ------------------------------------------------------------------ */

const COLUMNS = [
  { id: 'open', label: 'פתוח' },
  { id: 'inprogress', label: 'בביצוע' },
  { id: 'done', label: 'הושלם' },
]

const TYPE_LABELS = {
  setup: { label: 'הקמה', tone: 'secondary' },
  maintenance: { label: 'תחזוקה', tone: 'muted' },
}

/* "לפני יומיים" / "בעוד 3 שעות" – טקסט זמן קריא לאדם */
function humanize(ms) {
  const minutes = Math.round(Math.abs(ms) / 60000)
  if (minutes < 60) return `${minutes} דקות`
  const hours = Math.round(minutes / 60)
  if (hours < 48) return `${hours} שעות`
  return `${Math.round(hours / 24)} ימים`
}

function formatDue(iso) {
  return new Date(iso).toLocaleString('he-IL', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

function TaskCard({ task, clientName, onAdvance, onRevert, onOpenClient, isOverdue, isDueSoon }) {
  const overdue = task.status !== 'done' && isOverdue(task)
  const dueSoon = isDueSoon(task)
  const typeInfo = TYPE_LABELS[task.type] || TYPE_LABELS.maintenance
  const remaining = new Date(task.dueAt).getTime() - Date.now()

  return (
    <article className={`tcard ${overdue ? 'is-late' : ''} ${dueSoon ? 'is-soon' : ''} ${task.status === 'done' ? 'is-done' : ''}`}>
      <div className="tcard__tags">
        <span className={`pill pill--${typeInfo.tone}`}>{typeInfo.label}</span>
        {task.recurring && <span className="pill pill--muted">↻ {task.recurring}</span>}
        {task.priority === 'high' && <span className="pill pill--pending">עדיפות גבוהה</span>}
        {/* דגל האיחור – מחושב אוטומטית מיעד ה-SLA (סעיף 6.3) */}
        {overdue && <span className="pill pill--late">באיחור · {humanize(remaining)}</span>}
        {dueSoon && <span className="pill pill--pending">קרוב ליעד · נותרו {humanize(remaining)}</span>}
      </div>

      <h3 className="tcard__title">{task.title}</h3>

      <div className="tcard__meta">
        <button
          className="tcard__client"
          onClick={() => onOpenClient(task.clientId)}
          title="מעבר לכרטיס הלקוח"
        >
          {clientName} ↗
        </button>
        <span className="tcard__assignee">
          <span className="avatar avatar--xs">{task.assignee.charAt(0)}</span>
          {task.assignee}
        </span>
      </div>

      <div className="tcard__sla">
        {task.slaKey && <span>יעד SLA: {slaLabelOf(task.slaKey)}</span>}
        <span className={overdue ? 'tcard__due is-late' : 'tcard__due'} dir="ltr">
          {formatDue(task.dueAt)}
        </span>
      </div>

      {task.status !== 'done' ? (
        <button className="tcard__action" onClick={() => onAdvance(task)}>
          {task.status === 'open' ? 'התחלת ביצוע ←' : 'סימון כהושלם ✓'}
        </button>
      ) : (
        <button className="tcard__action tcard__action--ghost" onClick={() => onRevert(task)}>
          החזרה לביצוע
        </button>
      )}
    </article>
  )
}

export default function Tasks({ onOpenClient }) {
  const { tasks, clients, updateTaskStatus, isOverdue, isDueSoon } = useCrm()

  const [assignee, setAssignee] = useState('all')
  const [type, setType] = useState('all')
  const [search, setSearch] = useState('')

  const clientNames = useMemo(
    () => Object.fromEntries(clients.map((c) => [c.id, c.business])),
    [clients]
  )
  const assignees = useMemo(
    () => [...new Set(tasks.map((t) => t.assignee))].sort(),
    [tasks]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return tasks.filter((task) => {
      if (assignee !== 'all' && task.assignee !== assignee) return false
      if (type !== 'all' && task.type !== type) return false
      if (!q) return true
      return `${task.title} ${clientNames[task.clientId] || ''}`.toLowerCase().includes(q)
    })
  }, [tasks, assignee, type, search, clientNames])

  const open = filtered.filter((t) => t.status !== 'done')
  const summary = {
    open: open.length,
    inprogress: filtered.filter((t) => t.status === 'inprogress').length,
    overdue: open.filter(isOverdue).length,
    soon: open.filter(isDueSoon).length,
    done: filtered.filter((t) => t.status === 'done').length,
  }

  /* מיון בתוך עמודה: איחורים למעלה, ואז לפי תאריך היעד הקרוב */
  function columnTasks(columnId) {
    return filtered
      .filter((t) => t.status === columnId)
      .sort((a, b) => {
        const lateDiff = (isOverdue(b) ? 1 : 0) - (isOverdue(a) ? 1 : 0)
        if (columnId !== 'done' && lateDiff !== 0) return lateDiff
        return new Date(a.dueAt) - new Date(b.dueAt)
      })
  }

  function advance(task) {
    updateTaskStatus(task.id, task.status === 'open' ? 'inprogress' : 'done')
  }

  const hasFilters = search || assignee !== 'all' || type !== 'all'

  return (
    <div className="content__body">
      <section className="card filters">
        <div className="filters__search">
          <IconSearch width={18} height={18} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש משימה או לקוח..."
            aria-label="חיפוש משימות"
          />
        </div>

        {/* לוח לכל אחראי + תצוגה כללית למנהלים (סעיף 6.3) */}
        <label className="select">
          <span className="select__label">אחראי</span>
          <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
            <option value="all">תצוגה כללית – כולם</option>
            {assignees.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </label>

        <label className="select">
          <span className="select__label">סוג משימה</span>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">כל הסוגים</option>
            <option value="setup">משימות הקמה</option>
            <option value="maintenance">תחזוקה שוטפת</option>
          </select>
        </label>

        {hasFilters && (
          <button className="chip-btn" onClick={() => { setSearch(''); setAssignee('all'); setType('all') }}>
            ניקוי סינון
          </button>
        )}
      </section>

      {/* שורת סיכום */}
      <div className="totals totals--wide">
        <div className="totals__item">
          <span className="totals__value" dir="ltr">{summary.open}</span>
          <span className="totals__label">פתוחות</span>
        </div>
        <div className="totals__item">
          <span className="totals__value" dir="ltr">{summary.inprogress}</span>
          <span className="totals__label">בביצוע</span>
        </div>
        <div className="totals__item totals__item--late">
          <span className="totals__value" dir="ltr">{summary.overdue}</span>
          <span className="totals__label">באיחור</span>
        </div>
        <div className="totals__item totals__item--soon">
          <span className="totals__value" dir="ltr">{summary.soon}</span>
          <span className="totals__label">קרובות ליעד</span>
        </div>
        <div className="totals__item">
          <span className="totals__value" dir="ltr">{summary.done}</span>
          <span className="totals__label">הושלמו</span>
        </div>
      </div>

      {/* לוח הקנבן */}
      <div className="kanban">
        {COLUMNS.map((column) => {
          const items = columnTasks(column.id)
          return (
            <section key={column.id} className="kanban__col" aria-label={column.label}>
              <header className="kanban__head">
                <h2 className="kanban__title">{column.label}</h2>
                <span className="kanban__count" dir="ltr">{items.length}</span>
              </header>
              <div className="kanban__stack">
                {items.length === 0 && <p className="mini-empty">אין משימות בעמודה זו.</p>}
                {items.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    clientName={clientNames[task.clientId] || '—'}
                    onAdvance={advance}
                    onRevert={(t) => updateTaskStatus(t.id, 'inprogress')}
                    onOpenClient={onOpenClient}
                    isOverdue={isOverdue}
                    isDueSoon={isDueSoon}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
