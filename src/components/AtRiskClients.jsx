import { useCrm } from '../store/CrmContext.jsx'
import { packageById, formatCurrency } from '../data/mockData.js'

/* סעיף 13.6 – לקוחות בסיכון תשלום:
   איחור בתשלום, או חוסר פעילות מעל מספר ימים מוגדר. */
const INACTIVE_DAYS_THRESHOLD = 30

export default function AtRiskClients({ onOpenClient, onViewAll }) {
  const { clients } = useCrm()

  const atRisk = clients.filter(
    (c) => c.paymentStatus === 'overdue' || (c.inactiveDays || 0) > INACTIVE_DAYS_THRESHOLD
  )
  const overdueTotal = atRisk.reduce((sum, c) => sum + (c.overdueAmount || 0), 0)

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
              {atRisk.length} לקוחות · <span dir="ltr">{formatCurrency(overdueTotal)}</span> בפיגור
            </p>
          </div>
        </div>
        <button className="chip-btn" onClick={onViewAll}>לכל הלקוחות</button>
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
            {atRisk.map((client) => {
              const pkg = packageById[client.packageId]
              const isOverdue = client.paymentStatus === 'overdue'
              return (
                <tr
                  key={client.id}
                  className="row-clickable"
                  onClick={() => onOpenClient?.(client.id)}
                >
                  <td className="cell-strong">{client.business}</td>
                  <td><span className={`pill pill--tier${pkg.tier}`}>{pkg.name}</span></td>
                  <td>
                    {/* הסטטוס תמיד מוצג כטקסט, הצבע רק מחזק אותו */}
                    <span className={`pill ${isOverdue ? 'pill--late' : 'pill--pending'}`}>
                      {isOverdue ? 'איחור בתשלום' : 'ללא פעילות'} ·{' '}
                      <span dir="ltr">{isOverdue ? client.overdueDays : client.inactiveDays}</span> ימים
                    </span>
                  </td>
                  <td className="num">
                    {client.overdueAmount ? (
                      <span dir="ltr">{formatCurrency(client.overdueAmount)}</span>
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
