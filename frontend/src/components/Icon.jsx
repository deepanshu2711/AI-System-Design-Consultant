const PATHS = {
  clipboard: (
    <>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
    </>
  ),
  activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  server: (
    <>
      <rect x="2" y="3" width="20" height="7" rx="1.5" />
      <rect x="2" y="14" width="20" height="7" rx="1.5" />
      <path d="M6 6.5h.01M6 17.5h.01" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
      <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
    </>
  ),
  zap: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  layers: (
    <>
      <path d="m12 2 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 17 9 5 9-5" />
    </>
  ),
  code: <path d="m9 18-6-6 6-6M15 6l6 6-6 6" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a13 13 0 0 1 0 18 13 13 0 0 1 0-18Z" />
    </>
  ),
  "hard-drive": (
    <>
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M5.5 5h13L22 12v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-6L5.5 5Z" />
      <path d="M6 16h.01M10 16h.01" />
    </>
  ),
  boxes: (
    <>
      <path d="M2.5 7 12 2l9.5 5-9.5 5-9.5-5Z" />
      <path d="M2.5 7v10L12 22V12M21.5 7v10L12 22" />
    </>
  ),
  "arrow-right": <path d="M5 12h14M13 6l6 6-6 6" />,
  sparkles: (
    <path d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1M12 8l1.2 3.3L16.5 12l-3.3 1.2L12 16.5l-1.2-3.3L7.5 12l3.3-1.2L12 8Z" />
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  loader: (
    <path d="M12 2v4M12 18v4M4.9 4.9l2.9 2.9M16.2 16.2l2.9 2.9M2 12h4M18 12h4M4.9 19.1l2.9-2.9M16.2 7.8l2.9-2.9" />
  ),
  "message-circle": <path d="M21 11.5a8.38 8.38 0 0 1-8.8 8.4 8.5 8.5 0 0 1-4.2-1L3 20l1.2-4.8A8.38 8.38 0 1 1 21 11.5Z" />,
  "chevron-down": <path d="m6 9 6 6 6-6" />,
  gauge: (
    <>
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M12 3a9 9 0 0 0-9 9M12 3a9 9 0 0 1 9 9M14.5 11.5 18 8" />
    </>
  ),
  network: (
    <>
      <circle cx="12" cy="5" r="2.5" />
      <circle cx="5" cy="19" r="2.5" />
      <circle cx="19" cy="19" r="2.5" />
      <path d="M12 7.5 7 16.5M12 7.5l5 9M7.5 19h9" />
    </>
  ),
  x: <path d="M18 6 6 18M6 6l12 12" />,
}

export default function Icon({ name, size = 18, strokeWidth = 1.8, className = "" }) {
  const path = PATHS[name]
  if (!path) return null
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {path}
    </svg>
  )
}
