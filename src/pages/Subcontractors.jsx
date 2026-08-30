import { useEffect, useMemo, useState } from 'react'

/* סגירת חלון קופץ בלחיצת Escape – אחיד בכל המערכת */
function useEscape(onClose) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
}
import { useCrm } from '../store/CrmContext.jsx'
import {
  subcontractors, rateLabelOf, formatCurrency, currentMonthKey,
} from '../data/mockData.js'

/* ------------------------------------------------------------------
   ניהול קבלני משנה – סעיף 7 באפיון.
   כרטיס קבלן (שם, התמחות, פרטי קשר, תעריף), הקצאת משימות,
   מעקב תשלומים מול משימות שהושלמו, ותשתית ויזואלית להזמנה
   למערכת בהרשאות מוגבלות (תופעל עם חיבור השרת – סעיפים 2.2 + 7).
   ------------------------------------------------------------------ */

function dateHe(iso) {
  return new Date(iso).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

/* חלון הזמנת קבלן למערכת – תשתית ויזואלית בלבד בשלב זה */
function InviteModal({ sub, onClose }) {
  useEscape(onClose)
  return (
    <div className="modal-layer" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <header className="modal__head">
          <div>
            <h2 className="modal__title">הזמנת {sub.name} למערכת</h2>
            <p className="modal__subtitle">תהליך ההזמנה המאובטח מסעיף 2.2 באפיון</p>
          </div>
          <button className="modal__close" onClick={onClose} aria-label="סגירה">✕</button>
        </header>
        <div className="modal__body">
          <p className="modal__note">
            הקבלן יקבל <strong>קישור הזמנה חד-פעמי</strong> (בתוקף 48 שעות) בוואטסאפ
            או באימייל, יקבע סיסמה אישית, וייכנס עם ערכת ההרשאות המוגבלת:
          </p>
          <ul className="perm-list">
            <li className="perm-list__yes">✓ רואה את המשימות שהוקצו לו בלבד</li>
            <li className="perm-list__yes">✓ רואה את החומרים הרלוונטיים ללקוח הספציפי</li>
            <li className="perm-list__no">✗ ללא גישה לנתונים כספיים</li>
            <li className="perm-list__no">✗ ללא גישה ללקוחות אחרים או לכלל נתוני הלקוח</li>
          </ul>
          <div className="alert-strip alert-strip--info">
            שליחת ההזמנה בפועל תופעל עם חיבור המערכת לשרת – התשתית מוכנה.
          </div>
        </div>
        <footer className="modal__foot">
          <button className="btn-ghost" onClick={onClose}>סגירה</button>
          <button className="btn-primary btn-primary--inline" disabled title="יופעל עם חיבור השרת">
            שליחת הזמנה
          </button>
        </footer>
      </div>
    </div>
  )
}

/* טופס הקצאת משימה לקבלן (סעיף 7) */
function AssignModal({ sub, clients, onAssign, onClose }) {
  useEscape(onClose)
  const [title, setTitle] = useState('')
  const [clientId, setClientId] = useState(clients[0]?.id || '')
  const [fee, setFee] = useState(sub.rateType === 'monthly' ? '' : String(sub.rate))
  const [days, setDays] = useState('3')
  const [error, setError] = useState('')

  function save() {
    if (!title.trim()) return setError('נא להזין תיאור משימה')
    const dueAt = new Date(Date.now() + Number(days) * 24 * 60 * 60 * 1000).toISOString()
    onAssign({
      title: title.trim(),
      clientId,
      assignee: sub.name,
      subcontractorId: sub.id,
      fee: fee ? Number(fee) : null,
      dueAt,
    })
  }

  return (
    <div className="modal-layer" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <header className="modal__head">
          <div>
            <h2 className="modal__title">הקצאת משימה ל{sub.name}</h2>
            <p className="modal__subtitle">{sub.field} · {rateLabelOf(sub)}</p>
          </div>
          <button className="modal__close" onClick={onClose} aria-label="סגירה">✕</button>
        </header>
        <div className="modal__body">
          {error && <div className="alert-strip" role="alert">{error}</div>}
          <label className="fld">
            <span className="fld__label">תיאור המשימה</span>
            <input className="fld__input" value={title}
              onChange={(e) => { setTitle(e.target.value); setError('') }}
              placeholder="למשל: עיצוב באנר לקמפיין החדש" />
          </label>
          <div className="form-grid">
            <label className="fld">
              <span className="fld__label">לקוח</span>
              <select className="fld__input" value={clientId} onChange={(e) => setClientId(e.target.value)}>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.business}</option>)}
              </select>
            </label>
            <label className="fld">
              <span className="fld__label">יעד (ימים מהיום)</span>
              <input className="fld__input" type="number" min="1" dir="ltr" value={days}
                onChange={(e) => setDays(e.target.value)} />
            </label>
            <label className="fld">
              <span className="fld__label">
                תשלום למשימה ₪ {sub.rateType === 'monthly' ? '(ריק = במסגרת הריטיינר)' : ''}
              </span>
              <input className="fld__input" type="number" min="0" dir="ltr" value={fee}
                onChange={(e) => setFee(e.target.value)} />
            </label>
          </div>
        </div>
        <footer className="modal__foot">
          <button className="btn-ghost" onClick={onClose}>ביטול</button>
          <button className="btn-primary btn-primary--inline" onClick={save}>הקצאת המשימה</button>
        </footer>
      </div>
    </div>
  )
}

