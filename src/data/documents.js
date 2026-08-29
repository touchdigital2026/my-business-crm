/* ------------------------------------------------------------------
   מאגר המסמכים המרכזי (סעיף 10 באפיון).
   מבנה תיקיות מוגדר מראש, תיוג, שיוך ללקוח והיסטוריית גרסאות.

   בנוסף למסמכים שכאן, קבלות ההוצאות (סעיף 9) נכנסות אוטומטית
   לתיקיית "קבלות והוצאות" – הגזירה נעשית במחסן המרכזי.
   ------------------------------------------------------------------ */

/* מבנה התיקיות המוגדר מראש, כלשון סעיף 10 */
export const DOC_FOLDERS = [
  { id: 'contracts', name: 'חוזים', icon: '📄' },
  { id: 'receipts', name: 'קבלות והוצאות', icon: '🧾' },
  { id: 'invoices', name: 'חשבוניות ללקוחות', icon: '💳' },
  { id: 'branding', name: 'חומרי מיתוג', icon: '🎨' },
  { id: 'legal', name: 'מסמכים משפטיים / עסקיים', icon: '⚖️' },
]
export const folderById = Object.fromEntries(DOC_FOLDERS.map((f) => [f.id, f]))

/* זיהוי סוג הקובץ מהשם/סוג – תומך בכל סוג קובץ (סעיף 10) */
export function kindOfFile(name, mime = '') {
  const ext = name.split('.').pop().toLowerCase()
  if (mime.includes('pdf') || ext === 'pdf') return 'PDF'
  if (mime.startsWith('image') || ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'תמונה'
  if (['doc', 'docx'].includes(ext)) return 'Word'
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'Excel'
  if (['ppt', 'pptx'].includes(ext)) return 'מצגת'
  if (['zip', 'rar'].includes(ext)) return 'ZIP'
  return 'קובץ'
}

function hashOf(id) {
  let h = 0
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 9973
  return h
}

const monthsAgoDate = (months, day) => {
  const d = new Date()
  d.setMonth(d.getMonth() - months)
  d.setDate(day)
  d.setHours(10, 0, 0, 0)
  return d.toISOString()
}

export function buildDocuments(clients) {
  const docs = []
  const admin = 'מנהל המערכת'

  /* הסכם התקשרות לכל לקוח – משויך לכרטיס הלקוח, מתוארך ליום ההצטרפות */
  for (const client of clients) {
    docs.push({
      id: `D-contract-${client.id}`,
      name: `הסכם התקשרות – ${client.business}.pdf`,
      kind: 'PDF',
      sizeLabel: `${170 + (hashOf(client.id) % 90)}KB`,
      folderId: 'contracts',
      clientId: client.id,
      tags: ['הסכם'],
      uploadedAt: client.startDate,
      uploadedBy: admin,
      visibility: 'מנהלי-על',
      versions: [],
    })
  }

  /* מסמכים כלליים של העסק (ללא שיוך ללקוח) */
  const general = [
    { id: 'D-brand-logo', name: 'לוגו ראשי.png', kind: 'תמונה', sizeLabel: '840KB', folderId: 'branding', tags: ['מיתוג', 'לוגו'], months: 6, day: 12, visibility: 'כולם' },
    { id: 'D-brand-deck', name: 'מצגת תדמית.pptx', kind: 'מצגת', sizeLabel: '6MB', folderId: 'branding', tags: ['מיתוג', 'מצגת'], months: 5, day: 20, visibility: 'כולם' },
    { id: 'D-brand-kit', name: 'ערכת מיתוג מלאה.zip', kind: 'ZIP', sizeLabel: '18MB', folderId: 'branding', tags: ['מיתוג'], months: 4, day: 8, visibility: 'כולם' },
    { id: 'D-legal-license', name: 'רישיון עסק.pdf', kind: 'PDF', sizeLabel: '310KB', folderId: 'legal', tags: ['משפטי', 'רישיון'], months: 5, day: 4, visibility: 'מנהלי-על' },
    { id: 'D-legal-insurance', name: 'פוליסת ביטוח אחריות מקצועית.pdf', kind: 'PDF', sizeLabel: '520KB', folderId: 'legal', tags: ['משפטי', 'ביטוח'], months: 3, day: 16, visibility: 'מנהלי-על' },
  ]
  for (const doc of general) {
    docs.push({
      ...doc,
      clientId: null,
      uploadedAt: monthsAgoDate(doc.months, doc.day),
      uploadedBy: admin,
      versions: [],
    })
  }

  /* מסמכים נוספים של לקוח לדוגמה (מזרחי נדל"ן) */
  docs.push({
    id: 'D-c01-invoice',
    name: 'חשבונית אחרונה – מזרחי נדל"ן.pdf',
    kind: 'PDF',
    sizeLabel: '84KB',
    folderId: 'invoices',
    clientId: 'C01',
    tags: ['חשבונית'],
    uploadedAt: monthsAgoDate(0, 5),
    uploadedBy: admin,
    visibility: 'מנהלי-על',
    versions: [],
  })
  docs.push({
    id: 'D-c01-brand',
    name: 'קבצי מיתוג – מזרחי נדל"ן.zip',
    kind: 'ZIP',
    sizeLabel: '11MB',
    folderId: 'branding',
    clientId: 'C01',
    tags: ['מיתוג'],
    uploadedAt: monthsAgoDate(3, 9),
    uploadedBy: admin,
    visibility: 'כולם',
    versions: [],
  })

  return docs
}
