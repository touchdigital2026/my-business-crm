import {
  IconDashboard, IconLeads, IconCustomers, IconTasks, IconSubcontractors,
  IconPayments, IconExpenses, IconDocuments, IconUsers, IconReports,
  IconLogout, IconClose, IconSearch, IconAlert,
} from './icons.jsx'
import { useCrm } from '../store/CrmContext.jsx'

/* המודולים לפי סעיף 16.3 באפיון. כדי להוסיף מסך – מוסיפים כאן שורה. */
const NAV_ITEMS = [
  { id: 'dashboard', label: 'דשבורד', Icon: IconDashboard },
  { id: 'leads', label: 'לידים', Icon: IconLeads },
  { id: 'clients', label: 'לקוחות', Icon: IconCustomers },
  { id: 'tasks', label: 'משימות', Icon: IconTasks },
  { id: 'subcontractors', label: 'קבלני משנה', Icon: IconSubcontractors },
  { id: 'payments', label: 'תשלומים', Icon: IconPayments },
  { id: 'expenses', label: 'הוצאות', Icon: IconExpenses },
  { id: 'documents', label: 'מסמכים', Icon: IconDocuments },
  { id: 'users', label: 'משתמשים', Icon: IconUsers },
  { id: 'reports', label: 'דוחות', Icon: IconReports },
]

export default function Sidebar({ active, onNavigate, user, onLogout, open, onClose }) {
  /* מוני התפריט וכרטיס ההתראה נגזרים מהנתונים האמיתיים */
  const { activeLeads, activeClients, setupClients, openTasks, overdueTasks } = useCrm()
  const counts = {
    leads: activeLeads.length,
    clients: activeClients.length + setupClients.length,
    tasks: openTasks.length,
  }

  return (
    <>
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

        {/* חיפוש גלובלי – ממוקם בסרגל הצד לפי סעיף 16.3 */}
        <div className="sidebar__search">
          <IconSearch width={17} height={17} />
          <input
            type="search"
            placeholder="חיפוש בכל המערכת..."
            aria-label="חיפוש גלובלי"
          />
        </div>

        <nav className="sidebar__nav" aria-label="ניווט ראשי">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`nav-item ${active === id ? 'is-active' : ''}`}
              onClick={() => onNavigate(id)}
              aria-current={active === id ? 'page' : undefined}
            >
              <span className="nav-item__icon">
                <Icon width={18} height={18} />
              </span>
              <span className="nav-item__label">{label}</span>
              {counts[id] > 0 && (
                <span className="nav-item__badge" dir="ltr">{counts[id]}</span>
              )}
            </button>
          ))}
        </nav>

        {/* כרטיס התראה קבוע בתחתית הסרגל – סעיף 16.3 */}
        {overdueTasks.length > 0 && (
          <button className="alert-card" onClick={() => onNavigate('tasks')}>
            <span className="alert-card__icon">
              <IconAlert width={17} height={17} />
            </span>
            <span className="alert-card__body">
              <strong>
                <span dir="ltr">{overdueTasks.length}</span> משימות באיחור
              </strong>
              <span>חריגה מיעדי ה-SLA — לחץ לצפייה</span>
            </span>
          </button>
        )}

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
