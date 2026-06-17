interface StatusBadgeProps { status: string }

const STATUS_MAP: Record<string, { c: string; lbl: string }> = {
  Current: { c: 'blue', lbl: 'Current' },
  Next: { c: 'amber', lbl: 'Next' },
  Done: { c: 'gray', lbl: 'Done' },
  Live: { c: 'teal', lbl: 'Live' },
  Pending: { c: 'amber', lbl: 'Pending' },
  Inactive: { c: 'gray', lbl: 'Inactive' },
  QA: { c: 'amber', lbl: 'QA' },
  Dev: { c: 'blue', lbl: 'Dev' },
  Design: { c: 'gray', lbl: 'Design' },
  Product: { c: 'teal', lbl: 'Product' },
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const m = STATUS_MAP[status] || { c: 'gray', lbl: status }
  return <span className={`badge ${m.c}`}><span className="dot"/>{m.lbl}</span>
}
