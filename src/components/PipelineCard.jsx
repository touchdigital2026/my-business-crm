import { pipeline } from '../data/mockData.js'

/* סעיף 13.5 – פייפליין מכירות: מספר לידים בכל שלב ואחוז המרה.
   סדרה אחת בלבד, ולכן צבע אחד: אורך העמודה הוא המידע.
   צביעת כל שלב בגוון אחר הייתה מוסיפה רעש בלי משמעות. */
export default function PipelineCard() {
  const { stages, enteredLast30, wonLast30, lostLast30 } = pipeline
  const max = Math.max(...stages.map((s) => s.count))
  const inPipeline = stages.reduce((sum, s) => sum + s.count, 0)
  const conversion = ((wonLast30 / enteredLast30) * 100).toFixed(1)

  return (
    <section className="card">
      <div className="card__head">
        <div className="card__head-main">
          <span className="card__icon card__icon--accent">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 5h18l-7 8v6l-4 2v-8Z" stroke="currentColor" strokeWidth="1.7"
                strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <h2 className="card__title">פייפליין מכירות</h2>
            <p className="card__subtitle">{inPipeline} לידים פעילים בתהליך</p>
          </div>
        </div>
      </div>

      {/* אחוז ההמרה – המספר שמסכם את כל הפייפליין */}
      <div className="conversion">
        <div className="conversion__main">
          <span className="conversion__value" dir="ltr">{conversion}%</span>
          <span className="conversion__label">אחוז המרה, 30 הימים האחרונים</span>
        </div>
        <ul className="conversion__facts">
          <li>
            <span className="conversion__fact-value" dir="ltr">{enteredLast30}</span>
            <span className="conversion__fact-label">לידים נכנסו</span>
          </li>
          <li>
            <span className="conversion__fact-value conversion__fact-value--good" dir="ltr">
              {wonLast30}
            </span>
            <span className="conversion__fact-label">נסגרו</span>
          </li>
          <li>
            <span className="conversion__fact-value conversion__fact-value--bad" dir="ltr">
              {lostLast30}
            </span>
            <span className="conversion__fact-label">אבדו</span>
          </li>
        </ul>
      </div>

      <ul className="bars">
        {stages.map((stage) => (
          <li key={stage.name} className="bars__row">
            <div className="bars__meta">
              <span className="bars__name">{stage.name}</span>
              <span className="bars__value" dir="ltr">{stage.count}</span>
            </div>
            <div className="bars__track">
              <div
                className="bars__fill"
                style={{ width: `${(stage.count / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
