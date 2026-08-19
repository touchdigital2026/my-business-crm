import { useState } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import Topbar from '../components/Topbar.jsx'
import StatCard from '../components/StatCard.jsx'
import LeadsChart from '../components/LeadsChart.jsx'
import SourcesChart from '../components/SourcesChart.jsx'
import RecentLeads from '../components/RecentLeads.jsx'
import TasksCard from '../components/TasksCard.jsx'
import { kpis } from '../data/mockData.js'

export default function Dashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState('dashboard')
  const [menuOpen, setMenuOpen] = useState(false) // רלוונטי רק למסכים קטנים

  function handleNavigate(pageId) {
    setActivePage(pageId)
    setMenuOpen(false)
  }

  return (
    <div className="app">
      <Sidebar
        active={activePage}
        onNavigate={handleNavigate}
        user={user}
        onLogout={onLogout}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <main className="content">
        <Topbar user={user} onOpenMenu={() => setMenuOpen(true)} />

        {activePage === 'dashboard' ? (
          <div className="content__body">
            {/* שורת המדדים הראשיים */}
            <div className="kpi-grid">
              {kpis.map((kpi) => (
                <StatCard key={kpi.id} {...kpi} />
              ))}
            </div>

            {/* גרף מרכזי + פילוח מקורות */}
            <div className="grid-2">
              <LeadsChart />
              <SourcesChart />
            </div>

            {/* טבלת לידים + משימות היום */}
            <div className="grid-2 grid-2--wide">
              <RecentLeads />
              <TasksCard />
            </div>
          </div>
        ) : (
          /* שאר המסכים ייבנו בשלבים הבאים */
          <div className="content__body">
            <section className="card empty-state">
              <div className="empty-state__badge">🚧</div>
              <h2>המסך הזה עדיין בבנייה</h2>
              <p>
                בשלב הבא של הפיתוח נבנה כאן את המסך המלא.
                בינתיים אפשר לחזור לדשבורד מהתפריט.
              </p>
              <button className="btn-primary btn-primary--inline" onClick={() => setActivePage('dashboard')}>
                חזרה לדשבורד
              </button>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
