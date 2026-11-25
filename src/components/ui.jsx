import React, { useEffect } from 'react'
import { PRIORITIES, PRIORITY_STYLE } from '../lib/sample'

export const Card = ({ title, action, children, className = '' }) => (
  <section className={`card ${className}`}>
    {(title || action) && (
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-bold text-ink">{title}</h3>
        {action}
      </div>
    )}
    {children}
  </section>
)

export const PageHeader = ({ title, desc, children }) => (
  <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="h-page">{title}</h1>
      {desc && <p className="mt-1 text-sm text-ink-soft">{desc}</p>}
    </div>
    <div className="flex flex-wrap items-center gap-2">{children}</div>
  </div>
)

export const PriorityBadge = ({ p }) => (
  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${PRIORITY_STYLE[p]}`}>{PRIORITIES[p]}</span>
)

export const Empty = ({ icon = '🌿', title, desc, action }) => (
  <div className="flex flex-col items-center gap-2 rounded-2xl bg-cream-50 py-8 text-center">
    <div className="text-3xl">{icon}</div>
    <p className="font-medium text-ink-soft">{title}</p>
    {desc && <p className="text-xs text-ink-mute">{desc}</p>}
    {action}
  </div>
)

export function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return
    const h = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={onClose}>
      <div role="dialog" aria-label={title} className="max-h-[90vh] w-full max-w-md overflow-auto rounded-t-3xl bg-white p-6 shadow-soft sm:rounded-3xl" onMouseDown={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} aria-label="닫기" className="rounded-full p-1 text-ink-mute hover:bg-lav-50">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export const Field = ({ label, children }) => (
  <label className="mb-3 block">
    <span className="label">{label}</span>
    {children}
  </label>
)

export const PrioritySelect = ({ value, onChange }) => (
  <div className="flex gap-2">
    {Object.entries(PRIORITIES).map(([k, v]) => (
      <button type="button" key={k} onClick={() => onChange(k)}
        className={`flex-1 rounded-2xl px-2 py-2 text-xs font-medium transition ${value === k ? PRIORITY_STYLE[k] + ' ring-2 ring-lav-300' : 'bg-cream-100 text-ink-mute'}`}>
        {v}
      </button>
    ))}
  </div>
)

// 원형 진행 그래프 (SVG)
export function Ring({ value, size = 120, stroke = 12, color = '#a28fd6', label, sub }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f0eaf9" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(value, 100) / 100)} style={{ transition: 'stroke-dashoffset .6s ease' }} />
      </svg>
      <div className="absolute text-center">
        <div className="text-xl font-bold">{label ?? `${value}%`}</div>
        {sub && <div className="text-[11px] text-ink-mute">{sub}</div>}
      </div>
    </div>
  )
}

export const Bar = ({ value, color = 'bg-lav-300' }) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-lav-50">
    <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${Math.min(value, 100)}%` }} />
  </div>
)

export const Stat = ({ icon, label, value, tint = 'bg-lav-50' }) => (
  <div className={`rounded-2xl ${tint} p-3`}>
    <div className="text-xs text-ink-soft">{icon} {label}</div>
    <div className="mt-1 text-xl font-bold">{value}</div>
  </div>
)

export const DateNav = ({ date, onChange, label, today }) => {
  const shift = (n) => { const d = new Date(date + 'T00:00:00'); d.setDate(d.getDate() + n); onChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`) }
  return (
    <div className="flex items-center gap-1 rounded-2xl bg-white/80 p-1 shadow-soft">
      <button className="btn-ghost !px-3" onClick={() => shift(-1)} aria-label="이전 날">‹</button>
      <input type="date" value={date} onChange={(e) => e.target.value && onChange(e.target.value)} className="bg-transparent px-1 text-sm font-medium outline-none" aria-label="날짜 선택" />
      <button className="btn-ghost !px-3" onClick={() => shift(1)} aria-label="다음 날">›</button>
      {date !== today && <button className="btn-primary !px-3" onClick={() => onChange(today)}>오늘</button>}
    </div>
  )
}
