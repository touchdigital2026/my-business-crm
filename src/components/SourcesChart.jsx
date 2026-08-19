import { leadSources } from '../data/mockData.js'

/* פילוח מקורות הלידים.
   סדרה אחת בלבד – ולכן צבע אחד ולא מקרא: אורך העמודה הוא המידע,
   וצביעה בצבע שונה לכל שורה הייתה מוסיפה רעש בלי משמעות. */
export default function SourcesChart() {
  const total = leadSources.reduce((sum, s) => sum + s.value, 0)
  const max = Math.max(...leadSources.map((s) => s.value))

  return (
    <section className="card">
      <div className="card__head">
        <div>
          <h2 className="card__title">מקורות הלידים</h2>
          <p className="card__subtitle">סה"כ {total} לידים החודש</p>
        </div>
      </div>

      <ul className="bars">
        {leadSources.map((s) => (
          <li key={s.name} className="bars__row">
            <div className="bars__meta">
              <span className="bars__name">{s.name}</span>
              <span className="bars__value">
                {s.value}
                <span className="bars__pct">
                  {' '}
                  ({Math.round((s.value / total) * 100)}%)
                </span>
              </span>
            </div>
            <div className="bars__track">
              <div className="bars__fill" style={{ width: `${(s.value / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
