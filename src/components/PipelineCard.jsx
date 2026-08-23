import { useCrm } from '../store/CrmContext.jsx'
import { pipelineStages } from '../data/mockData.js'

/* סעיף 13.5 – פייפליין מכירות: מספר לידים בכל שלב ואחוז המרה.
   הנתונים נגזרים מרשימת הלידים האמיתית, ולכן הכרטיס מתעדכן
   מיד כשממירים ליד ללקוח במסך הלידים.

   סדרה אחת בלבד, ולכן צבע אחד: אורך העמודה הוא המידע. */
export default function PipelineCard() {
  const { activeLeads, wonLeads, lostLeads } = useCrm()

  const stages = pipelineStages.map((stage) => ({
    name: stage.name,
    count: activeLeads.filter((l) => l.stage === stage.id).length,
  }))
  const max = Math.max(...stages.map((s) => s.count), 1)
  const decided = wonLeads.length + lostLeads.length
  const entered = activeLeads.length + decided
  const conversion = entered ? ((wonLeads.length / entered) * 100).toFixed(1) : '0.0'

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
            <p className="card__subtitle">{activeLeads.length} לידים פעילים בתהליך</p>
          </div>
        </div>
      </div>

      <div className="conversion">
        <div className="conversion__main">
          <span className="conversion__value" dir="ltr">{conversion}%</span>
          <span className="conversion__label">אחוז המרה מסך הלידים</span>
        </div>
        <ul className="conversion__facts">
          <li>
            <span className="conversion__fact-value" dir="ltr">{entered}</span>
            <span className="conversion__fact-label">סה"כ לידים</span>
          </li>
          <li>
            <span className="conversion__fact-value conversion__fact-value--good" dir="ltr">
              {wonLeads.length}
            </span>
            <span className="conversion__fact-label">נסגרו</span>
          </li>
          <li>
            <span className="conversion__fact-value conversion__fact-value--bad" dir="ltr">
              {lostLeads.length}
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
              <div className="bars__fill" style={{ width: `${(stage.count / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
