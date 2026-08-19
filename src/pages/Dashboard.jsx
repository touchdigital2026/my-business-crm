import { useState } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import Topbar from '../components/Topbar.jsx'
import StatCard from '../components/StatCard.jsx'
import PipelineCard from '../components/PipelineCard.jsx'
import PackagesCard from '../components/PackagesCard.jsx'
import FinanceChart from '../components/FinanceChart.jsx'
import TasksByAssignee from '../components/TasksByAssignee.jsx'
import AtRiskClients from '../components/AtRiskClients.jsx'
import SubcontractorsCard from '../components/SubcontractorsCard.jsx'
import { IconCustomers, IconWallet, IconTrend, IconAlert } from '../components/icons.jsx'
import {
  clientsByPackage, revenue, expenses, tasks, atRiskClients,
} from '../data/mockData.js'

const PAGE_TITLES = {
  dashboard: 'דשבורד',
  leads: 'לידים',
  clients: 'לקוחות',
  tasks: 'משימות',
  subcontractors: 'קבלני משנה',
  payments: 'תשלומים',
  expenses: 'הוצאות',
  documents: 'מסמכים',
  users: 'משתמשים',
  reports: 'דוחות',
}

export default function Dashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState('dashboard')
  const [menuOpen, setMenuOpen] = useState(false)

  function handleNavigate(pageId) {
    setActivePage(pageId)
    setMenuOpen(false)
  }

  /* ארבעת המדדים הראשיים, נגזרים מהנתונים של סעיף 13 */
  const activeClients = clientsByPackage.reduce((sum, c) => sum + c.active, 0)
  const inSetup = clientsByPackage.reduce((sum, c) => sum + c.inSetup, 0)
  const profit = revenue.actual - expenses.total

  const kpis = [
    {
      id: 'clients',
      label: 'לקוחות פעילים',
      value: activeClients,
      format: 'number',
      delta: 14.3,
      goodDirection: 'up',
      trend: [16, 17, 17, 19, 20, 20, 21, 22, 22, 23, 23, 24],
      Icon: IconCustomers,
      note: `${inSetup} נוספים בהקמה`,
    },
    {
      id: 'revenue',
      label: 'הכנסה חודשית',
      value: revenue.actual,
      format: 'currency',
      delta: 7.6,
      goodDirection: 'up',
      trend: [52, 54, 55, 57, 58, 59, 61, 63, 64, 66, 68, 71],
      Icon: IconWallet,
      note: `+ תחזית ₪${revenue.forecast.toLocaleString('he-IL')} מהקמות`,
    },
    {
      id: 'profit',
      label: 'רווח החודש',
      value: profit,
      format: 'currency',
      delta: 8.9,
      goodDirection: 'up',
      trend: [29, 31, 32, 33, 35, 35, 37, 38, 38, 39, 41, 43],
      Icon: IconTrend,
      note: `הוצאות ₪${expenses.total.toLocaleString('he-IL')}`,
    },
    {
      id: 'overdue',
      label: 'משימות באיחור',
      value: tasks.overdue,
      format: 'number',
      delta: -16.7,
      goodDirection: 'down',
      trend: [8, 9, 7, 8, 7, 7, 6, 7, 6, 6, 6, 5],
      Icon: IconAlert,
      tone: 'danger',
      note: `${atRiskClients.length} לקוחות בסיכון תשלום`,
    },
  ]

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
        <Topbar
          user={user}
          breadcrumbs={['דשבורד', PAGE_TITLES[activePage]].filter(
            (c, i, arr) => i === 0 || c !== arr[0]
          )}
          onOpenMenu={() => setMenuOpen(true)}
        />

        {activePage === 'dashboard' ? (
          <div className="content__body">
            <div className="kpi-grid">
              {kpis.map((kpi) => (
                <StatCard key={kpi.id} {...kpi} />
              ))}
            </div>

            {/* 13.2 + 13.3 – פיננסים | 13.5 – פייפליין */}
            <div className="grid-2">
              <FinanceChart />
              <PipelineCard />
            </div>

            {/* 13.1 – חבילות | 13.4 – משימות לפי אחראי */}
            <div className="grid-2">
              <PackagesCard />
              <TasksByAssignee />
            </div>

            {/* 13.6 – לקוחות בסיכון | 13.7 – קבלני משנה */}
            <div className="grid-2">
              <AtRiskClients />
              <SubcontractorsCard />
            </div>
          </div>
        ) : (
          <div className="content__body">
            <section className="card empty-state">
              <div className="empty-state__badge">🚧</div>
              <h2>מסך "{PAGE_TITLES[activePage]}" עדיין בבנייה</h2>
              <p>
                בשלב הבא של הפיתוח נבנה כאן את המסך המלא.
                בינתיים אפשר לחזור לדשבורד מהתפריט.
              </p>
              <button
                className="btn-primary btn-primary--inline"
                onClick={() => setActivePage('dashboard')}
              >
                חזרה לדשבורד
              </button>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
