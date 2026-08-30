import { useMemo, useRef, useState } from 'react'
import { useCrm } from '../store/CrmContext.jsx'
import ExpenseModal from '../components/ExpenseModal.jsx'
import { IconSearch } from '../components/icons.jsx'
import {
  formatCurrency, monthLabelOf, currentMonthKey, preVatOf,
} from '../data/mockData.js'

/* ------------------------------------------------------------------
   ניהול הוצאות וקבלות – סעיף 9 באפיון.
   רישום הוצאות בקטגוריות, מסך רווח והפסד שמשלב את ההכנסות
   מסעיף 8 מול ההוצאות, ותשתית קבלות מקושרות לרשומות.
   (סעיף 9.4: המודול מיועד למנהלי-על בלבד – ייאכף עם מנגנון
   ההרשאות של סעיף 2.)
   ------------------------------------------------------------------ */

/* צירוף קבלה לרשומה קיימת בטבלה */
function ReceiptCell({ expense, onAttach }) {
  const fileRef = useRef(null)
  if (expense.receipt) {
    return (
      <span className="receipt-chip receipt-chip--table">
        <span className="docs__icon">{expense.receipt.kind}</span>
        {expense.receipt.url ? (
          <a className="assets__link" href={expense.receipt.url} target="_blank" rel="noreferrer">
            {expense.receipt.name}
          </a>
        ) : (
          <span className="receipt-chip__name" title="קובץ דמו – יוחלף בקובץ אמיתי עם חיבור השרת">
            {expense.receipt.name}
          </span>
        )}
      </span>
    )
  }
  return (
    <>
      <input ref={fileRef} type="file" accept="image/*,application/pdf" capture="environment"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (!file) return
          onAttach(expense.id, {
            name: file.name,
            kind: file.type.includes('pdf') ? 'PDF' : 'תמונה',
            size: `${Math.max(1, Math.round(file.size / 1024))}KB`,
            url: URL.createObjectURL(file),
          })
        }} />
      <button className="btn-convert btn-convert--warn" onClick={() => fileRef.current.click()}>
        📎 צירוף קבלה
      </button>
    </>
  )
}

