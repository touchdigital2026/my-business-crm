import { useEffect, useState } from 'react'
import { useCrm } from '../store/CrmContext.jsx'
import { isCloud } from '../lib/supabase.js'
import { ROLES, roleById, INVITE_HOURS } from '../data/users.js'

/* ------------------------------------------------------------------
   הזמנת משתמש למערכת – סעיף 2.2 באפיון.
   שלב 1: פרטי המשתמש והתפקיד. שלב 2: הודעת הזמנה מוכנה לשליחה
   בוואטסאפ או באימייל, עם תוקף של 48 שעות.
   משמש גם את מסך המשתמשים וגם את כרטיס קבלן המשנה.
   ------------------------------------------------------------------ */

function useEscape(onClose) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
}

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

/* 050-1234567 -> 972501234567 (הפורמט של קישורי וואטסאפ) */
function waNumber(phone) {
  const digits = (phone || '').replace(/\D/g, '')
  if (!digits) return ''
  return digits.startsWith('0') ? '972' + digits.slice(1) : digits
}

/* כתובת כניסה – רק אם המערכת כבר באוויר, ולא רצה על המחשב המקומי */
function publicUrl() {
  const { origin, hostname } = window.location
  return ['localhost', '127.0.0.1'].includes(hostname) ? null : origin
}

function inviteMessage(user) {
  const url = publicUrl()
  return [
    `שלום ${user.name},`,
    `הוזמנת להצטרף למערכת ה-CRM שלנו בתפקיד ${roleById[user.role].label}.`,
    url ? `כתובת הכניסה: ${url}` : null,
    `שם המשתמש שלך: ${user.email}`,
    'הסיסמה הראשונית תישלח אליך בהודעה נפרדת – מומלץ להחליף אותה בכניסה הראשונה.',
    `ההזמנה בתוקף ${INVITE_HOURS} שעות.`,
  ].filter(Boolean).join('\n')
}

