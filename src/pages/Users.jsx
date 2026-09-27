import { useEffect, useMemo, useState } from 'react'
import { useCrm } from '../store/CrmContext.jsx'
import InviteModal from '../components/InviteModal.jsx'
import { IconSearch } from '../components/icons.jsx'
import {
  ROLES, roleById, MODULES, ADMIN_ONLY_MODULES, USER_STATUS_LABELS, statusOf,
} from '../data/users.js'

/* ------------------------------------------------------------------
   ניהול משתמשים והרשאות – סעיף 2 באפיון.
   רשימת הצוות, הזמנת משתמשים חדשים (סעיף 2.2), עריכת תפקיד,
   השבתה, ומטריצת הרשאות: אילו מודולים פתוחים לכל תפקיד.
   ------------------------------------------------------------------ */

function useEscape(onClose) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
}

/* "היום 09:12" / "אתמול" / "לפני 6 ימים" */
function lastSeen(iso) {
  if (!iso) return 'טרם נכנס'
  const date = new Date(iso)
  const days = Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000))
  if (days <= 0) return 'היום ' + date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
  if (days === 1) return 'אתמול'
  if (days < 30) return `לפני ${days} ימים`
  return date.toLocaleDateString('he-IL')
}

function hoursLeft(iso) {
  return Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / (60 * 60 * 1000)))
}