export default function Expenses({ user }) {
  const {
    expenses, expenseCategories, expenseStats, financeSeries,
    revenue, attachReceipt,
  } = useCrm()

  const [month, setMonth] = useState(currentMonthKey())
  const [category, setCategory] = useState('all')
  const [receiptFilter, setReceiptFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const [pnlQuarterly, setPnlQuarterly] = useState(false)

  const categoryById = useMemo(
    () => Object.fromEntries(expenseCategories.map((c) => [c.id, c.name])),
    [expenseCategories]
  )
  const monthKeys = useMemo(
    () => [...new Set(expenses.map((e) => e.monthKey))].sort().reverse(),
    [expenses]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return expenses
      .filter((e) => {
        if (month !== 'all' && e.monthKey !== month) return false
        if (category !== 'all' && e.categoryId !== category) return false
        if (receiptFilter === 'missing' && e.receipt) return false
        if (receiptFilter === 'has' && !e.receipt) return false
        if (!q) return true
        return `${e.vendor} ${e.notes} ${categoryById[e.categoryId] || ''}`.toLowerCase().includes(q)
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [expenses, month, category, receiptFilter, search, categoryById])

  const filteredTotal = filtered.reduce((sum, e) => sum + e.amount, 0)

  /* רווח והפסד – ההכנסות מסעיף 8 מול ההוצאות מסעיף 9 */
  const pnlRows = useMemo(() => {
    if (!pnlQuarterly) return financeSeries
    const map = new Map()
    for (const row of financeSeries) {
      const [year, m] = row.monthKey.split('-').map(Number)
      const key = `Q${Math.ceil(m / 3)} ${year}`
      if (!map.has(key)) map.set(key, { month: key, income: 0, expense: 0 })
      const q = map.get(key)
      q.income += row.income
      q.expense += row.expense
    }
    return [...map.values()]
  }, [financeSeries, pnlQuarterly])

  const pnlTotals = pnlRows.reduce(
    (acc, row) => ({ income: acc.income + row.income, expense: acc.expense + row.expense }),
    { income: 0, expense: 0 }
  )

  const maxCat = Math.max(...expenseStats.byCategory.map((c) => c.amount), 1)

  return (
    <div className="content__body">
      {saved && (
        <div className="banner" role="status">
          <span className="banner__icon">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 12.5l5 5L20 6.5" stroke="currentColor" strokeWidth="2.4"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div className="banner__body">
            <strong>ההוצאה נרשמה</strong>
            <span>מסך הרווח והפסד, גרף הדשבורד וכל המונים התעדכנו מיד.</span>
          </div>
          <button className="banner__close" onClick={() => setSaved(false)} aria-label="סגירה">✕</button>
        </div>
      )}

      {/* מדדי החודש */}
      <div className="totals totals--pay">
        <div className="totals__item">
          <span className="totals__value" dir="ltr">{formatCurrency(expenseStats.total)}</span>
          <span className="totals__label">הוצאות החודש</span>
        </div>
        <div className="totals__item">
          <span className="totals__value" dir="ltr">{formatCurrency(revenue.actual - expenseStats.total)}</span>
          <span className="totals__label">רווח החודש</span>
        </div>
        <div className="totals__item">
          <span className="totals__value" dir="ltr">{formatCurrency(expenseStats.recurringTotal)}</span>
          <span className="totals__label">מינויים קבועים ({expenseStats.recurringCount})</span>
        </div>
        <div className={`totals__item ${expenseStats.missingReceipts > 0 ? 'totals__item--soon' : ''}`}>
          <span className="totals__value" dir="ltr">{expenseStats.missingReceipts}</span>
          <span className="totals__label">קבלות חסרות</span>
        </div>
      </div>

      {/* תזכורת חידוש מינויים (סעיף 9.3) */}
      <div className="renew-note">
        ↻ תזכורת: {expenseStats.recurringCount} מינויים חודשיים בסך{' '}
        <strong dir="ltr">{formatCurrency(expenseStats.recurringTotal)}</strong> יתחדשו
        אוטומטית ב-1 לחודש הבא.
      </div>

      <div className="grid-2">
        {/* מסך רווח והפסד (סעיף 9.3) */}
        <section className="card">
          <div className="card__head">
            <div className="card__head-main">
              <span className="card__icon card__icon--accent">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M3 16.5 9 10l4 4 7.5-7.5M15 6.5h5.5V12" stroke="currentColor"
                    strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <h2 className="card__title">רווח והפסד</h2>
                <p className="card__subtitle">הכנסות (סעיף 8) מול הוצאות (סעיף 9)</p>
              </div>
            </div>
            <div className="seg-toggle">
              <button className={`seg-toggle__btn ${!pnlQuarterly ? 'is-on' : ''}`}
                onClick={() => setPnlQuarterly(false)}>חודשי</button>
              <button className={`seg-toggle__btn ${pnlQuarterly ? 'is-on' : ''}`}
                onClick={() => setPnlQuarterly(true)}>רבעוני</button>
            </div>
          </div>
          <div className="table-scroll">
            <table className="data-table data-table--compact">
              <thead>
                <tr><th>{pnlQuarterly ? 'רבעון' : 'חודש'}</th><th>הכנסות</th><th>הוצאות</th><th>רווח</th><th>שוליים</th></tr>
              </thead>
              <tbody>
                {pnlRows.map((row) => {
                  const profit = row.income - row.expense
                  return (
                    <tr key={row.month}>
                      <td>{row.month}</td>
                      <td className="num"><span dir="ltr">{formatCurrency(row.income)}</span></td>
                      <td className="num"><span dir="ltr">{formatCurrency(row.expense)}</span></td>
                      <td className={`num cell-strong ${profit < 0 ? 'text-late' : ''}`}>
                        <span dir="ltr">{formatCurrency(profit)}</span>
                      </td>
                      <td className="num muted" dir="ltr">
                        {row.income ? Math.round((profit / row.income) * 100) : 0}%
                      </td>
                    </tr>
                  )
                })}
                <tr className="pnl-total">
                  <td>סה"כ</td>
                  <td className="num"><span dir="ltr">{formatCurrency(pnlTotals.income)}</span></td>
                  <td className="num"><span dir="ltr">{formatCurrency(pnlTotals.expense)}</span></td>
                  <td className="num cell-strong">
                    <span dir="ltr">{formatCurrency(pnlTotals.income - pnlTotals.expense)}</span>
                  </td>
                  <td className="num muted" dir="ltr">
                    {pnlTotals.income
                      ? Math.round(((pnlTotals.income - pnlTotals.expense) / pnlTotals.income) * 100)
                      : 0}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* פילוח ההוצאות לפי קטגוריה (סעיף 9.3) */}
        <section className="card">
          <div className="card__head">
            <div>
              <h2 className="card__title">הוצאות לפי קטגוריה</h2>
              <p className="card__subtitle">{monthLabelOf(currentMonthKey())}</p>
            </div>
          </div>
          <ul className="bars">
            {expenseStats.byCategory.map((cat) => (
              <li key={cat.id} className="bars__row">
                <div className="bars__meta">
                  <span className="bars__name">{cat.name}</span>
                  <span className="bars__value" dir="ltr">{formatCurrency(cat.amount)}</span>
                </div>
                <div className="bars__track">
                  <div className="bars__fill bars__fill--expense"
                    style={{ width: `${(cat.amount / maxCat) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ספר ההוצאות */}
      <section className="card filters">
        <div className="filters__search">
          <IconSearch width={18} height={18} />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש ספק, קטגוריה או הערה..." aria-label="חיפוש הוצאות" />
        </div>
        <label className="select">
          <span className="select__label">חודש</span>
          <select value={month} onChange={(e) => setMonth(e.target.value)}>
            <option value="all">כל החודשים</option>
            {monthKeys.map((key) => <option key={key} value={key}>{monthLabelOf(key)}</option>)}
          </select>
        </label>
        <label className="select">
          <span className="select__label">קטגוריה</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">כל הקטגוריות</option>
            {expenseCategories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </label>
        <label className="select">
          <span className="select__label">קבלה</span>
          <select value={receiptFilter} onChange={(e) => setReceiptFilter(e.target.value)}>
            <option value="all">הכל</option>
            <option value="has">עם קבלה</option>
            <option value="missing">חסרה קבלה</option>
          </select>
        </label>
        <button className="btn-primary btn-primary--inline btn-add" onClick={() => setModalOpen(true)}>
          + רישום הוצאה
        </button>
      </section>

      <section className="card">
        <div className="card__head">
          <div>
            <h2 className="card__title">
              {filtered.length} הוצאות{month !== 'all' ? ` · ${monthLabelOf(month)}` : ''}
            </h2>
            <p className="card__subtitle">
              סה"כ בתצוגה: <span dir="ltr">{formatCurrency(filteredTotal)}</span> (כולל מע"מ)
            </p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-rows"><p>לא נמצאו הוצאות שמתאימות לסינון.</p></div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>תאריך</th>
                  <th>קטגוריה</th>
                  <th>ספק</th>
                  <th>אמצעי</th>
                  <th>סכום</th>
                  <th>לפני מע"מ</th>
                  <th>קבלה</th>
                  <th>הוזן ע"י</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((expense) => (
                  <tr key={expense.id}>
                    <td className="muted num" dir="ltr">
                      {new Date(expense.date).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </td>
                    <td>
                      <span className="pill pill--muted">{categoryById[expense.categoryId] || '—'}</span>
                      {expense.recurring && <span className="pill pill--secondary"> ↻ מינוי</span>}
                    </td>
                    <td className="cell-strong">
                      {expense.vendor}
                      {expense.subcontractorId && <span className="muted"> · קבלן משנה</span>}
                    </td>
                    <td className="muted">{expense.method}</td>
                    <td className="num"><span dir="ltr">{formatCurrency(expense.amount)}</span></td>
                    <td className="num muted"><span dir="ltr">{formatCurrency(preVatOf(expense.amount))}</span></td>
                    <td><ReceiptCell expense={expense} onAttach={attachReceipt} /></td>
                    <td className="muted">{expense.enteredBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalOpen && (
        <ExpenseModal
          user={user}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); setSaved(true) }}
        />
      )}
    </div>
  )
}
