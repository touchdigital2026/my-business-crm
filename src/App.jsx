import { useState } from 'react'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import { CrmProvider } from './store/CrmContext.jsx'

export default function App() {
  // המשתמש המחובר. null = עדיין לא התחבר, ולכן מוצג מסך ההתחברות.
  const [user, setUser] = useState(null)

  if (!user) {
    return <Login onLogin={setUser} />
  }

  /* CrmProvider מחזיק את הלידים, הלקוחות והמשימות במקום אחד,
     כך שכל המסכים רואים את אותם נתונים ומתעדכנים יחד. */
  return (
    <CrmProvider>
      <Dashboard user={user} onLogout={() => setUser(null)} />
    </CrmProvider>
  )
}
