import { recentLeads, leadStatuses } from '../data/mockData.js'

export default function RecentLeads() {
  return (
    <section className="card">
      <div className="card__head">
        <div>
          <h2 className="card__title">לידים אחרונים</h2>
          <p className="card__subtitle">6 הפניות האחרונות שהתקבלו</p>
        </div>
        <button className="chip-btn">לכל הלידים</button>
      </div>

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>שם</th>
              <th>עסק</th>
              <th>מקור</th>
              <th>שווי משוער</th>
              <th>סטטוס</th>
              <th>תאריך</th>
            </tr>
          </thead>
          <tbody>
            {recentLeads.map((lead) => {
              const status = leadStatuses[lead.status]
              return (
                <tr key={lead.id}>
                  <td>
                    <div className="cell-user">
                      <span className="avatar avatar--sm">{lead.name.charAt(0)}</span>
                      <span className="cell-user__name">{lead.name}</span>
                    </div>
                  </td>
                  <td className="muted">{lead.company}</td>
                  <td className="muted">{lead.source}</td>
                  <td className="num">
                    {/* dir="ltr" על התוכן בלבד – כדי שהעמודה תישאר מיושרת כמו השאר */}
                    <span dir="ltr">₪{lead.value.toLocaleString('he-IL')}</span>
                  </td>
                  <td>
                    {/* הסטטוס תמיד מוצג כטקסט, הצבע רק מחזק אותו */}
                    <span className={`pill pill--${status.tone}`}>{status.label}</span>
                  </td>
                  <td className="muted num">{lead.date}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
