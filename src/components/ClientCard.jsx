import { useState } from 'react'
import { useCrm } from '../store/CrmContext.jsx'
import { packageById, formatCurrency, SLA, formatSla } from '../data/mockData.js'
import {
  assetsForClient, ASSET_STATUS_LABELS, commLogFor, docsFor,
  LIFECYCLE_STAGES, lifecycleStageOf, CLIENT_STATUS_LABELS, formatDate,
} from '../data/clientData.js'
import { monthLabelOf, PAYMENT_KIND_LABELS } from '../data/mockData.js'

/* ------------------------------------------------------------------
   כרטיס לקוח מלא – סעיף 3.2 באפיון.
   מרכז במקום אחד: פרטי זיהוי, חבילה ותאריכים, מחזור חיים (3.1),
   נכסים דיגיטליים, יומן תקשורת, משימות, תשלומים, מסמכים והערות.
   ------------------------------------------------------------------ */

/* מד מחזור החיים – ששת השלבים מסעיף 3.1 */
function LifecycleStepper({ client }) {
  const current = lifecycleStageOf(client)
  return (
    <ol className="stepper" aria-label="מחזור חיי הלקוח">
      {LIFECYCLE_STAGES.map((stage) => {
        const state =
          stage.id < current ? 'done' : stage.id === current ? 'current' : 'future'
        const danger = stage.id === 6 && current === 6
        return (
          <li key={stage.id} className={`stepper__step is-${state} ${danger ? 'is-danger' : ''}`}>
            <span className="stepper__dot">
              {state === 'done' ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="3"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                stage.id
              )}
            </span>
            <span className="stepper__label">{stage.label}</span>
          </li>
        )
      })}
    </ol>
  )
}

function InfoItem({ label, value, ltr }) {
  return (
    <div className="info__item">
      <span className="info__label">{label}</span>
      <span className="info__value" dir={ltr ? 'ltr' : undefined}>{value || '—'}</span>
    </div>
  )
}

