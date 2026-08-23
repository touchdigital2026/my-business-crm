import { useMemo, useState } from 'react'
import { useCrm } from '../store/CrmContext.jsx'
import {
  packages, packageById, formatCurrency, monthLabelOf, currentMonthKey,
} from '../data/mockData.js'

/* ------------------------------------------------------------------
   דוח הכנסות חודשי/רבעוני, מפולח לפי חבילה ולפי לקוח (סעיף 8).
   העמודות מוערמות לפי שלוש דרגות החבילות (סולם הסגול המדורג),
   ומקטע אפור אחד ל"תוספות וחיובים חד-פעמיים".
   ------------------------------------------------------------------ */

const EXTRA_SEGMENT = { id: 'extra', name: 'תוספות וחד-פעמי', color: '#8E8CA3' }
const SEGMENTS = [
  ...packages.map((p) => ({ id: p.id, name: p.name, color: `var(--tier-${p.tier})` })),
  EXTRA_SEGMENT,
]

function quarterOf(monthKey) {
  const [year, month] = monthKey.split('-').map(Number)
  return `Q${Math.ceil(month / 3)} ${year}`
}

function buildScale(max, steps = 4) {
  const raw = max / steps
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)))
  const stepSize = Math.ceil(raw / magnitude) * magnitude
  return { top: stepSize * steps, ticks: Array.from({ length: steps + 1 }, (_, i) => stepSize * i) }
}

