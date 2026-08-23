import { useMemo, useState } from 'react'
import { useCrm } from '../store/CrmContext.jsx'
import ClientCard from '../components/ClientCard.jsx'
import { IconSearch } from '../components/icons.jsx'
import { packages, packageById, formatCurrency } from '../data/mockData.js'
import { CLIENT_STATUS_LABELS, formatDate } from '../data/clientData.js'

/* לקוח בסיכון תשלום (סעיף 3.3): באיחור, או ללא פעילות מעל 30 יום */
const INACTIVE_DAYS = 30
const isPaymentRisk = (c) => c.paymentStatus === 'overdue'
const isInactiveRisk = (c) => (c.inactiveDays || 0) > INACTIVE_DAYS

export default function Clients({ selectedClientId, onSelect }) {
  const { clients } = useCrm()

  const [search, setSearch] = useState('')
  const [pkg, setPkg] = useState('all')
  const [status, setStatus] = useState('all')
  const [owner, setOwner] = useState('all')
  const [risk, setRisk] = useState('all')

  const owners = useMemo(
    () => [...new Set(clients.map((c) => c.owner))].sort(),
    [clients]
  )

  /* חיפוש חופשי לפי שם/טלפון/אימייל + סינון (סעיף 3.3) */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return clients.filter((client) => {
      if (pkg !== 'all' && client.packageId !== pkg) return false
      if (status !== 'all' && client.status !== status) return false
      if (owner !== 'all' && client.owner !== owner) return false
      if (risk === 'overdue' && !isPaymentRisk(client)) return false
      if (risk === 'inactive' && !isInactiveRisk(client)) return false
      if (risk === 'any' && !isPaymentRisk(client) && !isInactiveRisk(client)) return false
      if (!q) return true
      return [client.business, client.contact, client.phone, client.email]
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [clients, search, pkg, status, owner, risk])

  const monthly = filtered
    .filter((c) => c.status === 'active')
    .reduce((sum, c) => sum + packageById[c.packageId].price, 0)

  const hasFilters = search || pkg !== 'all' || status !== 'all' || owner !== 'all' || risk !== 'all'
  function clearFilters() {
    setSearch(''); setPkg('all'); setStatus('all'); setOwner('all'); setRisk('all')
  }

  /* כרטיס לקוח פתוח – מוצג במקום הרשימה */
  if (selectedClientId) {
    return (
      <div className="content__body">
        <ClientCard clientId={selectedClientId} onBack={() => onSelect(null)} />
      </div>
    )
  }

  return (
    <div className="content__body">
      <section className="card filters">
        <div className="filters__search">
          <IconSearch width={18} height={18} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש לפי שם עסק, איש קשר, טלפון או אימייל..."
            aria-label="חיפוש לקוחות"
          />
        </div>

        <label className="select">
          <span className="select__label">חבילה</span>
          <select value={pkg} onChange={(e) => setPkg(e.target.value)}>
            <option value="all">כל החבילות</option>
            {packages.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </label>

        <label className="select">
          <span className="select__label">סטטוס</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">כל הסטטוסים</option>
            <option value="setup">בהקמה</option>
            <option value="active">פעיל – תחזוקה שוטפת</option>
            <option value="frozen">מוקפא / בסיכון נטישה</option>
          </select>
        </label>

        <label className="select">
          <span className="select__label">גורם אחראי</span>
          <select value={owner} onChange={(e) => setOwner(e.target.value)}>
            <option value="all">כל האחראים</option>
            {owners.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </label>

        <label className="select">
          <span className="select__label">סיכון תשלום</span>
          <select value={risk} onChange={(e) => setRisk(e.target.value)}>
            <option value="all">הכל</option>
            <option value="any">בסיכון (הכל)</option>
            <option value="overdue">איחור בתשלום</option>
            <option value="inactive">ללא פעילות</option>
          </select>
        </label>

        {hasFilters && (
          <button className="chip-btn" onClick={clearFilters}>ניקוי סינון</button>
        )}
      </section>

      <section className="card">
        <div className="card__head">
          <div>
            <h2 className="card__title">
              {filtered.length === clients.length
                ? `כל הלקוחות (${clients.length})`
                : `${filtered.length} מתוך ${clients.length} לקוחות`}
            </h2>
            <p className="card__subtitle">
              הכנסה חודשית מהלקוחות הפעילים בתצוגה: <span dir="ltr">{formatCurrency(monthly)}</span>
            </p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-rows">
            <p>לא נמצאו לקוחות שמתאימים לסינון.</p>
            <button className="chip-btn" onClick={clearFilters}>ניקוי סינון</button>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>לקוח</th>
                  <th>תחום</th>
                  <th>חבילה</th>
                  <th>סטטוס</th>
                  <th>תשלום</th>
                  <th>אחראי</th>
                  <th>תחילת התקשרות</th>
                  <th>פעולה</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((client) => {
                  const pkgInfo = packageById[client.packageId]
                  const st = CLIENT_STATUS_LABELS[client.status]
                  return (
                    <tr
                      key={client.id}
                      className="row-clickable"
                      onClick={() => onSelect(client.id)}
                    >
                      <td>
                        <div className="cell-user">
                          <span className="avatar avatar--sm">{client.business.charAt(0)}</span>
                          <span className="cell-lead">
                            <span className="cell-lead__business">{client.business}</span>
                            <span className="cell-lead__name">{client.contact}</span>
                          </span>
                        </div>
                      </td>
                      <td className="muted">{client.industry}</td>
                      <td><span className={`pill pill--tier${pkgInfo.tier}`}>{pkgInfo.name}</span></td>
                      <td><span className={`pill pill--${st.tone}`}>{st.label}</span></td>
                      <td>
                        {client.paymentStatus === 'overdue' ? (
                          <span className="pill pill--late">
                            באיחור · <span dir="ltr">{client.overdueDays}</span> ימים
                          </span>
                        ) : isInactiveRisk(client) ? (
                          <span className="pill pill--pending">
                            ללא פעילות · <span dir="ltr">{client.inactiveDays}</span> ימים
                          </span>
                        ) : (
                          <span className="pill pill--active">שולם</span>
                        )}
                      </td>
                      <td className="muted">{client.owner}</td>
                      <td className="muted num" dir="ltr">{formatDate(client.startDate)}</td>
                      <td>
                        <button
                          className="btn-convert"
                          onClick={(e) => { e.stopPropagation(); onSelect(client.id) }}
                        >
                          כרטיס לקוח
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
