import { useState } from 'react'
import Login from './pages/Login.jsx'

export default function App() {
  // המשתמש המחובר. null = עדיין לא התחבר, ולכן מוצג מסך ההתחברות.
  const [user, setUser] = useState(null)

  if (!user) {
    return <Login onLogin={setUser} />
  }

  // מסך זמני להוכחת ההתחברות – בשלב הבא נחליף אותו בדשבורד אמיתי.
  return (
    <div className="welcome">
      <div className="welcome__card">
        <div className="welcome__badge">
          <svg width="27" height="27" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 12.5l5 5L20 6.5"
              stroke="#fff"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2>ההתחברות הצליחה!</h2>
        <p>
          שלום {user.name}. מסך ההתחברות עובד כמו שצריך.
          <br />
          בשלב הבא נבנה כאן את הדשבורד וניהול הלידים.
        </p>
        <button className="btn-ghost" onClick={() => setUser(null)}>
          התנתקות
        </button>
      </div>
    </div>
  )
}
