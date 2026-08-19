/* אוסף האייקונים של המערכת.
   כל אייקון הוא פונקציה שמחזירה ציור וקטורי קטן (SVG),
   כך שהוא נשאר חד בכל גודל מסך ומקבל את צבע הטקסט שסביבו. */

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export const IconDashboard = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="7.5" height="8.5" rx="2" />
    <rect x="13.5" y="3" width="7.5" height="5.5" rx="2" />
    <rect x="3" y="14.5" width="7.5" height="6.5" rx="2" />
    <rect x="13.5" y="11.5" width="7.5" height="9.5" rx="2" />
  </svg>
)

export const IconLeads = (p) => (
  <svg {...base} {...p}>
    <path d="M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20" />
    <circle cx="9" cy="7" r="3.5" />
    <path d="M17.5 11.5h4M19.5 9.5v4" />
  </svg>
)

export const IconCustomers = (p) => (
  <svg {...base} {...p}>
    <path d="M15 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20" />
    <circle cx="8.5" cy="7" r="3.5" />
    <path d="M16 4.2a3.5 3.5 0 0 1 0 6.6M18 20v-1.5a4 4 0 0 0-2.4-3.7" />
  </svg>
)

export const IconCampaigns = (p) => (
  <svg {...base} {...p}>
    <path d="M3.5 9.5v5a1.5 1.5 0 0 0 1.5 1.5h2l7 4V4l-7 4H5a1.5 1.5 0 0 0-1.5 1.5Z" />
    <path d="M17.5 9a4 4 0 0 1 0 6" />
    <path d="M7 16v4" />
  </svg>
)

export const IconTasks = (p) => (
  <svg {...base} {...p}>
    <rect x="4" y="4" width="16" height="17" rx="2.5" />
    <path d="M8 3v3M16 3v3M8.5 12.5l2 2 4-4" />
  </svg>
)

export const IconReports = (p) => (
  <svg {...base} {...p}>
    <path d="M4 20h16" />
    <path d="M7 20v-6M12 20V7M17 20v-9" />
  </svg>
)

export const IconSettings = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 14.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.8-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.8-1.1V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" />
  </svg>
)

export const IconSearch = (p) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
)

export const IconBell = (p) => (
  <svg {...base} {...p}>
    <path d="M18 8.5a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16s-2-1.5-2-6.5Z" />
    <path d="M13.7 19a2 2 0 0 1-3.4 0" />
  </svg>
)

export const IconLogout = (p) => (
  <svg {...base} {...p}>
    <path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" />
    <path d="M15.5 16.5 20 12l-4.5-4.5M20 12H9" />
  </svg>
)

export const IconMenu = (p) => (
  <svg {...base} {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)

export const IconClose = (p) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export const IconArrowUp = (p) => (
  <svg {...base} strokeWidth="2.2" {...p}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </svg>
)

export const IconArrowDown = (p) => (
  <svg {...base} strokeWidth="2.2" {...p}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </svg>
)

export const IconSubcontractors = (p) => (
  <svg {...base} {...p}>
    <path d="M3 20v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1" />
    <circle cx="9" cy="7" r="3.2" />
    <path d="M17.5 13.5 19 15l3-3" />
    <path d="M16.5 8.5h5" />
  </svg>
)

export const IconPayments = (p) => (
  <svg {...base} {...p}>
    <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
    <path d="M2.5 9.5h19" />
    <path d="M6 14.5h4" />
  </svg>
)

export const IconExpenses = (p) => (
  <svg {...base} {...p}>
    <path d="M5 21V6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5V21l-2.3-1.5L14.4 21l-2.4-1.5L9.6 21l-2.3-1.5Z" />
    <path d="M9 9h6M9 13h4" />
  </svg>
)

export const IconDocuments = (p) => (
  <svg {...base} {...p}>
    <path d="M13.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5Z" />
    <path d="M13.5 3v5.5H19" />
  </svg>
)

export const IconUsers = (p) => (
  <svg {...base} {...p}>
    <path d="M15 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20" />
    <circle cx="8.5" cy="7" r="3.5" />
    <path d="M16 4.2a3.5 3.5 0 0 1 0 6.6M18 20v-1.5a4 4 0 0 0-2.4-3.7" />
  </svg>
)

export const IconAlert = (p) => (
  <svg {...base} {...p}>
    <path d="M12 4 2.8 20h18.4L12 4Z" />
    <path d="M12 10v4" />
    <circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none" />
  </svg>
)

export const IconClock = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5.2l3.2 2" />
  </svg>
)

export const IconTrend = (p) => (
  <svg {...base} {...p}>
    <path d="M3 16.5 9 10l4 4 7.5-7.5" />
    <path d="M15 6.5h5.5V12" />
  </svg>
)

export const IconWallet = (p) => (
  <svg {...base} {...p}>
    <path d="M20 7.5V6a2 2 0 0 0-2-2H5.5A2.5 2.5 0 0 0 3 6.5v11A2.5 2.5 0 0 0 5.5 20H18a2 2 0 0 0 2-2v-1.5" />
    <path d="M21.5 10.5h-5a2.5 2.5 0 0 0 0 5h5Z" />
  </svg>
)

export const IconStorage = (p) => (
  <svg {...base} {...p}>
    <ellipse cx="12" cy="6" rx="8" ry="3" />
    <path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6" />
    <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
  </svg>
)
