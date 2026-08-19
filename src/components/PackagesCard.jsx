import { clientsByPackage, packageById, formatCurrency } from '../data/mockData.js'

/* סעיף 13.1 – מספר לקוחות פעילים לפי חבילה.
   שלוש החבילות הן דרגות מסודרות (סטנדרט < ביניים < פרימיום),
   ולכן הן צבועות בסולם סגול מדורג מבהיר לכהה ולא בצבעים אקראיים. */
export default function PackagesCard() {
  const rows = clientsByPackage.map((row) => {
    const pkg = packageById[row.packageId]
    return { ...row, ...pkg, monthly: row.active * pkg.price }
  })
  const totalActive = rows.reduce((sum, r) => sum + r.active, 0)
  const totalSetup = rows.reduce((sum, r) => sum + r.inSetup, 0)
  const max = Math.max(...rows.map((r) => r.active))

  return (
    <section className="card">
      <div className="card__head">
        <div className="card__head-main">
          <span className="card__icon card__icon--accent">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 3 3.5 7.5v9L12 21l8.5-4.5v-9Z" stroke="currentColor" strokeWidth="1.7"
                strokeLinejoin="round" />
              <path d="M3.5 7.5 12 12l8.5-4.5M12 12v9" stroke="currentColor" strokeWidth="1.7"
                strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <h2 className="card__title">לקוחות פעילים לפי חבילה</h2>
            <p className="card__subtitle">
              {totalActive} פעילים · {totalSetup} נוספים בהקמה
            </p>
          </div>
        </div>
      </div>

      <ul className="tiers">
        {rows.map((row) => (
          <li key={row.id} className="tiers__row">
            <div className="tiers__meta">
              <span className="tiers__name">
                <i className="tiers__dot" style={{ background: `var(--tier-${row.tier})` }} />
                {row.name}
              </span>
              <span className="tiers__count">
                <strong dir="ltr">{row.active}</strong> לקוחות
              </span>
            </div>
            <div className="bars__track">
              <div
                className="bars__fill"
                style={{
                  width: `${(row.active / max) * 100}%`,
                  background: `var(--tier-${row.tier})`,
                }}
              />
            </div>
            <div className="tiers__foot">
              <span dir="ltr">{formatCurrency(row.price)} / חודש ללקוח</span>
              <span className="tiers__sum" dir="ltr">{formatCurrency(row.monthly)}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
