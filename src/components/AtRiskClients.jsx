import { atRiskClients, packageById, formatCurrency } from '../data/mockData.js'

/* סעיף 13.6 – לקוחות בסיכון תשלום:
   איחור בתשלום, או חוסר פעילות מעל מספר ימים מוגדר. */
export default function AtRiskClients() {
  const overdueTotal = atRiskClients
    .filter((c) => c.reason === 'overdue')
    .reduce((sum, c) => sum + c.amount, 0)

  return (
    <section className="card">
      <div className="card__head">
        <div className="card__head-main">
          <span className="card__icon card__icon--danger">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 4 2.8 20h18.4L12 4Z" stroke="currentColor" strokeWidth="1.7"
                strokeLinejoin="round" />
              <path d="M12 10v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <circle cx="12" cy="17" r="0.9" fill="currentColor" />
            </svg>
          </span>
          <div>
            <h2 className="card__title">לקוחות בסיכון תשלום</h2>
            <p className="card__subtitle">
              {atRiskClients.length} לקוחות · <span dir="ltr">{formatCurrency(overdueTotal)}</span> בפיגור
            </p>
          </div>
        </div>
        <button className="chip-btn">לכל הלקוחות</button>
      </div>

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>עסק</th>
              <th>חבילה</th>
              <th>סיבה</th>
              <th>סכום בפיגור</th>
              <th>אחראי</th>
            </tr>
          </thead>
          <tbody>
            {atRiskClients.map((client) => {
              const pkg = packageById[client.packageId]
              const isOverdue = client.reason === 'overdue'
              return (
                <tr key={client.id}>
                  <td className="cell-strong">{client.business}</td>
                  <td>
                    <span className={`pill pill--tier${pkg.tier}`}>{pkg.name}</span>
                  </td>
                  <td>
                    <span className={`pill ${isOverdue ? 'pill--late' : 'pill--pending'}`}>
                      {isOverdue ? 'איחור בתשלום' : 'ללא פעילות'} · <span dir="ltr">{client.days}</span> ימים
                    </span>
                  </td>
                  <td className="num">
                    {client.amount > 0 ? (
                      <span dir="ltr">{formatCurrency(client.amount)}</span>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                  <td className="muted">{client.owner}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
