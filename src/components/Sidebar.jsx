import {
  IconDashboard, IconLeads, IconCustomers, IconCampaigns,
  IconTasks, IconReports, IconSettings, IconLogout, IconClose,
} from './icons.jsx'

/* פריטי התפריט. כדי להוסיף מסך חדש בעתיד – מוסיפים כאן שורה. */
const NAV_ITEMS = [
  { id: 'dashboard', label: 'דשבורד', Icon: IconDashboard },
  { id: 'leads', label: 'לידים', Icon: IconLeads, badge: 12 },
  { id: 'customers', label: 'לקוחות', Icon: IconCustomers },
  { id: 'campaigns', label: 'קמפיינים', Icon: IconCampaigns },
  { id: 'tasks', label: 'משימות', Icon: IconTasks, badge: 3 },
  { id: 'reports', label: 'דוחות', Icon: IconReports },
  { id: 'settings', label: 'הגדרות', Icon: IconSettings },
]

export default function Sidebar({ active, onNavigate, user, onLogout, open, onClose }) {
  return (
    <>
      {/* רקע כהה שמופיע מאחורי התפריט במסכי מובייל */}
      <div
        className={`sidebar-backdrop ${open ? 'is-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar ${open ? 'is-open' : ''}`}>
        <div className="sidebar__head">
          <div className="brand">
            <div className="brand__mark">CRM</div>
            <div>
              <div className="brand__name">ניהול לקוחות</div>
              <div className="brand__tag">שיווק דיגיטלי</div>
            </div>
          </div>
          <button className="sidebar__close" onClick={onClose} aria-label="סגירת התפריט">
            <IconClose width={18} height={18} />
          </button>
        </div>

        <nav className="sidebar__nav" aria-label="ניווט ראשי">
          <p className="sidebar__section">תפריט ראשי</p>
          {NAV_ITEMS.map(({ id, label, Icon, badge }) => (
            <button
              key={id}
              className={`nav-item ${active === id ? 'is-active' : ''}`}
              onClick={() => onNavigate(id)}
              aria-current={active === id ? 'page' : undefined}
            >
              <Icon />
              <span className="nav-item__label">{label}</span>
              {badge && <span className="nav-item__badge">{badge}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar__foot">
          <div className="sidebar__user">
            <div className="avatar">{user.name.charAt(0)}</div>
            <div className="sidebar__user-info">
              <div className="sidebar__user-name">{user.name}</div>
              <div className="sidebar__user-mail">{user.email}</div>
            </div>
          </div>
          <button className="sidebar__logout" onClick={onLogout}>
            <IconLogout width={17} height={17} />
            <span>התנתקות</span>
          </button>
        </div>
      </aside>
    </>
  )
}
