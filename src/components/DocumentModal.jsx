import { useEffect, useRef, useState } from 'react'
import { useCrm } from '../store/CrmContext.jsx'
import { DOC_FOLDERS, kindOfFile } from '../data/mockData.js'

/* ------------------------------------------------------------------
   טופס העלאת מסמך למאגר (סעיף 10):
   קובץ מכל סוג, תיקייה, שיוך אופציונלי ללקוח, ותגיות.
   ------------------------------------------------------------------ */
export default function DocumentModal({ user, onClose, onSaved }) {
  const { clients, addDocument } = useCrm()

  const [file, setFile] = useState(null)
  const [folder, setFolder] = useState(DOC_FOLDERS[0].id)
  const [clientId, setClientId] = useState('')
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleFile(e) {
    const selected = e.target.files?.[0]
    if (!selected) return
    setFile({
      name: selected.name,
      kind: kindOfFile(selected.name, selected.type),
      sizeLabel: selected.size > 1024 * 1024
        ? `${(selected.size / 1024 / 1024).toFixed(1)}MB`
        : `${Math.max(1, Math.round(selected.size / 1024))}KB`,
      url: URL.createObjectURL(selected),
    })
    setError('')
  }

  function addTag() {
    const value = tagInput.trim()
    if (value && !tags.includes(value)) setTags([...tags, value])
    setTagInput('')
  }

  function handleSave() {
    if (!file) return setError('נא לבחור קובץ להעלאה')
    addDocument({
      ...file,
      folderId: folder,
      clientId: clientId || null,   // שיוך ללקוח הוא אופציונלי (סעיף 10)
      tags,
      uploadedBy: user.name,
    })
    onSaved()
  }

  return (
    <div className="modal-layer" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="doc-title"
        onClick={(e) => e.stopPropagation()}>
        <header className="modal__head">
          <div>
            <h2 className="modal__title" id="doc-title">העלאת מסמך למאגר</h2>
            <p className="modal__subtitle">מועלה על ידי {user.name}</p>
          </div>
          <button className="modal__close" onClick={onClose} aria-label="סגירה">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="modal__body">
          {error && <div className="alert-strip" role="alert">{error}</div>}

          <div className="fld">
            <span className="fld__label">קובץ (PDF, תמונה, Word, Excel וכו')</span>
            <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={handleFile} />
            {file ? (
              <div className="receipt-chip">
                <span className="docs__icon">{file.kind}</span>
                <span className="receipt-chip__name">{file.name}</span>
                <span className="muted">{file.sizeLabel}</span>
                <button className="chip-btn" onClick={() => fileRef.current.click()}>החלפה</button>
              </div>
            ) : (
              <button className="chip-btn" onClick={() => fileRef.current.click()}>
                📎 בחירת קובץ
              </button>
            )}
          </div>

          <div className="form-grid">
            <label className="fld">
              <span className="fld__label">תיקייה</span>
              <select className="fld__input" value={folder} onChange={(e) => setFolder(e.target.value)}>
                {DOC_FOLDERS.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </label>

            <label className="fld">
              <span className="fld__label">שיוך ללקוח (אופציונלי)</span>
              <select className="fld__input" value={clientId} onChange={(e) => setClientId(e.target.value)}>
                <option value="">מסמך כללי של העסק</option>
                {[...clients]
                  .sort((a, b) => a.business.localeCompare(b.business, 'he'))
                  .map((c) => <option key={c.id} value={c.id}>{c.business}</option>)}
              </select>
            </label>
          </div>

          <div className="fld">
            <span className="fld__label">תגיות – הקלד ולחץ Enter</span>
            <div className="tags-input">
              {tags.map((tag) => (
                <span key={tag} className="tag-chip">
                  {tag}
                  <button onClick={() => setTags(tags.filter((t) => t !== tag))} aria-label={`הסרת ${tag}`}>✕</button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); addTag() }
                }}
                onBlur={addTag}
                placeholder={tags.length === 0 ? 'למשל: הסכם, 2026' : ''}
              />
            </div>
          </div>
        </div>

        <footer className="modal__foot">
          <button className="btn-ghost" onClick={onClose}>ביטול</button>
          <button className="btn-primary btn-primary--inline" onClick={handleSave}>
            העלאת המסמך
          </button>
        </footer>
      </div>
    </div>
  )
}
