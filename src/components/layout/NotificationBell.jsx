import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthProvider.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { listNotifications, markRead, markAllRead, relativeTime } from '../../lib/notifications.js'

// P1-1 — the bell lives in AppShell's shared top strip (the only header common
// to every authenticated screen today). Unread state is a small ACCENT DOT
// only — restraint law: no numeric badge, no large fill, tints ≤10% except the
// dot itself which is a small element. Dropdown = bg-surface/border-line/rounded.
export default function NotificationBell() {
  const { user } = useAuth()
  const { T } = useLang()
  const nav = useNavigate()
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  const load = useCallback(() => {
    if (!user?.id) return
    listNotifications(user.id).then(setItems).catch(() => {})
  }, [user?.id])

  useEffect(() => { load() }, [load])

  // Click-outside closes the panel.
  useEffect(() => {
    if (!open) return
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  if (!user) return null

  const unread = items.some((n) => !n.read)

  async function onItemClick(n) {
    setOpen(false)
    if (!n.read) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
      await markRead(n.id)
    }
    if (n.link) nav(n.link)
  }

  async function onMarkAll() {
    setItems((prev) => prev.map((x) => ({ ...x, read: true })))
    await markAllRead(user.id)
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={T.notifications.title}
        aria-expanded={open}
        aria-haspopup="true"
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-surface hover:text-ink"
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {unread && <span aria-hidden="true" className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />}
      </button>

      {open && (
        <div className="absolute end-0 top-11 z-40 w-80 max-w-[90vw] overflow-hidden rounded-xl border border-line bg-surface shadow-card">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
              {T.notifications.title}
            </span>
            {unread && (
              <button onClick={onMarkAll} className="text-xs text-accent hover:underline">
                {T.notifications.markAllRead}
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted">{T.notifications.empty}</p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => onItemClick(n)}
                  className={`flex w-full items-start gap-2 border-b border-line px-4 py-3 text-start transition last:border-b-0 hover:bg-raise ${n.read ? '' : 'bg-surface2'}`}
                >
                  {!n.read && <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
                  <span className={`min-w-0 flex-1 ${n.read ? 'text-muted' : 'text-ink'}`}>
                    <span className="block text-sm leading-snug">{n.body}</span>
                    <span className="mt-0.5 block font-mono text-[11px] text-faint">{relativeTime(n.created_at, T)}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
