import React from 'react'

interface IconProps {
  d?: string
  size?: number
  fill?: string
  stroke?: string
  sw?: number
  children?: React.ReactNode
  style?: React.CSSProperties
  className?: string
}

const IconBase = ({ d, size = 16, fill = 'none', stroke = 'currentColor', sw = 1.75, children, style, className }: IconProps) => (
  <svg className={`icon${className ? ' ' + className : ''}`} width={size} height={size} viewBox="0 0 24 24" fill={fill}
       stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {d ? <path d={d}/> : children}
  </svg>
)

export const I = {
  Home: (p: IconProps) => <IconBase {...p}><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></IconBase>,
  Calendar: (p: IconProps) => <IconBase {...p}><rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 2.5v4"/><path d="M16 2.5v4"/></IconBase>,
  Check: (p: IconProps) => <IconBase {...p}><path d="M9 11l3 3 8-8"/><path d="M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></IconBase>,
  Package: (p: IconProps) => <IconBase {...p}><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/></IconBase>,
  Globe: (p: IconProps) => <IconBase {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z"/></IconBase>,
  Note: (p: IconProps) => <IconBase {...p}><path d="M5 3h11l4 4v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M15 3v5h5"/><path d="M8 13h7"/><path d="M8 17h5"/></IconBase>,
  Chat: (p: IconProps) => <IconBase {...p}><path d="M4 5h16v11H7l-3 4V5z"/></IconBase>,
  Link: (p: IconProps) => <IconBase {...p}><path d="M10 14a4 4 0 0 1 0-6l3-3a4 4 0 0 1 6 6l-1.5 1.5"/><path d="M14 10a4 4 0 0 1 0 6l-3 3a4 4 0 0 1-6-6l1.5-1.5"/></IconBase>,
  Gear: (p: IconProps) => <IconBase {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></IconBase>,
  Logout: (p: IconProps) => <IconBase {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></IconBase>,
  Search: (p: IconProps) => <IconBase {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></IconBase>,
  Bell: (p: IconProps) => <IconBase {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></IconBase>,
  Sun: (p: IconProps) => <IconBase {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/></IconBase>,
  Moon: (p: IconProps) => <IconBase {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></IconBase>,
  Plus: (p: IconProps) => <IconBase {...p}><path d="M12 5v14M5 12h14"/></IconBase>,
  X: (p: IconProps) => <IconBase {...p}><path d="M6 6l12 12M18 6L6 18"/></IconBase>,
  ChevL: (p: IconProps) => <IconBase {...p}><path d="M15 6l-6 6 6 6"/></IconBase>,
  ChevR: (p: IconProps) => <IconBase {...p}><path d="M9 6l6 6-6 6"/></IconBase>,
  ChevD: (p: IconProps) => <IconBase {...p}><path d="M6 9l6 6 6-6"/></IconBase>,
  Filter: (p: IconProps) => <IconBase {...p}><path d="M3 5h18l-7 8v6l-4 2v-8L3 5z"/></IconBase>,
  Pencil: (p: IconProps) => <IconBase {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></IconBase>,
  Trash: (p: IconProps) => <IconBase {...p}><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></IconBase>,
  Copy: (p: IconProps) => <IconBase {...p}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></IconBase>,
  Refresh: (p: IconProps) => <IconBase {...p}><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></IconBase>,
  Send: (p: IconProps) => <IconBase {...p}><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></IconBase>,
  Download: (p: IconProps) => <IconBase {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></IconBase>,
  Upload: (p: IconProps) => <IconBase {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></IconBase>,
  Doc: (p: IconProps) => <IconBase {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></IconBase>,
  Sheet: (p: IconProps) => <IconBase {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></IconBase>,
  Jira: (p: IconProps) => <IconBase {...p}><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></IconBase>,
  Design: (p: IconProps) => <IconBase {...p}><path d="M12 19l7-7-3-3-9 9v3h3l2-2z"/><circle cx="6" cy="6" r="3"/></IconBase>,
  Video: (p: IconProps) => <IconBase {...p}><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3z"/></IconBase>,
  Menu: (p: IconProps) => <IconBase {...p}><path d="M3 6h18M3 12h18M3 18h18"/></IconBase>,
  Lock: (p: IconProps) => <IconBase {...p}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></IconBase>,
  Mail: (p: IconProps) => <IconBase {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></IconBase>,
  External: (p: IconProps) => <IconBase {...p}><path d="M14 3h7v7"/><path d="M21 3l-9 9"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></IconBase>,
  Alert: (p: IconProps) => <IconBase {...p}><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0z"/></IconBase>,
  Sparkle: (p: IconProps) => <IconBase {...p}><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M19 16l.7 2 2 .7-2 .7L19 22l-.7-1.6-2-.7 2-.7L19 16z"/></IconBase>,
  Paperclip: (p: IconProps) => <IconBase {...p}><path d="M21 12.5l-8.5 8.5a5 5 0 0 1-7-7l8.5-8.5a3.5 3.5 0 0 1 5 5L10.5 19a2 2 0 0 1-3-3l8-8"/></IconBase>,
  Task: (p: IconProps) => <IconBase {...p}><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12l2 2 4-4"/></IconBase>,
}

export { IconBase as Icon }
