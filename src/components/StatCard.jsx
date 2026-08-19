import { IconArrowUp, IconArrowDown } from './icons.jsx'

/* עיצוב המספר הגדול לפי סוג המדד */
function formatValue(value, format) {
  if (format === 'currency') return '₪' + value.toLocaleString('he-IL')
  if (format === 'percent') return value.toLocaleString('he-IL') + '%'
  return value.toLocaleString('he-IL')
}

/* גרף מיניאטורי שמראה את המגמה של 12 החודשים האחרונים.
   הקו עצמו עמום, והנקודה בקצה – בצבע המותג – מסמנת את החודש הנוכחי. */
function Sparkline({ points }) {
  const W = 108
  const H = 34
  const PAD = 3
  const min = Math.min(...points)
  const max = Math.max(...points)
  const span = max - min || 1

  const coords = points.map((p, i) => {
    const x = PAD + (i * (W - PAD * 2)) / (points.length - 1)
    const y = H - PAD - ((p - min) / span) * (H - PAD * 2)
    return [x, y]
  })
  const line = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const [lastX, lastY] = coords[coords.length - 1]

  return (
    <svg className="sparkline" width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <polyline
        points={line}
        fill="none"
        stroke="var(--chart-1)"
        strokeOpacity="0.32"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* טבעת בצבע הרקע כדי שהנקודה תישאר ברורה גם מעל הקו */}
      <circle cx={lastX} cy={lastY} r="4.5" fill="var(--card)" />
      <circle cx={lastX} cy={lastY} r="3.2" fill="var(--chart-1)" />
    </svg>
  )
}

export default function StatCard({ label, value, format, delta, goodDirection, trend }) {
  const isUp = delta >= 0
  // האם השינוי חיובי מבחינה עסקית? (ירידה בשיעור המרה = רע)
  const isGood = goodDirection === 'up' ? isUp : !isUp
  const Arrow = isUp ? IconArrowUp : IconArrowDown

  return (
    <article className="card stat">
      <p className="stat__label">{label}</p>
      <div className="stat__row">
        {/* dir="ltr" – מספרים וסימנים כמו ₪ ו-% תמיד נקראים משמאל לימין,
            גם בתוך עמוד בעברית */}
        <span className="stat__value" dir="ltr">
          {formatValue(value, format)}
        </span>
        <Sparkline points={trend} />
      </div>
      <div className={`stat__delta ${isGood ? 'is-good' : 'is-bad'}`}>
        <Arrow width={13} height={13} />
        <span dir="ltr">
          {isUp ? '+' : '−'}
          {Math.abs(delta)}%
        </span>
        <span className="stat__delta-note">מהחודש שעבר</span>
      </div>
    </article>
  )
}
