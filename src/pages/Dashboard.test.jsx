import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, within, cleanup, fireEvent } from '@testing-library/react'
import { CrmProvider } from '../store/CrmContext.jsx'
import Dashboard from './Dashboard.jsx'
import { initialUsers } from '../data/users.js'

/* ------------------------------------------------------------------
   מה כל תפקיד רואה בפועל על המסך (סעיף 2).
   ------------------------------------------------------------------ */
afterEach(cleanup)

const byEmail = (email) => initialUsers.find((u) => u.email === email)

function renderAs(email) {
  const user = byEmail(email)
  render(
    <CrmProvider user={user}>
      <Dashboard user={user} onLogout={() => {}} />
    </CrmProvider>
  )
  const nav = screen.getByRole('navigation', { name: 'ניווט ראשי' })
  const labels = within(nav).getAllByRole('button').map((b) => b.querySelector('.nav-item__label').textContent)
  return { user, labels }
}

describe('ניווט לפי תפקיד', () => {
  it('מנהל-על רואה את כל עשרת המודולים', () => {
    const { labels } = renderAs('admin@crm.co.il')
    expect(labels).toHaveLength(10)
    expect(labels).toContain('משתמשים')
    expect(labels).toContain('הוצאות')
  })

  it('צוות לא רואה כספים ולא ניהול משתמשים, ונוחת במודול הראשון שלו', () => {
    const { labels } = renderAs('yael@crm.co.il')
    expect(labels).toEqual(['לידים', 'לקוחות', 'משימות', 'קבלני משנה', 'מסמכים'])
    expect(screen.getByRole('navigation', { name: 'נתיב ניווט' }).textContent).toContain('לידים')
  })

  it('קבלן משנה רואה רק את המשימות שהוקצו לו, בלי קישור לכרטיס הלקוח', () => {
    const { user, labels } = renderAs('alon.social@gmail.com')
    expect(labels).toEqual(['משימות'])
    const assignees = [...document.querySelectorAll('.tcard__assignee')].map((el) => el.textContent)
    expect(assignees.length).toBeGreaterThan(0)
    for (const name of assignees) expect(name).toContain(user.name)
    expect(document.querySelector('button.tcard__client')).toBeNull()
  })
})

describe('מסך משתמשים', () => {
  it('מנהל-על לא יכול לשנות את התפקיד של עצמו או להשבית את עצמו', () => {
    renderAs('admin@crm.co.il')
    fireEvent.click(screen.getByRole('button', { name: /משתמשים/ }))
    const selfRow = screen.getByText('(את/ה)').closest('tr')
    fireEvent.click(within(selfRow).getByRole('button', { name: 'עריכה' }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByDisplayValue('מנהל-על').disabled).toBe(true)
    expect(within(dialog).queryByText('השבתת משתמש')).toBeNull()
  })
})