/* תצוגת קבלן בודד */
function SubDetail({ sub, onBack, onOpenClient }) {
  const { tasks, clients, expenses, assignTask, paySubTask, isOverdue } = useCrm()
  const [assignOpen, setAssignOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [assigned, setAssigned] = useState(false)

  const clientById = useMemo(() => Object.fromEntries(clients.map((c) => [c.id, c])), [clients])
  const subTasks = tasks.filter((t) => t.subcontractorId === sub.id)
  const openTasks = subTasks.filter((t) => t.status !== 'done')
  const doneWithFee = subTasks.filter((t) => t.status === 'done' && t.fee)
  const unpaidTotal = doneWithFee.filter((t) => !t.feePaid).reduce((sum, t) => sum + t.fee, 0)

  const paidAllTime = expenses
    .filter((e) => e.subcontractorId === sub.id)
    .reduce((sum, e) => sum + e.amount, 0)
  const paidThisMonth = expenses
    .filter((e) => e.subcontractorId === sub.id && e.monthKey === currentMonthKey())
    .reduce((sum, e) => sum + e.amount, 0)

  return (
    <>
      <section className="card client-head">
        <div className="client-head__top">
          <button className="chip-btn" onClick={onBack}>→ חזרה לרשימת הקבלנים</button>
          <div className="client-head__pills">
            <span className="pill pill--secondary">{sub.field}</span>
            <span className="pill pill--muted">גישה: טרם הוזמן למערכת</span>
          </div>
        </div>
        <div className="client-head__main">
          <span className="avatar avatar--lg">{sub.name.charAt(0)}</span>
          <div>
            <h2 className="client-head__name">{sub.name}</h2>
            <p className="client-head__meta">
              <span dir="ltr">{sub.phone}</span> · <span dir="ltr">{sub.email}</span> · {rateLabelOf(sub)}
              {sub.revSharePct && <> · עמלה <span dir="ltr">{sub.revSharePct}%</span> מהיקף המכירות</>}
            </p>
          </div>
        </div>
        <div className="totals totals--pay">
          <div className={`totals__item ${unpaidTotal > 0 ? 'totals__item--soon' : ''}`}>
            <span className="totals__value" dir="ltr">{formatCurrency(unpaidTotal)}</span>
            <span className="totals__label">ממתין לתשלום</span>
          </div>
          <div className="totals__item">
            <span className="totals__value" dir="ltr">{formatCurrency(paidThisMonth)}</span>
            <span className="totals__label">שולם החודש</span>
          </div>
          <div className="totals__item">
            <span className="totals__value" dir="ltr">{formatCurrency(paidAllTime)}</span>
            <span className="totals__label">שולם סה"כ (חצי שנה)</span>
          </div>
          <div className="totals__item">
            <span className="totals__value" dir="ltr">{sub.slaRate}%</span>
            <span className="totals__label">עמידה ב-SLA</span>
          </div>
        </div>
      </section>

      <div className="grid-2">
        <div className="stack">
          {/* מעקב תשלומים מול משימות שהושלמו (סעיף 7) */}
          <section className="card">
            <div className="card__head">
              <div>
                <h2 className="card__title">מעקב תשלומים</h2>
                <p className="card__subtitle">משימות שהושלמו והתשלום עליהן</p>
              </div>
            </div>
            {doneWithFee.length === 0 ? (
              <p className="mini-empty">אין עדיין משימות שהושלמו עם תשלום למשימה.</p>
            ) : (
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr><th>משימה</th><th>לקוח</th><th>הושלמה</th><th>סכום</th><th>סטטוס</th></tr>
                  </thead>
                  <tbody>
                    {doneWithFee.map((task) => (
                      <tr key={task.id}>
                        <td className="cell-strong">{task.title}</td>
                        <td>
                          <button className="tcard__client" onClick={() => onOpenClient(task.clientId)}>
                            {clientById[task.clientId]?.business || '—'}
                          </button>
                        </td>
                        <td className="muted num" dir="ltr">{dateHe(task.dueAt)}</td>
                        <td className="num"><span dir="ltr">{formatCurrency(task.fee)}</span></td>
                        <td>
                          {task.feePaid ? (
                            <span className="pill pill--active">שולם</span>
                          ) : (
                            <button className="btn-convert" onClick={() => paySubTask(task.id)}>
                              תשלום ורישום כהוצאה
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* המשימות הפתוחות שהוקצו לקבלן */}
          <section className="card">
            <div className="card__head">
              <div>
                <h2 className="card__title">משימות מוקצות</h2>
                <p className="card__subtitle">{openTasks.length} פתוחות כרגע</p>
              </div>
              <button className="btn-primary btn-primary--inline btn-add" onClick={() => setAssignOpen(true)}>
                + הקצאת משימה
              </button>
            </div>
            {assigned && (
              <div className="banner" role="status">
                <span className="banner__icon">✓</span>
                <div className="banner__body">
                  <strong>המשימה הוקצתה</strong>
                  <span>היא מופיעה עכשיו גם בלוח המשימות, בלוח האישי של {sub.name}.</span>
                </div>
                <button className="banner__close" onClick={() => setAssigned(false)} aria-label="סגירה">✕</button>
              </div>
            )}
            {openTasks.length === 0 ? (
              <p className="mini-empty">אין משימות פתוחות – אפשר להקצות חדשה.</p>
            ) : (
              <ul className="client-tasks">
                {openTasks.map((task) => (
                  <li key={task.id} className="client-tasks__row">
                    <span className={`client-tasks__status ${isOverdue(task) ? 'is-late' : ''}`} />
                    <span className="client-tasks__title">
                      {task.title}
                      <span className="client-tasks__sla">
                        {clientById[task.clientId]?.business} · יעד: <span dir="ltr">{dateHe(task.dueAt)}</span>
                        {task.fee ? <> · <span dir="ltr">{formatCurrency(task.fee)}</span></> : ' · במסגרת הריטיינר'}
                      </span>
                    </span>
                    {isOverdue(task) ? (
                      <span className="pill pill--late">באיחור</span>
                    ) : task.status === 'inprogress' ? (
                      <span className="pill pill--pending">בביצוע</span>
                    ) : (
                      <span className="pill pill--secondary">פתוחה</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="stack">
          {/* תשתית הגישה למערכת (סעיפים 2.2 + 7) */}
          <section className="card">
            <div className="card__head">
              <div>
                <h2 className="card__title">גישה למערכת</h2>
                <p className="card__subtitle">הרשאות מוגבלות מראש לקבלן</p>
              </div>
            </div>
            <ul className="perm-list">
              <li className="perm-list__yes">✓ המשימות שהוקצו לו בלבד</li>
              <li className="perm-list__yes">✓ החומרים של הלקוח הספציפי בלבד</li>
              <li className="perm-list__no">✗ נתונים כספיים</li>
              <li className="perm-list__no">✗ לקוחות אחרים</li>
            </ul>
            <button className="chip-btn" onClick={() => setInviteOpen(true)}>
              ✉️ הזמנה למערכת
            </button>
          </section>

          <section className="card">
            <div className="card__head"><h2 className="card__title">ביצועים</h2></div>
            <div className="info">
              <div className="info__item">
                <span className="info__label">זמן ממוצע למשימה</span>
                <span className="info__value" dir="ltr">{sub.avgHours < 1 ? Math.round(sub.avgHours * 60) + ' דק׳' : sub.avgHours + ' שעות'}</span>
              </div>
              <div className="info__item">
                <span className="info__label">משימות שהושלמו (מצטבר)</span>
                <span className="info__value" dir="ltr">{sub.completed}</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {assignOpen && (
        <AssignModal
          sub={sub}
          clients={clients}
          onClose={() => setAssignOpen(false)}
          onAssign={(record) => { assignTask(record); setAssignOpen(false); setAssigned(true) }}
        />
      )}
      {inviteOpen && <InviteModal sub={sub} onClose={() => setInviteOpen(false)} />}
    </>
  )
}

export default function Subcontractors({ onOpenClient }) {
  const { tasks, clients, expenses, paySubTask } = useCrm()
  const [selectedId, setSelectedId] = useState(null)

  const clientById = useMemo(() => Object.fromEntries(clients.map((c) => [c.id, c])), [clients])
  const unpaid = tasks.filter((t) => t.status === 'done' && t.fee && !t.feePaid)
  const unpaidTotal = unpaid.reduce((sum, t) => sum + t.fee, 0)
  const openSubTasks = tasks.filter((t) => t.subcontractorId && t.status !== 'done')
  const paidThisMonth = expenses
    .filter((e) => e.subcontractorId && e.monthKey === currentMonthKey())
    .reduce((sum, e) => sum + e.amount, 0)

  if (selectedId) {
    const sub = subcontractors.find((s) => s.id === selectedId)
    return (
      <div className="content__body">
        <SubDetail sub={sub} onBack={() => setSelectedId(null)} onOpenClient={onOpenClient} />
      </div>
    )
  }

  return (
    <div className="content__body">
      <div className="totals totals--pay">
        <div className="totals__item">
          <span className="totals__value" dir="ltr">{subcontractors.length}</span>
          <span className="totals__label">קבלנים פעילים</span>
        </div>
        <div className="totals__item">
          <span className="totals__value" dir="ltr">{openSubTasks.length}</span>
          <span className="totals__label">משימות פתוחות אצלם</span>
        </div>
        <div className={`totals__item ${unpaidTotal > 0 ? 'totals__item--soon' : ''}`}>
          <span className="totals__value" dir="ltr">{formatCurrency(unpaidTotal)}</span>
          <span className="totals__label">ממתין לתשלום ({unpaid.length})</span>
        </div>
        <div className="totals__item">
          <span className="totals__value" dir="ltr">{formatCurrency(paidThisMonth)}</span>
          <span className="totals__label">שולם החודש</span>
        </div>
      </div>

      {/* מי סיים מה וכמה לשלם – מעקב התשלומים המרכזי (סעיף 7) */}
      {unpaid.length > 0 && (
        <section className="card">
          <div className="card__head">
            <div>
              <h2 className="card__title">ממתינים לתשלום</h2>
              <p className="card__subtitle">
                משימות שהושלמו וטרם שולמו · <span dir="ltr">{formatCurrency(unpaidTotal)}</span>
              </p>
            </div>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr><th>קבלן</th><th>משימה שהושלמה</th><th>לקוח</th><th>סכום</th><th>פעולה</th></tr>
              </thead>
              <tbody>
                {unpaid.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <div className="cell-user">
                        <span className="avatar avatar--sm">{task.assignee.charAt(0)}</span>
                        <span className="cell-user__name">{task.assignee}</span>
                      </div>
                    </td>
                    <td className="muted">{task.title}</td>
                    <td>
                      <button className="tcard__client" onClick={() => onOpenClient(task.clientId)}>
                        {clientById[task.clientId]?.business || '—'}
                      </button>
                    </td>
                    <td className="num"><span dir="ltr">{formatCurrency(task.fee)}</span></td>
                    <td>
                      <button className="btn-convert" onClick={() => paySubTask(task.id)}>
                        תשלום ורישום כהוצאה
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* כרטיסי הקבלנים */}
      <div className="subs-grid">
        {subcontractors.map((sub) => {
          const subOpen = tasks.filter((t) => t.subcontractorId === sub.id && t.status !== 'done').length
          const subUnpaid = tasks
            .filter((t) => t.subcontractorId === sub.id && t.status === 'done' && t.fee && !t.feePaid)
            .reduce((sum, t) => sum + t.fee, 0)
          return (
            <button key={sub.id} className="card sub-card" onClick={() => setSelectedId(sub.id)}>
              <div className="sub-card__head">
                <span className="avatar">{sub.name.charAt(0)}</span>
                <div>
                  <h2 className="sub-card__name">{sub.name}</h2>
                  <p className="sub-card__field">{sub.field}</p>
                </div>
              </div>
              <div className="sub-card__facts">
                <span className="sub-card__rate">{rateLabelOf(sub)}</span>
                {sub.revSharePct && (
                  <span className="pill pill--secondary">+ עמלה <span dir="ltr">{sub.revSharePct}%</span> מהמכירות</span>
                )}
              </div>
              <div className="sub-card__foot">
                <span><strong dir="ltr">{subOpen}</strong> משימות פתוחות</span>
                {subUnpaid > 0 ? (
                  <span className="pill pill--pending">לתשלום <span dir="ltr">{formatCurrency(subUnpaid)}</span></span>
                ) : (
                  <span className="pill pill--active">אין חוב פתוח</span>
                )}
              </div>
              <span className="pill pill--muted sub-card__access">גישה: טרם הוזמן</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