export default function ClientCard({ clientId, onBack }) {
  const { clients, tasks, payments: allPayments, updateClientNotes, isOverdue } = useCrm()
  const client = clients.find((c) => c.id === clientId)
  const [notesSaved, setNotesSaved] = useState(false)

  if (!client) {
    return (
      <section className="card empty-state">
        <div className="empty-state__badge">🔍</div>
        <h2>הלקוח לא נמצא</h2>
        <button className="btn-primary btn-primary--inline" onClick={onBack}>חזרה לרשימה</button>
      </section>
    )
  }

  const pkg = packageById[client.packageId]
  const statusInfo = CLIENT_STATUS_LABELS[client.status]
  const assets = assetsForClient(client, tasks)
  const payments = allPayments
    .filter((p) => p.clientId === client.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
  const log = commLogFor(client)
  const docs = docsFor(client)

  const clientTasks = tasks.filter((t) => t.clientId === client.id)
  const openTasks = clientTasks.filter((t) => t.status !== 'done')
  const doneTasks = clientTasks.filter((t) => t.status === 'done')

  function saveNotes(e) {
    updateClientNotes(client.id, e.target.value)
    setNotesSaved(true)
    setTimeout(() => setNotesSaved(false), 2000)
  }

  return (
    <>
      {/* כותרת הכרטיס */}
      <section className="card client-head">
        <div className="client-head__top">
          <button className="chip-btn" onClick={onBack}>→ חזרה לרשימת הלקוחות</button>
          <div className="client-head__pills">
            <span className={`pill pill--tier${pkg.tier}`}>{pkg.name}</span>
            <span className={`pill pill--${statusInfo.tone}`}>{statusInfo.label}</span>
          </div>
        </div>

        <div className="client-head__main">
          <span className="avatar avatar--lg">{client.business.charAt(0)}</span>
          <div>
            <h2 className="client-head__name">{client.business}</h2>
            <p className="client-head__meta">
              {client.industry} · איש קשר: {client.contact} · אחראי: {client.owner}
            </p>
          </div>
        </div>

        {client.status === 'frozen' && client.frozenReason && (
          <div className="alert-strip">
            <strong>לקוח מוקפא:</strong> {client.frozenReason}
          </div>
        )}

        <LifecycleStepper client={client} />
      </section>

      <div className="grid-2">
        {/* עמודה ראשית */}
        <div className="stack">
          {/* פרטי זיהוי + התקשרות (3.2) */}
          <section className="card">
            <div className="card__head"><h2 className="card__title">פרטי הלקוח</h2></div>
            <div className="info">
              <InfoItem label="טלפון" value={client.phone} ltr />
              <InfoItem label="אימייל" value={client.email} ltr />
              <InfoItem label="תחום עיסוק" value={client.industry} />
              <InfoItem label="כתובת" value={client.address} />
              <InfoItem label="תחילת התקשרות" value={formatDate(client.startDate)} ltr />
              <InfoItem label="תאריך חידוש" value={formatDate(client.renewalDate)} ltr />
              <InfoItem label="חבילה נוכחית" value={`${pkg.name} · ${formatCurrency(pkg.price)}/חודש`} />
              <InfoItem label="תכולת החבילה" value={pkg.includes} />
            </div>
          </section>

          {/* נכסים דיגיטליים (3.2) */}
          <section className="card">
            <div className="card__head">
              <div>
                <h2 className="card__title">נכסים דיגיטליים</h2>
                <p className="card__subtitle">
                  {assets.filter((a) => a.status === 'live').length} מתוך {assets.length} באוויר
                </p>
              </div>
            </div>
            <ul className="assets">
              {assets.map((asset) => {
                const st = ASSET_STATUS_LABELS[asset.status]
                return (
                  <li key={asset.name} className="assets__row">
                    <span className={`assets__dot assets__dot--${asset.status}`} aria-hidden="true" />
                    <span className="assets__name">{asset.name}</span>
                    <span className={`pill pill--${st.tone}`}>{st.label}</span>
                    {asset.url ? (
                      <a className="assets__link" href={asset.url} title="קישור ישיר לנכס (יופעל עם חיבור נתונים אמיתיים)">
                        קישור ↗
                      </a>
                    ) : (
                      <span className="assets__link assets__link--off">אין קישור עדיין</span>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>

          {/* היסטוריית תשלומים (3.2) */}
          <section className="card">
            <div className="card__head">
              <div>
                <h2 className="card__title">היסטוריית תשלומים</h2>
                <p className="card__subtitle">סטטוס חשבוניות אחרונות</p>
              </div>
            </div>
            {payments.length === 0 ? (
              <p className="mini-empty">
                {client.status === 'frozen'
                  ? 'הלקוח מוקפא – החיוב החודשי מושהה עד לחידוש הפעילות.'
                  : 'טרם נרשמו תשלומים – החיוב החודשי יתחיל עם סיום ההקמה, ובינתיים ההכנסה מהלקוח נספרת בתחזית שבדשבורד.'}
              </p>
            ) : (
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr><th>חודש</th><th>חשבונית</th><th>סכום</th><th>אמצעי תשלום</th><th>סטטוס</th></tr>
                  </thead>
                  <tbody>
                    {payments.map((pay) => (
                      <tr key={pay.id}>
                        <td>
                          {monthLabelOf(pay.monthKey)}
                          {pay.kind !== 'monthly' && (
                            <span className="muted"> · {PAYMENT_KIND_LABELS[pay.kind]}</span>
                          )}
                        </td>
                        <td className="muted num" dir="ltr">{pay.invoice}</td>
                        <td className="num"><span dir="ltr">{formatCurrency(pay.amount)}</span></td>
                        <td className="muted">{pay.method}</td>
                        <td>
                          <span className={`pill ${pay.status === 'paid' ? 'pill--active' : 'pill--late'}`}>
                            {pay.status === 'paid' ? 'שולם' : 'באיחור'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* עמודה משנית */}
        <div className="stack">
          {/* משימות פתוחות וסגורות (3.2) */}
          <section className="card">
            <div className="card__head">
              <div>
                <h2 className="card__title">משימות</h2>
                <p className="card__subtitle">{openTasks.length} פתוחות · {doneTasks.length} הושלמו</p>
              </div>
            </div>
            {clientTasks.length === 0 ? (
              <p className="mini-empty">אין משימות המשויכות ללקוח זה.</p>
            ) : (
              <ul className="client-tasks">
                {openTasks.map((task) => (
                  <li key={task.id} className="client-tasks__row">
                    <span className={`client-tasks__status ${isOverdue(task) ? 'is-late' : ''}`} />
                    <span className="client-tasks__title">
                      {task.title}
                      {task.slaKey && (
                        <span className="client-tasks__sla">יעד: {formatSla(SLA[task.slaKey].minutes)}</span>
                      )}
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
                {doneTasks.map((task) => (
                  <li key={task.id} className="client-tasks__row is-done">
                    <span className="client-tasks__status is-ok" />
                    <span className="client-tasks__title">{task.title}</span>
                    <span className="pill pill--active">הושלמה</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* יומן תקשורת (3.2 + 11) */}
          <section className="card">
            <div className="card__head"><h2 className="card__title">יומן תקשורת</h2></div>
            <ul className="comm-log">
              {log.map((entry) => (
                <li key={entry.id} className="comm-log__row">
                  <span className="comm-log__date" dir="ltr">{entry.date}</span>
                  <div className="comm-log__body">
                    <span className="pill pill--muted">{entry.type}</span>
                    <p>{entry.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* מסמכים וקבצים (3.2 + 10) */}
          <section className="card">
            <div className="card__head"><h2 className="card__title">מסמכים וקבצים</h2></div>
            <ul className="docs">
              {docs.map((doc) => (
                <li key={doc.id} className="docs__row">
                  <span className="docs__icon">{doc.kind}</span>
                  <span className="docs__name">{doc.name}</span>
                  <span className="docs__size" dir="ltr">{doc.size}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* הערות חופשיות (3.2) */}
          <section className="card">
            <div className="card__head">
              <h2 className="card__title">הערות</h2>
              {notesSaved && <span className="notes-saved">נשמר ✓</span>}
            </div>
            <textarea
              className="notes"
              rows={4}
              placeholder="הערות חופשיות על הלקוח..."
              defaultValue={client.notes}
              onBlur={saveNotes}
            />
          </section>
        </div>
      </div>
    </>
  )
}
