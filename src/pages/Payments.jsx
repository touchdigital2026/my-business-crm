import { useMemo, useState } from 'react'
import { useCrm } from '../store/CrmContext.jsx'
import RevenueReport from '../components/RevenueReport.jsx'
import { IconSearch, IconAlert } from '../components/icons.jsx'
import {
  formatCurrency, packageById,
  monthLabelOf, PAYMENT_STATUS_LABELS, PAYMENT_KIND_LABELS, currentMonthKey,
} from '../data/mockData.js'

/* ------------------------------------------------------------------
   ניהול תשלומים וחשבוניות – סעיף 8 באפיון.
   מדדי החודש, התראות אוטומטיות על איחורים, ספר התשלומים המלא
   עם סינון, ודוח הכנסות חודשי/רבעוני.
   (חלוקת רווחים בין שותפים לא נבנתה – בהחלטת בעל העסק.)
   ------------------------------------------------------------------ */

function describePayment(pay) {
  if (pay.kind === 'addon') return `תוספת – ${pay.addOnName}`
  if (pay.kind === 'oneoff') return `חד-פעמי – ${pay.oneOffTitle}`
  return `חיוב חודשי – חבילת ${packageById[pay.packageId].name}`
}

export default function Payments({ onOpenClient }) {
  const { payments, clients, paymentStats, markPaymentPaid } = useCrm()

  const [month, setMonth] = useState(currentMonthKey())
  const [status, setStatus] = useState('all')
  const [kind, setKind] = useState('all')
  const [search, setSearch] = useState('')

  const clientById = useMemo(
    () => Object.fromEntries(clients.map((c) => [c.id, c])),
    [clients]
  )
  const monthKeys = useMemo(
    () => [...new Set(payments.map((p) => p.monthKey))].sort().reverse(),
    [payments]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const rank = { overdue: 0, pending: 1, paid: 2 }
    return payments
      .filter((pay) => {
        if (month !== 'all' && pay.monthKey !== month) return false
        if (status !== 'all' && pay.status !== status) return false
        if (kind !== 'all' && pay.kind !== kind) return false
        if (!q) return true
        const client = clientById[pay.clientId]
        return `${client?.business || ''} ${client?.contact || ''} ${pay.invoice}`
          .toLowerCase()
          .includes(q)
      })
      .sort((a, b) => rank[a.status] - rank[b.status] || new Date(b.date) - new Date(a.date))
  }, [payments, month, status, kind, search, clientById])

  const filteredTotal = filtered.reduce((sum, p) => sum + p.amount, 0)
  const hasFilters = search || status !== 'all' || kind !== 'all' || month !== currentMonthKey()

  return (
    <div className="content__body">
      {/* מדדי החודש הנוכחי */}
      <div className="totals totals--pay">
        <div className="totals__item">
          <span className="totals__value" dir="ltr">{formatCurrency(paymentStats.billed)}</span>
          <span className="totals__label">חויב החודש</span>
        </div>
        <div className="totals__item">
          <span className="totals__value" dir="ltr">{formatCurrency(paymentStats.collected)}</span>
          <span className="totals__label">נגבה בפועל</span>
        </div>
        <div className="totals__item totals__item--late">
          <span className="totals__value" dir="ltr">{formatCurrency(paymentStats.overdueTotal)}</span>
          <span className="totals__label">באיחור ({paymentStats.overduePayments.length})</span>
        </div>
        <div className="totals__item totals__item--soon">
          <span className="totals__value" dir="ltr">{formatCurrency(paymentStats.pendingTotal)}</span>
          <span className="totals__label">ממתין ({paymentStats.pendingPayments.length})</span>
        </div>
      </div>

      {/* התראות אוטומטיות על תשלומים שלא הגיעו במועד (סעיף 8) */}
      {paymentStats.overduePayments.length > 0 && (
        <section className="card pay-alerts">
          <div className="card__head">
            <div className="card__head-main">
              <span className="card__icon card__icon--danger">
                <IconAlert width={19} height={19} />
              </span>
              <div>
                <h2 className="card__title">התראות תשלום</h2>
                <p className="card__subtitle">
                  {paymentStats.overduePayments.length} תשלומים לא הגיעו במועד ·{' '}
                  <span dir="ltr">{formatCurrency(paymentStats.overdueTotal)}</span> בפיגור
                </p>
              </div>
            </div>
          </div>
          <ul className="pay-alerts__list">
            {paymentStats.overduePayments.map((pay) => {
              const client = clientById[pay.clientId]
              return (
                <li key={pay.id} className="pay-alerts__row">
                  <span className="pay-alerts__dot" aria-hidden="true" />
                  <span className="pay-alerts__text">
                    <button className="tcard__client" onClick={() => onOpenClient(pay.clientId)}>
                      {client?.business} ↗
                    </button>{' '}
                    – <span dir="ltr">{formatCurrency(pay.amount)}</span> לא שולם ·
                    באיחור <span dir="ltr">{pay.daysLate}</span> ימים
                  </span>
                  <button className="chip-btn" onClick={() => markPaymentPaid(pay.id)}>
                    סימון כשולם ✓
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {/* דוח הכנסות חודשי / רבעוני (סעיף 8) */}
      <RevenueReport onOpenClient={onOpenClient} />

      {/* ספר התשלומים */}
      <section className="card filters">
        <div className="filters__search">
          <IconSearch width={18} height={18} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש לקוח או מספר חשבונית..."
            aria-label="חיפוש תשלומים"
          />
        </div>
        <label className="select">
          <span className="select__label">חודש</span>
          <select value={month} onChange={(e) => setMonth(e.target.value)}>
            <option value="all">כל החודשים</option>
            {monthKeys.map((key) => (
              <option key={key} value={key}>{monthLabelOf(key)}</option>
            ))}
          </select>
        </label>
        <label className="select">
          <span className="select__label">סטטוס</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">הכל</option>
            <option value="paid">שולם</option>
            <option value="pending">ממתין</option>
            <option value="overdue">באיחור</option>
          </select>
        </label>
        <label className="select">
          <span className="select__label">סוג חיוב</span>
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="all">כל הסוגים</option>
            <option value="monthly">חיוב חודשי (חבילה)</option>
            <option value="addon">תוספות</option>
            <option value="oneoff">חד-פעמי</option>
          </select>
        </label>
        {hasFilters && (
          <button
            className="chip-btn"
            onClick={() => { setSearch(''); setStatus('all'); setKind('all'); setMonth(currentMonthKey()) }}
          >
            ניקוי סינון
          </button>
        )}
      </section>

      <section className="card">
        <div className="card__head">
          <div>
            <h2 className="card__title">
              {filtered.length} תשלומים{month !== 'all' ? ` · ${monthLabelOf(month)}` : ''}
            </h2>
            <p className="card__subtitle">
              סה"כ בתצוגה: <span dir="ltr">{formatCurrency(filteredTotal)}</span>
            </p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-rows"><p>לא נמצאו תשלומים שמתאימים לסינון.</p></div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>לקוח</th>
                  <th>פירוט</th>
                  <th>חשבונית</th>
                  <th>תאריך</th>
                  <th>אמצעי תשלום</th>
                  <th>סכום</th>
                  <th>סטטוס</th>
                  <th>פעולה</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((pay) => {
                  const client = clientById[pay.clientId]
                  const st = PAYMENT_STATUS_LABELS[pay.status]
                  return (
                    <tr key={pay.id}>
                      <td>
                        <button
                          className="tcard__client cell-strong"
                          onClick={() => onOpenClient(pay.clientId)}
                        >
                          {client?.business || '—'}
                        </button>
                      </td>
                      <td className="muted">{describePayment(pay)}</td>
                      <td className="muted num" dir="ltr">{pay.invoice}</td>
                      <td className="muted num" dir="ltr">
                        {new Date(pay.date).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                      </td>
                      <td className="muted">{pay.method}</td>
                      <td className="num"><span dir="ltr">{formatCurrency(pay.amount)}</span></td>
                      <td>
                        <span className={`pill pill--${st.tone}`}>
                          {st.label}
                          {pay.status === 'overdue' && (
                            <> · <span dir="ltr">{Math.max(1, Math.floor((Date.now() - new Date(pay.date)) / 86400000))}</span> ימים</>
                          )}
                        </span>
                      </td>
                      <td>
                        {pay.status !== 'paid' ? (
                          <button className="btn-convert" onClick={() => markPaymentPaid(pay.id)}>
                            סימון כשולם
                          </button>
                        ) : (
                          <span className="muted">—</span>
                        )}
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