/* עריכת משתמש: פרטים, תפקיד, והשבתה / הפעלה מחדש */
function EditModal({ user, isSelf, isLastAdmin, subs, onSave, onClose }) {
  useEscape(onClose)
  const [name, setName] = useState(user.name)
  const [title, setTitle] = useState(user.title || '')
  const [phone, setPhone] = useState(user.phone || '')
  const [role, setRole] = useState(user.role)
  const [subId, setSubId] = useState(user.subcontractorId != null ? String(user.subcontractorId) : '')
  const [error, setError] = useState('')

  /* אי אפשר לנעול את עצמך מחוץ למערכת, ואי אפשר להישאר בלי מנהל-על */
  const roleLocked = isSelf || isLastAdmin
  const status = statusOf(user)

  function save(extra = {}) {
    if (!name.trim()) return setError('נא להזין שם')
    if (role === 'subcontractor' && !subId) return setError('נא לבחור את כרטיס הקבלן')
    onSave({
      name: name.trim(),
      title: title.trim(),
      phone: phone.trim(),
      role,
      subcontractorId: role === 'subcontractor' ? Number(subId) : null,
      ...extra,
    })
  }

  return (
    <div className="modal-layer" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <header className="modal__head">
          <div>
            <h2 className="modal__title">עריכת {user.name}</h2>
            <p className="modal__subtitle" dir="ltr">{user.email}</p>
          </div>
          <button className="modal__close" onClick={onClose} aria-label="סגירה">✕</button>
        </header>

        <div className="modal__body">
          {error && <div className="alert-strip" role="alert">{error}</div>}
          <div className="form-grid">
            <label className="fld">
              <span className="fld__label">שם מלא</span>
              <input className="fld__input" value={name} onChange={(e) => { setName(e.target.value); setError('') }} />
            </label>
            <label className="fld">
              <span className="fld__label">תפקיד בעסק</span>
              <input className="fld__input" value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label className="fld">
              <span className="fld__label">טלפון</span>
              <input className="fld__input" type="tel" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
            <label className="fld">
              <span className="fld__label">הרשאות מערכת</span>
              <select className="fld__input" value={role} disabled={roleLocked}
                onChange={(e) => { setRole(e.target.value); setError('') }}>
                {ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </label>
          </div>
          {roleLocked && (
            <p className="invite-foot">
              {isSelf
                ? 'אי אפשר לשנות את התפקיד של עצמך – כדי לא לנעול את עצמך מחוץ למערכת.'
                : 'זה מנהל-העל הפעיל היחיד. כדי לשנות את התפקיד שלו, מנה קודם מנהל-על נוסף.'}
            </p>
          )}

          {role === 'subcontractor' && (
            <label className="fld">
              <span className="fld__label">כרטיס הקבלן (קובע אילו משימות יראה)</span>
              <select className="fld__input" value={subId} onChange={(e) => { setSubId(e.target.value); setError('') }}>
                <option value="">בחירת קבלן...</option>
                {subs.map((s) => <option key={s.id} value={s.id}>{s.name} – {s.field}</option>)}
              </select>
            </label>
          )}

          {!isSelf && !isLastAdmin && (
            <div className="danger-zone">
              {status === 'disabled' ? (
                <>
                  <span>המשתמש מושבת ואינו יכול להיכנס.</span>
                  <button className="chip-btn" onClick={() => save({ status: user.lastLoginAt ? 'active' : 'invited' })}>
                    הפעלה מחדש
                  </button>
                </>
              ) : (
                <>
                  <span>השבתה חוסמת את הכניסה מיד. הנתונים שיצר נשמרים.</span>
                  <button className="chip-btn chip-btn--danger" onClick={() => save({ status: 'disabled' })}>
                    השבתת משתמש
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <footer className="modal__foot">
          <button className="btn-ghost" onClick={onClose}>ביטול</button>
          <button className="btn-primary btn-primary--inline" onClick={() => save()}>שמירה</button>
        </footer>
      </div>
    </div>
  )
}

/* מטריצת ההרשאות: מודול × תפקיד */
function PermissionsCard({ permissions, onToggle }) {
  return (
    <section className="card">
      <div className="card__head">
        <div>
          <h2 className="card__title">הרשאות לפי תפקיד</h2>
          <p className="card__subtitle">סמן אילו מסכים פתוחים לכל תפקיד. השינוי חל מיד על כל המשתמשים בתפקיד.</p>
        </div>
      </div>
      <div className="table-scroll">
        <table className="data-table perm-matrix">
          <thead>
            <tr>
              <th>מסך</th>
              {ROLES.map((r) => <th key={r.id} className="perm-matrix__col">{r.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {MODULES.map((m) => (
              <tr key={m.id}>
                <td>
                  <span className="perm-matrix__module">{m.label}</span>
                  {m.note && <span className="perm-matrix__note">{m.note}</span>}
                </td>
                {ROLES.map((r) => {
                  const adminOnly = ADMIN_ONLY_MODULES.includes(m.id)
                  if (r.id === 'super_admin') {
                    return <td key={r.id} className="perm-matrix__col"><span className="perm-lock is-on" title="מנהל-על רואה הכל">✓</span></td>
                  }
                  if (adminOnly) {
                    return <td key={r.id} className="perm-matrix__col"><span className="perm-lock" title="מנהלי-על בלבד">🔒</span></td>
                  }
                  const on = (permissions[r.id] || []).includes(m.id)
                  return (
                    <td key={r.id} className="perm-matrix__col">
                      <input
                        type="checkbox"
                        className="perm-check"
                        checked={on}
                        onChange={(e) => onToggle(r.id, m.id, e.target.checked)}
                        aria-label={`${m.label} – ${r.label}`}
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="perm-list perm-list--notes">
        <li>קבלן משנה רואה בלוח המשימות <strong>רק את המשימות שהוקצו לו</strong>, גם אם המסך פתוח לו.</li>
        <li>במצב ענן ההרשאות נאכפות גם במסד הנתונים עצמו – לא רק בתצוגה.</li>
      </ul>
    </section>
  )
}

export default function Users({ currentUser }) {
  const { users, subs, permissions, updateUser, renewInvite, setRoleModule } = useCrm()

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [resendUser, setResendUser] = useState(null)
  const [editing, setEditing] = useState(null)

  const withStatus = useMemo(() => users.map((u) => ({ ...u, shownStatus: statusOf(u) })), [users])
  const activeAdmins = users.filter((u) => u.role === 'super_admin' && u.status === 'active')

  const stats = {
    active: withStatus.filter((u) => u.shownStatus === 'active').length,
    pending: withStatus.filter((u) => ['invited', 'expired'].includes(u.shownStatus)).length,
    admins: activeAdmins.length,
    disabled: withStatus.filter((u) => u.shownStatus === 'disabled').length,
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const order = { active: 0, invited: 1, expired: 2, disabled: 3 }
    return withStatus
      .filter((u) => roleFilter === 'all' || u.role === roleFilter)
      .filter((u) => !q || `${u.name} ${u.email} ${u.title || ''}`.toLowerCase().includes(q))
      .sort((a, b) => order[a.shownStatus] - order[b.shownStatus] || a.name.localeCompare(b.name, 'he'))
  }, [withStatus, search, roleFilter])

  const isSelf = (u) => u.id === currentUser.id || u.email.toLowerCase() === currentUser.email.toLowerCase()

  return (
    <div className="content__body">
      <section className="card">
        <div className="totals totals--pay">
          <div className="totals__item">
            <span className="totals__value" dir="ltr">{stats.active}</span>
            <span className="totals__label">משתמשים פעילים</span>
          </div>
          <div className={`totals__item ${stats.pending ? 'totals__item--soon' : ''}`}>
            <span className="totals__value" dir="ltr">{stats.pending}</span>
            <span className="totals__label">הזמנות ממתינות</span>
          </div>
          <div className="totals__item">
            <span className="totals__value" dir="ltr">{stats.admins}</span>
            <span className="totals__label">מנהלי-על</span>
          </div>
          <div className="totals__item">
            <span className="totals__value" dir="ltr">{stats.disabled}</span>
            <span className="totals__label">מושבתים</span>
          </div>
        </div>
      </section>

      <section className="card filters">
        <div className="filters__search">
          <IconSearch width={18} height={18} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש לפי שם, אימייל או תפקיד..."
            aria-label="חיפוש משתמשים"
          />
        </div>
        <label className="select">
          <span className="select__label">הרשאות</span>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">כל התפקידים</option>
            {ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </label>
        <button className="btn-primary btn-primary--inline btn-add" onClick={() => setInviteOpen(true)}>
          + הזמנת משתמש
        </button>
      </section>

      <section className="card">
        <div className="card__head">
          <div>
            <h2 className="card__title">צוות המערכת ({users.length})</h2>
            <p className="card__subtitle">כל מי שיכול להיכנס למערכת, והתפקיד שקובע מה הוא רואה</p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-rows"><p>לא נמצאו משתמשים שמתאימים לחיפוש.</p></div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>משתמש</th>
                  <th>הרשאות</th>
                  <th>סטטוס</th>
                  <th>כניסה אחרונה</th>
                  <th>פעולה</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const role = roleById[u.role]
                  const st = USER_STATUS_LABELS[u.shownStatus]
                  const pending = u.shownStatus === 'invited' || u.shownStatus === 'expired'
                  return (
                    <tr key={u.id} className={u.shownStatus === 'disabled' ? 'row-dim' : ''}>
                      <td>
                        <div className="cell-user">
                          <span className="avatar avatar--sm">{u.name.charAt(0)}</span>
                          <span className="cell-lead">
                            <span className="cell-lead__business">
                              {u.name}{isSelf(u) && <span className="muted"> (את/ה)</span>}
                            </span>
                            <span className="cell-lead__name" dir="ltr">{u.email}</span>
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="cell-lead">
                          <span><span className={`pill pill--${role.tone}`}>{role.label}</span></span>
                          {u.title && <span className="cell-lead__name">{u.title}</span>}
                        </span>
                      </td>
                      <td>
                        <span className={`pill pill--${st.tone}`}>{st.label}</span>
                        {u.shownStatus === 'invited' && (
                          <div className="cell-lead__name">
                            נותרו <span dir="ltr">{hoursLeft(u.inviteExpiresAt)}</span> שעות
                          </div>
                        )}
                      </td>
                      <td className="muted">{lastSeen(u.lastLoginAt)}</td>
                      <td>
                        <div className="doc-actions">
                          <button className="btn-convert" onClick={() => setEditing(u)}>עריכה</button>
                          {pending && (
                            <button
                              className="btn-convert btn-convert--warn"
                              onClick={() => {
                                setResendUser(u.shownStatus === 'expired' ? renewInvite(u.id) : u)
                              }}
                            >
                              {u.shownStatus === 'expired' ? 'חידוש הזמנה' : 'שליחה מחדש'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <PermissionsCard permissions={permissions} onToggle={setRoleModule} />

      {inviteOpen && <InviteModal onClose={() => setInviteOpen(false)} />}
      {resendUser && <InviteModal resendUser={resendUser} onClose={() => setResendUser(null)} />}
      {editing && (
        <EditModal
          user={editing}
          subs={subs}
          isSelf={isSelf(editing)}
          isLastAdmin={editing.role === 'super_admin' && activeAdmins.length <= 1 && editing.status === 'active'}
          onClose={() => setEditing(null)}
          onSave={(changes) => { updateUser(editing.id, changes); setEditing(null) }}
        />
      )}
    </div>
  )
}
