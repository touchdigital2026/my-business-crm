/* ------------------------------------------------------------------
   החיבור לענן (Supabase).
   אם קובץ .env.local קיים עם המפתחות – המערכת עוברת למצב ענן:
   קוראת וכותבת נתונים אמיתיים. בלעדיו – מצב דמו מקומי.
   ------------------------------------------------------------------ */
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const configured = Boolean(url && anonKey && url.startsWith('http') && !url.includes('xxxxxxxxxxxx'))

export const supabase = configured ? createClient(url, anonKey) : null
export const isCloud = configured
