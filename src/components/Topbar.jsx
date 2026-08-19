import { IconBell, IconMenu, IconStorage } from './icons.jsx'

const TODAY = new Date().toLocaleDateString('he-IL', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

/* מכסת אחסון המסמכים – מחוון בסרגל העליון לפי סעיף 16.3 */
const STORAGE = { usedGb: 6.4, totalGb: 20 }

export default function Topbar({ user, breadcrumbs, onOpenMenu }) {
  const storagePct = Math.round((STORAGE.usedGb / STORAGE.totalGb) * 100)

  return (
    <header className="topbar">
      <button className="topbar__menu" onClick={onOpenMenu} aria-label="פתיחת התפריט">
        <IconMenu />
      </button>

      <div className="topbar__titles">
        {/* נתיב ניווט (Breadcrumbs) – סעיף 16.3 */}
        <nav className="crumbs" aria-label="נתיב ניווט">
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb} className="crumbs__item">
              {i > 0 && <span className="crumbs__sep">/</span>}
              <span className={i === breadcrumbs.length - 1 ? 'crumbs__current' : ''}>{crumb}</span>
            </span>
          ))}
        </nav>
        <p className="topbar__date">{TODAY}</p>
      </div>

      <div className="topbar__actions">
        <div className="storage" title={`נוצלו ${STORAGE.usedGb}GB מתוך ${STORAGE.totalGb}GB`}>
          <IconStorage width={17} height={17} />
          <div className="storage__body">
            <div className="storage__label">
              אחסון מסמכים
              <span dir="ltr">{STORAGE.usedGb}GB / {STORAGE.totalGb}GB</span>
            </div>
            <div className="storage__track">
              <div className="storage__fill" style={{ width: `${storagePct}%` }} />
            </div>
          </div>
        </div>

        <button className="icon-btn" aria-label="התראות">
          <IconBell width={19} height={19} />
          <span className="icon-btn__dot" />
        </button>
        <div className="avatar avatar--light">{user.name.charAt(0)}</div>
      </div>
    </header>
  )
}
