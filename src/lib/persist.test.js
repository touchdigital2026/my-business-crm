import { describe, it, expect } from 'vitest'
import { mappers } from './persist.js'
import {
  initialLeads, initialClients, initialTasks, initialPayments, initialExpenses, initialDocuments,
} from '../data/mockData.js'
import { initialUsers } from '../data/users.js'

/* ------------------------------------------------------------------
   כל רשומה שנשמרת לענן חייבת לחזור ממנו זהה.
   בדיקה זו תופסת שדה שנשכח במיפוי – באג שהיה מוחק נתונים בשקט.
   ------------------------------------------------------------------ */
const { to, from } = mappers

/* שדות שמסולקים בכוונה או מנורמלים בשמירה */
function comparable(record) {
  const out = {}
  for (const [key, value] of Object.entries(record)) {
    if (value === undefined || value === null) continue
    out[key] = value
  }
  return out
}

const cases = [
  ['lead', initialLeads],
  ['client', initialClients],
  ['task', initialTasks],
  ['payment', initialPayments],
  ['expense', initialExpenses.map((e) => ({ ...e, receipt: e.receipt ? { name: e.receipt.name, kind: e.receipt.kind, size: e.receipt.size || null } : null }))],
  ['document', initialDocuments],
  ['user', initialUsers],
]

describe('מיפוי לענן הלוך-חזור', () => {
  for (const [kind, records] of cases) {
    it(`${kind}: ${records.length} רשומות חוזרות בלי לאבד שדות`, () => {
      expect(records.length).toBeGreaterThan(0)
      for (const record of records) {
        const back = from[kind](to[kind](record))
        const expected = comparable(record)
        const actual = comparable(back)
        for (const key of Object.keys(expected)) {
          expect(actual[key], `${kind} ${record.id} – השדה "${key}"`).toEqual(expected[key])
        }
      }
    })
  }

  it('כתובת זמנית של קובץ (blob:) לא נשמרת בענן', () => {
    const row = to.document({ ...initialDocuments[0], url: 'blob:http://localhost/123' })
    expect(row.url).toBeNull()
  })

  it('הרשאות תפקיד נשמרות כמו שהן', () => {
    const p = { role: 'staff', modules: ['leads', 'tasks'] }
    expect(from.permissions(to.permissions(p))).toEqual(p)
  })
})
