import { useState } from 'react'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'

export default function App() {
  // המשתמש המחובר. null = עדיין לא התחבר, ולכן מוצג מסך ההתחברות.
  const [user, setUser] = useState(null)

  if (!user) {
    return <Login onLogin={setUser} />
  }

  return <Dashboard user={user} onLogout={() => setUser(null)} />
}