/* שלב השליחה – גם להזמנה חדשה וגם לשליחה מחדש */
function ShareStep({ user }) {
  const [copied, setCopied] = useState(false)
  const text = inviteMessage(user)
  const wa = `https://wa.me/${waNumber(user.phone)}?text=${encodeURIComponent(text)}`
  const mail = `mailto:${user.email}?subject=${encodeURIComponent('הזמנה למערכת ה-CRM')}&body=${encodeURIComponent(text)}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('העתק את ההודעה:', text)
    }
  }

  return (
    <>
      <p className="modal__note">
        <strong>{user.name}</strong> נוסף/ה לצוות בסטטוס "הוזמן". ההזמנה בתוקף {INVITE_HOURS} שעות.
        שלח/י את ההודעה:
      </p>
      <pre className="invite-msg">{text}</pre>
      <div className="invite-share">
        <a className="chip-btn" href={wa} target="_blank" rel="noreferrer">💬 שליחה בוואטסאפ</a>
        <a className="chip-btn" href={mail}>✉️ שליחה באימייל</a>
        <button className="chip-btn" onClick={copy}>{copied ? '✓ הועתק' : '📋 העתקת ההודעה'}</button>
      </div>
      {isCloud ? (
        <div className="alert-strip alert-strip--info">
          <strong>צעד אחד ב-Supabase:</strong> Authentication ← Users ← Add user ← Create new user.
          מזינים את האימייל <span dir="ltr">{user.email}</span> וסיסמה ראשונית, מסמנים
          Auto Confirm User, ושולחים את הסיסמה בנפרד. בכניסה הראשונה המשתמש יהפוך ל"פעיל"
          ויקבל אוטומטית את ההרשאות של התפקיד שלו.
        </div>
      ) : (
        <div className="alert-strip alert-strip--info">
          מצב דמו: המשתמש נשמר עד לרענון הדף. אחרי החיבור לענן הוא יישמר לצמיתות.
        </div>
      )}
      {!publicUrl() && (
        <p className="invite-foot">
          המערכת רצה כרגע רק במחשב שלך, ולכן ההודעה לא כוללת כתובת כניסה.
          כדי שהצוות ייכנס מבחוץ צריך להעלות את המערכת לאוויר – זה אחד השלבים הבאים.
        </p>
      )}
    </>
  )
}

export default function InviteModal({ onClose, presetSub = null, resendUser = null }) {
  useEscape(onClose)
  const { users, subs, inviteUser } = useCrm()

  const [invited, setInvited] = useState(resendUser)
  const [role, setRole] = useState(presetSub ? 'subcontractor' : 'staff')
  const [subId, setSubId] = useState(presetSub ? String(presetSub.id) : '')
  const [name, setName] = useState(presetSub?.name || '')
  const [email, setEmail] = useState(presetSub?.email || '')
  const [phone, setPhone] = useState(presetSub?.phone || '')
  const [title, setTitle] = useState(presetSub?.field || '')
  const [error, setError] = useState('')

  /* קבלנים שעדיין אין להם משתמש במערכת */
  const linkedSubIds = new Set(users.map((u) => u.subcontractorId).filter((id) => id != null))
  const freeSubs = subs.filter((s) => !linkedSubIds.has(s.id) || s.id === presetSub?.id)

  function pickSub(id) {
    setSubId(id)
    const sub = subs.find((s) => String(s.id) === id)
    if (sub) {
      setName(sub.name); setEmail(sub.email || ''); setPhone(sub.phone || ''); setTitle(sub.field)
    }
    setError('')
  }

  function save() {
    const cleanEmail = email.trim().toLowerCase()
    if (!name.trim()) return setError('נא להזין שם מלא')
    if (!isValidEmail(cleanEmail)) return setError('נא להזין כתובת אימייל תקינה – זה שם המשתמש לכניסה')
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return setError('כבר קיים משתמש עם האימייל הזה')
    }
    if (role === 'subcontractor' && !subId) {
      return setError('נא לבחור את כרטיס הקבלן – כך המשתמש יראה רק את המשימות שלו')
    }
    setInvited(inviteUser({
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      title: title.trim(),
      role,
      subcontractorId: role === 'subcontractor' ? Number(subId) : undefined,
    }))
  }

  return (
    <div className="modal-layer" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <header className="modal__head">
          <div>
            <h2 className="modal__title">
              {invited ? `הזמנה ל${invited.name}` : presetSub ? `הזמנת ${presetSub.name} למערכת` : 'הזמנת משתמש חדש'}
            </h2>
            <p className="modal__subtitle">תהליך ההזמנה מסעיף 2.2 באפיון</p>
          </div>
          <button className="modal__close" onClick={onClose} aria-label="סגירה">✕</button>
        </header>

        <div className="modal__body">
          {invited ? (
            <ShareStep user={invited} />
          ) : (
            <>
              {error && <div className="alert-strip" role="alert">{error}</div>}

              <div className="role-pick" role="radiogroup" aria-label="תפקיד">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    role="radio"
                    aria-checked={role === r.id}
                    className={`role-pick__opt ${role === r.id ? 'is-on' : ''}`}
                    onClick={() => { setRole(r.id); setError('') }}
                  >
                    <strong>{r.label}</strong>
                    <span>{r.desc}</span>
                  </button>
                ))}
              </div>

              {role === 'subcontractor' && (
                <label className="fld">
                  <span className="fld__label">כרטיס הקבלן</span>
                  <select className="fld__input" value={subId} onChange={(e) => pickSub(e.target.value)}>
                    <option value="">בחירת קבלן...</option>
                    {freeSubs.map((s) => <option key={s.id} value={s.id}>{s.name} – {s.field}</option>)}
                  </select>
                </label>
              )}

              <div className="form-grid">
                <label className="fld">
                  <span className="fld__label">שם מלא</span>
                  <input className="fld__input" value={name}
                    onChange={(e) => { setName(e.target.value); setError('') }} />
                </label>
                <label className="fld">
                  <span className="fld__label">תפקיד בעסק</span>
                  <input className="fld__input" value={title} placeholder="למשל: אשת מכירות"
                    onChange={(e) => setTitle(e.target.value)} />
                </label>
                <label className="fld">
                  <span className="fld__label">אימייל (שם המשתמש)</span>
                  <input className="fld__input" type="email" dir="ltr" value={email}
                    onChange={(e) => { setEmail(e.target.value); setError('') }} />
                </label>
                <label className="fld">
                  <span className="fld__label">טלפון (לשליחה בוואטסאפ)</span>
                  <input className="fld__input" type="tel" dir="ltr" value={phone}
                    onChange={(e) => setPhone(e.target.value)} />
                </label>
              </div>
            </>
          )}
        </div>

        <footer className="modal__foot">
          <button className="btn-ghost" onClick={onClose}>{invited ? 'סגירה' : 'ביטול'}</button>
          {!invited && (
            <button className="btn-primary btn-primary--inline" onClick={save}>
              יצירת הזמנה
            </button>
          )}
        </footer>
      </div>
    </div>
  )
}
