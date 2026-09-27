import { useState } from 'react'
import { supabase, isCloud } from '../lib/supabase.js'
import { cloudLogin } from '../lib/persist.js'
import { initialUsers, DEMO_PASSWORD, statusOf } from '../data/users.js'

/* ------------------------------------------------------------------
   מצב דמו: כל משתמשי צוות הדמו נכנסים עם אותה סיסמה, וכל אחד
   רואה את המערכת לפי התפקיד שלו (סעיף 2).
   ------------------------------------------------------------------ */
const DEMO_LOGINS = [
  { email: 'admin@crm.co.il', label: 'מנהל-על' },
  { email: 'yael@crm.co.il', label: 'צוות' },
  { email: 'alon.social@gmail.com', label: 'קבלן משנה' },
]

const NO_ACCESS = 'לחשבון הזה אין גישה למערכת. פנה למנהל המערכת.'

/* הפרטים שהמערכת צריכה על המשתמש המחובר */
const sessionUserOf = (member, remember) => ({
  id: member.id,
  email: member.email,
  name: member.name,
  role: member.role,
  subcontractorId: member.subcontractorId,
  remember,
})

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  // בדיקת תקינות של השדות לפני שליחה
  function validate() {
    const next = {}
    if (!email.trim()) next.email = 'נא להזין כתובת אימייל'
    else if (!isValidEmail(email.trim())) next.email = 'כתובת האימייל אינה תקינה'

    if (!password) next.password = 'נא להזין סיסמה'
    else if (password.length < 6) next.password = 'הסיסמה חייבת להכיל לפחות 6 תווים'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')
    if (!validate()) return

    setLoading(true)

    /* מצב ענן: התחברות אמיתית ומאובטחת מול Supabase (סעיף 15) */
    if (isCloud) {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (error) {
          setLoading(false)
          setFormError(
            error.message.includes('Invalid')
              ? 'האימייל או הסיסמה שגויים. נסה שוב.'
              : 'לא ניתן להתחבר לשרת הענן – בדוק את החיבור לאינטרנט ואת המפתחות בקובץ .env.local'
          )
          return
        }
        /* זיהוי התפקיד מטבלת הצוות. מי שלא רשום או הושבת – לא נכנס */
        const result = await cloudLogin()
        let member = result.member
        if (result.legacy) {
          /* הסכמה בענן עדיין בגרסה הישנה (לפני ההרשאות) – נכנסים כמנהל-על */
          console.warn('טבלת הצוות לא קיימת בענן – יש להריץ מחדש את supabase/schema.sql')
          member = { id: 'owner', email: email.trim(), name: email.trim().split('@')[0], role: 'super_admin' }
        } else if (result.error) {
          throw result.error
        }
        if (!member) {
          await supabase.auth.signOut()
          setLoading(false)
          setFormError(NO_ACCESS)
          return
        }
        setLoading(false)
        onLogin(sessionUserOf(member, remember))
        return
      } catch {
        setLoading(false)
        setFormError('לא ניתן להתחבר לשרת הענן – בדוק את החיבור לאינטרנט ואת המפתחות בקובץ .env.local')
        return
      }
    }

    // מצב דמו: השהיה קצרה שמדמה פנייה לשרת
    await new Promise((resolve) => setTimeout(resolve, 700))
    setLoading(false)

    const member = initialUsers.find((u) => u.email === email.trim().toLowerCase())
    if (!member || password !== DEMO_PASSWORD) {
      setFormError('האימייל או הסיסמה שגויים. נסה שוב.')
      return
    }
    if (['disabled', 'expired'].includes(statusOf(member))) {
      setFormError(NO_ACCESS)
      return
    }

    onLogin(sessionUserOf(member, remember))
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="brand">
          <div className="brand__mark">CRM</div>
          <div>
            <div className="brand__name">מערכת ניהול לקוחות</div>
            <div className="brand__tag">שיווק דיגיטלי</div>
          </div>
        </div>

        <h1 className="login-title">ברוך הבא 👋</h1>
        <p className="login-subtitle">התחבר לחשבון שלך כדי לנהל לידים, לקוחות וקמפיינים.</p>

        {formError && (
          <div className="alert" role="alert">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path d="M12 7.5v5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="16.3" r="1.15" fill="currentColor" />
            </svg>
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="field__label" htmlFor="email">
              אימייל
            </label>
            <input
              id="email"
              type="email"
              className={`field__input ${errors.email ? 'field__input--error' : ''}`}
              placeholder="name@company.com"
              dir="ltr"
              autoComplete="email"
              value={email}
              disabled={loading}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors({ ...errors, email: undefined })
              }}
            />
            {errors.email && <span className="field__error">{errors.email}</span>}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="password">
              סיסמה
            </label>
            <div className="field__wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`field__input ${errors.password ? 'field__input--error' : ''}`}
                placeholder="••••••••"
                dir="ltr"
                autoComplete="current-password"
                value={password}
                disabled={loading}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors({ ...errors, password: undefined })
                }}
              />
              <button
                type="button"
                className="field__toggle"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? 'הסתר' : 'הצג'}
              </button>
            </div>
            {errors.password && <span className="field__error">{errors.password}</span>}
          </div>

          <div className="login-row">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span className="checkbox__box">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M5 12.5l4.5 4.5L19 7"
                    stroke="#fff"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span>זכור אותי</span>
            </label>

            <button
              type="button"
              className="link-btn"
              onClick={() => alert('שחזור סיסמה יתווסף בשלב הבא של הפיתוח.')}
            >
              שכחתי סיסמה
            </button>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true" />
                מתחבר...
              </>
            ) : (
              'התחברות'
            )}
          </button>
        </form>

        <div className="login-hint">
          {isCloud ? (
            <>☁ המערכת מחוברת לענן – התחבר עם המשתמש שיצרת ב-Supabase</>
          ) : (
            <>
              מצב דמו · סיסמה לכל המשתמשים: <code>{DEMO_PASSWORD}</code>
              <div className="login-hint__users">
                {DEMO_LOGINS.map((demo) => (
                  <button
                    key={demo.email}
                    type="button"
                    className="login-hint__user"
                    onClick={() => {
                      setEmail(demo.email)
                      setPassword(DEMO_PASSWORD)
                      setErrors({})
                      setFormError('')
                    }}
                  >
                    <strong>{demo.label}</strong>
                    <code>{demo.email}</code>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
