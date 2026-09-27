#!/bin/bash
# ============================================================
# חיבור המערכת לענן (Supabase) – בלחיצה כפולה.
# שואל את שני הערכים מלוח הבקרה של Supabase ושומר אותם
# בקובץ .env.local (הקובץ לא נשלח ל-git – המפתחות נשארים אצלך).
# ============================================================
cd "$(dirname "$0")" || exit 1

clear
echo "======================================"
echo "   חיבור המערכת לענן (Supabase)"
echo "======================================"
echo ""
echo "ב-Supabase: Project Settings ← Data API / API Keys"
echo ""

read -r -p "1) הדבק את ה-Project URL ולחץ Enter: " URL
URL="$(echo "$URL" | tr -d '[:space:]')"
if [[ ! "$URL" =~ ^https://[a-z0-9-]+\.supabase\.co/?$ ]]; then
  echo ""
  echo "✗ הכתובת לא נראית נכונה. היא אמורה להיראות כך: https://abcdefgh.supabase.co"
  echo "  שום דבר לא נשמר. סגור את החלון ונסה שוב."
  read -r -p "לחץ Enter לסגירה..." _
  exit 1
fi
URL="${URL%/}"

echo ""
read -r -p "2) הדבק את המפתח הציבורי (anon / publishable) ולחץ Enter: " KEY
KEY="$(echo "$KEY" | tr -d '[:space:]')"
if [[ "$KEY" == sb_secret_* || "$KEY" == *service_role* ]]; then
  echo ""
  echo "✗ זה המפתח הסודי (secret / service_role) – אסור לשים אותו במערכת!"
  echo "  העתק במקומו את המפתח הציבורי: anon או publishable."
  read -r -p "לחץ Enter לסגירה..." _
  exit 1
fi
if [[ ${#KEY} -lt 30 ]]; then
  echo ""
  echo "✗ המפתח קצר מדי – כנראה לא הועתק במלואו. שום דבר לא נשמר."
  read -r -p "לחץ Enter לסגירה..." _
  exit 1
fi

if [[ -f .env.local ]]; then
  cp .env.local .env.local.backup
  echo ""
  echo "(החיבור הקודם גובה לקובץ .env.local.backup)"
fi

printf 'VITE_SUPABASE_URL=%s\nVITE_SUPABASE_ANON_KEY=%s\n' "$URL" "$KEY" > .env.local
chmod 600 .env.local

echo ""
echo "✓ נשמר! עכשיו סגור את חלון המערכת (אם פתוח) והפעל מחדש את הפעלה.command."
echo "  במסך ההתחברות אמור להופיע: ☁ המערכת מחוברת לענן"
echo ""
read -r -p "לחץ Enter לסגירה..." _