export default function RevenueReport({ onOpenClient }) {
  const { payments, clients } = useCrm()
  const [mode, setMode] = useState('monthly')   // חודשי | רבעוני
  const [asTable, setAsTable] = useState(false)
  const [hovered, setHovered] = useState(null)

  const clientById = useMemo(
    () => Object.fromEntries(clients.map((c) => [c.id, c])),
    [clients]
  )

  /* קיבוץ החיובים לתקופות – חודשים או רבעונים */
  const periods = useMemo(() => {
    const map = new Map()
    for (const pay of payments) {
      const key = mode === 'monthly' ? pay.monthKey : quarterOf(pay.monthKey)
      if (!map.has(key)) {
        map.set(key, { key, label: mode === 'monthly' ? monthLabelOf(pay.monthKey).split(' ')[0] : key, segments: {}, total: 0 })
      }
      const period = map.get(key)
      const segment = pay.kind === 'monthly' ? pay.packageId : 'extra'
      period.segments[segment] = (period.segments[segment] || 0) + pay.amount
      period.total += pay.amount
    }
    return [...map.values()].sort((a, b) => (a.key > b.key ? 1 : -1))
  }, [payments, mode])

  const { top, ticks } = buildScale(Math.max(...periods.map((p) => p.total), 1))

  /* פילוח לפי לקוח – בתקופה האחרונה (החודש או הרבעון הנוכחי) */
  const currentPeriodKey = mode === 'monthly' ? currentMonthKey() : quarterOf(currentMonthKey())
  const byClient = useMemo(() => {
    const map = new Map()
    for (const pay of payments) {
      const key = mode === 'monthly' ? pay.monthKey : quarterOf(pay.monthKey)
      if (key !== currentPeriodKey) continue
      if (!map.has(pay.clientId)) {
        map.set(pay.clientId, { clientId: pay.clientId, billed: 0, paid: 0, open: 0 })
      }
      const row = map.get(pay.clientId)
      row.billed += pay.amount
      if (pay.status === 'paid') row.paid += pay.amount
      else row.open += pay.amount
    }
    return [...map.values()].sort((a, b) => b.billed - a.billed)
  }, [payments, mode, currentPeriodKey])

  return (
    <section className="card chart-card">
      <div className="card__head">
        <div className="card__head-main">
          <span className="card__icon card__icon--accent">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 20h16M7 20v-6M12 20V7M17 20v-9" stroke="currentColor" strokeWidth="1.7"
                strokeLinecap="round" />
            </svg>
          </span>
          <div>
            <h2 className="card__title">דוח הכנסות</h2>
            <p className="card__subtitle">פילוח לפי חבילה ולפי לקוח</p>
          </div>
        </div>
        <div className="card__head-actions">
          <div className="seg-toggle" role="tablist" aria-label="טווח הדוח">
            <button
              className={`seg-toggle__btn ${mode === 'monthly' ? 'is-on' : ''}`}
              onClick={() => setMode('monthly')}
            >
              חודשי
            </button>
            <button
              className={`seg-toggle__btn ${mode === 'quarterly' ? 'is-on' : ''}`}
              onClick={() => setMode('quarterly')}
            >
              רבעוני
            </button>
          </div>
          <button className="chip-btn" onClick={() => setAsTable((v) => !v)}>
            {asTable ? 'הצג כגרף' : 'הצג כטבלה'}
          </button>
        </div>
      </div>

      {/* מקרא – הזיהוי לא מסתמך על צבע בלבד */}
      <ul className="legend legend--wrap">
        {SEGMENTS.map((segment) => (
          <li key={segment.id} className="legend__item">
            <span className="legend__swatch" style={{ background: segment.color }} />
            {segment.name}
          </li>
        ))}
      </ul>

      {asTable ? (
        <table className="data-table data-table--compact">
          <thead>
            <tr>
              <th>{mode === 'monthly' ? 'חודש' : 'רבעון'}</th>
              {SEGMENTS.map((segment) => <th key={segment.id}>{segment.name}</th>)}
              <th>סה"כ</th>
            </tr>
          </thead>
          <tbody>
            {periods.map((period) => (
              <tr key={period.key}>
                <td>{period.label}</td>
                {SEGMENTS.map((segment) => (
                  <td key={segment.id} className="num">
                    <span dir="ltr">{formatCurrency(period.segments[segment.id] || 0)}</span>
                  </td>
                ))}
                <td className="num cell-strong"><span dir="ltr">{formatCurrency(period.total)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="chart">
          <div className="chart__axis">
            {[...ticks].reverse().map((tick) => (
              <span key={tick} className="chart__tick" dir="ltr">
                {tick >= 1000 ? tick / 1000 + 'K' : tick}
              </span>
            ))}
          </div>
          <div className="chart__plot">
            <div className="chart__grid">
              {ticks.map((tick) => <span key={tick} className="chart__gridline" />)}
            </div>
            <div className="chart__groups">
              {periods.map((period, i) => (
                <div
                  key={period.key}
                  className={`chart__group ${hovered === i ? 'is-hovered' : ''}`}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* עמודה מוערמת: רווח 2px בצבע הרקע בין המקטעים */}
                  <div className="stackbar" style={{ height: `${(period.total / top) * 100}%` }}>
                    {SEGMENTS.filter((s) => period.segments[s.id]).map((segment, j, arr) => (
                      <div
                        key={segment.id}
                        className="stackbar__seg"
                        style={{
                          flexGrow: period.segments[segment.id],
                          background: segment.color,
                          borderRadius: j === arr.length - 1 ? '4px 4px 0 0' : 0,
                        }}
                      />
                    ))}
                  </div>

                  {hovered === i && (
                    <div
                      className="chart__tooltip"
                      role="status"
                      style={{ bottom: `calc(${(period.total / top) * 100}% + 12px)` }}
                    >
                      <strong>{period.label}</strong>
                      {SEGMENTS.filter((s) => period.segments[s.id]).map((segment) => (
                        <span key={segment.id}>
                          <i className="dot" style={{ background: segment.color }} />
                          {segment.name}: <span dir="ltr">{formatCurrency(period.segments[segment.id])}</span>
                        </span>
                      ))}
                      <span className="chart__tooltip-sum">
                        סה"כ: <span dir="ltr">{formatCurrency(period.total)}</span>
                      </span>
                    </div>
                  )}

                  <span className="chart__label">{period.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* פילוח לפי לקוח – התקופה הנוכחית */}
      <div className="report-clients">
        <h3 className="report-clients__title">
          פילוח לפי לקוח · {mode === 'monthly' ? monthLabelOf(currentMonthKey()) : currentPeriodKey}
        </h3>
        <div className="table-scroll">
          <table className="data-table data-table--compact">
            <thead>
              <tr>
                <th>לקוח</th>
                <th>חבילה</th>
                <th>חויב</th>
                <th>שולם</th>
                <th>פתוח</th>
              </tr>
            </thead>
            <tbody>
              {byClient.map((row) => {
                const client = clientById[row.clientId]
                const pkg = client ? packageById[client.packageId] : null
                return (
                  <tr key={row.clientId}>
                    <td>
                      <button className="tcard__client cell-strong" onClick={() => onOpenClient(row.clientId)}>
                        {client?.business || '—'}
                      </button>
                    </td>
                    <td>{pkg && <span className={`pill pill--tier${pkg.tier}`}>{pkg.name}</span>}</td>
                    <td className="num"><span dir="ltr">{formatCurrency(row.billed)}</span></td>
                    <td className="num"><span dir="ltr">{formatCurrency(row.paid)}</span></td>
                    <td className="num">
                      {row.open > 0 ? (
                        <span className="pill pill--late" dir="ltr">{formatCurrency(row.open)}</span>
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
      </div>
    </section>
  )
}
