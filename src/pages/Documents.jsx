import { useMemo, useRef, useState } from 'react'
import { useCrm } from '../store/CrmContext.jsx'
import DocumentModal from '../components/DocumentModal.jsx'
import { IconSearch } from '../components/icons.jsx'
import { DOC_FOLDERS, folderById, kindOfFile } from '../data/mockData.js'

/* ------------------------------------------------------------------
   מאגר המסמכים המרכזי – סעיף 10 באפיון.
   תיקיות מוגדרות מראש, תגיות, שיוך ללקוח, חיפוש לפי שם/תגית/
   לקוח/טווח תאריכים, והיסטוריית גרסאות.
   ------------------------------------------------------------------ */

/* החלפת קובץ בגרסה חדשה – הישנה נשמרת בהיסטוריה */
function ReplaceButton({ doc, user, onReplace }) {
  const fileRef = useRef(null)
  return (
    <>
      <input ref={fileRef} type="file" style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (!file) return
          onReplace(doc.id, {
            name: file.name,
            kind: kindOfFile(file.name, file.type),
            sizeLabel: file.size > 1024 * 1024
              ? `${(file.size / 1024 / 1024).toFixed(1)}MB`
              : `${Math.max(1, Math.round(file.size / 1024))}KB`,
            url: URL.createObjectURL(file),
          }, user.name)
        }} />
      <button className="chip-btn" onClick={() => fileRef.current.click()} title="הגרסה הקודמת תישמר בהיסטוריה">
        גרסה חדשה
      </button>
    </>
  )
}

export default function Documents({ user, onOpenClient }) {
  const { allDocuments, clients, replaceDocument } = useCrm()

  const [folder, setFolder] = useState('all')
  const [clientFilter, setClientFilter] = useState('all')
  const [tagFilter, setTagFilter] = useState(null)
  const [search, setSearch] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [expandedId, setExpandedId] = useState(null)   // שורת גרסאות פתוחה

  const clientById = useMemo(
    () => Object.fromEntries(clients.map((c) => [c.id, c])),
    [clients]
  )

  const folderCounts = useMemo(() => {
    const counts = {}
    for (const doc of allDocuments) counts[doc.folderId] = (counts[doc.folderId] || 0) + 1
    return counts
  }, [allDocuments])

  /* חיפוש חופשי לפי שם, תגית, לקוח משויך או טווח תאריכים (סעיף 10) */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return allDocuments.filter((doc) => {
      if (folder !== 'all' && doc.folderId !== folder) return false
      if (clientFilter === 'general' && doc.clientId) return false
      if (clientFilter !== 'all' && clientFilter !== 'general' && doc.clientId !== clientFilter) return false
      if (tagFilter && !doc.tags.includes(tagFilter)) return false
      if (fromDate && new Date(doc.uploadedAt) < new Date(fromDate + 'T00:00:00')) return false
      if (toDate && new Date(doc.uploadedAt) > new Date(toDate + 'T23:59:59')) return false
      if (!q) return true
      const clientName = doc.clientId ? clientById[doc.clientId]?.business || '' : ''
      return `${doc.name} ${doc.tags.join(' ')} ${clientName}`.toLowerCase().includes(q)
    })
  }, [allDocuments, folder, clientFilter, tagFilter, search, fromDate, toDate, clientById])

  const hasFilters = folder !== 'all' || clientFilter !== 'all' || tagFilter || search || fromDate || toDate
  function clearFilters() {
    setFolder('all'); setClientFilter('all'); setTagFilter(null)
    setSearch(''); setFromDate(''); setToDate('')
  }

  return (
    <div className="content__body">
      {/* התיקיות המוגדרות מראש */}
      <div className="folders">
        <button
          className={`folder-card ${folder === 'all' ? 'is-active' : ''}`}
          onClick={() => setFolder('all')}
        >
          <span className="folder-card__icon">🗂️</span>
          <span className="folder-card__name">כל המסמכים</span>
          <span className="folder-card__count" dir="ltr">{allDocuments.length}</span>
        </button>
        {DOC_FOLDERS.map((f) => (
          <button
            key={f.id}
            className={`folder-card ${folder === f.id ? 'is-active' : ''}`}
            onClick={() => setFolder(folder === f.id ? 'all' : f.id)}
          >
            <span className="folder-card__icon">{f.icon}</span>
            <span className="folder-card__name">{f.name}</span>
            <span className="folder-card__count" dir="ltr">{folderCounts[f.id] || 0}</span>
          </button>
        ))}
      </div>

      <section className="card filters">
        <div className="filters__search">
          <IconSearch width={18} height={18} />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש לפי שם קובץ, תגית או לקוח..." aria-label="חיפוש מסמכים" />
        </div>
        <label className="select">
          <span className="select__label">לקוח משויך</span>
          <select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}>
            <option value="all">הכל</option>
            <option value="general">מסמכים כלליים בלבד</option>
            {[...clients]
              .sort((a, b) => a.business.localeCompare(b.business, 'he'))
              .map((c) => <option key={c.id} value={c.id}>{c.business}</option>)}
          </select>
        </label>
        <label className="select">
          <span className="select__label">מתאריך</span>
          <input className="select__date" type="date" dir="ltr" value={fromDate}
            onChange={(e) => setFromDate(e.target.value)} />
        </label>
        <label className="select">
          <span className="select__label">עד תאריך</span>
          <input className="select__date" type="date" dir="ltr" value={toDate}
            onChange={(e) => setToDate(e.target.value)} />
        </label>
        {hasFilters && <button className="chip-btn" onClick={clearFilters}>ניקוי סינון</button>}
        <button className="btn-primary btn-primary--inline btn-add" onClick={() => setModalOpen(true)}>
          + העלאת מסמך
        </button>
      </section>

      {tagFilter && (
        <div className="renew-note">
          מסונן לפי תגית: <span className="tag-chip tag-chip--on">{tagFilter}
            <button onClick={() => setTagFilter(null)} aria-label="ביטול סינון התגית">✕</button>
          </span>
        </div>
      )}

      <section className="card">
        <div className="card__head">
          <div>
            <h2 className="card__title">
              {folder === 'all' ? 'כל המסמכים' : folderById[folder].name} · {filtered.length}
            </h2>
            <p className="card__subtitle">
              קבלות מסעיף 9 מתויקות אוטומטית בתיקיית "קבלות והוצאות"
            </p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-rows">
            <p>לא נמצאו מסמכים שמתאימים לסינון.</p>
            <button className="chip-btn" onClick={clearFilters}>ניקוי סינון</button>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>מסמך</th>
                  <th>תיקייה</th>
                  <th>לקוח משויך</th>
                  <th>תגיות</th>
                  <th>הועלה</th>
                  <th>ע"י</th>
                  <th>הרשאה</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc) => (
                  <FragmentRow key={doc.id} doc={doc} expanded={expandedId === doc.id}
                    onToggle={() => setExpandedId(expandedId === doc.id ? null : doc.id)}
                    clientById={clientById} onOpenClient={onOpenClient}
                    onTag={setTagFilter} user={user} onReplace={replaceDocument} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalOpen && (
        <DocumentModal user={user} onClose={() => setModalOpen(false)} onSaved={() => setModalOpen(false)} />
      )}
    </div>
  )
}

