import { describe, it, expect } from 'vitest'
import {
  allowedModules, statusOf, MODULES, ADMIN_ONLY_MODULES, DEFAULT_PERMISSIONS, initialUsers,
} from './users.js'

/* הרשאות לפי תפקיד – סעיף 2 */
describe('allowedModules', () => {
  it('מנהל-על רואה את כל המודולים', () => {
    expect(allowedModules('super_admin', {})).toEqual(MODULES.map((m) => m.id))
  })

  it('צוות רואה רק את מה שפתוח לו במטריצה', () => {
    expect(allowedModules('staff', DEFAULT_PERMISSIONS)).toEqual(DEFAULT_PERMISSIONS.staff)
  })

  it('הוצאות ומשתמשים לא נפתחים לאף תפקיד מלבד מנהל-על, גם אם סומנו', () => {
    const tampered = { staff: ['leads', ...ADMIN_ONLY_MODULES], subcontractor: ['tasks', 'users'] }
    expect(allowedModules('staff', tampered)).toEqual(['leads'])
    expect(allowedModules('subcontractor', tampered)).toEqual(['tasks'])
  })

  it('קבלן משנה רואה כברירת מחדל רק משימות', () => {
    expect(allowedModules('subcontractor', DEFAULT_PERMISSIONS)).toEqual(['tasks'])
  })

  it('תפקיד לא מוכר לא רואה כלום', () => {
    expect(allowedModules('hacker', DEFAULT_PERMISSIONS)).toEqual([])
  })
})

describe('statusOf', () => {
  const now = Date.parse('2026-09-28T12:00:00Z')

  it('הזמנה בתוקף נשארת "הוזמן"', () => {
    expect(statusOf({ status: 'invited', inviteExpiresAt: '2026-09-29T00:00:00Z' }, now)).toBe('invited')
  })

  it('הזמנה שעבר תוקפה מוצגת כ"פג תוקף"', () => {
    expect(statusOf({ status: 'invited', inviteExpiresAt: '2026-09-27T00:00:00Z' }, now)).toBe('expired')
  })

  it('משתמש פעיל או מושבת לא מושפע מתאריך ההזמנה', () => {
    expect(statusOf({ status: 'active', inviteExpiresAt: '2020-01-01' }, now)).toBe('active')
    expect(statusOf({ status: 'disabled' }, now)).toBe('disabled')
  })
})

describe('צוות הדמו', () => {
  it('יש בדיוק מנהל-על פעיל אחד', () => {
    expect(initialUsers.filter((u) => u.role === 'super_admin' && u.status === 'active')).toHaveLength(1)
  })

  it('כל קבלן משנה מקושר לכרטיס קבלן', () => {
    for (const u of initialUsers.filter((u) => u.role === 'subcontractor')) {
      expect(u.subcontractorId, u.name).toBeTypeOf('number')
    }
  })

  it('אימיילים ייחודיים', () => {
    const emails = initialUsers.map((u) => u.email.toLowerCase())
    expect(new Set(emails).size).toBe(emails.length)
  })
})
