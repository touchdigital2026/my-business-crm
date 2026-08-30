import { useEffect, useRef, useState } from 'react'
import { useCrm } from '../store/CrmContext.jsx'
import { PAY_METHODS } from '../data/mockData.js'

/* ------------------------------------------------------------------
   טופס רישום הוצאה חדשה – כל השדות מסעיף 9.1:
   תאריך, סכום, קטגוריה (+הוספת קטגוריה חדשה), ספק (חופשי או קבלן
   משנה קיים), אמצעי תשלום, קובץ קבלה, הערות, ומי הזין.
   ------------------------------------------------------------------ */
export default function ExpenseModal({ user, onClose, onSaved }) {
  const { expenseCategories, addExpense, addExpenseCategory, subs: subcontractors } = useCrm()

  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(expenseCategories[0].id)
  const [newCategory, setNewCategory] = useState('')
  const [vendor, setVendor] = useState('')
  const [method, setMethod] = useState(PAY_METHODS[1])
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')
  const [receipt, setReceipt] = useState(null)
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setReceipt({
      name: file.name,
      kind: file.type.includes('pdf') ? 'PDF' : 'תמונה',
      size: `${Math.max(1, Math.round(file.size / 1024))}KB`,
      url: URL.createObjectURL(file),
    })
  }

  function handleSave() {
    const value = Number(amount)
    if (!value || value <= 0) return setError('נא להזין סכום תקין')
    if (category === '__new' && !newCategory.trim()) return setError('נא להזין שם לקטגוריה החדשה')
    if (!vendor.trim()) return setError('נא להזין ספק / גורם מקבל תשלום')

    const categoryId = category === '__new' ? addExpenseCategory(newCategory.trim()) : category
    const sub = subcontractors.find((s) => s.name === vendor.trim())

    addExpense({
      amount: value,
      categoryId,
      vendor: vendor.trim(),
      subcontractorId: sub?.id,
      method,
      date: new Date(date + 'T12:00:00').toISOString(),
      notes: notes.trim(),
      receipt,
      enteredBy: user.name,   // מי הזין את ההוצאה (סעיף 9.1)
    })
    onSaved()
  }

  return (
    <div className="modal-layer" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="expense-title"
        onClick={(e) => e.stopPropagation()}>
        <header className="modal__head">
          <div>
            <h2 className="modal__title" id="expense-title">רישום הוצאה חדשה</h2>
            <p className="modal__subtitle">מוזן על ידי {user.name}</p>
          </div>
          <button className="modal__close" onClick={onClose} aria-label="סגירה">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="modal__body">
          {error && <div className="alert-strip" role="alert">{error}</div>}

          <div className="form-grid">
            <label className="fld">
              <span className="fld__label">סכום (כולל מע"מ) ₪</span>
              <input className="fld__input" type="number" min="0" dir="ltr" value={amount}
                onChange={(e) => { setAmount(e.target.value); setError('') }} placeholder="0" />
            </label>

            <label className="fld">
              <span className="fld__label">תאריך ההוצאה</span>
              <input className="fld__input" type="date" dir="ltr" value={date}
                onChange={(e) => setDate(e.target.value)} />
            </label>

            <label className="fld">
              <span className="fld__label">קטגוריה</span>
              <select className="fld__input" value={category}
                onChange={(e) => { setCategory(e.target.value); setError('') }}>
                {expenseCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
                <option value="__new">+ הוספת קטגוריה חדשה...</option>
              </select>
            </label>

            {category === '__new' && (
              <label className="fld">
                <span className="fld__label">שם הקטגוריה החדשה</span>
                <input className="fld__input" value={newCategory}
                  onChange={(e) => { setNewCategory(e.target.value); setError('') }}
                  placeholder="למשל: הדרכות וקורסים" />
              </label>
            )}

            <label className="fld">
              <span className="fld__label">ספק / גורם מקבל תשלום</span>
              <input className="fld__input" value={vendor} list="subs-list"
                onChange={(e) => { setVendor(e.target.value); setError('') }}
                placeholder="שם חופשי, או בחירת קבלן משנה" />
              {/* קישור לכרטיס קבלן משנה קיים (סעיף 9.1) */}
              <datalist id="subs-list">
                {subcontractors.map((sub) => <option key={sub.id} value={sub.name} />)}
              </datalist>
            </label>

            <label className="fld">
              <span className="fld__label">אמצעי תשלום</span>
              <select className="fld__input" value={method} onChange={(e) => setMethod(e.target.value)}>
                {PAY_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </label>
          </div>

          {/* צירוף קבלה – כולל צילום ישיר מהנייד (סעיפים 9.1–9.2) */}
          <div className="fld">
            <span className="fld__label">קבלה / חשבונית</span>
            <input ref={fileRef} type="file" accept="image/*,application/pdf" capture="environment"
              style={{ display: 'none' }} onChange={handleFile} />
            {receipt ? (
              <div className="receipt-chip">
                <span className="docs__icon">{receipt.kind}</span>
                <span className="receipt-chip__name">{receipt.name}</span>
                <button className="chip-btn" onClick={() => fileRef.current.click()}>החלפה</button>
              </div>
            ) : (
              <button className="chip-btn" onClick={() => fileRef.current.click()}>
                📎 צירוף קובץ (או צילום מהנייד)
              </button>
            )}
          </div>

          <label className="fld">
            <span className="fld__label">הערות</span>
            <textarea className="fld__input" rows={2} value={notes}
              onChange={(e) => setNotes(e.target.value)} placeholder="הערות חופשיות..." />
          </label>
        </div>

        <footer className="modal__foot">
          <button className="btn-ghost" onClick={onClose}>ביטול</button>
          <button className="btn-primary btn-primary--inline" onClick={handleSave}>
            שמירת ההוצאה
          </button>
        </footer>
      </div>
    </div>
  )
}
