import { IconSearch, IconBell, IconMenu } from './icons.jsx'

/* ברכה שמשתנה לפי שעת היום */
function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'בוקר טוב'
  if (hour < 18) return 'צהריים טובים'
  return 'ערב טוב'
}

const TODAY = new Date().toLocaleDateString('he-IL', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export default function Topbar({ user, onOpenMenu }) {
  return (
    <header className="topbar">
      <button className="topbar__menu" onClick={onOpenMenu} aria-label="פתיחת התפריט">
        <IconMenu />
      </button>

      <div className="topbar__titles">
        <h1 className="topbar__title">
          {greeting()}, {user.name}
        </h1>
        <p className="topbar__date">{TODAY}</p>
      </div>

      <div className="topbar__actions">
        <div className="search">
          <IconSearch width={18} height={18} />
          <input
            className="search__input"
            type="search"
            placeholder="חיפוש ליד, לקוח או קמפיין..."
            aria-label="חיפוש"
          />
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
