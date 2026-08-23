import { useEffect } from 'react'
import { packageById, setupTasksFor, SLA, formatSla, formatCurrency } from '../data/mockData.js'

/* ------------------------------------------------------------------
   חלון האישור להמרת ליד ללקוח (סעיף 4.3).
   מציג מראש בדיוק מה עומד לקרות: איזה כרטיס לקוח ייווצר,
   ואילו משימות הקמה ייפתחו – עם יעד הזמן של כל אחת.
   ------------------------------------------------------------------ */
export default function ConvertLeadModal({ lead, onConfirm, onCancel }) {
  const pkg = packageById[lead.packageId]
  const tasks = setupTasksFor(lead.packageId)

  // סגירה בלחיצה על Escape
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onCancel()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div className="modal-layer" onClick={onCancel}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="convert-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal__head">
          <div>
            <h2 className="modal__title" id="convert-title">המרת ליד ללקוח</h2>
            <p className="modal__subtitle">
              {lead.business} · {lead.name}
            </p>
          </div>
          <button className="modal__close" onClick={onCancel} aria-label="סגירה">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="modal__body">
          <div className="modal__summary">
            <div>
              <span className="modal__summary-label">חבילה נרכשת</span>
              <span className={`pill pill--tier${pkg.tier}`}>{pkg.name}</span>
            </div>
            <div>
              <span className="modal__summary-label">מחיר חודשי</span>
              <span className="modal__summary-value" dir="ltr">{formatCurrency(pkg.price)}</span>
            </div>
            <div>
              <span className="modal__summary-label">אחראי</span>
              <span className="modal__summary-value">{lead.owner}</span>
            </div>
          </div>

          <p className="modal__note">
            הליד יסומן כ"נסגר", ייפתח עבורו כרטיס לקוח בסטטוס <strong>בהקמה</strong>,
            ויפתחו אוטומטית {tasks.length} משימות ההקמה של חבילת {pkg.name}:
          </p>

          <ul className="setup-tasks">
            {tasks.map((task, i) => (
              <li key={task.title} className="setup-tasks__row">
                <span className="setup-tasks__num" dir="ltr">{i + 1}</span>
                <span className="setup-tasks__title">{task.title}</span>
                <span className="setup-tasks__sla">
                  {formatSla(SLA[task.sla].minutes)}
                  {/* יעד זמן שאין לו שורה מפורשת בטבלת סעיף 6.2 */}
                  {task.slaAssumed && (
                    <span className="setup-tasks__assumed" title="יעד הזמן אינו מופיע במפורש באפיון – מוצע לאישור">
                      לאישור
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <footer className="modal__foot">
          <button className="btn-ghost" onClick={onCancel}>ביטול</button>
          <button className="btn-primary btn-primary--inline" onClick={onConfirm}>
            אישור והמרה ללקוח
          </button>
        </footer>
      </div>
    </div>
  )
}
