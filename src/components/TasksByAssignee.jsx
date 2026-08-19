import { tasks } from '../data/mockData.js'

/* סעיף 13.4 – משימות פתוחות ומשימות באיחור, סה"כ ולפי אחראי. */
export default function TasksByAssignee() {
  const max = Math.max(...tasks.byAssignee.map((a) => a.open))

  return (
    <section className="card">
      <div className="card__head">
        <div className="card__head-main">
          <span className="card__icon card__icon--accent">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="4" y="4" width="16" height="17" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
              <path d="M8 3v3M16 3v3M8.5 12.5l2 2 4-4" stroke="currentColor" strokeWidth="1.7"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <h2 className="card__title">משימות</h2>
            <p className="card__subtitle">מצב נוכחי לפי אחראי</p>
          </div>
        </div>
      </div>

      <div className="totals">
        <div className="totals__item">
          <span className="totals__value" dir="ltr">{tasks.open}</span>
          <span className="totals__label">פתוחות</span>
        </div>
        <div className="totals__item totals__item--late">
          <span className="totals__value" dir="ltr">{tasks.overdue}</span>
          <span className="totals__label">באיחור</span>
        </div>
        <div className="totals__item">
          <span className="totals__value" dir="ltr">{tasks.dueToday}</span>
          <span className="totals__label">להיום</span>
        </div>
      </div>

      <ul className="assignees">
        {tasks.byAssignee.map((person) => (
          <li key={person.name} className="assignees__row">
            <span className="avatar avatar--sm">{person.name.charAt(0)}</span>
            <div className="assignees__info">
              <div className="assignees__top">
                <span className="assignees__name">{person.name}</span>
                <span className="assignees__counts">
                  <span dir="ltr">{person.open}</span> פתוחות
                  {person.overdue > 0 && (
                    /* האיחור מסומן גם בטקסט ולא רק בצבע */
                    <span className="pill pill--late">
                      <span dir="ltr">{person.overdue}</span> באיחור
                    </span>
                  )}
                </span>
              </div>
              <div className="assignees__role">{person.role}</div>
              <div className="bars__track bars__track--thin">
                <div
                  className="bars__fill"
                  style={{ width: `${(person.open / max) * 100}%` }}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