function FragmentRow({ doc, expanded, onToggle, clientById, onOpenClient, onTag, user, onReplace }) {
  const client = doc.clientId ? clientById[doc.clientId] : null
  return (
    <>
      <tr>
        <td>
          <div className="doc-cell">
            <span className="docs__icon">{doc.kind}</span>
            <span className="doc-cell__body">
              {doc.url ? (
                <a className="assets__link doc-cell__name" href={doc.url} target="_blank" rel="noreferrer">
                  {doc.name}
                </a>
              ) : (
                <span className="doc-cell__name" title="קובץ דמו – יוחלף בקובץ אמיתי עם חיבור השרת">{doc.name}</span>
              )}
              <span className="doc-cell__size">{doc.sizeLabel}</span>
            </span>
          </div>
        </td>
        <td className="muted">{folderById[doc.folderId]?.name}</td>
        <td>
          {client ? (
            <button className="tcard__client" onClick={() => onOpenClient(client.id)}>
              {client.business} ↗
            </button>
          ) : (
            <span className="muted">כללי</span>
          )}
        </td>
        <td>
          <span className="doc-tags">
            {doc.tags.map((tag) => (
              <button key={tag} className="tag-chip" onClick={() => onTag(tag)} title="סינון לפי התגית">
                {tag}
              </button>
            ))}
          </span>
        </td>
        <td className="muted num" dir="ltr">
          {new Date(doc.uploadedAt).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' })}
        </td>
        <td className="muted">{doc.uploadedBy}</td>
        <td><span className="pill pill--muted">{doc.visibility || 'מנהלי-על'}</span></td>
        <td>
          <span className="doc-actions">
            {doc.derived ? (
              <span className="muted" title="מנוהל דרך מודול ההוצאות">מקור: הוצאות</span>
            ) : (
              <ReplaceButton doc={doc} user={user} onReplace={onReplace} />
            )}
            {doc.versions?.length > 0 && (
              <button className="pill pill--secondary doc-versions-btn" onClick={onToggle}>
                ↺ {doc.versions.length + 1} גרסאות
              </button>
            )}
          </span>
        </td>
      </tr>
      {expanded && doc.versions?.length > 0 && (
        <tr className="versions-row">
          <td colSpan={8}>
            <div className="versions">
              <strong>היסטוריית גרסאות</strong> – הגרסאות הקודמות נשמרות ולא נמחקות:
              <ul>
                {doc.versions.map((version, i) => (
                  <li key={i}>
                    <span className="docs__icon">קודם</span>
                    {version.name} · {version.sizeLabel} · הועלה{' '}
                    <span dir="ltr">
                      {new Date(version.uploadedAt).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </span>{' '}
                    ע"י {version.uploadedBy}
                  </li>
                ))}
              </ul>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
