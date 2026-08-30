import { useCrm } from '../store/CrmContext.jsx'

/* סעיף 13.7 – ביצועי קבלני משנה: זמן ממוצע להשלמת משימה.
   כאן זמן קצר יותר הוא טוב יותר, ולכן הרשימה ממוינת מהמהיר לאיטי
   ואחוז העמידה ב-SLA מוצג לצידו כטקסט. */
export default function SubcontractorsCard() {
  const { subs: subcontractors } = useCrm()
  const rows = [...subcontractors].sort((a, b) => a.avgHours - b.avgHours)
  const max = Math.max(...rows.map((r) => r.avgHours))

  function slaTone(rate) {
    if (rate >= 90) return 'active'
    if (rate >= 80) return 'pending'
    return 'late'
  }

  function formatDuration(hours) {
    if (hours < 1) return Math.round(hours * 60) + ' דק׳'
    return hours.toFixed(1) + ' שעות'
  }

  return (
    <section className="card">
      <div className="card__head">
        <div className="card__head-main">
          <span className="card__icon card__icon--accent">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
              <path d="M12 7v5.2l3.2 2" stroke="currentColor" strokeWidth="1.7"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <h2 className="card__title">ביצועי קבלני משנה</h2>
            <p className="card__subtitle">זמן ממוצע להשלמת משימה · עמודה קצרה = מהיר יותר</p>
          </div>
        </div>
      </div>

      <ul className="bars">
        {rows.map((sub) => (
          <li key={sub.id} className="bars__row">
            <div className="bars__meta">
              <span className="bars__name">
                {sub.name}
                <span className="bars__sub">{sub.field}</span>
              </span>
              <span className="bars__value" dir="ltr">{formatDuration(sub.avgHours)}</span>
            </div>
            <div className="bars__track">
              <div className="bars__fill" style={{ width: `${(sub.avgHours / max) * 100}%` }} />
            </div>
            <div className="bars__foot">
              <span className={`pill pill--${slaTone(sub.slaRate)}`}>
                <span dir="ltr">{sub.slaRate}%</span> עמידה ב-SLA
              </span>
              <span className="muted">
                <span dir="ltr">{sub.completed}</span> משימות הושלמו
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
