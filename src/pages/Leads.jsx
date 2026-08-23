import { useMemo, useState } from 'react'
import { useCrm } from '../store/CrmContext.jsx'
import ConvertLeadModal from '../components/ConvertLeadModal.jsx'
import { IconSearch, IconClose } from '../components/icons.jsx'
import {
  pipelineStages, stageById, leadSources, sourceById,
  packageById, formatCurrency,
} from '../data/mockData.js'

const STATUS_LABELS = {
  active: { label: 'בפייפליין', tone: 'secondary' },
  won: { label: 'הומר ללקוח', tone: 'active' },
  lost: { label: 'אבד', tone: 'late' },
}

export default function Leads() {
  const { leads, convertLead } = useCrm()

  const [search, setSearch] = useState('')
  const [stage, setStage] = useState('all')
  const [source, setSource] = useState('all')
  const [status, setStatus] = useState('active')
  const [pendingLead, setPendingLead] = useState(null)   // הליד שממתין לאישור המרה
  const [result, setResult] = useState(null)             // הודעת הצלחה אחרי המרה

  /* חיפוש חופשי + סינון לפי שלב ומקור (סעיף 4) */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return leads.filter((lead) => {
      if (status !== 'all' && lead.status !== status) return false
      if (stage !== 'all' && lead.stage !== stage) return false
      if (source !== 'all' && lead.source !== source) return false
      if (!q) return true
      return [lead.name, lead.business, lead.phone, lead.email, lead.owner]
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [leads, search, stage, source, status])

  const totalValue = filtered
    .filter((l) => l.status === 'active')
    .reduce((sum, l) => sum + l.value, 0)

  const hasFilters = search || stage !== 'all' || source !== 'all' || status !== 'active'

  function clearFilters() {
    setSearch(''); setStage('all'); setSource('all'); setStatus('active')
  }

  function handleConfirm() {
    const outcome = convertLead(pendingLead.id)
    setPendingLead(null)
    if (outcome) {
      /* הליד כבר לא "בפייפליין", ובלי זה הוא היה נעלם מהרשימה
         בדיוק ברגע שבו המשתמש רוצה לראות שההמרה הצליחה. */
      setStatus('all')
      setResult({
        business: outcome.client.business,
        packageName: packageById[outcome.client.packageId].name,
        taskCount: outcome.tasks.length,
      })
    }
  }

  return (
    <div className="content__body">
      {/* הודעת הצלחה אחרי המרה */}
      {result && (
        <div className="banner" role="status">
          <span className="banner__icon">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 12.5l5 5L20 6.5" stroke="currentColor" strokeWidth="2.4"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div className="banner__body">
            <strong>{result.business} הומר לכרטיס לקוח</strong>
            <span>
              הלקוח נפתח בשלב <strong>הקמה</strong> (סעיף 3.1 באפיון), ונוצרו אוטומטית{' '}
              <span dir="ltr">{result.taskCount}</span> משימות ההקמה של חבילת {result.packageName}.
            </span>
          </div>
          <button className="banner__close" onClick={() => setResult(null)} aria-label="סגירת ההודעה">
            <IconClose width={16} height={16} />
          </button>
        </div>
      )}

      {/* שורת סינון אחת מעל הרשימה */}
      <section className="card filters">
        <div className="filters__search">
          <IconSearch width={18} height={18} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש לפי שם, עסק, טלפון או אימייל..."
            aria-label="חיפוש לידים"
          />
        </div>

        <label className="select">
          <span className="select__label">שלב</span>
          <select value={stage} onChange={(e) => setStage(e.target.value)}>
            <option value="all">כל השלבים</option>
            {pipelineStages.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>

        <label className="select">
          <span className="select__label">מקור</span>
          <select value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="all">כל המקורות</option>
            {leadSources.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>

        <label className="select">
          <span className="select__label">סטטוס</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">בפייפליין</option>
            <option value="won">הומרו ללקוח</option>
            <option value="lost">אבדו</option>
            <option value="all">הכל</option>
          </select>
        </label>

        {hasFilters && (
          <button className="chip-btn" onClick={clearFilters}>ניקוי סינון</button>
        )}
      </section>

      <section className="card">
        <div className="card__head">
          <div className="card__head-main">
            <div>
              <h2 className="card__title">
                {filtered.length === leads.length
                  ? 'כל הלידים'
                  : `${filtered.length} מתוך ${leads.length} לידים`}
              </h2>
              <p className="card__subtitle">
                שווי פוטנציאלי בתצוגה הנוכחית: <span dir="ltr">{formatCurrency(totalValue)}</span> לחודש
              </p>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-rows">
            <p>לא נמצאו לידים שמתאימים לסינון.</p>
            <button className="chip-btn" onClick={clearFilters}>ניקוי סינון</button>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ליד</th>
                  <th>מקור</th>
                  <th>שלב</th>
                  <th>חבילה מוצעת</th>
                  <th>שווי פוטנציאלי</th>
                  <th>איש מכירות</th>
                  <th>פנייה אחרונה</th>
                  <th>מעקב הבא</th>
                  <th>פעולה</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => {
                  const pkg = packageById[lead.packageId]
                  const statusInfo = STATUS_LABELS[lead.status]
                  return (
                    <tr key={lead.id}>
                      <td>
                        <div className="cell-user">
                          <span className="avatar avatar--sm">{lead.name.charAt(0)}</span>
                          <span className="cell-lead">
                            <span className="cell-lead__business">{lead.business}</span>
                            <span className="cell-lead__name">{lead.name}</span>
                          </span>
                        </div>
                      </td>
                      <td className="muted">{sourceById[lead.source].name}</td>
                      <td>
                        {lead.status === 'active' ? (
                          <span className="pill pill--secondary">{stageById[lead.stage].name}</span>
                        ) : (
                          <span className={`pill pill--${statusInfo.tone}`}>{statusInfo.label}</span>
                        )}
                      </td>
                      <td>
                        <span className={`pill pill--tier${pkg.tier}`}>{pkg.name}</span>
                      </td>
                      <td className="num"><span dir="ltr">{formatCurrency(lead.value)}</span></td>
                      <td className="muted">{lead.owner}</td>
                      <td className="muted num">{lead.lastContact}</td>
                      <td className="muted num">{lead.nextFollowUp}</td>
                      <td>
                        {lead.status === 'active' ? (
                          <button
                            className="btn-convert"
                            onClick={() => setPendingLead(lead)}
                          >
                            המרה ללקוח
                          </button>
                        ) : lead.status === 'won' ? (
                          <span className="muted">הומר</span>
                        ) : (
                          <span className="muted" title={lead.lostReason}>{lead.lostReason}</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {pendingLead && (
        <ConvertLeadModal
          lead={pendingLead}
          onConfirm={handleConfirm}
          onCancel={() => setPendingLead(null)}
        />
      )}
    </div>
  )
}
