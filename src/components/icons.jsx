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
