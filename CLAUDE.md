# CRM – הנחיות פיתוח

מערכת CRM לעסק שיווק דיגיטלי. React + Vite, עם Supabase כמסד נתונים.
הממשק כולו בעברית (RTL), וגם ההערות בקוד בעברית – שמור על הסגנון.
בעל המערכת אינו מתכנת: הסברים אליו בעברית פשוטה, צעד אחר צעד.

## ענפים
- הענף הראשי: `claude/crm-login-screen-4g0sia` (ברירת המחדל ב-GitHub).
  `הפעלה.command` במחשב של בעל המערכת מושך ממנו – כל עבודה צריכה להגיע אליו.

## לפני כל דחיפה
- `npm test` – בדיקות האפליקציה (Vitest). חייבות לעבור.
- `npm run build` – חייב להצליח.
- שינוי ב-`supabase/schema.sql` או בהרשאות: להריץ את בדיקות האבטחה
  (`supabase/tests/security.sql`, ראה `.github/workflows/ci.yml`).
- GitHub Actions מריץ את כל אלה אוטומטית בכל דחיפה.

## כללים שאסור לשבור
- `supabase/schema.sql` חייב להיות בטוח להרצה חוזרת על פרויקט קיים
  (`if not exists`, `create or replace`, `drop policy if exists`). בעל המערכת מריץ
  אותו ידנית ב-SQL Editor. אסור `drop table` או מחיקת נתונים.
- כל טבלה חדשה: RLS + policy לפי `crm_can(...)` + grant ל-authenticated
  (הפרויקט נוצר עם "Automatically expose new tables" כבוי) + בדיקה ב-security.sql.
- שדה חדש ברשומה: לעדכן את שני המיפויים ב-`src/lib/persist.js` (to/from).
  הבדיקה `persist.test.js` תיכשל אם שדה נשכח.
- `supabase/seed.sql` נוצר אוטומטית: `node scripts/generate-seed.mjs > supabase/seed.sql`.
- הוצאות וניהול משתמשים – למנהלי-על בלבד (`ADMIN_ONLY_MODULES` + `crm_can`).
- לעולם לא להכניס מפתחות לקוד. `.env.local` לא נכנס ל-git.

## מבנה
- `src/store/CrmContext.jsx` – כל הנתונים והפעולות העסקיות.
- `src/lib/persist.js` – שמירה/טעינה מהענן.
- `src/data/*.js` – נתוני דמו וקבועים (חבילות, SLA, תפקידים).
- `src/pages/*` – מסך לכל מודול. `src/components/*` – רכיבים משותפים.
