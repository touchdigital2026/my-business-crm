import { useState } from 'react'
import { useCrm } from '../store/CrmContext.jsx'
import { monthlyFinance, expenses, formatCurrency } from '../data/mockData.js'

/* מעגל את הציר האנכי למספרים "עגולים" */
function buildScale(values, steps = 4) {
  const max = Math.max(...values)
  const raw = max / steps
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)))
  const stepSize = Math.ceil(raw / magnitude) * magnitude
  return { top: stepSize * steps, ticks: Array.from({ length: steps + 1 }, (_, i) => stepSize * i) }
}

/* סעיפים 13.2 ו-13.3 – הכנסה חודשית מול הוצאות, ומסך רווח/הפסד. */
export default function FinanceChart() {
  const [hovered, setHovered] = useState(null)
  const [asTable, setAsTable] = useState(false)

  const { revenue } = useCrm()
  const data = monthlyFinance
  const { top, ticks } = buildScale(data.flatMap((d) => [d.income, d.expense]))
  const profit = revenue.actual - expenses.total
  const margin = ((profit / revenue.actual) * 100).toFixed(1)

  return (
    <section className="card chart-card">
      <div className="card__head">
        <div className="card__head-main">
          <span className="card__icon card__icon--accent">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 16.5 9 10l4 4 7.5-7.5" stroke="currentColor" strokeWidth="1.7"
                strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15 6.5h5.5V12" stroke="currentColor" strokeWidth="1.7"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <h2 className="card__title">הכנסות מול הוצאות</h2>
            <p className="card__subtitle">6 החודשים האחרונים</p>
          </div>
        </div>
        <div className="card__head-actions">
          <ul className="legend">
            <li className="legend__item">
              <span className="legend__swatch" style={{ background: 'var(--chart-income)' }} />
              הכנסות
            </li>
            <li className="legend__item">
              <span className="legend__swatch" style={{ background: 'var(--chart-expense)' }} />
              הוצאות
            </li>
          </ul>
          <button className="chip-btn" onClick={() => setAsTable((v) => !v)}>
            {asTable ? 'הצג כגרף' : 'הצג כטבלה'}
          </button>
        </div>
      </div>

      {/* מסך רווח והפסד – סעיף 13.3 */}
      <div className="pnl">
        <div className="pnl__item">
          <span className="pnl__label">הכנסות החודש</span>
          <span className="pnl__value" dir="ltr">{formatCurrency(revenue.actual)}</span>
        </div>
        <span className="pnl__op">−</span>
        <div className="pnl__item">
          <span className="pnl__label">הוצאות החודש</span>
          <span className="pnl__value" dir="ltr">{formatCurrency(expenses.total)}</span>
        </div>
        <span className="pnl__op">=</span>
        <div className="pnl__item pnl__item--result">
          <span className="pnl__label">רווח החודש</span>
          <span className="pnl__value" dir="ltr">{formatCurrency(profit)}</span>
          <span className="pnl__note" dir="ltr">{margin}% שולי רווח</span>
        </div>
      </div>

      {asTable ? (
        <table className="data-table data-table--compact">
          <thead>
            <tr>
              <th>חודש</th>
              <th>הכנסות</th>
              <th>הוצאות</th>
              <th>רווח</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.month}>
                <td>{d.month}</td>
                <td className="num"><span dir="ltr">{formatCurrency(d.income)}</span></td>
                <td className="num"><span dir="ltr">{formatCurrency(d.expense)}</span></td>
                <td className="num"><span dir="ltr">{formatCurrency(d.income - d.expense)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="chart">
          <div className="chart__axis">
            {[...ticks].reverse().map((t) => (
              <span key={t} className="chart__tick" dir="ltr">
                {t >= 1000 ? t / 1000 + 'K' : t}
              </span>
            ))}
          </div>

          <div className="chart__plot">
            <div className="chart__grid">
              {ticks.map((t) => (
                <span key={t} className="chart__gridline" />
              ))}
            </div>

            <div className="chart__groups">
              {data.map((d, i) => (
                <div
                  key={d.month}
                  className={`chart__group ${hovered === i ? 'is-hovered' : ''}`}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div className="chart__bars">
                    <div
                      className="chart__bar chart__bar--income"
                      style={{ height: `${(d.income / top) * 100}%` }}
                    />
                    <div
                      className="chart__bar chart__bar--expense"
                      style={{ height: `${(d.expense / top) * 100}%` }}
                    />
                  </div>

                  {hovered === i && (
                    <div
                      className="chart__tooltip"
                      role="status"
                      style={{ bottom: `calc(${(d.income / top) * 100}% + 12px)` }}
                    >
                      <strong>{d.month}</strong>
                      <span>
                        <i className="dot" style={{ background: 'var(--chart-income)' }} />
                        הכנסות: <span dir="ltr">{formatCurrency(d.income)}</span>
                      </span>
                      <span>
                        <i className="dot" style={{ background: 'var(--chart-expense)' }} />
                        הוצאות: <span dir="ltr">{formatCurrency(d.expense)}</span>
                      </span>
                      <span className="chart__tooltip-sum">
                        רווח: <span dir="ltr">{formatCurrency(d.income - d.expense)}</span>
                      </span>
                    </div>
                  )}

                  <span className="chart__label">{d.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
