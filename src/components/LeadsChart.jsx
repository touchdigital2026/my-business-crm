import { useState } from 'react'
import { monthlyPerformance } from '../data/mockData.js'

/* מעגל את הציר האנכי למספרים "עגולים" (0, 40, 80...) */
function buildScale(values, steps = 4) {
  const max = Math.max(...values)
  const raw = max / steps
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)))
  const stepSize = Math.ceil(raw / magnitude) * magnitude
  const top = stepSize * steps
  const ticks = Array.from({ length: steps + 1 }, (_, i) => stepSize * i)
  return { top, ticks }
}

export default function LeadsChart() {
  const [hovered, setHovered] = useState(null)
  const [asTable, setAsTable] = useState(false)

  const data = monthlyPerformance
  const { top, ticks } = buildScale(data.flatMap((d) => [d.leads, d.deals]))
  const lastIndex = data.length - 1

  return (
    <section className="card chart-card">
      <div className="card__head">
        <div>
          <h2 className="card__title">לידים ועסקאות לפי חודש</h2>
          <p className="card__subtitle">8 החודשים האחרונים</p>
        </div>
        <div className="card__head-actions">
          {/* מקרא – זיהוי הסדרות לא מסתמך על הצבע בלבד */}
          <ul className="legend">
            <li className="legend__item">
              <span className="legend__swatch" style={{ background: 'var(--chart-1)' }} />
              לידים חדשים
            </li>
            <li className="legend__item">
              <span className="legend__swatch" style={{ background: 'var(--chart-2)' }} />
              עסקאות שנסגרו
            </li>
          </ul>
          <button className="chip-btn" onClick={() => setAsTable((v) => !v)}>
            {asTable ? 'הצג כגרף' : 'הצג כטבלה'}
          </button>
        </div>
      </div>

      {asTable ? (
        <table className="data-table data-table--compact">
          <thead>
            <tr>
              <th>חודש</th>
              <th>לידים חדשים</th>
              <th>עסקאות שנסגרו</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.month}>
                <td>{d.month}</td>
                <td className="num">{d.leads}</td>
                <td className="num">{d.deals}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="chart">
          <div className="chart__axis">
            {[...ticks].reverse().map((t) => (
              <span key={t} className="chart__tick">
                {t.toLocaleString('he-IL')}
              </span>
            ))}
          </div>

          <div className="chart__plot">
            {/* קווי עזר אופקיים – דקים ועדינים, לא מושכים תשומת לב */}
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
                      className="chart__bar chart__bar--1"
                      style={{ height: `${(d.leads / top) * 100}%` }}
                    >
                      {i === lastIndex && <span className="chart__cap">{d.leads}</span>}
                    </div>
                    <div
                      className="chart__bar chart__bar--2"
                      style={{ height: `${(d.deals / top) * 100}%` }}
                    />
                  </div>

                  {hovered === i && (
                    <div
                      className="chart__tooltip"
                      role="status"
                      style={{ bottom: `calc(${(d.leads / top) * 100}% + 12px)` }}
                    >
                      <strong>{d.month}</strong>
                      <span>
                        <i className="dot" style={{ background: 'var(--chart-1)' }} />
                        לידים: {d.leads}
                      </span>
                      <span>
                        <i className="dot" style={{ background: 'var(--chart-2)' }} />
                        עסקאות: {d.deals}
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
